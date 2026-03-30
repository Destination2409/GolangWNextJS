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
	UpsertProduct(product *models.Product) error
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

func (r *productRepository) UpsertProduct(product *models.Product) error {
	var existing models.Product
	if err := r.db.Where("external_id = ?", product.ExternalID).First(&existing).Error; err == nil {
		// Found, update it
		product.ID = existing.ID // keep same ID
		return r.db.Save(product).Error
	}
	// Not found, create it
	return r.db.Create(product).Error
}
