package config

import (
	"fmt"
	"log"
	"os"

	"github.com/chayanonchanatapa/golangapi/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func NewMySQLDB() (*gorm.DB, error) {
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName,
	)

	log.Printf("Connecting to MySQL: %s:xxxx@tcp(%s:%s)/%s", dbUser, dbHost, dbPort, dbName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migrate models
	// Since you have manually created the DB tables (`products`, `categories`, etc.), 
	// it's highly recommended to NOT let Gorm auto-migrate them. Gorm will try to 
	// ALTER your existing columns, leading to type mismatch errors.
	err = db.AutoMigrate(&models.User{}) // Only migrate User if it doesn't exist yet
	if err != nil {
		return nil, err
	}

	return db, nil
}
