package models

import (
	"time"
)

type User struct {
	ID                uint       `gorm:"primaryKey" json:"id"`
	Email             string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password          string     `gorm:"type:longtext;not null" json:"-"`
	Prefix            *string    `gorm:"type:varchar(50)" json:"prefix"`
	FirstName         string     `gorm:"type:varchar(100);not null" json:"first_name"`
	LastName          string     `gorm:"type:varchar(100);not null" json:"last_name"`
	Gender            *string    `gorm:"type:enum('male','female','other')" json:"gender"`
	Status            string     `gorm:"type:enum('active','inactive','blocked');default:'active';not null" json:"status"`
	PermissionID      uint       `gorm:"default:1;not null" json:"permission_id"`
	LastLoginAt       *time.Time `json:"last_login_at"`
	PasswordUpdatedAt *time.Time `json:"password_updated_at"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}
