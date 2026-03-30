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
	_ = redisClient // To avoid unused variable error temporarily

	// Repositories
	userRepo := repositories.NewUserRepository(db)
	productRepo := repositories.NewProductRepository(db)

	// Services
	authService := services.NewAuthService(userRepo)
	productService := services.NewProductService(productRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	productHandler := handlers.NewProductHandler(productService)

	// Initialize Gin router
	r := gin.Default()

	// CORS Middleware (simple for development)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "API is running!",
		})
	})

	// Public Routes
	api := r.Group("/api")
	routes.RegisterAuthRoutes(api, authHandler)

	// Protected Routes
	protected := r.Group("/api")
	protected.Use(middlewares.AuthMiddleware())
	{
		protected.GET("/dashboard", func(c *gin.Context) {
			userID, _ := c.Get("userID")
			c.JSON(200, gin.H{
				"message": "Welcome to the protected dashboard!",
				"userID":  userID,
			})
		})

		// Product Routes
		routes.RegisterProductRoutes(protected, productHandler)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}
