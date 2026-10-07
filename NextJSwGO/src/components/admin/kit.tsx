import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold md:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function KitSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className={cn('flex flex-col gap-4', className)}>{children}</div>
    </section>
  )
}

export function StatusPill({
  tone,
  children,
}: {
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'
  children: ReactNode
}) {
  const tones = {
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    danger: 'bg-destructive/12 text-destructive',
    info: 'bg-primary/12 text-primary',
    accent: 'bg-accent/12 text-accent',
    neutral: 'bg-secondary text-muted-foreground',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium', tones[tone])}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
