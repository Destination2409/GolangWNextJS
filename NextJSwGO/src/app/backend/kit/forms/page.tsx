import { PageHeader } from '@/components/admin/kit'
import { FormsShowcase } from '@/components/admin/forms-showcase'

export const metadata = { title: 'ฟอร์ม — Admin Console' }

export default function FormsPage() {
  return (
    <>
      <PageHeader title="ฟอร์ม" description="ชุด input พื้นฐานทั้งหมดสำหรับใช้ในระบบหลังบ้าน" />
      <FormsShowcase />
    </>
  )
}
