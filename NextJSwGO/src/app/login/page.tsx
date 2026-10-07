"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FormError, fieldClass } from "@/components/auth/auth-shell";
import { saveTokens } from "@/lib/session";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
            }

            // เก็บทั้ง access + refresh token (saveTokens ยิง event ให้ header อัปเดตเองด้วย)
            saveTokens(data.token, data.refresh_token);
            router.push("/backend/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_FB_CLIENT_TOKEN || process.env.FB_CLIENT_TOKEN || "2040268933586815";
        const redirectUri = window.location.origin + "/facebook/callback";
        const fbUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,email,user_gender`;
        window.location.href = fbUrl;
    };

    return (
        <AuthShell
            title="ยินดีต้อนรับกลับ"
            description="เข้าสู่ระบบเพื่อจัดการบัญชีและร้านค้าของคุณ"
            footer={
                <>
                    ยังไม่มีบัญชีใช่ไหม?{" "}
                    <Link href="/register" className="font-medium text-primary hover:underline underline-offset-4">
                        สมัครสมาชิก
                    </Link>
                </>
            }
        >
            <FormError message={error} />

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className={fieldClass}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className={fieldClass}
                    />
                </div>
                <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <LogIn />}
                    เข้าสู่ระบบ
                </Button>
            </form>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                หรือเข้าสู่ระบบด้วย
                <span className="h-px flex-1 bg-border" />
            </div>

            <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleFacebookLogin}>
                <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-[#1877F2]">
                    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
                </svg>
                Facebook
            </Button>
        </AuthShell>
    );
}
