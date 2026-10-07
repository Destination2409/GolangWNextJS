package services

import (
	"math"
	"strconv"
	"strings"

	"github.com/chayanonchanatapa/golangapi/internal/models"
	"github.com/chayanonchanatapa/golangapi/internal/repositories"
)

type ProductService interface {
	GetProducts(page, perPage int, search string) (map[string]interface{}, error)
	GetProductByID(id uint64) (*models.Product, error)
	CreateProduct(product *models.Product) error
	UpdateProduct(id uint64, product *models.Product) error
	DeleteProduct(id uint64) error
	ImportProducts(records [][]string) (imported int, skipped int, err error)

	GetStoreProducts(q repositories.StoreQuery) (map[string]interface{}, error)
	GetStoreProduct(id uint64) (*models.Product, error)
	GetReferences() (*models.References, error)
	GetStats() (*models.ProductStats, error)
}

// LowStockThreshold is the stock level at or below which a product counts as low stock.
const LowStockThreshold = 5

type productService struct {
	repo repositories.ProductRepository
}

func NewProductService(repo repositories.ProductRepository) ProductService {
	return &productService{repo}
}

func (s *productService) GetProducts(page, perPage int, search string) (map[string]interface{}, error) {
	products, total, err := s.repo.FindAll(page, perPage, search)
	if err != nil {
		return nil, err
	}

	return paginate(products, total, page, perPage), nil
}

func (s *productService) GetProductByID(id uint64) (*models.Product, error) {
	return s.repo.FindByID(id)
}

func (s *productService) CreateProduct(product *models.Product) error {
	product.Description = nilIfEmpty(product.Description)
	product.ImageURL = nilIfEmpty(product.ImageURL)
	product.Image = nilIfEmpty(product.Image)
	product.CompareAt = positiveOrNil(product.CompareAt)
	return s.repo.Create(product)
}

func (s *productService) UpdateProduct(id uint64, input *models.Product) error {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	product.Title = input.Title
	product.Price = input.Price
	product.Stock = input.Stock

	if input.ExternalID != "" {
		product.ExternalID = input.ExternalID
	}
	if input.Status != "" {
		product.Status = input.Status
	}

	// PUT is a full update: the backend form always sends every field, so a
	// null reference clears it (e.g. removing a product from its category).
	product.GenderID = input.GenderID
	product.CategoryID = input.CategoryID
	product.SubCategoryID = input.SubCategoryID
	product.ProductTypeID = input.ProductTypeID
	product.ColourID = input.ColourID
	product.UsageID = input.UsageID
	product.Description = nilIfEmpty(input.Description)
	product.ImageURL = nilIfEmpty(input.ImageURL)
	if input.Image != nil {
		product.Image = nilIfEmpty(input.Image)
	}
	product.CompareAt = positiveOrNil(input.CompareAt)

	// Clear preloaded associations so Save() writes only the IDs above
	product.Gender, product.Category, product.SubCategory = nil, nil, nil
	product.ProductType, product.Colour, product.Usage = nil, nil, nil

	return s.repo.Update(product)
}

func (s *productService) DeleteProduct(id uint64) error {
	return s.repo.Delete(id)
}

func (s *productService) ImportProducts(records [][]string) (imported int, skipped int, err error) {
	for i, row := range records {
		if i == 0 {
			continue // skip header
		}
		// ProductId,Gender,Category,SubCategory,ProductType,Colour,Usage,ProductTitle,Image,ImageURL
		// then optional: Price,CompareAtPrice,Stock,Description
		row = trimRow(row)
		if len(row) < 10 || row[0] == "" || row[7] == "" {
			skipped++ // skip malformed rows
			continue
		}

		product := &models.Product{
			ExternalID: row[0],
			Title:      row[7],
			Status:     "active",
		}

		given, ok := applyOptionalColumns(product, row)
		if !ok {
			skipped++ // a number column held something that isn't a number
			continue
		}

		if row[8] != "" {
			product.Image = &row[8]
		}
		if row[9] != "" {
			product.ImageURL = &row[9]
		}

		// Gender
		if row[1] != "" {
			gender, _ := s.repo.GetOrCreateGender(row[1])
			if gender != nil {
				gID := uint8(gender.ID)
				product.GenderID = &gID
			}
		}

		// Hierarchy: Category -> SubCategory -> ProductType
		if row[2] != "" {
			cat, _ := s.repo.GetOrCreateCategory(row[2])
			if cat != nil {
				catID := cat.ID
				product.CategoryID = &catID

				if row[3] != "" {
					subCat, _ := s.repo.GetOrCreateSubCategory(row[3], catID)
					if subCat != nil {
						subCatID := subCat.ID
						product.SubCategoryID = &subCatID

						if row[4] != "" {
							pt, _ := s.repo.GetOrCreateProductType(row[4], subCatID)
							if pt != nil {
								ptID := pt.ID
								product.ProductTypeID = &ptID
							}
						}
					}
				}
			}
		}

		// Colour
		if row[5] != "" {
			colour, _ := s.repo.GetOrCreateColour(row[5])
			if colour != nil {
				colID := colour.ID
				product.ColourID = &colID
			}
		}

		// Usage
		if row[6] != "" {
			usage, _ := s.repo.GetOrCreateUsage(row[6])
			if usage != nil {
				uID := usage.ID
				product.UsageID = &uID
			}
		}

		// Use upsert to create or update the row matching the ExternalID
		if err := s.repo.UpsertProduct(product, given); err != nil {
			skipped++
			continue
		}
		imported++
	}

	return imported, skipped, nil
}

// ImportColumns is the header row of an import file (CSV or Excel).
var ImportColumns = []string{
	"ProductId", "Gender", "Category", "SubCategory", "ProductType", "Colour", "Usage",
	"ProductTitle", "Image", "ImageURL", "Price", "CompareAtPrice", "Stock", "Description",
}

func trimRow(row []string) []string {
	out := make([]string, len(row))
	for i, v := range row {
		out[i] = strings.TrimSpace(v)
	}
	return out
}

// applyOptionalColumns reads Price, CompareAtPrice, Stock and Description
// (columns 11-14). Older 10-column files simply have none of them.
func applyOptionalColumns(p *models.Product, row []string) (repositories.ImportFields, bool) {
	var given repositories.ImportFields
	col := func(i int) string {
		if i < len(row) {
			return strings.ReplaceAll(row[i], ",", "") // allow "8,990"
		}
		return ""
	}

	if v := col(10); v != "" {
		price, err := strconv.ParseFloat(v, 64)
		if err != nil || price < 0 {
			return given, false
		}
		p.Price, given.Price = price, true
	}
	if v := col(11); v != "" {
		compareAt, err := strconv.ParseFloat(v, 64)
		if err != nil {
			return given, false
		}
		p.CompareAt, given.CompareAt = positiveOrNil(&compareAt), true
	}
	if v := col(12); v != "" {
		stock, err := strconv.ParseFloat(v, 64) // Excel may send "15.0"
		if err != nil || stock < 0 {
			return given, false
		}
		p.Stock, given.Stock = int64(stock), true
	}
	if 13 < len(row) && row[13] != "" {
		desc := row[13]
		p.Description, given.Description = &desc, true
	}
	return given, true
}

func nilIfEmpty(s *string) *string {
	if s == nil || *s == "" {
		return nil
	}
	return s
}

// positiveOrNil treats 0 or less as "no compare-at price".
func positiveOrNil(f *float64) *float64 {
	if f == nil || *f <= 0 {
		return nil
	}
	return f
}

func paginate(data interface{}, total int64, page, perPage int) map[string]interface{} {
	lastPage := int(math.Ceil(float64(total) / float64(perPage)))
	if lastPage < 1 {
		lastPage = 1
	}
	return map[string]interface{}{
		"data":      data,
		"total":     total,
		"page":      page,
		"per_page":  perPage,
		"last_page": lastPage,
	}
}

func (s *productService) GetStoreProducts(q repositories.StoreQuery) (map[string]interface{}, error) {
	products, total, err := s.repo.FindPublic(q)
	if err != nil {
		return nil, err
	}
	return paginate(products, total, q.Page, q.PerPage), nil
}

func (s *productService) GetStoreProduct(id uint64) (*models.Product, error) {
	return s.repo.FindPublicByID(id)
}

func (s *productService) GetReferences() (*models.References, error) {
	return s.repo.References()
}

func (s *productService) GetStats() (*models.ProductStats, error) {
	return s.repo.Stats(LowStockThreshold)
}
