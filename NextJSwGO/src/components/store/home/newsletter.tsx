'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

export function Newsletter() {
  const [email, setEmail] = useState('')

  return (
    <section className="px-3 pb-16 md:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <h2 className="text-balance font-heading text-3xl font-bold md:text-4xl">รับข่าวสารก่อนใคร</h2>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          สมัครรับจดหมายข่าว รับโค้ดส่วนลด 10% สำหรับคำสั่งซื้อแรกทันที
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            toast.success('สมัครสำเร็จ!', { description: `ส่งโค้ดส่วนลดไปที่ ${email} แล้ว` })
            setEmail('')
          }}
          className="flex w-full max-w-md gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-soft transition-shadow focus-within:border-primary/50 focus-within:shadow-neon"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            อีเมล
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:shadow-neon active:scale-95"
          >
            <Send className="size-4" />
            สมัคร
          </button>
        </form>
      </div>
    </section>
  )
}
