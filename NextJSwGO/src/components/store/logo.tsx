import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn('group flex items-center gap-2', className)} aria-label="NEONSHOP หน้าหลัก">
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary font-heading text-lg font-bold text-primary-foreground shadow-neon transition-transform duration-300 group-hover:rotate-6">
        N
        <span className="absolute -right-1 -top-1 size-3 animate-glow rounded-full bg-accent" />
      </span>
      <span className="font-heading text-lg font-bold tracking-wider">
        NEON<span className="text-primary">//</span>SHOP
      </span>
    </Link>
  )
}
