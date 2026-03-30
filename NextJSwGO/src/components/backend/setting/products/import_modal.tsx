import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ImportProductModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!isOpen || !mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

            toast.success("นำเข้าสินค้าสำเร็จ!");
            onSuccess();
            onClose();
            setFile(null);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                    <h2 className="text-xl font-bold text-foreground">นำเข้า CSV</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={loading} className="rounded-full h-8 w-8 hover:bg-muted">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                        <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
                            เลือกไฟล์
                            <input 
                                type="file" 
                                accept=".csv" 
                                className="hidden" 
                                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            />
                        </label>
                        {file && <p className="mt-2 text-xs text-muted-foreground break-all">{file.name}</p>}
                        {!file && <p className="text-xs text-muted-foreground mt-1">รองรับเฉพาะ .csv</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" isLoading={loading} disabled={!file}>
                            อัปโหลด
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
