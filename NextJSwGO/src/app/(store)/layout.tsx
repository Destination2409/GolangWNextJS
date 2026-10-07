import { CartProvider } from '@/components/store/cart-provider'
import { CartSheet } from '@/components/store/cart-sheet'
import { SiteFooter } from '@/components/store/site-footer'
import { SiteHeader } from '@/components/store/site-header'
import { fetchReferences } from '@/lib/api'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // หมวดหมู่ใช้ทำเมนู ถ้า API ล่มก็ยังแสดงหน้าได้ แค่ไม่มีลิงก์หมวดหมู่
  const categories = await fetchReferences()
    .then((r) => r.categories)
    .catch(() => [])

  return (
    <CartProvider>
      <div className="relative flex min-h-dvh flex-col">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <SiteHeader categories={categories} />
        <main className="flex-1">{children}</main>
        <SiteFooter categories={categories} />
      </div>
      <CartSheet />
    </CartProvider>
  )
}
