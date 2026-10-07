package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	AccessTokenTTL  = 60 * time.Minute
	RefreshTokenTTL = 7 * 24 * time.Hour
)

func Secret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "super-secret-key-change-me" // fallback for local development
	}
	return []byte(secret)
}

// NewJTI returns a random token ID used to track/revoke a token in Redis.
func NewJTI() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func Sign(claims jwt.MapClaims) (string, error) {
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(Secret())
}

// Parse validates the signature and expiry of a token and returns its claims.
func Parse(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return Secret(), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}
	return claims, nil
}

// RemainingTTL is how long until the token's exp claim; zero if already expired.
func RemainingTTL(claims jwt.MapClaims) time.Duration {
	exp, err := claims.GetExpirationTime()
	if err != nil || exp == nil {
		return 0
	}
	if d := time.Until(exp.Time); d > 0 {
		return d
	}
	return 0
}
