'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Check, Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatTHB, type Product } from '@/lib/products'
import { useCart } from './cart-provider'

export function ProductPurchase({ product }: { product: Product }) {
  const { add, setOpen } = useCart()
  const [color, setColor] = useState(product.colors[0].name)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [liked, setLiked] = useState(false)
  const [tab, setTab] = useState<'detail' | 'specs'>('detail')
  const soldOut = product.stock === 0
  const maxQty = Math.max(1, Math.min(10, product.stock))

  function handleAdd() {
    add(product, qty, color)
    setAdded(true)
    toast.success('เพิ่มลงตะกร้าแล้ว', {
      description: `${product.name} (${color}) × ${qty}`,
      action: { label: 'ดูตะกร้า', onClick: () => setOpen(true) },
    })
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col gap-4">
        <div className="group relative aspect-square animate-rise overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-neon">
          <div aria-hidden className="absolute inset-0 bg-grid opacity-60" />
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/4 animate-scan bg-primary/10 blur-xl" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'relative aspect-square overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5',
                i === 0 ? 'border-primary shadow-neon' : 'border-border opacity-60 hover:opacity-100',
              )}
            >
              <Image
                src={product.image}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
                style={{ transform: `scale(${1 + i * 0.25}) rotate(${i * 8}deg)` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex animate-rise flex-col gap-6" style={{ animationDelay: '120ms' }}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {product.badge && (
              <span className="rounded-full bg-accent px-3 py-1 font-heading text-xs font-semibold text-accent-foreground">
                {product.badge}
              </span>
            )}
            {product.categoryName && <span className="text-sm text-muted-foreground">{product.categoryName}</span>}
          </div>
          <h1 className="text-balance font-heading text-4xl font-bold md:text-5xl">{product.name}</h1>
          <p className="text-lg text-muted-foreground">{product.tagline}</p>
        </div>

        <div className="flex items-end gap-3">
          <span className="font-heading text-4xl font-bold text-primary text-neon">{formatTHB(product.price)}</span>
          {product.compareAt && (
            <>
              <span className="pb-1 text-muted-foreground line-through">{formatTHB(product.compareAt)}</span>
              <span className="mb-1 rounded-lg bg-accent/15 px-2 py-0.5 text-sm text-accent">
                -{Math.round((1 - product.price / product.compareAt) * 100)}%
              </span>
            </>
          )}
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm text-muted-foreground">
            สี: <span className="text-foreground">{color}</span>
          </legend>
          <div className="flex gap-3">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                aria-pressed={color === c.name}
                onClick={() => setColor(c.name)}
                className={cn(
                  'size-11 rounded-2xl border-2 p-1 transition-all duration-300 active:scale-75',
                  color === c.name ? 'scale-110 border-primary shadow-neon' : 'border-border hover:border-muted-foreground',
                )}
              >
                <span className="block size-full rounded-xl" style={{ background: c.value }} />
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-soft">
            <button
              type="button"
              aria-label="ลดจำนวน"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex size-10 items-center justify-center rounded-xl transition-all hover:bg-secondary active:scale-75 disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span key={qty} className="w-8 animate-pop text-center font-heading text-lg tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              aria-label="เพิ่มจำนวน"
              disabled={qty >= maxQty}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className="flex size-10 items-center justify-center rounded-xl transition-all hover:bg-secondary active:scale-75 disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className={cn(
              'relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl font-medium transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0',
              added ? 'bg-success text-primary-foreground' : 'bg-primary text-primary-foreground shadow-neon',
            )}
          >
            {added ? <Check className="size-5 animate-pop" /> : <ShoppingBag className="size-5" />}
            {soldOut ? 'สินค้าหมด' : added ? 'เพิ่มแล้ว!' : 'เพิ่มลงตะกร้า'}
            {!added && !soldOut && (
              <span aria-hidden className="absolute inset-y-0 left-0 w-1/4 animate-shine bg-primary-foreground/25" />
            )}
          </button>
          <button
            type="button"
            aria-label="รายการโปรด"
            aria-pressed={liked}
            onClick={() => setLiked((v) => !v)}
            className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card shadow-soft transition-all hover:border-accent/50 hover:shadow-neon-pink active:scale-75"
          >
            <Heart className={cn('size-5 transition-all', liked ? 'scale-110 fill-accent text-accent' : '')} />
          </button>
        </div>

        <p className={cn('text-sm', product.stock < 10 ? 'text-warning' : 'text-muted-foreground')}>
          {soldOut ? 'สินค้าหมดชั่วคราว' : product.stock < 10 ? `เหลือเพียง ${product.stock} ชิ้นเท่านั้น!` : `มีสินค้า ${product.stock} ชิ้น`}
        </p>

        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, label: 'ส่งฟรี 48 ชม.' },
            { icon: ShieldCheck, label: 'รับประกัน 2 ปี' },
            { icon: RotateCcw, label: 'คืนได้ 30 วัน' },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm shadow-soft">
              <Icon className="size-4 text-primary" />
              {label}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex gap-1 rounded-xl bg-secondary p-1" role="tablist">
            {(
              [
                ['detail', 'รายละเอียด'],
                ['specs', 'สเปค'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  'flex-1 rounded-lg py-2 text-sm transition-all duration-300',
                  tab === id ? 'bg-card text-primary shadow-soft' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === 'detail' ? (
            <p key="d" className="animate-in leading-relaxed text-muted-foreground fade-in slide-in-from-bottom-1">
              {product.description}
            </p>
          ) : (
            <dl key="s" className="grid animate-in grid-cols-2 gap-3 fade-in slide-in-from-bottom-1">
              {product.specs.map((s) => (
                <div key={s.label} className="rounded-xl bg-secondary p-3">
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                  <dd className="font-heading font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}
