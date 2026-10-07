package models

import "time"

type Category struct {
	ID        uint      `gorm:"primaryKey;autoIncrement;type:int unsigned" json:"id"`
	Name      string    `gorm:"type:varchar(50);not null" json:"name"`
	CreatedAt time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3)" json:"created_at"`
	UpdatedAt time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)" json:"updated_at"`
}

type SubCategory struct {
	ID         uint      `gorm:"primaryKey;autoIncrement;type:int unsigned" json:"id"`
	CategoryID uint      `gorm:"type:int unsigned;not null" json:"category_id"`
	Name       string    `gorm:"type:varchar(100);not null" json:"name"`
	CreatedAt  time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3)" json:"created_at"`
	UpdatedAt  time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)" json:"updated_at"`

	Category Category `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"category,omitempty"`
}

type ProductType struct {
	ID            uint      `gorm:"primaryKey;autoIncrement;type:int unsigned" json:"id"`
	SubCategoryID uint      `gorm:"type:int unsigned;not null" json:"sub_category_id"`
	Name          string    `gorm:"type:varchar(100);not null" json:"name"`
	CreatedAt     time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3)" json:"created_at"`
	UpdatedAt     time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)" json:"updated_at"`

	SubCategory SubCategory `gorm:"foreignKey:SubCategoryID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"sub_category,omitempty"`
}

type Colour struct {
	ID        uint      `gorm:"primaryKey;autoIncrement;type:int unsigned" json:"id"`
	Name      string    `gorm:"type:varchar(50);not null" json:"name"`
	CreatedAt time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3)" json:"created_at"`
	UpdatedAt time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)" json:"updated_at"`
}

type Usage struct {
	ID        uint      `gorm:"primaryKey;autoIncrement;type:int unsigned" json:"id"`
	Name      string    `gorm:"type:varchar(50);not null" json:"name"`
	CreatedAt time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3)" json:"created_at"`
	UpdatedAt time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)" json:"updated_at"`
}

type Gender struct {
	ID        uint      `gorm:"primaryKey;autoIncrement;type:int unsigned" json:"id"`
	Name      string    `gorm:"type:varchar(50);not null" json:"name"`
	CreatedAt time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3)" json:"created_at"`
	UpdatedAt time.Time `gorm:"type:datetime(3);default:CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)" json:"updated_at"`
}

// CategoryWithCount is a category plus how many active products it has (for the storefront).
type CategoryWithCount struct {
	Category
	ProductCount int64 `json:"product_count"`
}

// References bundles every lookup table, used by dropdowns and storefront filters.
type References struct {
	Genders       []Gender            `json:"genders"`
	Categories    []CategoryWithCount `json:"categories"`
	SubCategories []SubCategory       `json:"sub_categories"`
	ProductTypes  []ProductType       `json:"product_types"`
	Colours       []Colour            `json:"colours"`
	Usages        []Usage             `json:"usages"`
}

type CategoryCount struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Count int64  `json:"count"`
}

// ProductStats feeds the backend dashboard.
type ProductStats struct {
	Total          int64           `json:"total"`
	Active         int64           `json:"active"`
	Inactive       int64           `json:"inactive"`
	LowStock       int64           `json:"low_stock"`
	OutOfStock     int64           `json:"out_of_stock"`
	InventoryValue float64         `json:"inventory_value"`
	ByCategory     []CategoryCount `json:"by_category"`
	LowStockItems  []Product       `json:"low_stock_items"`
}
