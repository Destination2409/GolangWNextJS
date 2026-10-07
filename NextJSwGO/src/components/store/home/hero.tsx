import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BatteryFull, Sparkles, Zap } from 'lucide-react'
import { formatTHB, type Product } from '@/lib/products'

export function Hero({
  product,
  productCount,
  categoryCount,
}: {
  product?: Product
  productCount: number
  categoryCount: number
}) {
  return (
    <section className="px-3 pt-6 md:px-6 md:pt-10">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <span
            className="flex w-fit animate-rise items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary"
            style={{ animationDelay: '0ms' }}
          >
            <span className="size-1.5 animate-glow rounded-full bg-primary" />
            คอลเลกชันใหม่ 2026 มาแล้ว
          </span>
          <h1
            className="animate-rise text-balance font-heading text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
            style={{ animationDelay: '100ms' }}
          >
            ใช้ชีวิตใน<span className="text-neon text-primary">อนาคต</span>
            <br />
            ตั้งแต่<span className="text-accent">วันนี้</span>
          </h1>
          <p
            className="max-w-md animate-rise text-pretty text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: '200ms' }}
          >
            แกดเจ็ต เทคแวร์ และอุปกรณ์ล้ำยุคที่คัดมาแล้ว ออกแบบมาเพื่อคนเมืองที่ไม่เคยหยุดนิ่ง
          </p>
          <div className="flex animate-rise flex-wrap gap-3" style={{ animationDelay: '300ms' }}>
            <Link
              href="/products"
              className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-primary px-6 py-3.5 font-medium text-primary-foreground shadow-neon transition-all hover:-translate-y-1 active:scale-95"
            >
              <span className="relative z-10">เลือกซื้อเลย</span>
              <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-1" />
              <span aria-hidden className="absolute inset-y-0 left-0 w-1/3 animate-shine bg-primary-foreground/25" />
            </Link>
            <Link
              href={product ? `/products/${product.slug}` : '/products'}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 font-medium shadow-soft transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-neon-pink active:scale-95"
            >
              ดูสินค้าเด่น
            </Link>
          </div>
          <dl className="flex animate-rise gap-8 pt-2" style={{ animationDelay: '400ms' }}>
            <div>
              <dt className="text-xs text-muted-foreground">สินค้าในร้าน</dt>
              <dd className="font-heading text-2xl font-bold tabular-nums">{productCount.toLocaleString('th-TH')}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">หมวดหมู่</dt>
              <dd className="font-heading text-2xl font-bold tabular-nums">{categoryCount}</dd>
            </div>
          </dl>
        </div>

        <div className="relative animate-rise" style={{ animationDelay: '200ms' }}>
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-primary/20 bg-[#070b1f] shadow-neon">
            {/* Oversized wrapper so the floating/rotating image never exposes the frame edges */}
            <div className="absolute -inset-[9%] animate-float">
              <Image
                src={product?.image ?? "/images/hero.png"}
                alt={product?.name ?? 'สินค้าแนะนำ'}
                fill
                priority
                sizes="(min-width: 1024px) 60vw, 120vw"
                className="object-cover"
              />
            </div>
            <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/4 animate-scan bg-primary/10 blur-xl"
            />
          </div>

          <div className="absolute -left-2 top-10 flex animate-float items-center gap-3 rounded-2xl border border-border bg-card/85 p-3 shadow-neon backdrop-blur md:-left-8">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BatteryFull className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">แบตเตอรี่</p>
              <p className="font-heading font-semibold">60 ชั่วโมง</p>
            </div>
          </div>
          <div
            className="absolute -right-2 bottom-12 flex animate-float items-center gap-3 rounded-2xl border border-border bg-card/85 p-3 shadow-neon-pink backdrop-blur md:-right-6"
            style={{ animationDelay: '-3s' }}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Zap className="size-5" />
            </span>
            <div>
              <p className="max-w-32 truncate text-xs text-muted-foreground">{product?.name ?? 'NEONSHOP'}</p>
              <p className="font-heading font-semibold text-primary">{product ? formatTHB(product.price) : 'เร็วๆ นี้'}</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 hidden items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 text-xs backdrop-blur sm:flex">
            <Sparkles className="size-3.5 text-warning" />
            ขายดีอันดับ 1 สัปดาห์นี้
          </div>
        </div>
      </div>
    </section>
  )
}
