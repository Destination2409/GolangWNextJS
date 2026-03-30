import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "react-toastify";

interface EditModalProps {
    isOpen: boolean;
    product: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditProductModal({ isOpen, product, onClose, onSuccess }: EditModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        external_id: "",
        title: "",
        price: "",
        stock: "0",
        status: ""
    });

    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                external_id: product.external_id || "",
                title: product.title || "",
                price: product.price?.toString() || "0",
                stock: product.stock?.toString() || "0",
                status: product.status || ""
            });
        }
    }, [product, isOpen]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!isOpen || !product || !mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    external_id: formData.external_id,
                    title: formData.title,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock, 10),
                    status: formData.status
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "แก้ไขสินค้าล้มเหลว");

            toast.success("บันทึกการแก้ไขสำเร็จ!");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                    <h2 className="text-xl font-bold text-foreground">แก้ไขข้อมูลสินค้า</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={loading} className="rounded-full h-8 w-8 hover:bg-muted">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">รหัสสินค้าภายนอก (External ID)</label>
                            <Input 
                                required 
                                disabled // มักจะไม่ให้แก้ ID หลัก
                                value={formData.external_id}
                                onChange={(e) => setFormData({...formData, external_id: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">สถานะการใช้งาน</label>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Select>
                        </div>
                    </div>
                        
                    <div className="space-y-2">
                        <label className="text-sm font-medium">ชื่อสินค้า (Title) *</label>
                        <Input 
                            required 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ราคา (Price) *</label>
                            <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                required 
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">สต็อกคงเหลือ (Stock) *</label>
                            <Input 
                                type="number" 
                                min="0" 
                                required 
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            ยืนยันการแก้ไข
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
