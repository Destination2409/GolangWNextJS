package routes

import (
	"github.com/chayanonchanatapa/golangapi/internal/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterProductRoutes(router *gin.RouterGroup, handler *handlers.ProductHandler) {
	productGroup := router.Group("/products")
	{
		productGroup.GET("", handler.GetProducts)
		productGroup.POST("/import", handler.ImportProducts)
		productGroup.GET("/:id", handler.GetProduct)
		productGroup.POST("", handler.CreateProduct)
		productGroup.PUT("/:id", handler.UpdateProduct)
		productGroup.DELETE("/:id", handler.DeleteProduct)
	}
}
