import type { Metadata } from 'next'
import { BackendShell } from '@/components/backend/backend-shell'

export const metadata: Metadata = {
  title: 'Admin Console — NEONSHOP',
  description: 'ระบบหลังบ้านสำหรับพนักงานขาย NEONSHOP',
  robots: { index: false, follow: false },
}

export default function BackendLayout({ children }: { children: React.ReactNode }) {
  return <BackendShell>{children}</BackendShell>
}
