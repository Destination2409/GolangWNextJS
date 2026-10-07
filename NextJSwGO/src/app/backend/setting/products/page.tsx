"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/kit";
import { ProductsIndexData } from "@/components/backend/setting/products/index_data";
import { useRequireAuth } from "@/hooks/useRequireAuth";

function ProductsContent() {
    // ค้นหาจากช่องค้นหาด้านบน (topbar) จะส่งมาเป็น ?search=
    const search = useSearchParams().get("search") ?? "";
    return <ProductsIndexData initialSearch={search} />;
}

export default function SettingProductsPage() {
    // กำหนดว่า permission_id 2 เป็นต้นไปจะเข้าได้
    const { isAuthenticated } = useRequireAuth(2);

    return (
        <>
            <PageHeader title="จัดการสินค้า" description="บริหารจัดการรายการสินค้าในระบบ นำเข้าข้อมูล แก้ไขราคาและสต็อก" />
            {isAuthenticated ? (
                <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
                    <ProductsContent />
                </Suspense>
            ) : (
                <div className="h-96 animate-pulse rounded-2xl bg-muted" />
            )}
        </>
    );
}
