"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, ExternalLink, ImageOff, Loader2, PackageSearch, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusPill } from "@/components/admin/kit";
import { FormSelect } from "@/components/form-select";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { fetchReferences, type ApiProduct, type Paginated, type References } from "@/lib/api";
import { formatTHB, productImage, PLACEHOLDER_IMAGE } from "@/lib/products";
import { ImportDialog } from "./import_dialog";
import { ProductFormDialog } from "./product_form_dialog";

const LOW_STOCK = 5;
const EXAMPLE_FILE_NAME = "Go_next_import_product_example.xlsx";

/** หมายเลขหน้าที่จะแสดง เช่น 1 … 4 5 6 … 12 */
function pageNumbers(page: number, last: number): (number | "…")[] {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(last - 1, page + 1);
    if (start > 2) pages.push("…");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < last - 1) pages.push("…");
    pages.push(last);
    return pages;
}

export function ProductsIndexData({ initialSearch = "" }: { initialSearch?: string }) {
    const [isLoading, setIsLoading] = useState(true);

    // pagination state
    const [data, setData] = useState<ApiProduct[]>([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // dialogs
    const [references, setReferences] = useState<References | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<ApiProduct | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [deleting, setDeleting] = useState<ApiProduct | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [exampleLoading, setExampleLoading] = useState(false);

    // ค้นหาจาก topbar จะเปลี่ยน ?search= ใน URL
    useEffect(() => {
        setSearch(initialSearch);
        setDebouncedSearch(initialSearch);
        setPage(1);
    }, [initialSearch]);

    const loadReferences = useCallback(() => {
        fetchReferences()
            .then(setReferences)
            .catch(() => toast.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ"));
    }, []);

    useEffect(loadReferences, [loadReferences]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/products?page=${page}&per_page=${perPage}&search=${encodeURIComponent(debouncedSearch)}`,
            );
            const json: Paginated<ApiProduct> = await res.json();

            if (res.ok && json.data) {
                setData(json.data);
                setTotalRows(json.total || 0);
                setTotalPages(json.last_page || 1);
            } else {
                setData([]);
                setTotalRows(0);
                setTotalPages(1);
            }
        } catch (err) {
            console.error(err);
            toast.error("ไม่สามารถเชื่อมต่อดึงข้อมูลสินค้าได้");
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, debouncedSearch]);

    // ดีเลย์ search (debounce) รอ 500ms หลังพิมพ์เสร็จ
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 500);
        return () => clearTimeout(timeout);
    }, [search]);

    // ยิง API ทันทีเมื่อ page, perPage หรือ debouncedSearch อย่างใดอย่างหนึ่งเปลี่ยน
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // หลังเพิ่ม/แก้ไข/นำเข้า อาจมีหมวดหมู่ใหม่ (จาก CSV) จึงโหลดข้อมูลอ้างอิงใหม่ด้วย
    const reloadAll = () => {
        fetchData();
        loadReferences();
    };

    // ไฟล์ตัวอย่างสร้างโดย Go API (ต้องแนบ token) จึงโหลดเป็น blob แล้วสั่งดาวน์โหลดเอง
    const downloadExample = async () => {
        setExampleLoading(true);
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/products/import/example`);
            if (!res.ok) throw new Error("ดาวน์โหลดไฟล์ตัวอย่างไม่สำเร็จ");
            const url = URL.createObjectURL(await res.blob());
            const a = document.createElement("a");
            a.href = url;
            a.download = EXAMPLE_FILE_NAME;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setExampleLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setDeleteLoading(true);
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/products/${deleting.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "ลบสินค้าล้มเหลว");
            }
            toast.success("ลบสินค้าแล้ว", { description: deleting.title });
            setDeleting(null);
            // ถ้าลบตัวสุดท้ายของหน้า ให้ถอยกลับไปหน้าก่อน
            if (data.length === 1 && page > 1) setPage(page - 1);
            else fetchData();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const from = totalRows === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, totalRows);

    return (
        <>
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft md:p-5">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex h-10 w-full items-center gap-2 rounded-xl border border-input bg-background/60 px-3 shadow-soft focus-within:border-primary/50 sm:max-w-xs">
                        <Search className="size-4 text-muted-foreground" />
                        <span className="sr-only">ค้นหาสินค้า</span>
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="ค้นหาชื่อหรือรหัสสินค้า..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        {isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={downloadExample} disabled={exampleLoading}>
                            {exampleLoading ? <Loader2 className="animate-spin" /> : <Download />}
                            ตัวอย่างไฟล์นำเข้า
                        </Button>
                        <Button variant="success" onClick={() => setImportOpen(true)}>
                            <Upload /> นำเข้า Excel / CSV
                        </Button>
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                        >
                            <Plus /> เพิ่มสินค้า
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-border">
                    <Table>
                        <TableHeader className="bg-secondary/60">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-4">สินค้า</TableHead>
                                <TableHead className="hidden md:table-cell">หมวดหมู่</TableHead>
                                <TableHead className="text-right">ราคา</TableHead>
                                <TableHead className="text-center">สต็อก</TableHead>
                                <TableHead className="text-center">สถานะ</TableHead>
                                <TableHead className="w-28 pr-4 text-right">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && data.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6} className="px-4">
                                            <div className="h-10 animate-pulse rounded-lg bg-muted" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : data.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={6}>
                                        <div className="flex flex-col items-center gap-2 py-12 text-center">
                                            <PackageSearch className="size-10 animate-float text-primary" />
                                            <p className="font-heading">{debouncedSearch ? "ไม่พบสินค้าที่ค้นหา" : "ยังไม่มีสินค้า"}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {debouncedSearch ? "ลองเปลี่ยนคำค้นหาดูนะ" : "เพิ่มสินค้าใหม่ หรือนำเข้าจากไฟล์ CSV"}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row) => {
                                    const img = productImage(row);
                                    const onSale = row.compare_at_price != null && row.compare_at_price > row.price;
                                    return (
                                        <TableRow key={row.id} className={isLoading ? "opacity-60" : undefined}>
                                            <TableCell className="pl-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary">
                                                        {img === PLACEHOLDER_IMAGE ? (
                                                            <ImageOff className="size-4 text-muted-foreground" />
                                                        ) : (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={img} alt="" className="size-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div className="flex min-w-0 flex-col">
                                                        <span className="truncate font-medium">{row.title}</span>
                                                        <span className="font-mono text-xs text-muted-foreground">{row.external_id}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden text-muted-foreground md:table-cell">
                                                {row.category?.name ?? "-"}
                                                {row.sub_category && <span className="block text-xs">{row.sub_category.name}</span>}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                <span className="font-medium">{formatTHB(row.price)}</span>
                                                {onSale && (
                                                    <span className="block text-xs text-muted-foreground line-through">{formatTHB(row.compare_at_price!)}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <StatusPill tone={row.stock <= 0 ? "danger" : row.stock <= LOW_STOCK ? "warning" : "success"}>
                                                    {row.stock.toLocaleString("th-TH")}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <StatusPill tone={row.status === "active" ? "info" : "neutral"}>
                                                    {row.status === "active" ? "เปิดขาย" : "ปิดขาย"}
                                                </StatusPill>
                                            </TableCell>
                                            <TableCell className="pr-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {row.status === "active" && (
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                render={
                                                                    <a
                                                                        href={`/products/${row.id}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        aria-label={`ดู ${row.title} ที่หน้าร้าน`}
                                                                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                                                                    />
                                                                }
                                                            >
                                                                <ExternalLink className="size-4" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>ดูที่หน้าร้าน</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label={`แก้ไข ${row.title}`}
                                                        onClick={() => {
                                                            setEditing(row);
                                                            setFormOpen(true);
                                                        }}
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label={`ลบ ${row.title}`}
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => setDeleting(row)}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer: rows per page + pagination */}
                <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
                    <div className="flex items-center gap-3">
                        <span>
                            แสดง {from}-{to} จาก {totalRows.toLocaleString("th-TH")} รายการ
                        </span>
                        <FormSelect
                            allowEmpty={false}
                            value={String(perPage)}
                            onChange={(v) => {
                                setPerPage(Number(v));
                                setPage(1);
                            }}
                            options={[10, 20, 50].map((n) => ({ value: String(n), label: `${n} / หน้า` }))}
                            className="h-9 w-28"
                        />
                    </div>
                    {totalPages > 1 && (
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        text="ก่อนหน้า"
                                        aria-disabled={page <= 1}
                                        className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage((p) => Math.max(1, p - 1));
                                        }}
                                    />
                                </PaginationItem>
                                {pageNumbers(page, totalPages).map((n, i) =>
                                    n === "…" ? (
                                        <PaginationItem key={`gap-${i}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={n}>
                                            <PaginationLink
                                                href="#"
                                                isActive={n === page}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPage(n);
                                                }}
                                            >
                                                {n}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ),
                                )}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        text="ถัดไป"
                                        aria-disabled={page >= totalPages}
                                        className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage((p) => Math.min(totalPages, p + 1));
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>

            <ProductFormDialog
                open={formOpen}
                product={editing}
                references={references}
                onOpenChange={setFormOpen}
                onSuccess={reloadAll}
            />

            <ImportDialog open={importOpen} onOpenChange={setImportOpen} onSuccess={reloadAll} />

            <Dialog open={deleting !== null} onOpenChange={(o) => !o && !deleteLoading && setDeleting(null)}>
                <DialogContent className="rounded-2xl p-6">
                    <DialogHeader>
                        <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
                            <Trash2 className="size-6" />
                        </span>
                        <DialogTitle className="font-heading text-lg">ยืนยันการลบสินค้า?</DialogTitle>
                        <DialogDescription>
                            คุณต้องการลบ &quot;{deleting?.title}&quot; หรือไม่? การกระทำนี้ไม่สามารถกู้คืนได้
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleting(null)} disabled={deleteLoading}>
                            ยกเลิก
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                            {deleteLoading ? <Loader2 className="animate-spin" /> : <Trash2 />}
                            ลบสินค้า
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
