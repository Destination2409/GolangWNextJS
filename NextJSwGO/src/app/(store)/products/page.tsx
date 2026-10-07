import type { Metadata } from 'next'
import { ProductBrowser } from '@/components/store/product-browser'
import { fetchReferences } from '@/lib/api'

export const metadata: Metadata = {
  title: 'สินค้าทั้งหมด — NEONSHOP',
  description: 'เลือกชมแกดเจ็ต เทคแวร์ และอุปกรณ์ล้ำยุคทั้งหมดของ NEONSHOP',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const { category, search } = await searchParams
  const categories = await fetchReferences()
    .then((r) => r.categories)
    .catch(() => [])
  const categoryId = Number(category)
  const valid = categories.some((c) => c.id === categoryId) ? categoryId : undefined

  return (
    <div className="px-3 py-10 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <span className="font-heading text-sm font-medium uppercase tracking-widest text-accent">Catalog</span>
          <h1 className="text-balance font-heading text-4xl font-bold md:text-5xl">
            สินค้า<span className="text-primary text-neon">ทั้งหมด</span>
          </h1>
          <p className="text-muted-foreground">อัปเกรดชีวิตประจำวันด้วยอุปกรณ์จากอนาคต</p>
        </header>
        <ProductBrowser
          key={`${valid ?? 'all'}-${search ?? ''}`}
          categories={categories}
          initialCategory={valid}
          initialSearch={search ?? ''}
        />
      </div>
    </div>
  )
}
