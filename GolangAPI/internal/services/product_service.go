package services

import (
	"math"

	"github.com/chayanonchanatapa/golangapi/internal/models"
	"github.com/chayanonchanatapa/golangapi/internal/repositories"
)

type ProductService interface {
	GetProducts(page, perPage int, search string) (map[string]interface{}, error)
	GetProductByID(id uint64) (*models.Product, error)
	CreateProduct(product *models.Product) error
	UpdateProduct(id uint64, product *models.Product) error
	DeleteProduct(id uint64) error
	ImportProducts(records [][]string) error
}

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

	lastPage := int(math.Ceil(float64(total) / float64(perPage)))
	if lastPage < 1 {
		lastPage = 1
	}

	return map[string]interface{}{
		"data":      products,
		"total":     total,
		"page":      page,
		"per_page":  perPage,
		"last_page": lastPage,
	}, nil
}

func (s *productService) GetProductByID(id uint64) (*models.Product, error) {
	return s.repo.FindByID(id)
}

func (s *productService) CreateProduct(product *models.Product) error {
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

	return s.repo.Update(product)
}

func (s *productService) DeleteProduct(id uint64) error {
	return s.repo.Delete(id)
}

func (s *productService) ImportProducts(records [][]string) error {
	for i, row := range records {
		if i == 0 {
			continue // skip header
		}
		// ProductId,Gender,Category,SubCategory,ProductType,Colour,Usage,ProductTitle,Image,ImageURL
		if len(row) < 10 {
			continue // skip malformed rows
		}

		product := &models.Product{
			ExternalID: row[0],
			Title:      row[7],
			Status:     "active",
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
		_ = s.repo.UpsertProduct(product)
	}

	return nil
}

