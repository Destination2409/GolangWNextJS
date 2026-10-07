package models

import (
	"time"
)

type Product struct {
	ID            uint64     `gorm:"primaryKey;autoIncrement;type:bigint unsigned" json:"id"`
	ExternalID    string     `gorm:"type:varchar(255);not null" json:"external_id"`
	GenderID      *uint8     `gorm:"type:tinyint unsigned;default:NULL" json:"gender_id"`
	CategoryID    *uint      `gorm:"type:int unsigned;default:NULL" json:"category_id"`
	SubCategoryID *uint      `gorm:"type:int unsigned;default:NULL" json:"sub_category_id"`
	ProductTypeID *uint      `gorm:"type:int unsigned;default:NULL" json:"product_type_id"`
	ColourID      *uint      `gorm:"type:int unsigned;default:NULL" json:"colour_id"`
	UsageID       *uint      `gorm:"type:int unsigned;default:NULL" json:"usage_id"`
	Title         string     `gorm:"type:varchar(255);not null" json:"title"`
	Description   *string    `gorm:"type:text;default:NULL" json:"description"`
	Image         *string    `gorm:"type:varchar(255);default:NULL" json:"image"`
	ImageURL      *string    `gorm:"type:text;default:NULL" json:"image_url"`
	Price         float64    `gorm:"type:decimal(10,2);not null" json:"price"`
	CompareAt     *float64   `gorm:"column:compare_at_price;type:decimal(10,2);default:NULL" json:"compare_at_price"`
	Stock         int64      `gorm:"type:bigint;not null;default:0" json:"stock"`
	Status        string     `gorm:"type:enum('active','inactive');not null;default:'active'" json:"status"`
	CreatedAt     *time.Time `gorm:"type:datetime(3);default:NULL" json:"created_at"`
	UpdatedAt     *time.Time `gorm:"type:datetime(3);default:NULL" json:"updated_at"`

	// Associations with constraints explicitly ignored (-) to prevent mismatch mapping between uint and tinyint in MySQL could throw errors during migration.
	Gender      *Gender      `gorm:"foreignKey:GenderID;references:ID;constraint:-;" json:"gender,omitempty"`
	Category    *Category    `gorm:"foreignKey:CategoryID;references:ID;constraint:-;" json:"category,omitempty"`
	SubCategory *SubCategory `gorm:"foreignKey:SubCategoryID;references:ID;constraint:-;" json:"sub_category,omitempty"`
	ProductType *ProductType `gorm:"foreignKey:ProductTypeID;references:ID;constraint:-;" json:"product_type,omitempty"`
	Colour      *Colour      `gorm:"foreignKey:ColourID;references:ID;constraint:-;" json:"colour,omitempty"`
	Usage       *Usage       `gorm:"foreignKey:UsageID;references:ID;constraint:-;" json:"usage,omitempty"`
}
