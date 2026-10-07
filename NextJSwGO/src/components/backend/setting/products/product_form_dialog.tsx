"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/form-select";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { ApiProduct, References } from "@/lib/api";
import { productImage } from "@/lib/products";

const field = "h-10 rounded-xl bg-background/60 px-3 shadow-soft";

type FormState = {
    external_id: string;
    title: string;
    description: string;
    price: string;
    compare_at_price: string;
    stock: string;
    status: string;
    image_url: string;
    gender_id: string;
    category_id: string;
    sub_category_id: string;
    product_type_id: string;
    colour_id: string;
    usage_id: string;
};

const emptyForm: FormState = {
    external_id: "",
    title: "",
    description: "",
    price: "",
    compare_at_price: "",
    stock: "0",
    status: "active",
    image_url: "",
    gender_id: "",
    category_id: "",
    sub_category_id: "",
    product_type_id: "",
    colour_id: "",
    usage_id: "",
};

const str = (v: number | string | null | undefined) => (v == null ? "" : String(v));

function fromProduct(p: ApiProduct): FormState {
    return {
        external_id: p.external_id,
        title: p.title,
        description: p.description ?? "",
        price: str(p.price),
        compare_at_price: str(p.compare_at_price),
        stock: str(p.stock),
        status: p.status,
        image_url: p.image_url ?? "",
        gender_id: str(p.gender_id),
        category_id: str(p.category_id),
        sub_category_id: str(p.sub_category_id),
        product_type_id: str(p.product_type_id),
        colour_id: str(p.colour_id),
        usage_id: str(p.usage_id),
    };
}

const toOptions = (list: { id: number; name: string }[] = []) => list.map((x) => ({ value: String(x.id), label: x.name }));
const idOrNull = (v: string) => (v ? Number(v) : null);

/** ใช้ทั้งเพิ่มสินค้า (product = null) และแก้ไขสินค้า */
export function ProductFormDialog({
    open,
    product,
    references,
    onOpenChange,
    onSuccess,
}: {
    open: boolean;
    product: ApiProduct | null;
    references: References | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const isEdit = product !== null;
    const [form, setForm] = useState<FormState>(emptyForm);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) setForm(product ? fromProduct(product) : emptyForm);
    }, [open, product]);

    const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

    // หมวดหมู่ย่อยและประเภทต้องอยู่ใต้ตัวที่เลือกไว้ด้านบน
    const subCategories = useMemo(
        () => references?.sub_categories.filter((s) => String(s.category_id) === form.category_id) ?? [],
        [references, form.category_id],
    );
    const productTypes = useMemo(
        () => references?.product_types.filter((t) => String(t.sub_category_id) === form.sub_category_id) ?? [],
        [references, form.sub_category_id],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const body = {
                external_id: form.external_id.trim(),
                title: form.title.trim(),
                description: form.description.trim(),
                price: parseFloat(form.price),
                // ส่ง 0 เพื่อบอก API ให้ล้างราคาเดิม (เลิกลดราคา)
                compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : 0,
                stock: parseInt(form.stock, 10),
                status: form.status,
                image_url: form.image_url.trim(),
                gender_id: idOrNull(form.gender_id),
                category_id: idOrNull(form.category_id),
                sub_category_id: idOrNull(form.sub_category_id),
                product_type_id: idOrNull(form.product_type_id),
                colour_id: idOrNull(form.colour_id),
                usage_id: idOrNull(form.usage_id),
            };

            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/products`;
            const res = await fetchWithAuth(url, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || (isEdit ? "แก้ไขสินค้าล้มเหลว" : "เพิ่มสินค้าล้มเหลว"));

            toast.success(isEdit ? "บันทึกการแก้ไขแล้ว" : "เพิ่มสินค้าสำเร็จ", { description: body.title });
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const preview = form.image_url.trim() ? form.image_url.trim() : product ? productImage(product) : null;

    return (
        <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl p-6 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-heading text-xl">{isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? `รหัส ${product.external_id}` : "กรอกข้อมูลสินค้า ช่องที่มี * ต้องกรอก"}
                    </DialogDescription>
                </DialogHeader>

                <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="external_id">รหัสสินค้า (External ID) *</Label>
                            <Input id="external_id" required value={form.external_id} onChange={(e) => set({ external_id: e.target.value })} className={field} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="status">สถานะ</Label>
                            <FormSelect
                                id="status"
                                allowEmpty={false}
                                value={form.status}
                                onChange={(v) => set({ status: v })}
                                options={[
                                    { value: "active", label: "เปิดขาย (Active)" },
                                    { value: "inactive", label: "ปิดการขาย (Inactive)" },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="title">ชื่อสินค้า *</Label>
                        <Input id="title" required value={form.title} onChange={(e) => set({ title: e.target.value })} className={field} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">รายละเอียด</Label>
                        <Textarea
                            id="description"
                            rows={3}
                            value={form.description}
                            onChange={(e) => set({ description: e.target.value })}
                            className="rounded-xl bg-background/60 shadow-soft"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="price">ราคาขาย (บาท) *</Label>
                            <Input id="price" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => set({ price: e.target.value })} className={field} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="compare_at_price">ราคาก่อนลด</Label>
                            <Input
                                id="compare_at_price"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="ไม่ลดราคา"
                                value={form.compare_at_price}
                                onChange={(e) => set({ compare_at_price: e.target.value })}
                                className={field}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="stock">สต็อก *</Label>
                            <Input id="stock" type="number" min="0" required value={form.stock} onChange={(e) => set({ stock: e.target.value })} className={field} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="category_id">หมวดหมู่</Label>
                            <FormSelect
                                id="category_id"
                                value={form.category_id}
                                onChange={(v) => set({ category_id: v, sub_category_id: "", product_type_id: "" })}
                                options={toOptions(references?.categories)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="sub_category_id">หมวดหมู่ย่อย</Label>
                            <FormSelect
                                id="sub_category_id"
                                value={form.sub_category_id}
                                onChange={(v) => set({ sub_category_id: v, product_type_id: "" })}
                                options={toOptions(subCategories)}
                                disabled={!form.category_id}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="product_type_id">ประเภท</Label>
                            <FormSelect
                                id="product_type_id"
                                value={form.product_type_id}
                                onChange={(v) => set({ product_type_id: v })}
                                options={toOptions(productTypes)}
                                disabled={!form.sub_category_id}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="colour_id">สี</Label>
                            <FormSelect id="colour_id" value={form.colour_id} onChange={(v) => set({ colour_id: v })} options={toOptions(references?.colours)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="usage_id">การใช้งาน</Label>
                            <FormSelect id="usage_id" value={form.usage_id} onChange={(v) => set({ usage_id: v })} options={toOptions(references?.usages)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="gender_id">เพศ</Label>
                            <FormSelect id="gender_id" value={form.gender_id} onChange={(v) => set({ gender_id: v })} options={toOptions(references?.genders)} />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-1 flex-col gap-2">
                            <Label htmlFor="image_url">URL รูปภาพ</Label>
                            <Input
                                id="image_url"
                                placeholder="/images/p-watch.png หรือ https://..."
                                value={form.image_url}
                                onChange={(e) => set({ image_url: e.target.value })}
                                className={field}
                            />
                        </div>
                        {preview && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={preview} alt="" className="size-16 shrink-0 self-end rounded-xl border border-border bg-secondary object-cover" />
                        )}
                    </div>
                </form>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        ยกเลิก
                    </Button>
                    <Button type="submit" form="product-form" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Save />}
                        {isEdit ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
