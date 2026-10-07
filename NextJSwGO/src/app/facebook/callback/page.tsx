"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { saveTokens } from "@/lib/session";

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
                saveTokens(data.token, data.refresh_token);

                setStatus("เข้าสู่ระบบสำเร็จ! กำลังพาไปหน้าแรก...");
                
                setTimeout(() => router.push("/backend/dashboard"), 1000);

            } catch (err: any) {
                console.error(err);
                setStatus(`เกิดข้อผิดพลาด: ${err.message}`);
                setTimeout(() => router.push("/login"), 3000);
            }
        };

        handleAuth();
    }, [searchParams, router]);

    return (
        <AuthShell title="กำลังเข้าสู่ระบบ" description="เชื่อมต่อบัญชี Facebook ของคุณ">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground" aria-live="polite">{status}</p>
            </div>
        </AuthShell>
    );
}

export default function FacebookCallback() {
    return (
        <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-muted-foreground">กำลังโหลด...</div>}>
            <FacebookCallbackContent />
        </Suspense>
    );
}
