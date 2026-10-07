'use client'

import { useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const subscribe = () => () => {}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // หลังบ้านมี sidebar ทางซ้าย จึงย้ายปุ่มไปมุมขวาเพื่อไม่ให้ทับลิงก์ "กลับไปหน้าร้าน"
  const onBackend = usePathname().startsWith('/backend')
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด'}
      title={isDark ? 'ธีมสว่าง' : 'ธีมมืด'}
      className={cn(
        'group fixed bottom-5 z-50 flex h-11 w-20 items-center rounded-full border border-border bg-card p-1 shadow-neon transition-transform active:scale-95',
        onBackend ? 'right-5' : 'left-5',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform duration-300 ease-out',
          isDark && 'translate-x-9 bg-accent text-accent-foreground',
        )}
      >
        {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </span>
    </button>
  )
}
