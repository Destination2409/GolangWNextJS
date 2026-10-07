import Link from 'next/link'
import { ArrowUpRight, Gamepad2, Headphones, Shapes, Shirt, Watch } from 'lucide-react'
import type { References } from '@/lib/api'
import { SectionHeading } from './section-heading'

// ไอคอนตามลำดับหมวดหมู่ใน seed (ระบบเสียง, สวมใส่, เกมมิ่ง, เทคแวร์) หมวดที่เพิ่มทีหลังใช้ Shapes
const icons = [Headphones, Watch, Gamepad2, Shirt]

export function CategoryGrid({ categories }: { categories: References['categories'] }) {
  return (
    <section className="px-3 py-16 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <SectionHeading eyebrow="หมวดหมู่" title="เลือกตามสไตล์ของคุณ" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((c, i) => {
            const Icon = icons[i] ?? Shapes
            return (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="group relative flex animate-rise flex-col gap-6 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-neon active:scale-[0.97]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </span>
                  <ArrowUpRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.product_count} สินค้า</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
