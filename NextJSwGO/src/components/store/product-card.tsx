'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Check, Heart, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatTHB, type Product } from '@/lib/products'
import { useCart } from './cart-provider'

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const [liked, setLiked] = useState(false)
  const soldOut = product.stock === 0

  function handleAdd() {
    add(product)
    setAdded(true)
    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`, { description: formatTHB(product.price) })
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article
      className="group relative flex animate-rise flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-neon"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-foreground/10 opacity-0 blur-md transition-opacity group-hover:animate-shine group-hover:opacity-100"
        />
        {product.badge && (
          <span
            className={cn(
              'absolute left-3 top-3 rounded-full px-3 py-1 font-heading text-xs font-semibold shadow-soft',
              product.badge === 'ลดราคา'
                ? 'bg-accent text-accent-foreground'
                : 'bg-primary text-primary-foreground',
            )}
          >
            {product.badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-label={liked ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
          aria-pressed={liked}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-all hover:scale-110 active:scale-75"
        >
          <Heart className={cn('size-4 transition-colors', liked ? 'fill-accent text-accent' : 'text-foreground')} />
        </button>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <span className="rounded-full border border-border bg-card px-4 py-1.5 font-heading text-sm">สินค้าหมด</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.categoryName && (
          <span className="text-xs font-medium uppercase tracking-wider text-accent">{product.categoryName}</span>
        )}
        <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
          <h3 className="font-heading text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-1 text-sm text-muted-foreground">{product.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {product.compareAt && (
              <span className="text-xs text-muted-foreground line-through">{formatTHB(product.compareAt)}</span>
            )}
            <span className="font-heading text-xl font-bold text-primary">{formatTHB(product.price)}</span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
            className={cn(
              'relative z-10 flex size-11 items-center justify-center rounded-2xl transition-all duration-300 active:scale-75 disabled:cursor-not-allowed disabled:opacity-40',
              added
                ? 'rotate-[360deg] bg-success text-primary-foreground'
                : 'bg-secondary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-neon',
            )}
          >
            {added ? <Check className="size-5" /> : <Plus className="size-5" />}
          </button>
        </div>
      </div>
    </article>
  )
}
