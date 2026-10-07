package middlewares

import (
	"context"
	"net/http"
	"strings"

	"github.com/chayanonchanatapa/golangapi/internal/auth"
	"github.com/gin-gonic/gin"
)

// RevocationChecker reports whether an access token was revoked (e.g. by logout).
type RevocationChecker interface {
	IsAccessTokenRevoked(ctx context.Context, jti string) (bool, error)
}

func AuthMiddleware(revocations RevocationChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			return
		}

		claims, err := auth.Parse(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Refresh tokens carry type=refresh and must not be usable as access tokens
		if claims["type"] == "refresh" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		if jti, _ := claims["jti"].(string); jti != "" && revocations != nil {
			revoked, err := revocations.IsAccessTokenRevoked(c.Request.Context(), jti)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{"error": "Unable to verify session"})
				return
			}
			if revoked {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Session has been logged out"})
				return
			}
		}

		// JSON numbers decode as float64
		permissionID, _ := claims["permission_id"].(float64)

		c.Set("userID", claims["user_id"])
		c.Set("permissionID", uint(permissionID))
		c.Next()
	}
}

// RequirePermission must run after AuthMiddleware. It mirrors the frontend's
// useRequireAuth(min) check so the API is protected even if the UI is bypassed.
func RequirePermission(min uint) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetUint("permissionID") < min {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้"})
			return
		}
		c.Next()
	}
}
