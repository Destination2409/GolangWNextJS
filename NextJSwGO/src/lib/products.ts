// src/lib/products.ts
// แปลงสินค้าจาก Go API ให้อยู่ในรูปที่ component หน้าร้านของ theme ใช้งาน
import type { ApiProduct } from "./api"

export type Badge = "ใหม่" | "ลดราคา"

export type Product = {
    id: number
    slug: string
    name: string
    tagline: string
    description: string
    price: number
    compareAt?: number
    categoryId?: number
    categoryName?: string
    image: string
    stock: number
    badge?: Badge
    colors: { name: string; value: string }[]
    specs: { label: string; value: string }[]
}

export const PLACEHOLDER_IMAGE = "/placeholder.jpg"
const NEW_PRODUCT_DAYS = 14

// สีที่ใช้ใน seed ของ theme นี้ ส่วนชื่อสีอื่นๆ จะลองใช้เป็นชื่อสี CSS ตรงๆ
const colourValues: Record<string, string> = {
    graphite: "oklch(0.3 0.02 268)",
    "neon cyan": "oklch(0.86 0.15 195)",
    "synth pink": "oklch(0.68 0.25 355)",
    "navy blue": "navy",
    "off white": "#f4f1ea",
}

function colourValue(name: string) {
    const key = name.trim().toLowerCase()
    return colourValues[key] ?? key.replace(/\s+/g, "")
}

export function productImage(p: Pick<ApiProduct, "image_url" | "image">) {
    if (p.image_url) return p.image_url
    // CSV จาก dataset มักให้แค่ชื่อไฟล์ ถ้าเป็น URL หรือ path อยู่แล้วก็ใช้ได้เลย
    if (p.image && (p.image.startsWith("/") || p.image.startsWith("http"))) return p.image
    return PLACEHOLDER_IMAGE
}

export function toProduct(p: ApiProduct): Product {
    const onSale = p.compare_at_price != null && p.compare_at_price > p.price
    const isNew =
        p.created_at != null && Date.now() - new Date(p.created_at).getTime() < NEW_PRODUCT_DAYS * 24 * 3600 * 1000

    const specs = [
        { label: "หมวดหมู่", value: p.category?.name },
        { label: "ประเภท", value: p.sub_category?.name },
        { label: "สี", value: p.colour?.name },
        { label: "เหมาะสำหรับ", value: p.usage?.name },
        { label: "เพศ", value: p.gender?.name },
        { label: "รหัสสินค้า", value: p.external_id },
    ].filter((s): s is { label: string; value: string } => Boolean(s.value))

    return {
        id: p.id,
        slug: String(p.id),
        name: p.title,
        tagline: p.product_type?.name ?? p.sub_category?.name ?? p.category?.name ?? "",
        description: p.description ?? "ยังไม่มีรายละเอียดสินค้า",
        price: p.price,
        compareAt: onSale ? p.compare_at_price! : undefined,
        categoryId: p.category_id ?? undefined,
        categoryName: p.category?.name,
        image: productImage(p),
        stock: p.stock,
        badge: onSale ? "ลดราคา" : isNew ? "ใหม่" : undefined,
        colors: p.colour ? [{ name: p.colour.name, value: colourValue(p.colour.name) }] : [{ name: "มาตรฐาน", value: "var(--muted-foreground)" }],
        specs,
    }
}

export function formatTHB(n: number) {
    return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n)
}
