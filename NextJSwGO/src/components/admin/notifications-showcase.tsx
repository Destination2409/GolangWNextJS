'use client'

import { AlertTriangle, CheckCircle2, Info, Package, ShoppingCart, Trash2, UserPlus, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { KitSection } from '@/components/admin/kit'
import { cn } from '@/lib/utils'

const alerts = [
  { icon: Info, title: 'ข้อมูล', desc: 'ระบบจะปิดปรับปรุงคืนนี้ เวลา 02:00 - 03:00 น.', cls: 'border-primary/30 bg-primary/8 text-primary' },
  { icon: CheckCircle2, title: 'สำเร็จ', desc: 'อัปเดตราคาสินค้า 24 รายการเรียบร้อย', cls: 'border-success/30 bg-success/8 text-success' },
  { icon: AlertTriangle, title: 'คำเตือน', desc: 'สินค้า 3 รายการใกล้หมดสต็อก', cls: 'border-warning/30 bg-warning/8 text-warning' },
  { icon: XCircle, title: 'ผิดพลาด', desc: 'เชื่อมต่อระบบชำระเงินไม่สำเร็จ กรุณาลองใหม่', cls: 'border-destructive/30 bg-destructive/8 text-destructive' },
]

const feed = [
  { icon: ShoppingCart, tone: 'bg-primary/12 text-primary', title: 'คำสั่งซื้อใหม่ #NS-10482', time: '2 นาทีที่แล้ว', unread: true },
  { icon: UserPlus, tone: 'bg-accent/12 text-accent', title: 'ลูกค้าใหม่สมัครสมาชิก', time: '15 นาทีที่แล้ว', unread: true },
  { icon: Package, tone: 'bg-warning/12 text-warning', title: 'Glitch Keyboard 75 เหลือ 3 ชิ้น', time: '1 ชั่วโมงที่แล้ว', unread: false },
  { icon: CheckCircle2, tone: 'bg-success/12 text-success', title: 'จัดส่ง #NS-10477 สำเร็จ', time: 'เมื่อวาน', unread: false },
]

export function NotificationsShowcase() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <KitSection title="Alert / Banner" className="grid gap-3 md:grid-cols-2">
          {alerts.map(({ icon: Icon, title, desc, cls }) => (
            <Alert key={title} className={cn('rounded-xl px-4 py-3 shadow-soft', cls)}>
              <Icon />
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription className="text-foreground/75">{desc}</AlertDescription>
            </Alert>
          ))}
        </KitSection>
      </div>

      <KitSection title="Toast" description="กดปุ่มเพื่อดูการแจ้งเตือนแบบลอย (มุมขวาบน)">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => toast('มีคำสั่งซื้อใหม่เข้ามา')}>
            ทั่วไป
          </Button>
          <Button variant="success" onClick={() => toast.success('บันทึกข้อมูลสำเร็จ')}>
            สำเร็จ
          </Button>
          <Button variant="warning" onClick={() => toast.warning('สต็อกใกล้หมด')}>
            คำเตือน
          </Button>
          <Button variant="destructive" onClick={() => toast.error('เกิดข้อผิดพลาด')}>
            ผิดพลาด
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast('ลบสินค้าแล้ว', {
                description: 'NOVA-X Headphones ถูกย้ายไปถังขยะ',
                action: { label: 'เลิกทำ', onClick: () => toast.success('กู้คืนแล้ว') },
              })
            }
          >
            พร้อมปุ่ม Action
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.promise(new Promise((r) => setTimeout(r, 1500)), {
                loading: 'กำลังอัปโหลด...',
                success: 'อัปโหลดเสร็จสิ้น',
                error: 'อัปโหลดล้มเหลว',
              })
            }
          >
            Loading
          </Button>
        </div>
      </KitSection>

      <KitSection title="Dialog & Tooltip">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" />}>
              <Trash2 /> ลบสินค้า
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
                  <Trash2 className="size-5" />
                </span>
                <DialogTitle>ยืนยันการลบสินค้า?</DialogTitle>
                <DialogDescription>การลบนี้ไม่สามารถย้อนกลับได้ ข้อมูลสต็อกและประวัติจะถูกลบทั้งหมด</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>ยกเลิก</DialogClose>
                <DialogClose
                  render={<Button className="bg-destructive text-foreground hover:bg-destructive/90" />}
                  onClick={() => toast.success('ลบสินค้าเรียบร้อย')}
                >
                  ลบถาวร
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>เปิด Dialog ข้อมูล</DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>อัปเดตระบบ v2.4</DialogTitle>
                <DialogDescription>เพิ่มการส่งออกรายงานเป็น Excel และปรับปรุงความเร็วตาราง</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button />}>รับทราบ</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" />}>วางเมาส์ที่นี่</TooltipTrigger>
            <TooltipContent>คำอธิบายสั้นๆ แสดงเมื่อ hover</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { l: 'กำลังอัปโหลดรูปภาพ', v: 68 },
            { l: 'เป้ายอดขายเดือนนี้', v: 42 },
          ].map((p) => (
            <div key={p.l} className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>{p.l}</span>
                <span className="font-mono text-primary">{p.v}%</span>
              </div>
              <Progress value={p.v} aria-label={p.l} />
            </div>
          ))}
        </div>
      </KitSection>

      <div className="lg:col-span-2">
        <KitSection title="ศูนย์การแจ้งเตือน (Notification Center)">
          <Tabs defaultValue="all">
            <TabsList className="h-10 rounded-xl bg-secondary p-1">
              <TabsTrigger value="all" className="rounded-lg px-3">
                ทั้งหมด
              </TabsTrigger>
              <TabsTrigger value="unread" className="rounded-lg px-3">
                ยังไม่อ่าน
                <span className="rounded-md bg-accent px-1.5 text-xs text-accent-foreground">2</span>
              </TabsTrigger>
            </TabsList>
            {(['all', 'unread'] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="pt-3">
                <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {feed
                    .filter((f) => tab === 'all' || f.unread)
                    .map(({ icon: Icon, tone, title, time, unread }) => (
                      <li key={title} className={cn('flex items-center gap-3 px-4 py-3', unread && 'bg-primary/5')}>
                        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tone)}>
                          <Icon className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium">{title}</span>
                          <span className="text-xs text-muted-foreground">{time}</span>
                        </div>
                        {unread && <span className="size-2 rounded-full bg-primary shadow-neon" aria-label="ยังไม่อ่าน" />}
                      </li>
                    ))}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
        </KitSection>
      </div>
    </div>
  )
}
