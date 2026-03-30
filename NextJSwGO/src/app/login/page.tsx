"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

            localStorage.setItem("token", data.token);

            // Update Auth State immediately to reflect in Navbar without full reload
            window.dispatchEvent(new Event("storage"));
            router.push("/backend/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-background p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-card border border-border text-card-foreground shadow-lg rounded-xl">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">ยินดีต้อนรับกลับเข้าสู่ระบบ</h1>
                    <p className="text-sm text-muted-foreground">เข้าสู่บัญชีของคุณ</p>
                </div>

                {error && (
                    <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">อีเมล</label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            isLoading={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">รหัสผ่าน</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            isLoading={loading}
                        />
                    </div>
                    <Button type="submit" className="w-full" isLoading={loading}>
                        Login
                    </Button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">หรือเข้าสู่ระบบด้วย</span>
                    </div>
                </div>

                <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white border-0"
                    onClick={() => {
                        // ดึงค่า Client ID จาก .env.local ที่ user ระบุ (Fallback ด้วย 2040268933586815 ในกรณีที่ Env ล้มเหลว)
                        const clientId = process.env.NEXT_PUBLIC_FB_CLIENT_TOKEN || process.env.FB_CLIENT_TOKEN || "2040268933586815";
                        const redirectUri = window.location.origin + "/facebook/callback";
                        const fbUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,email,user_gender`;
                        window.location.href = fbUrl;
                    }}
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                    เข้าสู่ระบบด้วย Facebook
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    ยังไม่มีบัญชีใช่ไหม?{" "}
                    <Link href="/register" className="font-medium text-primary hover:underline underline-offset-4">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
