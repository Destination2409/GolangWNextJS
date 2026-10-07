package handlers

import (
	"net/http"
	"strconv"

	"github.com/chayanonchanatapa/golangapi/internal/repositories"
	"github.com/chayanonchanatapa/golangapi/internal/services"
	"github.com/gin-gonic/gin"
)

// StoreHandler serves the public storefront: no login, active products only.
type StoreHandler struct {
	service services.ProductService
}

func NewStoreHandler(service services.ProductService) *StoreHandler {
	return &StoreHandler{service}
}

func (h *StoreHandler) GetProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "12"))
	categoryID, _ := strconv.ParseUint(c.Query("category_id"), 10, 32)
	excludeID, _ := strconv.ParseUint(c.Query("exclude_id"), 10, 64)

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 60 {
		perPage = 12
	}

	result, err := h.service.GetStoreProducts(repositories.StoreQuery{
		Page:       page,
		PerPage:    perPage,
		Search:     c.Query("search"),
		CategoryID: uint(categoryID),
		InStock:    c.Query("in_stock") == "1" || c.Query("in_stock") == "true",
		Sort:       c.Query("sort"),
		ExcludeID:  excludeID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *StoreHandler) GetProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id format"})
		return
	}

	product, err := h.service.GetStoreProduct(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": product})
}

func (h *StoreHandler) GetReferences(c *gin.Context) {
	refs, err := h.service.GetReferences()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": refs})
}
