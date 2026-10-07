"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, PackageCheck, PackageX, Plus, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KitSection, PageHeader, StatusPill } from "@/components/admin/kit";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { ApiProduct } from "@/lib/api";
import { formatTHB } from "@/lib/products";
import { cn } from "@/lib/utils";

type Stats = {
    total: number;
    active: number;
    inactive: number;
    low_stock: number;
    out_of_stock: number;
    inventory_value: number;
    by_category: { id: number; name: string; count: number }[];
    low_stock_items: ApiProduct[];
};

export default function Dashboard() {
    // 1 แถวนี้จะทำหน้าที่สแกน Token, ตรวจสอบสิทธิ์ และดึงข้อมูล User ออกมาพร้อมใช้ทันที
    const { isAuthenticated, user } = useRequireAuth();
    const isStaff = (user?.permission_id ?? 0) >= 2;

    const [stats, setStats] = useState<Stats | null>(null);
    const [statsError, setStatsError] = useState(false);

    useEffect(() => {
        if (!isStaff) return;
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/products/stats`)
            .then(async (res) => {
                if (!res.ok) throw new Error();
                const json = await res.json();
                setStats(json.data);
            })
            .catch(() => setStatsError(true));
    }, [isStaff]);

    if (!isAuthenticated || !user) return null;

    const statCards = stats
        ? [
              { label: "สินค้าทั้งหมด", value: stats.total.toLocaleString("th-TH"), note: `เปิดขาย ${stats.active} · ปิด ${stats.inactive}`, icon: Boxes, tone: "bg-primary/12 text-primary" },
              { label: "เปิดขายอยู่", value: stats.active.toLocaleString("th-TH"), note: "แสดงบนหน้าร้าน", icon: PackageCheck, tone: "bg-success/12 text-success" },
              { label: "ใกล้หมด / หมด", value: `${stats.low_stock} / ${stats.out_of_stock}`, note: "เฉพาะที่เปิดขาย", icon: AlertTriangle, tone: "bg-warning/15 text-warning" },
              { label: "มูลค่าสต็อก", value: formatTHB(stats.inventory_value), note: "ราคา × จำนวนคงเหลือ", icon: Wallet, tone: "bg-accent/12 text-accent" },
          ]
        : [];
    const maxCategory = Math.max(1, ...(stats?.by_category.map((c) => c.count) ?? [1]));

    return (
        <>
            <PageHeader
                title="แดชบอร์ด"
                description={`ยินดีต้อนรับ, ${user.prefix ?? ""}${user.first_name} ${user.last_name}`}
                actions={
                    isStaff && (
                        <Link href="/backend/setting/products" className={buttonVariants()}>
                            <Plus /> จัดการสินค้า
                        </Link>
                    )
                }
            />

            {isStaff && (
                <>
                    {statsError && (
                        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                            โหลดสถิติไม่สำเร็จ ตรวจสอบว่า API ทำงานอยู่
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {stats
                            ? statCards.map((s) => (
                                  <div key={s.label} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-soft">
                                      <div className="flex items-center justify-between">
                                          <span className="text-sm text-muted-foreground">{s.label}</span>
                                          <span className={cn("flex size-8 items-center justify-center rounded-lg", s.tone)}>
                                              <s.icon className="size-4" />
                                          </span>
                                      </div>
                                      <span className="font-heading text-2xl font-semibold tabular-nums">{s.value}</span>
                                      <span className="text-xs text-muted-foreground">{s.note}</span>
                                  </div>
                              ))
                            : !statsError &&
                              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
                    </div>

                    {stats && (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <KitSection title="สินค้าตามหมวดหมู่" description="จำนวนสินค้าทั้งหมดในแต่ละหมวด">
                                <div className="flex h-48 items-end gap-3">
                                    {stats.by_category.map((c, i) => (
                                        <div key={c.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                                            <span className="text-xs font-medium tabular-nums">{c.count}</span>
                                            <div
                                                className={cn("w-full rounded-lg transition-all", i === 0 ? "bg-primary shadow-neon" : "bg-primary/25")}
                                                style={{ height: `${Math.max(4, (c.count / maxCategory) * 100)}%` }}
                                                title={`${c.name}: ${c.count}`}
                                            />
                                            <span className="line-clamp-1 text-center text-xs text-muted-foreground">{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </KitSection>
                            <div className="lg:col-span-2">
                                <KitSection title="สินค้าใกล้หมด" description="สินค้าที่เปิดขายและเหลือไม่เกิน 5 ชิ้น">
                                    {stats.low_stock_items.length ? (
                                        <div className="overflow-hidden rounded-xl border border-border">
                                            <Table>
                                                <TableHeader className="bg-secondary/60">
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="pl-4">รหัส</TableHead>
                                                        <TableHead>สินค้า</TableHead>
                                                        <TableHead className="text-right">ราคา</TableHead>
                                                        <TableHead className="pr-4 text-right">คงเหลือ</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {stats.low_stock_items.map((p) => (
                                                        <TableRow key={p.id}>
                                                            <TableCell className="pl-4 font-mono text-xs text-muted-foreground">{p.external_id}</TableCell>
                                                            <TableCell className="font-medium">{p.title}</TableCell>
                                                            <TableCell className="text-right tabular-nums">{formatTHB(p.price)}</TableCell>
                                                            <TableCell className="pr-4 text-right">
                                                                <StatusPill tone={p.stock <= 0 ? "danger" : "warning"}>
                                                                    {p.stock <= 0 ? "หมด" : `${p.stock} ชิ้น`}
                                                                </StatusPill>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p className="flex items-center gap-2 rounded-xl bg-success/10 p-4 text-sm text-success">
                                            <PackageX className="size-4" /> สต็อกเพียงพอทุกรายการ
                                        </p>
                                    )}
                                    <Link href="/backend/setting/products" className="inline-flex items-center gap-1 self-end text-sm text-primary hover:underline">
                                        ไปที่หน้าจัดการสินค้า <ArrowRight className="size-4" />
                                    </Link>
                                </KitSection>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <KitSection title="ข้อมูลผู้ใช้">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                            <UserRound className="size-5" />
                        </span>
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {user.prefix}
                                {user.first_name} {user.last_name}
                            </span>
                            <span className="text-sm text-muted-foreground break-all">{user.email}</span>
                        </div>
                    </div>
                    <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm">
                        <dt className="text-muted-foreground">รหัสผู้ใช้</dt>
                        <dd>#{user.user_id}</dd>
                    </dl>
                </KitSection>
                <KitSection title="สิทธิ์การใช้งาน">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                            <ShieldCheck className="size-5" />
                        </span>
                        <StatusPill tone={isStaff ? "info" : "neutral"}>
                            {isStaff ? "ผู้ดูแลระบบ" : "สมาชิก"} (ระดับ {user.permission_id})
                        </StatusPill>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {isStaff
                            ? "คุณจัดการสินค้า นำเข้า CSV และดูสถิติร้านค้าได้"
                            : "บัญชีสมาชิกใช้เลือกซื้อสินค้าได้ หากต้องการสิทธิ์จัดการร้าน กรุณาติดต่อผู้ดูแลระบบ"}
                    </p>
                    {!isStaff && (
                        <Link href="/products" className={cn(buttonVariants({ variant: "outline" }), "self-start")}>
                            เลือกซื้อสินค้า <ArrowRight />
                        </Link>
                    )}
                </KitSection>
            </div>
        </>
    );
}
