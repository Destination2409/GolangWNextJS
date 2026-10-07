package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/chayanonchanatapa/golangapi/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

const exampleFileName = "Go_next_import_product_example.xlsx"

// readXLSX returns the rows of the first sheet, the same shape encoding/csv gives.
func readXLSX(r io.Reader) ([][]string, error) {
	f, err := excelize.OpenReader(r)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		return nil, fmt.Errorf("workbook has no sheets")
	}
	// RawCellValue keeps 8990 as "8990" instead of the formatted "8,990"
	return f.GetRows(sheets[0], excelize.Options{RawCellValue: true})
}

// Example rows: a mix of existing categories and new ones (บ้านอัจฉริยะ, แผ่นรองเมาส์)
// to show that the import creates missing categories automatically.
var exampleRows = [][]interface{}{
	{"EX-001", "Unisex", "ระบบเสียง", "หูฟัง", "หูฟังเกมมิ่งไร้สาย", "Black", "เกมมิ่ง", "NOVA-X Pro Headset", "hero.png", "/images/hero.png", 6990, 7990, 25, "หูฟังเกมมิ่งไร้สาย ดีเลย์ต่ำ ไมค์ตัดเสียงรบกวน แบตเตอรี่ 40 ชั่วโมง"},
	{"EX-002", "Unisex", "ระบบเสียง", "หูฟัง", "หูฟังไร้สายพร้อมเคสวงแหวนแสง", "White", "ใช้งานทั่วไป", "ORBIT Buds Lite", "p-earbuds.png", "/images/p-earbuds.png", 1990, nil, 60, "หูฟัง True Wireless รุ่นเล็ก น้ำหนักเบา ใส่สบายทั้งวัน"},
	{"EX-003", "Unisex", "ระบบเสียง", "ลำโพง", "ลำโพงพกพาไฟ RGB", "Neon Cyan", "ใช้งานทั่วไป", "BEAM Max Speaker", nil, nil, 3490, nil, 18, "ลำโพงบลูทูธเสียงรอบทิศทาง กันน้ำ IPX7 พร้อมไฟ RGB"},
	{"EX-004", "Unisex", "อุปกรณ์สวมใส่", "นาฬิกาอัจฉริยะ", "สมาร์ทวอทช์หน้าจอโฮโลกราฟิก", "Graphite", "กีฬา", "PULSE Watch Sport", "p-watch.png", "/images/p-watch.png", 8990, 9990, 30, "สมาร์ทวอทช์สายกีฬา GPS ในตัว วัดชีพจรและออกซิเจนในเลือด"},
	{"EX-005", "Women", "อุปกรณ์สวมใส่", "นาฬิกาอัจฉริยะ", "สมาร์ทวอทช์หน้าจอโฮโลกราฟิก", "Synth Pink", "ใช้งานทั่วไป", "PULSE Watch Mini", "p-watch.png", "/images/p-watch.png", 7490, nil, 12, "สมาร์ทวอทช์หน้าปัดเล็ก 38mm ตัวเรือนอะลูมิเนียม"},
	{"EX-006", "Unisex", "อุปกรณ์สวมใส่", "แว่น AR", "แว่น AR เลนส์รอบทิศ", "Black", "เดินทาง", "HALO AR Lite", "p-visor.png", "/images/p-visor.png", 12900, 14900, 5, "แว่น AR รุ่นเบา แสดงแผนที่นำทางและข้อความแจ้งเตือน"},
	{"EX-007", "Unisex", "เกมมิ่งเกียร์", "คีย์บอร์ด", "คีย์บอร์ดแมคคานิคอล RGB ใส", "White", "เกมมิ่ง", "GRID-60 Compact Keyboard", "p-keyboard.png", "/images/p-keyboard.png", 3990, nil, 40, "คีย์บอร์ดขนาด 60% สวิตช์ Hot-swap คีย์แคปโปร่งแสง"},
	{"EX-008", "Unisex", "เกมมิ่งเกียร์", "คีย์บอร์ด", "คีย์บอร์ดแมคคานิคอล RGB ใส", "Black", "เกมมิ่ง", "GRID-100 Full Keyboard", "p-keyboard.png", "/images/p-keyboard.png", 6490, nil, 22, "คีย์บอร์ดฟูลไซซ์ มีปุ่มตัวเลข ปุ่มหมุนปรับเสียง"},
	{"EX-009", "Unisex", "เกมมิ่งเกียร์", "เมาส์", "เมาส์เกมมิ่งเปลือกใส", "Neon Cyan", "เกมมิ่ง", "ION Mouse Pro", "p-mouse.png", "/images/p-mouse.png", 3290, 3690, 35, "เมาส์ไร้สาย 52 กรัม เซนเซอร์ 30K DPI ชาร์จไร้สายได้"},
	{"EX-010", "Unisex", "เกมมิ่งเกียร์", "แผ่นรองเมาส์", "แผ่นรองเมาส์ RGB", "Black", "เกมมิ่ง", "GLOW Desk Mat XL", nil, nil, 990, nil, 80, "แผ่นรองเมาส์ขนาด 90x40 ซม. ขอบไฟ RGB"},
	{"EX-011", "Men", "เทคแวร์", "เสื้อผ้า", "แจ็คเก็ตกันน้ำแถบสะท้อนแสง", "Graphite", "เดินทาง", "SHELL Jacket Night", "p-jacket.png", "/images/p-jacket.png", 4590, nil, 14, "แจ็คเก็ตกันน้ำ มีฮู้ด แถบสะท้อนแสงรอบแขน"},
	{"EX-012", "Unisex", "เทคแวร์", "รองเท้า", "รองเท้าพื้นเรืองแสง", "White", "กีฬา", "VOLT Runner Lite", "p-sneaker.png", "/images/p-sneaker.png", 2990, 3490, 3, "รองเท้าวิ่งรุ่นเบา พื้นเรืองแสงในที่มืด"},
	{"EX-013", "Unisex", "เทคแวร์", "กระเป๋า", "กระเป๋าเป้เทคแวร์ 24L", "Black", "เดินทาง", "CARGO Sling Bag", "p-backpack.png", "/images/p-backpack.png", 1590, nil, 0, "กระเป๋าคาดอก กันน้ำ ใส่แท็บเล็ต 11 นิ้วได้"},
	{"EX-014", "Unisex", "บ้านอัจฉริยะ", "หลอดไฟ", "หลอดไฟอัจฉริยะ RGB", "Neon Cyan", "ใช้งานทั่วไป", "LUMEN Smart Bulb", nil, nil, 590, nil, 120, "หลอดไฟ Wi-Fi ปรับสีได้ 16 ล้านสี สั่งงานผ่านแอป"},
	{"EX-015", "Unisex", "บ้านอัจฉริยะ", "ไฟเส้น", "ไฟเส้น LED นีออน", "Synth Pink", "ใช้งานทั่วไป", "NEON Strip 5m", nil, nil, 890, 1190, 45, "ไฟเส้น LED ยาว 5 เมตร ตัดได้ เปลี่ยนสีตามเพลง"},
}

// Column notes for the second sheet; must stay in the same order as services.ImportColumns.
var columnNotes = [][2]string{
	{"บังคับ", "รหัสสินค้า ไม่ซ้ำกัน ถ้ามีอยู่แล้วจะอัปเดตสินค้าเดิม"},
	{"ไม่บังคับ", "เพศ เช่น Unisex, Men, Women"},
	{"ไม่บังคับ", "หมวดหมู่ ถ้ายังไม่มีระบบจะสร้างให้"},
	{"ไม่บังคับ", "หมวดหมู่ย่อย (อยู่ใต้ Category)"},
	{"ไม่บังคับ", "ประเภทสินค้า (อยู่ใต้ SubCategory) ใช้เป็นคำโปรยบนหน้าร้าน"},
	{"ไม่บังคับ", "สี"},
	{"ไม่บังคับ", "การใช้งาน เช่น ใช้งานทั่วไป, เกมมิ่ง, กีฬา"},
	{"บังคับ", "ชื่อสินค้า"},
	{"ไม่บังคับ", "ชื่อไฟล์รูป"},
	{"ไม่บังคับ", "URL หรือ path ของรูป เช่น /images/p-watch.png หรือ https://..."},
	{"ไม่บังคับ", "ราคาขาย (บาท) เว้นว่างเพื่อคงราคาเดิมตอนอัปเดต"},
	{"ไม่บังคับ", "ราคาก่อนลด ใส่เมื่อสินค้าลดราคา (ต้องมากกว่า Price)"},
	{"ไม่บังคับ", "จำนวนสต็อก เว้นว่างเพื่อคงสต็อกเดิมตอนอัปเดต"},
	{"ไม่บังคับ", "รายละเอียดสินค้า"},
}

func buildImportExample() (*excelize.File, error) {
	f := excelize.NewFile()
	const sheet = "Products"
	if err := f.SetSheetName("Sheet1", sheet); err != nil {
		return nil, err
	}

	header, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"0E7490"}, Pattern: 1},
		Alignment: &excelize.Alignment{Vertical: "center"},
	})
	required, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"BE185D"}, Pattern: 1},
		Alignment: &excelize.Alignment{Vertical: "center"},
	})
	money, _ := f.NewStyle(&excelize.Style{NumFmt: 3}) // #,##0

	for i, name := range services.ImportColumns {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		_ = f.SetCellValue(sheet, cell, name)
		style := header
		if name == "ProductId" || name == "ProductTitle" {
			style = required
		}
		_ = f.SetCellStyle(sheet, cell, cell, style)
	}
	for r, row := range exampleRows {
		cell, _ := excelize.CoordinatesToCellName(1, r+2)
		if err := f.SetSheetRow(sheet, cell, &row); err != nil {
			return nil, err
		}
	}

	last := len(exampleRows) + 1
	_ = f.SetCellStyle(sheet, "K2", fmt.Sprintf("M%d", last), money)
	widths := map[string]float64{"A": 10, "B": 9, "C": 14, "D": 16, "E": 30, "F": 12, "G": 13, "H": 26, "I": 15, "J": 24, "K": 10, "L": 15, "M": 8, "N": 60}
	for col, w := range widths {
		_ = f.SetColWidth(sheet, col, col, w)
	}
	_ = f.SetRowHeight(sheet, 1, 22)
	_ = f.SetPanes(sheet, &excelize.Panes{Freeze: true, YSplit: 1, TopLeftCell: "A2", ActivePane: "bottomLeft"})
	_ = f.AutoFilter(sheet, fmt.Sprintf("A1:N%d", last), nil)

	// Second sheet: what each column means. Import only reads the first sheet.
	const help = "คำอธิบายคอลัมน์"
	if _, err := f.NewSheet(help); err != nil {
		return nil, err
	}
	_ = f.SetSheetRow(help, "A1", &[]string{"คอลัมน์", "จำเป็น", "คำอธิบาย"})
	_ = f.SetCellStyle(help, "A1", "C1", header)
	for i, name := range services.ImportColumns {
		cell, _ := excelize.CoordinatesToCellName(1, i+2)
		_ = f.SetSheetRow(help, cell, &[]string{name, columnNotes[i][0], columnNotes[i][1]})
	}
	_ = f.SetCellValue(help, fmt.Sprintf("A%d", len(services.ImportColumns)+3), "หมายเหตุ: ระบบอ่านเฉพาะชีตแรก (Products) แถวแรกต้องเป็นหัวตาราง รองรับไฟล์ .xlsx และ .csv")
	_ = f.SetColWidth(help, "A", "A", 16)
	_ = f.SetColWidth(help, "B", "B", 10)
	_ = f.SetColWidth(help, "C", "C", 70)

	f.SetActiveSheet(0)
	return f, nil
}

// DownloadImportExample serves a ready-to-import Excel file with 15 sample products.
func (h *ProductHandler) DownloadImportExample(c *gin.Context) {
	f, err := buildImportExample()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer f.Close()

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, exampleFileName))
	if err := f.Write(c.Writer); err != nil {
		c.Status(http.StatusInternalServerError)
	}
}
