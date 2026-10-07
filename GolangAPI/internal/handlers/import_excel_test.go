package handlers

import (
	"bytes"
	"testing"

	"github.com/chayanonchanatapa/golangapi/internal/services"
)

// The example file must be importable as-is: same header, 15 rows, raw numbers.
func TestImportExampleRoundTrip(t *testing.T) {
	f, err := buildImportExample()
	if err != nil {
		t.Fatal(err)
	}
	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		t.Fatal(err)
	}

	rows, err := readXLSX(&buf)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 16 {
		t.Fatalf("rows = %d, want header + 15", len(rows))
	}
	for i, name := range services.ImportColumns {
		if rows[0][i] != name {
			t.Fatalf("header[%d] = %q, want %q", i, rows[0][i], name)
		}
	}
	// Price must come back unformatted so the import can parse it
	if got := rows[1][10]; got != "6990" {
		t.Fatalf("price cell = %q, want raw 6990", got)
	}
	if len(columnNotes) != len(services.ImportColumns) {
		t.Fatalf("columnNotes has %d entries, want %d", len(columnNotes), len(services.ImportColumns))
	}
}
