package handlers

import (
	"errors"
	"net/http"

	"github.com/chayanonchanatapa/golangapi/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type AuthRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	Prefix    string `json:"prefix"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Gender    string `json:"gender"`
}

func getValidationMessage(err error) string {
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		for _, fe := range ve {
			switch fe.Field() {
			case "Email":
				if fe.Tag() == "required" { return "กรุณากรอกอีเมล" }
				if fe.Tag() == "email" { return "รูปแบบอีเมลไม่ถูกต้อง" }
			case "Password":
				if fe.Tag() == "required" { return "กรุณากรอกรหัสผ่าน" }
				if fe.Tag() == "min" { return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }
			case "FirstName":
				if fe.Tag() == "required" { return "กรุณากรอกชื่อจริง" }
			case "LastName":
				if fe.Tag() == "required" { return "กรุณากรอกนามสกุล" }
			}
			return "ข้อมูล " + fe.Field() + " ไม่ถูกต้อง"
		}
	}
	return "รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง"
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": getValidationMessage(err)})
		return
	}

	user, err := h.authService.Register(req.Email, req.Password, req.Prefix, req.FirstName, req.LastName, req.Gender)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
		},
	})
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": getValidationMessage(err)})
		return
	}

	accessToken, refreshToken, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successful",
		"token":         accessToken,
		"refresh_token": refreshToken,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาส่ง refresh_token"})
		return
	}

	accessToken, refreshToken, err := h.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Token refreshed successfully",
		"token":         accessToken,
		"refresh_token": refreshToken,
	})
}

type FacebookLoginRequest struct {
	Code        string `json:"code" binding:"required"`
	RedirectURI string `json:"redirect_uri" binding:"required"`
}

func (h *AuthHandler) FacebookLogin(c *gin.Context) {
	var req FacebookLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง (code หรือ redirect_uri หายไป)"})
		return
	}

	accessToken, refreshToken, err := h.authService.FacebookLogin(req.Code, req.RedirectURI)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Facebook Login successful",
		"token":         accessToken,
		"refresh_token": refreshToken,
	})
}
