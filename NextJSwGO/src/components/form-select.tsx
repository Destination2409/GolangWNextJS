'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const NONE = '__none__'

export type Option = { value: string; label: string }

/**
 * Select แบบง่ายสำหรับฟอร์ม: ค่าเป็น string และ "" หมายถึงยังไม่เลือก
 * (Base UI ไม่ให้ item มีค่าเป็น string ว่าง จึงแปลงเป็นค่า NONE ภายใน)
 */
export function FormSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'ไม่ระบุ',
  allowEmpty = true,
  disabled,
  className,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  allowEmpty?: boolean
  disabled?: boolean
  className?: string
}) {
  const items = allowEmpty ? [{ value: NONE, label: placeholder }, ...options] : options

  return (
    <Select
      items={items}
      value={value === '' && allowEmpty ? NONE : value}
      onValueChange={(v) => onChange(v === NONE || v == null ? '' : String(v))}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn('h-10 w-full rounded-xl bg-background/60 px-3 shadow-soft', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {items.map((o) => (
          <SelectItem key={o.value} value={o.value} className="rounded-lg">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
