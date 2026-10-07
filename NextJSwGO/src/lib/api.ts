// src/lib/api.ts
// Types ของข้อมูลที่ Go API ส่งกลับมา + ตัวช่วยเรียก API ฝั่งหน้าร้าน (ไม่ต้องล็อกอิน)

export type Named = { id: number; name: string }

export type ApiProduct = {
    id: number
    external_id: string
    title: string
    description: string | null
    image: string | null
    image_url: string | null
    price: number
    compare_at_price: number | null
    stock: number
    status: "active" | "inactive"
    gender_id: number | null
    category_id: number | null
    sub_category_id: number | null
    product_type_id: number | null
    colour_id: number | null
    usage_id: number | null
    created_at: string | null
    updated_at: string | null
    gender?: Named | null
    category?: Named | null
    sub_category?: (Named & { category_id: number }) | null
    product_type?: (Named & { sub_category_id: number }) | null
    colour?: Named | null
    usage?: Named | null
}

export type Paginated<T> = {
    data: T[]
    total: number
    page: number
    per_page: number
    last_page: number
}

export type References = {
    genders: Named[]
    categories: (Named & { product_count: number })[]
    sub_categories: (Named & { category_id: number })[]
    product_types: (Named & { sub_category_id: number })[]
    colours: Named[]
    usages: Named[]
}

export type StoreQuery = {
    page?: number
    per_page?: number
    search?: string
    category_id?: number
    in_stock?: boolean
    sort?: "newest" | "price_asc" | "price_desc"
    exclude_id?: number
}

/**
 * Server components รันใน container ของ Next.js จึงต้องเรียก API ผ่านชื่อ service ใน Docker
 * (API_INTERNAL_URL) ส่วนเบราว์เซอร์เรียกผ่าน port ของเครื่อง (NEXT_PUBLIC_API_URL)
 */
export function apiBase() {
    if (typeof window === "undefined") {
        return process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8180/api"
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8180/api"
}

function toQueryString(q: StoreQuery) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(q)) {
        if (value === undefined || value === "" || value === false) continue
        params.set(key, value === true ? "1" : String(value))
    }
    const s = params.toString()
    return s ? `?${s}` : ""
}

async function getJSON<T>(path: string): Promise<T> {
    const res = await fetch(`${apiBase()}${path}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`API ${path} failed with ${res.status}`)
    return res.json()
}

export function fetchStoreProducts(q: StoreQuery = {}) {
    return getJSON<Paginated<ApiProduct>>(`/store/products${toQueryString(q)}`)
}

/** คืนค่า null ถ้าไม่พบสินค้า (หรือสินค้าถูกปิดการขาย) */
export async function fetchStoreProduct(id: string | number) {
    const res = await fetch(`${apiBase()}/store/products/${encodeURIComponent(String(id))}`, { cache: "no-store" })
    if (res.status === 404 || res.status === 400) return null
    if (!res.ok) throw new Error(`API /store/products/${id} failed with ${res.status}`)
    const json: { data: ApiProduct } = await res.json()
    return json.data
}

export async function fetchReferences() {
    const json = await getJSON<{ data: References }>("/store/references")
    return json.data
}
