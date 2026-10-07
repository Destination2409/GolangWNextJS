'use client'

import { useState } from 'react'
import { AtSign, CalendarDays, Eye, EyeOff, Lock, Search, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { KitSection } from '@/components/admin/kit'

const field = 'h-10 rounded-xl bg-background/60 px-3 shadow-soft'

const categories = [
  { value: 'audio', label: 'เครื่องเสียง' },
  { value: 'wearable', label: 'อุปกรณ์สวมใส่' },
  { value: 'fashion', label: 'แฟชั่น' },
  { value: 'gaming', label: 'เกมมิ่ง' },
]

export function FormsShowcase() {
  const [showPw, setShowPw] = useState(false)
  const [price, setPrice] = useState(5000)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <KitSection title="Text Input" description="ช่องกรอกข้อความรูปแบบต่างๆ">
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-name">ชื่อสินค้า</Label>
          <Input id="f-name" placeholder="เช่น NOVA-X Headphones" className={field} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-email">อีเมล (มีไอคอน)</Label>
          <div className="relative">
            <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="f-email" type="email" placeholder="you@neonshop.co" className={`${field} pl-9`} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-pw">รหัสผ่าน</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="f-pw" type={showPw ? 'text' : 'password'} defaultValue="cyber2077" className={`${field} px-9`} />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-price">ราคา (มี prefix / suffix)</Label>
          <div className="flex h-10 items-center overflow-hidden rounded-xl border border-input bg-background/60 shadow-soft focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <span className="flex h-full items-center bg-secondary px-3 text-sm text-muted-foreground">฿</span>
            <input id="f-price" inputMode="numeric" defaultValue="8,990" className="h-full flex-1 bg-transparent px-3 text-sm outline-none" />
            <span className="px-3 text-xs text-muted-foreground">THB</span>
          </div>
        </div>
      </KitSection>

      <KitSection title="สถานะของ Input" description="ปกติ, โฟกัส, สำเร็จ, ผิดพลาด และปิดใช้งาน">
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-ok">SKU (ถูกต้อง)</Label>
          <Input id="s-ok" defaultValue="NS-HP-001" className={`${field} border-success/60 focus-visible:ring-success/30`} />
          <p className="text-xs text-success">SKU นี้ใช้งานได้</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-err">จำนวนสต็อก (ผิดพลาด)</Label>
          <Input id="s-err" defaultValue="-4" aria-invalid className={field} aria-describedby="s-err-msg" />
          <p id="s-err-msg" className="text-xs text-destructive">จำนวนต้องมากกว่าหรือเท่ากับ 0</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-dis">รหัสร้าน (ปิดใช้งาน)</Label>
          <Input id="s-dis" defaultValue="BKK-SIAM-01" disabled className={field} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-search">ค้นหา</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="s-search" type="search" placeholder="ค้นหาสินค้า..." className={`${field} rounded-full pl-9`} />
          </div>
        </div>
      </KitSection>

      <KitSection title="Select, Date & Textarea">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>หมวดหมู่</Label>
            <Select items={categories} defaultValue="audio">
              <SelectTrigger className={`${field} w-full`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="rounded-lg">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="f-date">วันเริ่มขาย</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="f-date" type="date" defaultValue="2026-10-07" className={`${field} pl-9 [color-scheme:dark]`} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-desc">รายละเอียดสินค้า</Label>
          <Textarea id="f-desc" rows={4} placeholder="อธิบายจุดเด่นของสินค้า..." className="rounded-xl bg-background/60 shadow-soft" />
          <p className="text-right text-xs text-muted-foreground">0 / 500</p>
        </div>
      </KitSection>

      <KitSection title="Checkbox, Radio, Switch & Slider">
        <fieldset className="flex flex-col gap-3">
          <legend className="pb-2 text-sm font-medium">ช่องทางการจัดส่ง</legend>
          {['Kerry Express', 'Flash Express', 'รับที่ร้าน'].map((o, i) => (
            <Label key={o} className="flex items-center gap-3 font-normal">
              <Checkbox defaultChecked={i < 2} /> {o}
            </Label>
          ))}
        </fieldset>
        <fieldset className="flex flex-col gap-3">
          <legend className="pb-2 text-sm font-medium">สถานะสินค้า</legend>
          <RadioGroup defaultValue="active" className="flex flex-wrap gap-4">
            {[
              { v: 'active', l: 'เปิดขาย' },
              { v: 'draft', l: 'แบบร่าง' },
              { v: 'archived', l: 'เก็บถาวร' },
            ].map((r) => (
              <Label key={r.v} className="flex items-center gap-2 font-normal">
                <RadioGroupItem value={r.v} /> {r.l}
              </Label>
            ))}
          </RadioGroup>
        </fieldset>
        <div className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
          {[
            { l: 'แสดงในหน้าแรก', d: 'สินค้าจะปรากฏใน section แนะนำ', on: true },
            { l: 'แจ้งเตือนสต็อกต่ำ', d: 'แจ้งเมื่อเหลือน้อยกว่า 5 ชิ้น', on: false },
          ].map((s) => (
            <Label key={s.l} className="flex items-center justify-between gap-4 font-normal">
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{s.l}</span>
                <span className="text-xs text-muted-foreground">{s.d}</span>
              </span>
              <Switch defaultChecked={s.on} />
            </Label>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">ช่วงราคาสูงสุด</span>
            <span className="font-mono text-primary">฿{price.toLocaleString('th-TH')}</span>
          </div>
          <Slider
            value={[price]}
            onValueChange={(v) => setPrice(Array.isArray(v) ? v[0] : v)}
            min={0}
            max={20000}
            step={500}
            aria-label="ช่วงราคาสูงสุด"
          />
        </div>
      </KitSection>

      <div className="lg:col-span-2">
        <KitSection title="ฟอร์มเต็มรูปแบบ" description="ตัวอย่างการจัดวางฟอร์มเพิ่มสินค้า พร้อมอัปโหลดรูป">
          <form
            className="grid gap-5 md:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault()
              toast.success('บันทึกสินค้าเรียบร้อย')
            }}
          >
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center transition-colors hover:border-primary/60 hover:bg-primary/10">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Upload className="size-5" />
              </span>
              <span className="text-sm font-medium">ลากไฟล์มาวาง หรือคลิก</span>
              <span className="text-xs text-muted-foreground">PNG, JPG สูงสุด 5MB</span>
              <input type="file" accept="image/*" className="sr-only" />
            </label>
            <div className="flex flex-col gap-4 md:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="p-name">ชื่อสินค้า *</Label>
                  <Input id="p-name" required className={field} placeholder="ชื่อสินค้า" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="p-stock">จำนวนสต็อก *</Label>
                  <Input id="p-stock" type="number" min={0} required className={field} placeholder="0" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="p-note">หมายเหตุ</Label>
                <Textarea id="p-note" rows={3} className="rounded-xl bg-background/60 shadow-soft" />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="reset" variant="ghost">
                  ล้างค่า
                </Button>
                <Button type="button" variant="outline" onClick={() => toast('บันทึกแบบร่างแล้ว')}>
                  บันทึกแบบร่าง
                </Button>
                <Button type="submit">บันทึกสินค้า</Button>
              </div>
            </div>
          </form>
        </KitSection>
      </div>
    </div>
  )
}
