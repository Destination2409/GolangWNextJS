package middlewares

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/chayanonchanatapa/golangapi/internal/auth"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type fakeRevocations map[string]bool

func (f fakeRevocations) IsAccessTokenRevoked(_ context.Context, jti string) (bool, error) {
	return f[jti], nil
}

func newRouter(revoked fakeRevocations, minPermission uint) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(CORS("http://localhost:3100"))
	r.GET("/staff", AuthMiddleware(revoked), RequirePermission(minPermission), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})
	return r
}

func token(t *testing.T, claims jwt.MapClaims) string {
	t.Helper()
	if _, ok := claims["exp"]; !ok {
		claims["exp"] = time.Now().Add(time.Hour).Unix()
	}
	s, err := auth.Sign(claims)
	if err != nil {
		t.Fatal(err)
	}
	return s
}

func do(r *gin.Engine, method, bearer string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, "/staff", nil)
	req.Header.Set("Origin", "http://localhost:3100")
	if bearer != "" {
		req.Header.Set("Authorization", "Bearer "+bearer)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestAuthAndPermission(t *testing.T) {
	revoked := fakeRevocations{"revoked-jti": true}
	r := newRouter(revoked, 2)

	cases := []struct {
		name   string
		bearer string
		want   int
	}{
		{"no token", "", http.StatusUnauthorized},
		{"garbage token", "not-a-jwt", http.StatusUnauthorized},
		{"expired", token(t, jwt.MapClaims{"jti": "a", "permission_id": 2, "exp": time.Now().Add(-time.Minute).Unix()}), http.StatusUnauthorized},
		{"refresh token used as access", token(t, jwt.MapClaims{"jti": "b", "type": "refresh", "permission_id": 2}), http.StatusUnauthorized},
		{"revoked by logout", token(t, jwt.MapClaims{"jti": "revoked-jti", "permission_id": 2}), http.StatusUnauthorized},
		{"member lacks permission", token(t, jwt.MapClaims{"jti": "c", "permission_id": 1}), http.StatusForbidden},
		{"staff allowed", token(t, jwt.MapClaims{"jti": "d", "permission_id": 2}), http.StatusOK},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := do(r, http.MethodGet, tc.bearer).Code; got != tc.want {
				t.Fatalf("status = %d, want %d", got, tc.want)
			}
		})
	}
}

func TestCORSPreflightAllowsDelete(t *testing.T) {
	w := do(newRouter(nil, 2), http.MethodOptions, "")

	if w.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want 204", w.Code)
	}
	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3100" {
		t.Fatalf("allow-origin = %q", got)
	}
	if got := w.Header().Get("Access-Control-Allow-Methods"); !strings.Contains(got, "DELETE") {
		t.Fatalf("allow-methods %q does not include DELETE", got)
	}
}
