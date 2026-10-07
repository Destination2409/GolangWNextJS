package routes

import (
	"github.com/chayanonchanatapa/golangapi/internal/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(router *gin.RouterGroup, handler *handlers.AuthHandler) {
	router.POST("/register", handler.Register)
	router.POST("/login", handler.Login)
	router.POST("/refresh", handler.RefreshToken)
	router.POST("/facebook", handler.FacebookLogin)
	router.POST("/logout", handler.Logout)
}
