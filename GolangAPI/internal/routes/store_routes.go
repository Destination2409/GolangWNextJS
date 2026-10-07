package routes

import (
	"github.com/chayanonchanatapa/golangapi/internal/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterStoreRoutes(router *gin.RouterGroup, handler *handlers.StoreHandler) {
	storeGroup := router.Group("/store")
	{
		storeGroup.GET("/products", handler.GetProducts)
		storeGroup.GET("/products/:id", handler.GetProduct)
		storeGroup.GET("/references", handler.GetReferences)
	}
}
