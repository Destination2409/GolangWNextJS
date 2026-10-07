'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LogIn, Menu, Search, ShieldCheck, ShoppingBag, UserRound, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionUser } from '@/hooks/useSessionUser'
import { useCart } from './cart-provider'
import { Logo } from './logo'

export function SiteHeader({ categories = [] }: { categories?: { id: number; name: string }[] }) {
  const pathname = usePathname()
  const { count, setOpen, bump } = useCart()
  const { user, ready } = useSessionUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/products', label: 'สินค้าทั้งหมด' },
    ...categories.slice(0, 2).map((c) => ({ href: `/products?category=${c.id}`, label: c.name })),
  ]
  const isStaff = (user?.permission_id ?? 0) >= 2
  const account = user
    ? { href: '/backend/dashboard', label: 'บัญชีของฉัน', icon: UserRound }
    : { href: '/login', label: 'เข้าสู่ระบบ', icon: LogIn }
  const mobileLinks = [
    ...links,
    ...(isStaff ? [{ href: '/backend/setting/products', label: 'ระบบหลังบ้าน' }] : []),
    { href: account.href, label: account.label },
  ]

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border border-border bg-card/70 px-4 py-3 shadow-soft backdrop-blur-xl">
        <Logo />

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = link.href === pathname
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm transition-all duration-300 hover:bg-secondary hover:text-foreground active:scale-95',
                  active ? 'bg-secondary text-primary' : 'text-muted-foreground',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            aria-label="ค้นหาสินค้า"
            className="hidden size-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-secondary hover:text-primary active:scale-90 sm:flex"
          >
            <Search className="size-5" />
          </Link>
          {isStaff && (
            <Link
              href="/backend/setting/products"
              aria-label="ระบบหลังบ้าน"
              title="ระบบหลังบ้าน"
              className="hidden size-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-secondary hover:text-accent active:scale-90 sm:flex"
            >
              <ShieldCheck className="size-5" />
            </Link>
          )}
          {ready && (
            <Link
              href={account.href}
              aria-label={account.label}
              title={account.label}
              className="hidden size-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-secondary hover:text-primary active:scale-90 sm:flex"
            >
              <account.icon className="size-5" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`ตะกร้าสินค้า ${count} ชิ้น`}
            className="relative flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-neon transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <ShoppingBag className="size-5" />
            <span className="hidden sm:inline">ตะกร้า</span>
            <span
              key={bump}
              className="flex size-5 animate-pop items-center justify-center rounded-full bg-accent text-xs text-accent-foreground"
            >
              {count}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="เปิดเมนู"
            aria-expanded={mobileOpen}
            className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-secondary active:scale-90 md:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="เมนูมือถือ"
          className="mx-auto mt-2 flex max-w-7xl animate-in flex-col gap-1 rounded-2xl border border-border bg-card/90 p-2 shadow-soft backdrop-blur-xl fade-in slide-in-from-top-2 md:hidden"
        >
          {mobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
