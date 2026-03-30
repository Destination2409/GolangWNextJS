package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/chayanonchanatapa/golangapi/internal/models"
	"github.com/chayanonchanatapa/golangapi/internal/repositories"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo *repositories.UserRepository
}

func NewAuthService(userRepo *repositories.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(email, password, prefix, firstName, lastName, gender string) (*models.User, error) {
	// Check if user already exists
	_, err := s.userRepo.GetUserByEmail(email)
	if err == nil {
		return nil, errors.New("อีเมลนี้ถูกใช้งานแล้ว")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var pPrefix *string
	if prefix != "" {
		pPrefix = &prefix
	}
	var pGender *string
	if gender != "" {
		pGender = &gender
	}

	user := &models.User{
		Email:        email,
		Password:     string(hashedPassword),
		Prefix:       pPrefix,
		FirstName:    firstName,
		LastName:     lastName,
		Gender:       pGender,
		Status:       "active",
		PermissionID: 1,
	}

	err = s.userRepo.CreateUser(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

type FBTokenResponse struct {
	AccessToken string `json:"access_token"`
	Error       *struct {
		Message string `json:"message"`
	} `json:"error"`
}

type FBUserResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Name      string `json:"name"`
	Gender    string `json:"gender"`
	Error     *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (s *AuthService) FacebookLogin(code, redirectURI string) (string, string, error) {
	appID := os.Getenv("FB_ID")
	appSecret := os.Getenv("FB_SECRET")

	tokenURL := fmt.Sprintf("https://graph.facebook.com/v19.0/oauth/access_token?client_id=%s&redirect_uri=%s&client_secret=%s&code=%s",
		appID, redirectURI, appSecret, code)

	resp, err := http.Get(tokenURL)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	var fbToken FBTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&fbToken); err != nil {
		return "", "", err
	}
	if fbToken.Error != nil {
		return "", "", errors.New("Facebook Token Error: " + fbToken.Error.Message)
	}
	if fbToken.AccessToken == "" {
		return "", "", errors.New("Unable to get access token from Facebook")
	}

	userInfoURL := fmt.Sprintf("https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,gender&access_token=%s", fbToken.AccessToken)
	userResp, err := http.Get(userInfoURL)
	if err != nil {
		return "", "", err
	}
	defer userResp.Body.Close()

	var fbUser FBUserResponse
	if err := json.NewDecoder(userResp.Body).Decode(&fbUser); err != nil {
		return "", "", err
	}
	if fbUser.Error != nil {
		return "", "", errors.New("Facebook User Error: " + fbUser.Error.Message)
	}

	email := fbUser.Email
	if email == "" {
		email = fbUser.ID + "@facebook.com"
	}

	user, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		var pGender *string
		if fbUser.Gender == "male" || fbUser.Gender == "female" {
			g := fbUser.Gender
			pGender = &g
		}

		user = &models.User{
			Email:        email,
			Password:     "", 
			FirstName:    fbUser.FirstName,
			LastName:     fbUser.LastName,
			Gender:       pGender,
			Status:       "active",
			PermissionID: 1,
		}
		if user.FirstName == "" {
			user.FirstName = fbUser.Name
		}
		if user.LastName == "" {
			user.LastName = "-"
		}

		err = s.userRepo.CreateUser(user)
		if err != nil {
			return "", "", err
		}
	} else if user.Status != "active" {
		return "", "", errors.New("บัญชีนี้ถูกระงับการใช้งาน")
	}

	return generateTokens(user)
}

func (s *AuthService) Login(email, password string) (string, string, error) {
	user, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		return "", "", errors.New("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
	}

	if user.Status != "active" {
		return "", "", errors.New("บัญชีนี้ถูกระงับการใช้งาน")
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", "", errors.New("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
	}

	// Generate JWT
	accessTokenString, refreshTokenString, err := generateTokens(user)
	if err != nil {
		return "", "", err
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	_ = s.userRepo.UpdateUser(user) // Ignore error on non-critical update

	return accessTokenString, refreshTokenString, nil
}

func (s *AuthService) RefreshToken(refreshTokenStr string) (string, string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "super-secret-key-change-me"
	}

	token, err := jwt.Parse(refreshTokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		return "", "", errors.New("invalid refresh token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", "", errors.New("invalid claims")
	}

	if claims["type"] != "refresh" {
		return "", "", errors.New("not a refresh token")
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return "", "", errors.New("invalid user_id in token")
	}
	userID := uint(userIDFloat)

	user, err := s.userRepo.GetUserByID(userID)
	if err != nil {
		return "", "", errors.New("user not found")
	}

	if user.Status != "active" {
		return "", "", errors.New("บัญชีนี้ถูกระงับการใช้งาน")
	}

	return generateTokens(user)
}

func generateTokens(user *models.User) (string, string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "super-secret-key-change-me" // fallback
	}

	accessTokenExp := time.Now().Add(time.Minute * 60) // Expire in 60 mins

	claims := jwt.MapClaims{
		"user_id":       user.ID,
		"permission_id": user.PermissionID,
		"email":         user.Email,
		"first_name":    user.FirstName,
		"last_name":     user.LastName,
		"iat":           time.Now().Unix(),
		"exp":           accessTokenExp.Unix(),
	}

	if user.Prefix != nil {
		claims["prefix"] = *user.Prefix
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessTokenString, err := accessToken.SignedString([]byte(secret))
	if err != nil {
		return "", "", err
	}

	// Refresh Token
	rfClaims := jwt.MapClaims{
		"user_id": user.ID,
		"type":    "refresh",
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // Expire in 7 days
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, rfClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(secret))
	if err != nil {
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}
