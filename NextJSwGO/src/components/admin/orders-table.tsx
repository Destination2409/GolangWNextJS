'use client'

import { useMemo, useState } from 'react'
import { ArrowUpDown, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusPill } from '@/components/admin/kit'
import { orders, statusMeta } from '@/lib/admin-data'
import { cn } from '@/lib/utils'

const baht = (n: number) => `฿${n.toLocaleString('th-TH')}`

export function OrdersTable({ selectable = true, limit }: { selectable?: boolean; limit?: number }) {
  const [selected, setSelected] = useState<string[]>([])
  const [asc, setAsc] = useState(false)

  const rows = useMemo(() => {
    const sorted = [...orders].sort((a, b) => (asc ? a.total - b.total : b.total - a.total))
    return limit ? sorted.slice(0, limit) : sorted
  }, [asc, limit])

  const allChecked = selected.length === rows.length
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <div className="flex flex-col gap-3">
      {selectable && selected.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-2 text-sm">
          <span className="text-primary">เลือกแล้ว {selected.length} รายการ</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              toast.success(`ลบ ${selected.length} รายการแล้ว`)
              setSelected([])
            }}
          >
            <Trash2 /> ลบที่เลือก
          </Button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    aria-label="เลือกทั้งหมด"
                    checked={allChecked}
                    onCheckedChange={(v) => setSelected(v ? rows.map((r) => r.id) : [])}
                  />
                </TableHead>
              )}
              <TableHead className={cn(!selectable && 'pl-4')}>เลขที่</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead className="hidden md:table-cell">สินค้า</TableHead>
              <TableHead>
                <button type="button" onClick={() => setAsc((a) => !a)} className="inline-flex items-center gap-1 hover:text-foreground">
                  ยอดรวม <ArrowUpDown className="size-3.5" />
                </button>
              </TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">การจัดการ</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.id} data-state={selected.includes(o.id) ? 'selected' : undefined}>
                {selectable && (
                  <TableCell className="pl-4">
                    <Checkbox aria-label={`เลือก ${o.id}`} checked={selected.includes(o.id)} onCheckedChange={() => toggle(o.id)} />
                  </TableCell>
                )}
                <TableCell className={cn('font-mono text-xs text-muted-foreground', !selectable && 'pl-4')}>{o.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{o.customer}</span>
                    <span className="text-xs text-muted-foreground">{o.email}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{o.product}</TableCell>
                <TableCell className="font-medium tabular-nums">{baht(o.total)}</TableCell>
                <TableCell>
                  <StatusPill tone={statusMeta[o.status].tone}>{statusMeta[o.status].label}</StatusPill>
                </TableCell>
                <TableCell className="pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`ตัวเลือก ${o.id}`} />}>
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye /> ดูรายละเอียด
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil /> แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => toast.error(`ยกเลิก ${o.id}`)}>
                        <Trash2 /> ยกเลิกคำสั่งซื้อ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
