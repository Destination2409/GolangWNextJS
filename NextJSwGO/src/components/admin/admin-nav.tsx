'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, FormInput, LayoutDashboard, MousePointerClick, Package, Shapes, Store, Table2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; icon: LucideIcon }
type NavGroup = { group: string; minPermission: number; items: NavItem[] }

// minPermission: 1 = สมาชิกทั่วไป, 2 = พนักงาน/แอดมิน (ตรงกับ permission_id ใน JWT)
export const adminNav: NavGroup[] = [
  { group: 'บัญชี', minPermission: 1, items: [{ href: '/backend/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard }] },
  {
    group: 'ร้านค้า',
    minPermission: 2,
    items: [{ href: '/backend/setting/products', label: 'จัดการสินค้า', icon: Package }],
  },
  {
    group: 'UI Kit',
    minPermission: 2,
    items: [
      { href: '/backend/kit/forms', label: 'ฟอร์ม', icon: FormInput },
      { href: '/backend/kit/tables', label: 'ตาราง', icon: Table2 },
      { href: '/backend/kit/buttons', label: 'ปุ่ม & แบดจ์', icon: MousePointerClick },
      { href: '/backend/kit/icons', label: 'ไอคอน', icon: Shapes },
      { href: '/backend/kit/notifications', label: 'การแจ้งเตือน', icon: Bell },
    ],
  },
]

function visibleGroups(permission: number) {
  return adminNav.filter((g) => permission >= g.minPermission)
}

export function AdminSidebar({ permission }: { permission: number }) {
  const pathname = usePathname()
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 lg:flex">
      <Link href="/backend/dashboard" className="flex items-center gap-2.5 px-2 py-1">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-heading text-sm font-bold text-primary-foreground shadow-neon">
          N
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-heading font-semibold">NEONSHOP</span>
          <span className="text-xs text-muted-foreground">{permission >= 2 ? 'Admin Console' : 'บัญชีสมาชิก'}</span>
        </span>
      </Link>
      <nav aria-label="เมนูหลังบ้าน" className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {visibleGroups(permission).map((g) => (
          <div key={g.group} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{g.group}</p>
            {g.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-primary/12 text-primary shadow-soft'
                      : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <Link
        href="/"
        className="flex items-center gap-3 rounded-xl border border-sidebar-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Store className="size-4" />
        กลับไปหน้าร้าน
      </Link>
    </aside>
  )
}

export function AdminMobileNav({ permission }: { permission: number }) {
  const pathname = usePathname()
  const items = [...visibleGroups(permission).flatMap((g) => g.items), { href: '/', label: 'หน้าร้าน', icon: Store }]
  return (
    <nav aria-label="เมนูหลังบ้าน" className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 lg:hidden">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? 'page' : undefined}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm',
            pathname === href ? 'bg-primary/12 text-primary' : 'text-muted-foreground',
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
