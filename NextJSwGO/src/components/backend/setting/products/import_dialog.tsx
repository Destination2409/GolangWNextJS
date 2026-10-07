"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { cn } from "@/lib/utils";

const REQUIRED_COLUMNS = "ProductId, Gender, Category, SubCategory, ProductType, Colour, Usage, ProductTitle, Image, ImageURL";
const OPTIONAL_COLUMNS = "Price, CompareAtPrice, Stock, Description";

export function ImportDialog({
    open,
    onOpenChange,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragging, setDragging] = useState(false);

    const close = (o: boolean) => {
        if (loading) return;
        onOpenChange(o);
        if (!o) setFile(null);
    };

    const handleSubmit = async () => {
        if (!file) {
            toast.warning("กรุณาเลือกไฟล์ CSV ก่อน");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/products/import`, {
                method: "POST",
                body: formData // No Content-Type header needed for FormData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "นำเข้าล้มเหลว");

            toast.success(`นำเข้าสินค้าสำเร็จ ${data.imported ?? 0} รายการ`, {
                description: data.skipped ? `ข้าม ${data.skipped} แถวที่ข้อมูลไม่ครบ` : undefined,
            });
            onSuccess();
            setFile(null);
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="rounded-2xl p-6 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-heading text-xl">นำเข้าสินค้าจาก Excel / CSV</DialogTitle>
                    <DialogDescription>
                        สินค้าที่มีรหัสซ้ำจะถูกอัปเดต ช่องราคา/สต็อกที่เว้นว่างจะคงค่าเดิมไว้ และไม่เปลี่ยนสถานะเปิด-ปิดขาย
                    </DialogDescription>
                </DialogHeader>

                <label
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        const dropped = e.dataTransfer.files?.[0];
                        if (dropped) setFile(dropped);
                    }}
                    className={cn(
                        "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/5",
                        dragging && "border-primary bg-primary/10 shadow-neon",
                    )}
                >
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        {file ? <FileSpreadsheet className="size-6" /> : <Upload className="size-6" />}
                    </span>
                    {file ? (
                        <span className="flex flex-col">
                            <span className="font-medium break-all">{file.name}</span>
                            <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · คลิกเพื่อเปลี่ยนไฟล์</span>
                        </span>
                    ) : (
                        <span className="flex flex-col">
                            <span className="font-medium">ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</span>
                            <span className="text-xs text-muted-foreground">รองรับไฟล์ .xlsx และ .csv</span>
                        </span>
                    )}
                    <input
                        type="file"
                        accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        className="sr-only"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                </label>

                <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                    <p className="mb-1 font-medium text-foreground">คอลัมน์ตามลำดับ (แถวแรกเป็นหัวตาราง)</p>
                    <code className="break-words">{REQUIRED_COLUMNS}</code>
                    <p className="mt-2 mb-1 font-medium text-foreground">ต่อท้ายได้ (ไม่บังคับ)</p>
                    <code className="break-words">{OPTIONAL_COLUMNS}</code>
                    <p className="mt-2">ดูตัวอย่างได้จากปุ่ม &quot;ตัวอย่างไฟล์นำเข้า&quot;</p>
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => close(false)} disabled={loading}>
                        ยกเลิก
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading || !file}>
                        {loading ? <Loader2 className="animate-spin" /> : <Upload />}
                        นำเข้า
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
