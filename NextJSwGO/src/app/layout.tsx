import type { Metadata, Viewport } from 'next'
import { Prompt } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import './globals.css'

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
})

export const metadata: Metadata = {
  title: 'NEONSHOP — ร้านค้าแห่งอนาคต',
  description: 'ร้านค้าออนไลน์สไตล์ไซเบอร์พังก์ แกดเจ็ต เทคแวร์ และอุปกรณ์ล้ำยุค พร้อมระบบหลังบ้านสำหรับพนักงานขาย',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#11131f' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${prompt.variable} bg-background`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <ThemeToggle />
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
