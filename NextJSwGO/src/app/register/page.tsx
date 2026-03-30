"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [prefix, setPrefix] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [defaultPrefix, setDefaultPrefix] = useState(["นาย", "นาง", "นางสาว"]);
    const [defaultGender, setDefaultGender] = useState(["male", "female", "female"]);
    
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    prefix, 
                    first_name: firstName, 
                    last_name: lastName, 
                    gender 
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "สมัครสมาชิกไม่สำเร็จ");
            }

            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-background p-4 my-8">
            <div className="w-full max-w-lg p-8 space-y-6 bg-card border border-border text-card-foreground shadow-lg rounded-xl">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">สร้างบัญชีผู้ใช้</h1>
                    <p className="text-sm text-muted-foreground">เริ่มต้นใช้งานบัญชีของคุณฟรี</p>
                </div>

                {error && (
                    <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="prefix" className="text-sm font-medium leading-none">คำนำหน้าชื่อ</label>
                            <Select
                                id="prefix"
                                value={prefix}
                                onChange={(e) => { setPrefix(e.target.value); if (!gender && defaultPrefix.includes(e.target.value)) setGender(defaultGender[defaultPrefix.indexOf(e.target.value)]); }}
                                isLoading={loading}
                            >
                                <option value="" hidden>เลือกคำนำหน้า</option>
                                <option value="นาย">นาย</option>
                                <option value="นาง">นาง</option>
                                <option value="นางสาว">นางสาว</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="gender" className="text-sm font-medium leading-none">เพศ</label>
                            <Select
                                id="gender"
                                value={gender}
                                onChange={(e) => { setGender(e.target.value); if (!prefix && defaultGender.includes(e.target.value)) setPrefix(defaultPrefix[defaultGender.indexOf(e.target.value)]); }}
                                isLoading={loading}
                            >
                                <option value="" hidden>เลือกเพศ</option>
                                <option value="male">ชาย</option>
                                <option value="female">หญิง</option>
                                <option value="other">อื่นๆ</option>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="first_name" className="text-sm font-medium leading-none">ชื่อจริง *</label>
                            <Input
                                id="first_name"
                                placeholder="สมชาย"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                isLoading={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="last_name" className="text-sm font-medium leading-none">นามสกุล *</label>
                            <Input
                                id="last_name"
                                placeholder="ทั้งใจ"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                isLoading={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border mt-4">
                        <label htmlFor="email" className="text-sm font-medium leading-none">อีเมล *</label>
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
                        <label htmlFor="password" className="text-sm font-medium leading-none">รหัสผ่าน * (อย่างน้อย 6 ตัวอักษร)</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            isLoading={loading}
                        />
                    </div>
                    
                    <Button type="submit" className="w-full mt-6" isLoading={loading}>
                        Register
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    มีบัญชีอยู่แล้วใช่ไหม?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
