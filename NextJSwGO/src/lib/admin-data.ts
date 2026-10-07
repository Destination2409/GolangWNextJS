// Mock orders used only by the UI kit demo pages (/backend/kit). There is no orders API yet.
export type OrderStatus = 'paid' | 'pending' | 'shipped' | 'cancelled'

export type Order = {
  id: string
  customer: string
  email: string
  product: string
  total: number
  status: OrderStatus
  date: string
}

export const orders: Order[] = [
  { id: 'NS-10482', customer: 'กมลชนก วงศ์ใหญ่', email: 'kamon@mail.com', product: 'NOVA-X Headphones', total: 8990, status: 'paid', date: '07 ต.ค. 2026' },
  { id: 'NS-10481', customer: 'ธนกร ศรีสุข', email: 'thanakorn@mail.com', product: 'Pulse Watch S2', total: 6490, status: 'shipped', date: '07 ต.ค. 2026' },
  { id: 'NS-10480', customer: 'พิมพ์ชนก แก้วมณี', email: 'pim@mail.com', product: 'Glitch Keyboard 75', total: 5290, status: 'pending', date: '06 ต.ค. 2026' },
  { id: 'NS-10479', customer: 'วรเมธ จันทร์เพ็ญ', email: 'woramet@mail.com', product: 'Runner Neon 01', total: 4590, status: 'cancelled', date: '06 ต.ค. 2026' },
  { id: 'NS-10478', customer: 'ชยพล อินทร์แก้ว', email: 'chayapon@mail.com', product: 'Shell Jacket Ion', total: 7890, status: 'paid', date: '05 ต.ค. 2026' },
  { id: 'NS-10477', customer: 'ณิชา บุญมา', email: 'nicha@mail.com', product: 'Halo Earbuds', total: 3990, status: 'shipped', date: '05 ต.ค. 2026' },
]

export const statusMeta: Record<OrderStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'info' }> = {
  paid: { label: 'ชำระแล้ว', tone: 'success' },
  pending: { label: 'รอชำระ', tone: 'warning' },
  shipped: { label: 'จัดส่งแล้ว', tone: 'info' },
  cancelled: { label: 'ยกเลิก', tone: 'danger' },
}

// Sample products for the UI kit table demo
export const demoProducts = [
  { slug: 'nova-x-headphones', name: 'NOVA-X Headphones', category: 'ระบบเสียง', image: '/images/hero.png', price: 8990 },
  { slug: 'pulse-watch', name: 'PULSE Watch', category: 'อุปกรณ์สวมใส่', image: '/images/p-watch.png', price: 12490 },
  { slug: 'grid-75-keyboard', name: 'GRID-75 Keyboard', category: 'เกมมิ่งเกียร์', image: '/images/p-keyboard.png', price: 5490 },
  { slug: 'shell-jacket', name: 'SHELL Techwear Jacket', category: 'เทคแวร์', image: '/images/p-jacket.png', price: 4290 },
  { slug: 'volt-runner', name: 'VOLT Runner', category: 'เทคแวร์', image: '/images/p-sneaker.png', price: 3890 },
]
