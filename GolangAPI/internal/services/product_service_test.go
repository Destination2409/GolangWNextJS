package services

import (
	"testing"

	"github.com/chayanonchanatapa/golangapi/internal/models"
)

func TestApplyOptionalColumns(t *testing.T) {
	base := []string{"EX-1", "", "", "", "", "", "", "Title", "", ""}

	t.Run("old 10-column file sets nothing", func(t *testing.T) {
		p := &models.Product{}
		given, ok := applyOptionalColumns(p, base)
		if !ok || given.Price || given.Stock || given.CompareAt || given.Description {
			t.Fatalf("given = %+v ok = %v", given, ok)
		}
	})

	t.Run("all optional columns", func(t *testing.T) {
		p := &models.Product{}
		row := append(append([]string{}, base...), "8,990", "10990", "15.0", "desc")
		given, ok := applyOptionalColumns(p, row)
		if !ok || !given.Price || !given.Stock || !given.CompareAt || !given.Description {
			t.Fatalf("given = %+v ok = %v", given, ok)
		}
		if p.Price != 8990 || p.Stock != 15 || p.CompareAt == nil || *p.CompareAt != 10990 || *p.Description != "desc" {
			t.Fatalf("product = %+v", p)
		}
	})

	t.Run("bad number skips the row", func(t *testing.T) {
		row := append(append([]string{}, base...), "abc")
		if _, ok := applyOptionalColumns(&models.Product{}, row); ok {
			t.Fatal("expected ok = false")
		}
	})
}
