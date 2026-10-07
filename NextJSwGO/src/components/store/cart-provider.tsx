'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'

export type CartItem = { product: Product; quantity: number; color: string }

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (open: boolean) => void
  bump: number
  add: (product: Product, quantity?: number, color?: string) => void
  update: (slug: string, color: string, quantity: number) => void
  remove: (slug: string, color: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'neonshop-cart'

// ตะกร้าเก็บไว้ในเบราว์เซอร์เท่านั้น (ยังไม่มีระบบสั่งซื้อฝั่ง API)
function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [bump, setBump] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage full or blocked: the cart still works for this visit
    }
  }, [items, loaded])

  const add = useCallback((product: Product, quantity = 1, color?: string) => {
    const chosen = color ?? product.colors[0].name
    setItems((prev) => {
      const existing = prev.find((i) => i.product.slug === product.slug && i.color === chosen)
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: Math.min(i.quantity + quantity, 10) } : i,
        )
      }
      return [...prev, { product, quantity, color: chosen }]
    })
    setBump((b) => b + 1)
  }, [])

  const update = useCallback((slug: string, color: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.slug === slug && i.color === color
            ? { ...i, quantity: Math.max(0, Math.min(quantity, 10)) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    )
  }, [])

  const remove = useCallback((slug: string, color: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.slug === slug && i.color === color)))
  }, [])

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.quantity * i.product.price, 0),
      open,
      setOpen,
      bump,
      add,
      update,
      remove,
    }),
    [items, open, bump, add, update, remove],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
