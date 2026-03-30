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
