import { BadgeCheck, CreditCard, RotateCcw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Perk = { icon: LucideIcon; title: string; detail: string; tone: string }

const perks: Perk[] = [
  { icon: Truck, title: 'ส่งฟรี', detail: 'เมื่อซื้อครบ ฿3,000', tone: 'bg-primary/12 text-primary' },
  { icon: ShieldCheck, title: 'รับประกัน 2 ปี', detail: 'ทุกชิ้นในร้าน', tone: 'bg-accent/12 text-accent' },
  { icon: CreditCard, title: 'ผ่อน 0%', detail: 'นานสูงสุด 10 เดือน', tone: 'bg-success/12 text-success' },
  { icon: RotateCcw, title: 'คืนได้ใน 30 วัน', detail: 'ไม่ต้องให้เหตุผล', tone: 'bg-warning/15 text-warning' },
  { icon: BadgeCheck, title: 'ของแท้ 100%', detail: 'จากแบรนด์โดยตรง', tone: 'bg-primary/12 text-primary' },
]

function PerkChip({ perk, hidden }: { perk: Perk; hidden?: boolean }) {
  const Icon = perk.icon
  return (
    <li
      aria-hidden={hidden}
      className="group flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-card/80 py-2.5 pl-2.5 pr-5 shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-neon"
    >
      <span className={cn('flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 group-hover:rotate-6', perk.tone)}>
        <Icon className="size-5" />
      </span>
      <span className="flex flex-col">
        <span className="whitespace-nowrap text-sm font-semibold leading-tight">{perk.title}</span>
        <span className="whitespace-nowrap text-xs text-muted-foreground">{perk.detail}</span>
      </span>
    </li>
  )
}

export function Marquee() {
  return (
    <section aria-label="สิทธิพิเศษ" className="mt-16 px-3 md:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border bg-secondary/60 py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee gap-4 px-2 hover:[animation-play-state:paused]">
          {perks.map((p) => (
            <PerkChip key={p.title} perk={p} />
          ))}
          {perks.map((p) => (
            <PerkChip key={`${p.title}-dup`} perk={p} hidden />
          ))}
        </ul>
      </div>
    </section>
  )
}
