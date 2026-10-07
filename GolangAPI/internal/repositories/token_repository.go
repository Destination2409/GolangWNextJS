package repositories

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	refreshKeyPrefix = "auth:refresh:" // auth:refresh:<jti> -> user id, lives as long as the refresh token
	revokedKeyPrefix = "auth:revoked:" // auth:revoked:<jti> -> 1, lives until the access token would expire
)

// TokenRepository keeps auth token state in Redis so that refresh tokens are
// single-use (rotated on every refresh) and logout actually invalidates tokens.
type TokenRepository struct {
	rdb *redis.Client
}

func NewTokenRepository(rdb *redis.Client) *TokenRepository {
	return &TokenRepository{rdb: rdb}
}

func (r *TokenRepository) SaveRefreshToken(ctx context.Context, jti string, userID uint, ttl time.Duration) error {
	return r.rdb.Set(ctx, refreshKeyPrefix+jti, userID, ttl).Err()
}

// ConsumeRefreshToken atomically deletes the refresh token and returns its user id.
// found is false when the token was never issued, already used, or revoked.
func (r *TokenRepository) ConsumeRefreshToken(ctx context.Context, jti string) (userID uint, found bool, err error) {
	val, err := r.rdb.GetDel(ctx, refreshKeyPrefix+jti).Result()
	if errors.Is(err, redis.Nil) {
		return 0, false, nil
	}
	if err != nil {
		return 0, false, err
	}
	id, err := strconv.ParseUint(val, 10, 64)
	if err != nil {
		return 0, false, err
	}
	return uint(id), true, nil
}

func (r *TokenRepository) DeleteRefreshToken(ctx context.Context, jti string) error {
	return r.rdb.Del(ctx, refreshKeyPrefix+jti).Err()
}

func (r *TokenRepository) RevokeAccessToken(ctx context.Context, jti string, ttl time.Duration) error {
	if ttl <= 0 {
		return nil // already expired, nothing to block
	}
	return r.rdb.Set(ctx, revokedKeyPrefix+jti, 1, ttl).Err()
}

func (r *TokenRepository) IsAccessTokenRevoked(ctx context.Context, jti string) (bool, error) {
	n, err := r.rdb.Exists(ctx, revokedKeyPrefix+jti).Result()
	return n > 0, err
}
