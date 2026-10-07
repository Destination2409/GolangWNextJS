import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = 'ดูทั้งหมด',
}: {
  eyebrow: string
  title: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <span className="font-heading text-sm font-medium uppercase tracking-widest text-accent">{eyebrow}</span>
        <h2 className="text-balance font-heading text-3xl font-bold md:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-primary active:scale-95"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}
