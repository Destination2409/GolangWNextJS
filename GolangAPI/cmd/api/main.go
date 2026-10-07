package main

import (
	"log"
	"os"

	"github.com/chayanonchanatapa/golangapi/internal/config"
	"github.com/chayanonchanatapa/golangapi/internal/handlers"
	"github.com/chayanonchanatapa/golangapi/internal/middlewares"
	"github.com/chayanonchanatapa/golangapi/internal/repositories"
	"github.com/chayanonchanatapa/golangapi/internal/routes"
	"github.com/chayanonchanatapa/golangapi/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	// Initialize Database connection
	db, err := config.NewMySQLDB()
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}

	// Initialize Redis connection
	redisClient, err := config.NewRedisClient()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}

	// Repositories
	userRepo := repositories.NewUserRepository(db)
	productRepo := repositories.NewProductRepository(db)
	tokenRepo := repositories.NewTokenRepository(redisClient)

	// Services
	authService := services.NewAuthService(userRepo, tokenRepo)
	productService := services.NewProductService(productRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	productHandler := handlers.NewProductHandler(productService)
	storeHandler := handlers.NewStoreHandler(productService)

	// Initialize Gin router
	r := gin.Default()

	// CORS: ALLOWED_ORIGINS is a comma-separated list, empty allows any origin
	r.Use(middlewares.CORS(os.Getenv("ALLOWED_ORIGINS")))

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "API is running!",
		})
	})

	// Public Routes
	api := r.Group("/api")
	routes.RegisterAuthRoutes(api, authHandler)
	routes.RegisterStoreRoutes(api, storeHandler)

	// Protected Routes
	protected := r.Group("/api")
	protected.Use(middlewares.AuthMiddleware(tokenRepo))
	{
		protected.GET("/dashboard", func(c *gin.Context) {
			userID, _ := c.Get("userID")
			c.JSON(200, gin.H{
				"message": "Welcome to the protected dashboard!",
				"userID":  userID,
			})
		})

		// Product Routes (staff only, permission_id >= 2)
		staff := protected.Group("")
		staff.Use(middlewares.RequirePermission(2))
		routes.RegisterProductRoutes(staff, productHandler)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}
