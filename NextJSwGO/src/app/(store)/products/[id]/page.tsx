import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { SectionHeading } from '@/components/store/home/section-heading'
import { ProductCard } from '@/components/store/product-card'
import { ProductPurchase } from '@/components/store/product-purchase'
import { fetchStoreProduct, fetchStoreProducts } from '@/lib/api'
import { toProduct } from '@/lib/products'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await fetchStoreProduct(id).catch(() => null)
  if (!product) return { title: 'ไม่พบสินค้า — NEONSHOP' }
  return { title: `${product.title} — NEONSHOP`, description: product.description ?? undefined }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const apiProduct = await fetchStoreProduct(id)
  if (!apiProduct) notFound()
  const product = toProduct(apiProduct)

  // สินค้าที่เกี่ยวข้อง: หมวดเดียวกันก่อน ถ้าไม่พอเติมด้วยสินค้าอื่น
  const sameCategory = await fetchStoreProducts({ category_id: product.categoryId, exclude_id: product.id, per_page: 4 })
    .then((r) => r.data)
    .catch(() => [])
  const others =
    sameCategory.length < 4
      ? await fetchStoreProducts({ exclude_id: product.id, per_page: 8 })
          .then((r) => r.data.filter((p) => !sameCategory.some((s) => s.id === p.id)))
          .catch(() => [])
      : []
  const related = [...sameCategory, ...others].slice(0, 4).map(toProduct)

  return (
    <div className="px-3 py-8 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-16">
        <div className="flex flex-col gap-6">
          <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-primary">หน้าหลัก</Link>
            <ChevronRight className="size-4" />
            {product.categoryId ? (
              <Link href={`/products?category=${product.categoryId}`} className="transition-colors hover:text-primary">
                {product.categoryName}
              </Link>
            ) : (
              <Link href="/products" className="transition-colors hover:text-primary">สินค้าทั้งหมด</Link>
            )}
            <ChevronRight className="size-4" />
            <span className="text-foreground" aria-current="page">{product.name}</span>
          </nav>
          <ProductPurchase product={product} />
        </div>
        {related.length > 0 && (
          <section className="flex flex-col gap-8">
            <SectionHeading eyebrow="คุณอาจชอบ" title="สินค้าที่เกี่ยวข้อง" href="/products" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
