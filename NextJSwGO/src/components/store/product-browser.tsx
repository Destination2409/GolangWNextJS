'use client'

import { useEffect, useState } from 'react'
import { Loader2, PackageSearch, Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchStoreProducts, type References, type StoreQuery } from '@/lib/api'
import { toProduct, type Product } from '@/lib/products'
import { ProductCard } from './product-card'

const sorts = [
  { id: 'newest', label: 'มาใหม่' },
  { id: 'price_asc', label: 'ราคาต่ำ → สูง' },
  { id: 'price_desc', label: 'ราคาสูง → ต่ำ' },
] as const

type SortId = (typeof sorts)[number]['id']

const PER_PAGE = 12

export function ProductBrowser({
  categories,
  initialCategory,
  initialSearch = '',
}: {
  categories: References['categories']
  initialCategory?: number
  initialSearch?: string
}) {
  const [category, setCategory] = useState<number | 'all'>(initialCategory ?? 'all')
  const [query, setQuery] = useState(initialSearch)
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearch)
  const [sort, setSort] = useState<SortId>('newest')
  const [inStockOnly, setInStockOnly] = useState(false)

  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // รอให้พิมพ์เสร็จ 400ms ก่อนค่อยยิง API
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400)
    return () => clearTimeout(t)
  }, [query])

  // เปลี่ยนตัวกรองเมื่อไหร่ เริ่มหน้า 1 ใหม่
  useEffect(() => {
    setPage(1)
  }, [category, debouncedQuery, sort, inStockOnly])

  useEffect(() => {
    let cancelled = false
    const q: StoreQuery = {
      page,
      per_page: PER_PAGE,
      search: debouncedQuery,
      category_id: category === 'all' ? undefined : category,
      in_stock: inStockOnly,
      sort,
    }
    setLoading(true)
    setError(false)
    fetchStoreProducts(q)
      .then((res) => {
        if (cancelled) return
        const mapped = res.data.map(toProduct)
        setItems((prev) => (page === 1 ? mapped : [...prev, ...mapped]))
        setTotal(res.total)
        setLastPage(res.last_page)
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [page, category, debouncedQuery, sort, inStockOnly])

  const chips: { id: number | 'all'; label: string }[] = [
    { id: 'all', label: 'ทั้งหมด' },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="กรองตามหมวดหมู่">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm transition-all duration-300 active:scale-90',
                category === c.id
                  ? 'bg-primary text-primary-foreground shadow-neon'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 rounded-xl bg-secondary px-3 transition-shadow focus-within:shadow-neon">
            <Search className="size-4 text-muted-foreground" />
            <span className="sr-only">ค้นหาสินค้า</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:w-44"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-secondary px-3">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <span className="sr-only">เรียงลำดับ</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              className="h-10 bg-transparent text-sm outline-none [&>option]:bg-popover"
            >
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p aria-live="polite">{loading && page === 1 ? 'กำลังค้นหา...' : `พบ ${total} รายการ`}</p>
        <label className="flex cursor-pointer items-center gap-2">
          <span>เฉพาะที่มีสินค้า</span>
          <button
            type="button"
            role="switch"
            aria-checked={inStockOnly}
            onClick={() => setInStockOnly((v) => !v)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              inStockOnly ? 'bg-primary shadow-neon' : 'bg-secondary',
            )}
          >
            <span
              className={cn(
                'absolute top-1 size-4 rounded-full bg-foreground transition-all duration-300',
                inStockOnly ? 'left-6 bg-primary-foreground' : 'left-1',
              )}
            />
          </button>
        </label>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-destructive/40 py-20 text-center">
          <p className="font-heading text-lg">โหลดสินค้าไม่สำเร็จ</p>
          <p className="text-sm text-muted-foreground">ตรวจสอบว่า API ทำงานอยู่ แล้วลองใหม่อีกครั้ง</p>
        </div>
      ) : items.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i % PER_PAGE} />
            ))}
          </div>
          {page < lastPage && (
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="mx-auto flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-sm font-medium shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-neon active:scale-95 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              โหลดเพิ่ม
            </button>
          )}
        </>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl border border-border bg-card" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-20 text-center">
          <PackageSearch className="size-10 animate-float text-primary" />
          <p className="font-heading text-lg">ไม่พบสินค้าที่ค้นหา</p>
          <p className="text-sm text-muted-foreground">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ดูนะ</p>
        </div>
      )}
    </div>
  )
}
