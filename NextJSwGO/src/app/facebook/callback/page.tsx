"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FacebookCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("กำลังตรวจสอบข้อมูลกับ Facebook...");

    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) {
            setStatus("ไม่พบข้อมูลการอนุมัติ กำลังพากลับไปหน้า Login...");
            setTimeout(() => router.push("/login"), 2000);
            return;
        }

        const handleAuth = async () => {
            try {
                // จำเป็นต้องมี redirect_uri ให้ตรงกับตอนที่กดขอเป๊ะๆ
                const redirectUri = window.location.origin + "/facebook/callback";
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/facebook`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, redirect_uri: redirectUri })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "เข้าสู่ระบบผ่าน Facebook ล้มเหลว");

                // จัดเก็บตั๋วทั้งสองใบ
                localStorage.setItem("token", data.token);
                localStorage.setItem("refresh_token", data.refresh_token);
                
                setStatus("เข้าสู่ระบบสำเร็จ! กำลังพาไปหน้าแรก...");
                window.dispatchEvent(new Event("storage"));
                
                setTimeout(() => router.push("/backend/setting/products"), 1000);

            } catch (err: any) {
                console.error(err);
                setStatus(`เกิดข้อผิดพลาด: ${err.message}`);
                setTimeout(() => router.push("/login"), 3000);
            }
        };

        handleAuth();
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-background p-4">
            <div className="w-full max-w-sm p-8 bg-card border border-border shadow-lg rounded-xl flex flex-col items-center gap-4 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <h2 className="text-xl font-bold tracking-tight">กำลังเข้าสู่ระบบ</h2>
                <p className="text-sm text-muted-foreground">{status}</p>
            </div>
        </div>
    );
}

export default function FacebookCallback() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-140px)]">กำลังโหลด...</div>}>
            <FacebookCallbackContent />
        </Suspense>
    );
}
