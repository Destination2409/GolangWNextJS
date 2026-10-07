import {
  BarChart3,
  Bell,
  Box,
  Calendar,
  Check,
  CreditCard,
  Download,
  Filter,
  Heart,
  Home,
  Image as ImageIcon,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  Truck,
  Upload,
  User,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { KitSection, PageHeader } from '@/components/admin/kit'
import { cn } from '@/lib/utils'

export const metadata = { title: 'ไอคอน — Admin Console' }

const icons = {
  Home, Search, Bell, Settings, User, Users, ShoppingCart, ShoppingBag, Package, Box, Truck, CreditCard,
  Wallet, Tag, Star, Heart, Mail, Phone, MapPin, Calendar, BarChart3, Filter, Download, Upload,
  Plus, Pencil, Trash2, Check, X, ImageIcon, Zap,
}

const tones = [
  { cls: 'bg-primary/12 text-primary', l: 'Primary' },
  { cls: 'bg-accent/12 text-accent', l: 'Accent' },
  { cls: 'bg-success/12 text-success', l: 'Success' },
  { cls: 'bg-warning/12 text-warning', l: 'Warning' },
  { cls: 'bg-destructive/12 text-destructive', l: 'Danger' },
]

export default function IconsPage() {
  return (
    <>
      <PageHeader title="ไอคอน" description="ใช้ไลบรารี lucide-react — ขนาดมาตรฐาน 16 / 20 / 24px" />

      <KitSection title="ชุดไอคอนที่ใช้บ่อย">
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {Object.entries(icons).map(([name, Icon]) => (
            <li
              key={name}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="truncate text-xs text-muted-foreground">{name.replace('Icon', '')}</span>
            </li>
          ))}
        </ul>
      </KitSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <KitSection title="ขนาดไอคอน">
          <div className="flex items-end gap-8">
            {[
              { s: 'size-4', l: '16px' },
              { s: 'size-5', l: '20px' },
              { s: 'size-6', l: '24px' },
              { s: 'size-8', l: '32px' },
            ].map((x) => (
              <div key={x.l} className="flex flex-col items-center gap-2">
                <ShoppingBag className={cn(x.s, 'text-primary')} />
                <span className="font-mono text-xs text-muted-foreground">{x.l}</span>
              </div>
            ))}
          </div>
        </KitSection>

        <KitSection title="ไอคอนในกรอบ (Icon Container)">
          <div className="flex flex-wrap gap-3">
            {tones.map((t) => (
              <span key={t.l} className={cn('flex size-11 items-center justify-center rounded-xl shadow-soft', t.cls)} title={t.l}>
                <Package className="size-5" />
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {tones.map((t) => (
              <span key={t.l} className={cn('flex size-9 items-center justify-center rounded-full', t.cls)} title={t.l}>
                <Bell className="size-4" />
              </span>
            ))}
          </div>
        </KitSection>
      </div>
    </>
  )
}
