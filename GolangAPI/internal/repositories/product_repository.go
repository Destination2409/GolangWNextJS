package repositories

import (
	"github.com/chayanonchanatapa/golangapi/internal/models"
	"gorm.io/gorm"
)

type ProductRepository interface {
	FindAll(page, perPage int, search string) ([]models.Product, int64, error)
	FindByID(id uint64) (*models.Product, error)
	Create(product *models.Product) error
	Update(product *models.Product) error
	Delete(id uint64) error

	// Reference data methods
	GetOrCreateGender(name string) (*models.Gender, error)
	GetOrCreateCategory(name string) (*models.Category, error)
	GetOrCreateSubCategory(name string, categoryID uint) (*models.SubCategory, error)
	GetOrCreateProductType(name string, subCategoryID uint) (*models.ProductType, error)
	GetOrCreateColour(name string) (*models.Colour, error)
	GetOrCreateUsage(name string) (*models.Usage, error)

	// Import
	UpsertProduct(product *models.Product, given ImportFields) error

	// Storefront (active products only) and dashboard
	FindPublic(q StoreQuery) ([]models.Product, int64, error)
	FindPublicByID(id uint64) (*models.Product, error)
	References() (*models.References, error)
	Stats(lowStockThreshold int64) (*models.ProductStats, error)
}

// ImportFields says which optional columns the import row actually filled in.
// Columns left empty keep the existing product's value when updating.
type ImportFields struct {
	Price       bool
	CompareAt   bool
	Stock       bool
	Description bool
}

// StoreQuery holds the storefront list filters. Zero values mean "no filter".
type StoreQuery struct {
	Page       int
	PerPage    int
	Search     string
	CategoryID uint
	InStock    bool
	Sort       string // newest (default) | price_asc | price_desc
	ExcludeID  uint64
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db}
}

func (r *productRepository) FindAll(page, perPage int, search string) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := r.db.Model(&models.Product{})

	if search != "" {
		query = query.Where("title LIKE ? OR external_id LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * perPage
	err = query.Offset(offset).Limit(perPage).Order("id desc").
		Preload("Category").
		Preload("SubCategory").
		Preload("ProductType").
		Preload("Colour").
		Preload("Usage").
		Preload("Gender").
		Find(&products).Error
	return products, total, err
}

func (r *productRepository) FindByID(id uint64) (*models.Product, error) {
	var product models.Product
	err := r.db.Preload("Gender").
		Preload("Category").
		Preload("SubCategory").
		Preload("ProductType").
		Preload("Colour").
		Preload("Usage").
		First(&product, id).Error
	return &product, err
}

func (r *productRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(id uint64) error {
	return r.db.Delete(&models.Product{}, id).Error
}

func (r *productRepository) GetOrCreateGender(name string) (*models.Gender, error) {
	if name == "" {
		return nil, nil
	}
	var gender models.Gender
	err := r.db.FirstOrCreate(&gender, models.Gender{Name: name}).Error
	return &gender, err
}

func (r *productRepository) GetOrCreateCategory(name string) (*models.Category, error) {
	if name == "" {
		return nil, nil
	}
	var category models.Category
	err := r.db.FirstOrCreate(&category, models.Category{Name: name}).Error
	return &category, err
}

func (r *productRepository) GetOrCreateSubCategory(name string, categoryID uint) (*models.SubCategory, error) {
	if name == "" || categoryID == 0 {
		return nil, nil
	}
	var subCategory models.SubCategory
	err := r.db.Where(models.SubCategory{Name: name, CategoryID: categoryID}).
		FirstOrCreate(&subCategory, models.SubCategory{Name: name, CategoryID: categoryID}).Error
	return &subCategory, err
}

func (r *productRepository) GetOrCreateProductType(name string, subCategoryID uint) (*models.ProductType, error) {
	if name == "" || subCategoryID == 0 {
		return nil, nil
	}
	var productType models.ProductType
	err := r.db.Where(models.ProductType{Name: name, SubCategoryID: subCategoryID}).
		FirstOrCreate(&productType, models.ProductType{Name: name, SubCategoryID: subCategoryID}).Error
	return &productType, err
}

func (r *productRepository) GetOrCreateColour(name string) (*models.Colour, error) {
	if name == "" {
		return nil, nil
	}
	var colour models.Colour
	err := r.db.FirstOrCreate(&colour, models.Colour{Name: name}).Error
	return &colour, err
}

func (r *productRepository) GetOrCreateUsage(name string) (*models.Usage, error) {
	if name == "" {
		return nil, nil
	}
	var usage models.Usage
	err := r.db.FirstOrCreate(&usage, models.Usage{Name: name}).Error
	return &usage, err
}

func (r *productRepository) UpsertProduct(product *models.Product, given ImportFields) error {
	var existing models.Product
	if err := r.db.Where("external_id = ?", product.ExternalID).First(&existing).Error; err == nil {
		// Found, update it. Save() writes every column, so carry over whatever
		// the import row did not provide instead of zeroing it.
		product.ID = existing.ID
		product.CreatedAt = existing.CreatedAt
		product.Status = existing.Status // re-importing must not re-enable a product someone switched off
		if !given.Price {
			product.Price = existing.Price
		}
		if !given.CompareAt {
			product.CompareAt = existing.CompareAt
		}
		if !given.Stock {
			product.Stock = existing.Stock
		}
		if !given.Description {
			product.Description = existing.Description
		}
		return r.db.Save(product).Error
	}
	// Not found, create it
	return r.db.Create(product).Error
}

func (r *productRepository) FindPublic(q StoreQuery) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := r.db.Model(&models.Product{}).Where("status = ?", "active")
	if q.Search != "" {
		query = query.Where("title LIKE ?", "%"+q.Search+"%")
	}
	if q.CategoryID != 0 {
		query = query.Where("category_id = ?", q.CategoryID)
	}
	if q.InStock {
		query = query.Where("stock > 0")
	}
	if q.ExcludeID != 0 {
		query = query.Where("id <> ?", q.ExcludeID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	order := "id desc"
	switch q.Sort {
	case "price_asc":
		order = "price asc, id desc"
	case "price_desc":
		order = "price desc, id desc"
	}

	err := query.Offset((q.Page - 1) * q.PerPage).Limit(q.PerPage).Order(order).
		Preload("Category").
		Preload("SubCategory").
		Preload("ProductType").
		Preload("Colour").
		Preload("Usage").
		Preload("Gender").
		Find(&products).Error
	return products, total, err
}

func (r *productRepository) FindPublicByID(id uint64) (*models.Product, error) {
	var product models.Product
	err := r.db.Where("status = ?", "active").
		Preload("Gender").
		Preload("Category").
		Preload("SubCategory").
		Preload("ProductType").
		Preload("Colour").
		Preload("Usage").
		First(&product, id).Error
	return &product, err
}

func (r *productRepository) References() (*models.References, error) {
	refs := &models.References{}

	err := r.db.Model(&models.Category{}).
		Select("categories.*, COUNT(products.id) AS product_count").
		Joins("LEFT JOIN products ON products.category_id = categories.id AND products.status = 'active'").
		Group("categories.id").
		Order("categories.id").
		Scan(&refs.Categories).Error
	if err != nil {
		return nil, err
	}

	for _, q := range []struct {
		dest  interface{}
		order string
	}{
		{&refs.Genders, "id"},
		{&refs.SubCategories, "category_id, name"},
		{&refs.ProductTypes, "sub_category_id, name"},
		{&refs.Colours, "name"},
		{&refs.Usages, "id"},
	} {
		if err := r.db.Order(q.order).Find(q.dest).Error; err != nil {
			return nil, err
		}
	}
	return refs, nil
}

func (r *productRepository) Stats(lowStockThreshold int64) (*models.ProductStats, error) {
	// Scan totals into a flat struct: GORM can't scan into ProductStats directly
	// because of its slice fields.
	var totals struct {
		Total          int64
		Active         int64
		Inactive       int64
		LowStock       int64
		OutOfStock     int64
		InventoryValue float64
	}
	err := r.db.Model(&models.Product{}).Select(`
		COUNT(*) AS total,
		COALESCE(SUM(status = 'active'), 0) AS active,
		COALESCE(SUM(status = 'inactive'), 0) AS inactive,
		COALESCE(SUM(status = 'active' AND stock > 0 AND stock <= ?), 0) AS low_stock,
		COALESCE(SUM(status = 'active' AND stock <= 0), 0) AS out_of_stock,
		COALESCE(SUM(price * stock), 0) AS inventory_value`, lowStockThreshold).
		Scan(&totals).Error
	if err != nil {
		return nil, err
	}

	stats := &models.ProductStats{
		Total:          totals.Total,
		Active:         totals.Active,
		Inactive:       totals.Inactive,
		LowStock:       totals.LowStock,
		OutOfStock:     totals.OutOfStock,
		InventoryValue: totals.InventoryValue,
	}

	err = r.db.Model(&models.Category{}).
		Select("categories.id, categories.name, COUNT(products.id) AS count").
		Joins("LEFT JOIN products ON products.category_id = categories.id").
		Group("categories.id").
		Order("count desc, categories.id").
		Scan(&stats.ByCategory).Error
	if err != nil {
		return nil, err
	}

	err = r.db.Where("status = 'active' AND stock <= ?", lowStockThreshold).
		Order("stock asc, id desc").Limit(5).Find(&stats.LowStockItems).Error
	return stats, err
}
