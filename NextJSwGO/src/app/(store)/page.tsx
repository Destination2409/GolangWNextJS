import { CategoryGrid } from '@/components/store/home/category-grid'
import { FlashSale } from '@/components/store/home/flash-sale'
import { Hero } from '@/components/store/home/hero'
import { Marquee } from '@/components/store/home/marquee'
import { Newsletter } from '@/components/store/home/newsletter'
import { SectionHeading } from '@/components/store/home/section-heading'
import { ProductCard } from '@/components/store/product-card'
import { fetchReferences, fetchStoreProducts } from '@/lib/api'
import { toProduct } from '@/lib/products'

export default async function HomePage() {
  const [list, refs] = await Promise.all([
    fetchStoreProducts({ per_page: 24 }).catch(() => null),
    fetchReferences().catch(() => null),
  ])
  const products = (list?.data ?? []).map(toProduct)
  const categories = refs?.categories ?? []

  // สินค้าแนะนำ: ตัวที่มีป้าย (ลดราคา/ใหม่) ก่อน แล้วเติมด้วยสินค้าล่าสุด
  const featured = [...products.filter((p) => p.badge), ...products.filter((p) => !p.badge)].slice(0, 4)
  const onSale = products.filter((p) => p.compareAt)
  const heroProduct = products.find((p) => p.image.endsWith('/hero.png')) ?? products[0]

  return (
    <>
      <Hero product={heroProduct} productCount={list?.total ?? 0} categoryCount={categories.length} />
      <Marquee />
      {categories.length > 0 && <CategoryGrid categories={categories} />}
      <section className="px-3 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <SectionHeading eyebrow="แนะนำ" title="สินค้ามาแรงตอนนี้" href="/products" />
          {featured.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-border py-16 text-center text-muted-foreground">
              ยังไม่มีสินค้าในร้าน เพิ่มสินค้าได้ที่ระบบหลังบ้าน
            </p>
          )}
        </div>
      </section>
      {onSale.length > 0 && <FlashSale products={onSale} />}
      <Newsletter />
    </>
  )
}
