"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ProductsIndexData } from "@/components/backend/setting/products/index_data";

export default function SettingProductsPage() {
    // กำหนดว่า permission_id 2 เป็นต้นไปจะเข้าได้
    const { isAuthenticated, user } = useRequireAuth(2);

    // Skeleton ตอนหน้าจอเพิ่งโหลดและยังเช็คสิทธิ์แบบไม่เสร็จ (FOUC Prevention)
    if (!isAuthenticated) return (
        <div className="max-w-7xl mx-auto py-8 px-4 w-full relative animate-pulse flex flex-col gap-8">
            <div className="space-y-2">
                <div className="h-8 w-48 bg-muted rounded"></div>
                <div className="h-4 w-64 bg-muted rounded"></div>
            </div>
            <div className="flex justify-between items-center">
                 <div className="h-10 w-64 bg-muted rounded-md"></div>
                 <div className="flex gap-2">
                     <div className="h-10 w-32 bg-muted rounded-md"></div>
                     <div className="h-10 w-32 bg-muted rounded-md"></div>
                 </div>
            </div>
            <div className="h-[400px] w-full bg-muted rounded-lg border border-border"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการสินค้า (Products)</h1>
                <p className="text-muted-foreground text-sm">บริหารจัดการรายการสินค้าในระบบ, นำเข้าข้อมูล, แก้ไขราคาและสต็อก</p>
            </div>
            <ProductsIndexData />
        </div>
    );
}
