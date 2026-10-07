import { ArrowRight, Check, Download, Heart, Loader2, Plus, Settings, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KitSection, PageHeader, StatusPill } from '@/components/admin/kit'

export const metadata = { title: 'ปุ่ม & แบดจ์ — Admin Console' }

const variants = [
  { v: 'default', l: 'Primary' },
  { v: 'accent', l: 'Accent' },
  { v: 'secondary', l: 'Secondary' },
  { v: 'outline', l: 'Outline' },
  { v: 'ghost', l: 'Ghost' },
  { v: 'success', l: 'Success' },
  { v: 'warning', l: 'Warning' },
  { v: 'destructive', l: 'Danger' },
  { v: 'link', l: 'Link' },
] as const

export default function ButtonsPage() {
  return (
    <>
      <PageHeader title="ปุ่ม & แบดจ์" description="ปุ่มทุกรูปแบบ ขนาด สถานะ และป้ายกำกับ" />

      <KitSection title="รูปแบบปุ่ม (Variants)">
        <div className="flex flex-wrap gap-3">
          {variants.map((b) => (
            <Button key={b.v} variant={b.v}>
              {b.l}
            </Button>
          ))}
        </div>
      </KitSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <KitSection title="ขนาด (Sizes)">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="icon-xs" variant="secondary" aria-label="เพิ่ม">
              <Plus />
            </Button>
            <Button size="icon-sm" variant="secondary" aria-label="ตั้งค่า">
              <Settings />
            </Button>
            <Button size="icon" variant="outline" aria-label="ถูกใจ">
              <Heart />
            </Button>
            <Button size="icon-lg" aria-label="ดาวน์โหลด">
              <Download />
            </Button>
            <Button size="icon" variant="accent" className="rounded-full" aria-label="เพิ่มรายการ">
              <Plus />
            </Button>
          </div>
        </KitSection>

        <KitSection title="ปุ่มพร้อมไอคอน & สถานะ">
          <div className="flex flex-wrap gap-3">
            <Button>
              <Plus data-icon="inline-start" /> เพิ่มสินค้า
            </Button>
            <Button variant="outline">
              ถัดไป <ArrowRight data-icon="inline-end" />
            </Button>
            <Button variant="destructive">
              <Trash2 /> ลบ
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled>
              <Loader2 className="animate-spin" /> กำลังบันทึก...
            </Button>
            <Button variant="secondary" disabled>
              ปิดใช้งาน
            </Button>
            <Button variant="success">
              <Check /> อนุมัติ
            </Button>
          </div>
        </KitSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <KitSection title="กลุ่มปุ่ม (Button Group)">
          <div className="inline-flex w-fit rounded-xl border border-border bg-card p-1 shadow-soft">
            {['วันนี้', '7 วัน', '30 วัน', 'ทั้งหมด'].map((t, i) => (
              <button
                key={t}
                type="button"
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  i === 1 ? 'bg-primary text-primary-foreground shadow-neon' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <X /> ยกเลิก
            </Button>
            <Button className="flex-1">
              <Check /> ยืนยัน
            </Button>
          </div>
        </KitSection>

        <KitSection title="แบดจ์ & สถานะ (Badges)">
          <div className="flex flex-wrap gap-2">
            <Badge>ใหม่</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">ด่วน</Badge>
            <Badge className="bg-accent text-accent-foreground">HOT</Badge>
            <Badge className="bg-success/15 text-success">-20%</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="success">ชำระแล้ว</StatusPill>
            <StatusPill tone="warning">รอชำระ</StatusPill>
            <StatusPill tone="info">จัดส่งแล้ว</StatusPill>
            <StatusPill tone="danger">ยกเลิก</StatusPill>
            <StatusPill tone="accent">VIP</StatusPill>
            <StatusPill tone="neutral">แบบร่าง</StatusPill>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Cyber', 'Neon', 'Wireless'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-secondary py-1 pl-2.5 pr-1 text-xs">
                {t}
                <button type="button" aria-label={`ลบแท็ก ${t}`} className="rounded-md p-0.5 text-muted-foreground hover:bg-background hover:text-foreground">
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </KitSection>
      </div>
    </>
  )
}
