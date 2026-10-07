import Image from 'next/image'
import { Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { KitSection, PageHeader, StatusPill } from '@/components/admin/kit'
import { OrdersTable } from '@/components/admin/orders-table'
import { demoProducts } from '@/lib/admin-data'

export const metadata = { title: 'ตาราง — Admin Console' }

export default function TablesPage() {
  return (
    <>
      <PageHeader title="ตาราง" description="รูปแบบตารางสำหรับข้อมูลคำสั่งซื้อ สินค้า และสต็อก" />

      <KitSection title="ตารางข้อมูลแบบเต็ม" description="เลือกหลายแถว, เรียงลำดับ, เมนูการจัดการ และแบ่งหน้า">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input placeholder="ค้นหาคำสั่งซื้อ..." className="h-10 max-w-xs rounded-xl bg-background/60 shadow-soft" />
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter /> ตัวกรอง
            </Button>
            <Button>
              <Plus /> สร้างคำสั่งซื้อ
            </Button>
          </div>
        </div>
        <OrdersTable />
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">แสดง 1-6 จาก 128 รายการ</p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" text="ก่อนหน้า" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" text="ถัดไป" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </KitSection>

      <KitSection title="ตารางสินค้าพร้อมรูปและสต็อก">
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader className="bg-secondary/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">สินค้า</TableHead>
                <TableHead className="hidden sm:table-cell">หมวดหมู่</TableHead>
                <TableHead className="w-48">สต็อก</TableHead>
                <TableHead className="pr-4 text-right">ราคา</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoProducts.map((p, i) => {
                const stock = [82, 34, 9, 61, 0][i]
                return (
                  <TableRow key={p.slug}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Image src={p.image} alt="" width={40} height={40} className="size-10 rounded-lg bg-secondary object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{p.category}</TableCell>
                    <TableCell>
                      {stock === 0 ? (
                        <StatusPill tone="danger">หมดสต็อก</StatusPill>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Progress value={stock} className="flex-1" aria-label={`สต็อก ${stock}%`} />
                          <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{stock}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="pr-4 text-right font-medium tabular-nums">
                      ฿{p.price.toLocaleString('th-TH')}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </KitSection>

      <KitSection title="ตารางแบบกะทัดรัด (Striped)" description="เหมาะกับรายงานที่มีข้อมูลจำนวนมาก">
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">วันที่</TableHead>
                <TableHead>คำสั่งซื้อ</TableHead>
                <TableHead>ยอดขาย</TableHead>
                <TableHead className="pr-4 text-right">เติบโต</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:nth-child(odd)]:bg-secondary/40">
              {[
                ['01 ต.ค.', 98, 39120, '+4.2%'],
                ['02 ต.ค.', 112, 44890, '+14.7%'],
                ['03 ต.ค.', 87, 35210, '-21.6%'],
                ['04 ต.ค.', 140, 58300, '+65.5%'],
              ].map(([d, o, s, g]) => (
                <TableRow key={d as string}>
                  <TableCell className="py-2 pl-4">{d}</TableCell>
                  <TableCell className="py-2 tabular-nums">{o}</TableCell>
                  <TableCell className="py-2 tabular-nums">฿{(s as number).toLocaleString('th-TH')}</TableCell>
                  <TableCell className={`py-2 pr-4 text-right tabular-nums ${(g as string).startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                    {g}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </KitSection>
    </>
  )
}
