'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatTHB } from '@/lib/products'
import { useCart } from './cart-provider'

export function CartSheet() {
  const { items, open, setOpen, subtotal, update, remove } = useCart()
  const shipping = subtotal > 3000 || subtotal === 0 ? 0 : 120

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full gap-0 border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="font-heading text-xl">ตะกร้าของคุณ</SheetTitle>
          <SheetDescription>
            {items.length ? `มีสินค้า ${items.length} รายการ` : 'ยังไม่มีสินค้าในตะกร้า'}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex size-20 animate-float items-center justify-center rounded-3xl bg-secondary text-primary shadow-neon">
              <ShoppingBag className="size-9" />
            </div>
            <p className="text-pretty text-muted-foreground">ตะกร้ายังว่างอยู่ ลองเลือกของล้ำยุคสักชิ้นสิ</p>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-neon transition-all hover:-translate-y-0.5 active:scale-95"
            >
              เลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
              {items.map((item) => (
                <li
                  key={item.product.slug + item.color}
                  className="flex animate-in gap-3 rounded-2xl border border-border bg-background/50 p-3 fade-in slide-in-from-right-4"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    <Image src={item.product.image} alt={item.product.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-heading font-semibold">{item.product.name}</p>
                      <button
                        type="button"
                        onClick={() => remove(item.product.slug, item.color)}
                        aria-label={`ลบ ${item.product.name}`}
                        className="rounded-lg p-1 text-muted-foreground transition-all hover:bg-destructive/15 hover:text-destructive active:scale-90"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">สี: {item.color}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-lg bg-secondary p-0.5">
                        <button
                          type="button"
                          aria-label="ลดจำนวน"
                          onClick={() => update(item.product.slug, item.color, item.quantity - 1)}
                          className="flex size-7 items-center justify-center rounded-md transition-all hover:bg-muted active:scale-90"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="เพิ่มจำนวน"
                          onClick={() => update(item.product.slug, item.color, item.quantity + 1)}
                          className="flex size-7 items-center justify-center rounded-md transition-all hover:bg-muted active:scale-90"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="font-heading font-semibold text-primary">
                        {formatTHB(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 border-t border-border p-5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ยอดรวมสินค้า</span>
                <span className="tabular-nums">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ค่าจัดส่ง</span>
                <span>{shipping === 0 ? 'ฟรี' : formatTHB(shipping)}</span>
              </div>
              <div className="flex justify-between font-heading text-lg font-semibold">
                <span>ทั้งหมด</span>
                <span className="text-primary tabular-nums">{formatTHB(subtotal + shipping)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  toast.success('กำลังไปหน้าชำระเงิน', { description: 'นี่คือเดโมหน้าบ้าน ยังไม่มีการชำระเงินจริง' })
                }}
                className="relative overflow-hidden rounded-xl bg-primary py-3 font-medium text-primary-foreground shadow-neon transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span className="relative z-10">ชำระเงิน</span>
                <span aria-hidden className="absolute inset-y-0 left-0 w-1/3 animate-shine bg-primary-foreground/25" />
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
