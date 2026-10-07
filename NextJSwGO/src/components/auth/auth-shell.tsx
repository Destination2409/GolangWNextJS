import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/store/logo'

/** กรอบหน้าล็อกอิน / สมัครสมาชิก ตามธีม neon */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="flex w-full max-w-md animate-rise flex-col gap-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> กลับหน้าร้าน
          </Link>
        </div>
        <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card/80 p-6 shadow-neon backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
        {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  )
}

export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  )
}

export const fieldClass = 'h-10 rounded-xl bg-background/60 px-3 shadow-soft'
