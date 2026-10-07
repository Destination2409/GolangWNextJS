'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, LogOut, Search, Store } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserPayload } from '@/hooks/useRequireAuth'
import { initials } from '@/hooks/useSessionUser'
import { logout } from '@/lib/session'

export function AdminTopbar({ user }: { user: UserPayload }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const isStaff = user.permission_id >= 2

  const handleLogout = async () => {
    await logout()
    toast.success('ออกจากระบบแล้ว')
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      {isStaff ? (
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            router.push(`/backend/setting/products?search=${encodeURIComponent(query.trim())}`)
          }}
          className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-input bg-card px-3 shadow-soft focus-within:border-primary/50"
        >
          <Search className="size-4 text-muted-foreground" />
          <label htmlFor="admin-search" className="sr-only">ค้นหาสินค้า</label>
          <input
            id="admin-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาสินค้า, รหัสสินค้า..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded-md bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:block">Enter</kbd>
        </form>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="flex items-center gap-2 rounded-xl p-1 pr-3 transition-colors hover:bg-secondary" />
            }
          >
            <Avatar>
              <AvatarFallback className="bg-primary/15 text-primary">{initials(user)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-left text-sm leading-tight sm:block">
              <span className="block">
                {user.prefix}
                {user.first_name} {user.last_name?.[0] ? `${user.last_name[0]}.` : ''}
              </span>
              <span className="block text-xs text-muted-foreground">{isStaff ? 'ผู้ดูแลระบบ' : 'สมาชิก'}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push('/backend/dashboard')}>
                <LayoutDashboard /> แดชบอร์ด
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/')}>
                <Store /> ไปหน้าร้าน
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut /> ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
