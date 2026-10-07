'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Timer } from 'lucide-react'
import type { Product } from '@/lib/products'

function useCountdown(hours: number) {
  const [remaining, setRemaining] = useState<number | null>(null)
  useEffect(() => {
    const end = Date.now() + hours * 3600 * 1000
    const tick = () => setRemaining(Math.max(0, end - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [hours])
  const total = Math.floor((remaining ?? hours * 3600 * 1000) / 1000)
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
}

export function FlashSale({ products }: { products: Product[] }) {
  const [h, m, s] = useCountdown(8)
  const maxDiscount = Math.max(...products.map((p) => Math.round((1 - p.price / (p.compareAt ?? p.price)) * 100)))
  const names = products.slice(0, 3).map((p) => p.name).join(', ')
  const images = products.slice(0, 2).map((p) => p.image)
  const units = [
    { label: 'ชั่วโมง', value: h },
    { label: 'นาที', value: m },
    { label: 'วินาที', value: s },
  ]

  return (
    <section className="px-3 py-16 md:px-6">
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2.5rem] border border-accent/30 bg-card p-6 shadow-neon-pink md:grid-cols-2 md:p-12">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative flex flex-col gap-5">
          <span className="flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <Timer className="size-3.5" />
            Flash Sale
          </span>
          <h2 className="text-balance font-heading text-3xl font-bold md:text-5xl">
            ลดสูงสุด <span className="text-accent">{maxDiscount}%</span> เฉพาะคืนนี้
          </h2>
          <p className="max-w-md leading-relaxed text-muted-foreground">
            {names} และอีกหลายรุ่น ลดราคาพิเศษในเวลาจำกัด ของมีจำนวนจำกัด
          </p>
          <div className="flex gap-3" role="timer" aria-label="เวลาที่เหลือ">
            {units.map((u) => (
              <div key={u.label} className="flex w-20 flex-col items-center rounded-2xl border border-border bg-background/60 py-3 shadow-soft">
                <span className="font-heading text-3xl font-bold tabular-nums text-primary">
                  {String(u.value).padStart(2, '0')}
                </span>
                <span className="text-xs text-muted-foreground">{u.label}</span>
              </div>
            ))}
          </div>
          <Link
            href="/products"
            className="group flex w-fit items-center gap-2 rounded-2xl bg-accent px-6 py-3.5 font-medium text-accent-foreground shadow-neon-pink transition-all hover:-translate-y-1 active:scale-95"
          >
            ช้อปดีลนี้
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-border shadow-soft transition-transform duration-500 hover:-rotate-2 hover:scale-[1.03]"
              style={{ marginTop: i === 1 ? '2.5rem' : 0 }}
            >
              <Image src={src} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
