import Link from 'next/link'
import { Logo } from './logo'

export function SiteFooter({ categories = [] }: { categories?: { id: number; name: string }[] }) {
  const groups = [
    {
      title: 'ช้อปปิ้ง',
      links: [['สินค้าทั้งหมด', '/products'], ...categories.slice(0, 3).map((c) => [c.name, `/products?category=${c.id}`])],
    },
    { title: 'บัญชี', links: [['เข้าสู่ระบบ', '/login'], ['สมัครสมาชิก', '/register'], ['บัญชีของฉัน', '/backend/dashboard']] },
    { title: 'บริษัท', links: [['เกี่ยวกับเรา', '#'], ['ติดต่อเรา', '#'], ['ระบบหลังบ้าน', '/backend/setting/products']] },
  ]

  return (
    <footer className="px-3 pb-6 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 rounded-3xl border border-border bg-card p-8 shadow-soft md:flex-row md:justify-between">
        <div className="flex max-w-xs flex-col gap-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            ร้านค้าแกดเจ็ตและเทคแวร์สำหรับคนที่ใช้ชีวิตอยู่ในอนาคต จัดส่งทั่วประเทศภายใน 48 ชั่วโมง
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title} className="flex flex-col gap-3">
              <p className="font-heading text-sm font-semibold">{g.title}</p>
              <ul className="flex flex-col gap-2">
                {g.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-7xl text-center text-xs text-muted-foreground">
        {'© 2026 NEON//SHOP — สร้างเพื่อเป็นต้นแบบดีไซน์'}
      </p>
    </footer>
  )
}
