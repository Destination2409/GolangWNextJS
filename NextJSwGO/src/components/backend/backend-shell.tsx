'use client'

import { AdminMobileNav, AdminSidebar } from '@/components/admin/admin-nav'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { useRequireAuth } from '@/hooks/useRequireAuth'

/** กรอบหลังบ้าน: ต้องล็อกอินก่อน แล้วแสดงเมนูตามสิทธิ์ของผู้ใช้ */
export function BackendShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useRequireAuth(1)

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-dvh">
        <div className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block" />
        <div className="flex flex-1 flex-col">
          <div className="h-16 border-b border-border" />
          <div className="mx-auto flex w-full max-w-6xl animate-pulse flex-col gap-6 p-4 md:p-8">
            <div className="h-8 w-56 rounded-xl bg-muted" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-muted" />
              ))}
            </div>
            <div className="h-72 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar permission={user.permission_id} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} />
        <AdminMobileNav permission={user.permission_id} />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
