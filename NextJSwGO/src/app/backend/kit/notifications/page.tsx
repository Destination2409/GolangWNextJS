import { PageHeader } from '@/components/admin/kit'
import { NotificationsShowcase } from '@/components/admin/notifications-showcase'

export const metadata = { title: 'การแจ้งเตือน — Admin Console' }

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="การแจ้งเตือน" description="Alert, Toast, Dialog, Tooltip, Progress และรายการแจ้งเตือน" />
      <NotificationsShowcase />
    </>
  )
}
