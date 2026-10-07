package middlewares

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORS allows requests from the comma-separated origins in allowedOrigins.
// An empty list allows any origin, which is only meant for local development.
func CORS(allowedOrigins string) gin.HandlerFunc {
	allowed := map[string]bool{}
	for _, o := range strings.Split(allowedOrigins, ",") {
		if o = strings.TrimSpace(o); o != "" {
			allowed[o] = true
		}
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		h := c.Writer.Header()

		if len(allowed) == 0 {
			h.Set("Access-Control-Allow-Origin", "*")
		} else if allowed[origin] {
			h.Set("Access-Control-Allow-Origin", origin)
			h.Add("Vary", "Origin")
		}

		h.Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		h.Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
