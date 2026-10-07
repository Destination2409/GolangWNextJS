"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/form-select";
import { AuthShell, FormError, fieldClass } from "@/components/auth/auth-shell";

const prefixOptions = [
    { value: "นาย", label: "นาย" },
    { value: "นาง", label: "นาง" },
    { value: "นางสาว", label: "นางสาว" },
];

const genderOptions = [
    { value: "male", label: "ชาย" },
    { value: "female", label: "หญิง" },
    { value: "other", label: "อื่นๆ" },
];

// เลือกคำนำหน้าแล้วเดาเพศให้ (และกลับกัน) ถ้าอีกช่องยังว่างอยู่
const prefixToGender: Record<string, string> = { นาย: "male", นาง: "female", นางสาว: "female" };
const genderToPrefix: Record<string, string> = { male: "นาย", female: "นางสาว" };

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [prefix, setPrefix] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

            toast.success("สมัครสมาชิกสำเร็จ", { description: "เข้าสู่ระบบด้วยอีเมลที่เพิ่งสมัครได้เลย" });
            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="สร้างบัญชีใหม่"
            description="สมัครสมาชิกเพื่อเริ่มช้อปของล้ำยุค"
            footer={
                <>
                    มีบัญชีอยู่แล้ว?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                        เข้าสู่ระบบ
                    </Link>
                </>
            }
        >
            <FormError message={error} />

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="prefix">คำนำหน้าชื่อ</Label>
                        <FormSelect
                            id="prefix"
                            value={prefix}
                            placeholder="เลือกคำนำหน้า"
                            options={prefixOptions}
                            disabled={loading}
                            onChange={(v) => {
                                setPrefix(v);
                                if (!gender && prefixToGender[v]) setGender(prefixToGender[v]);
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="gender">เพศ</Label>
                        <FormSelect
                            id="gender"
                            value={gender}
                            placeholder="เลือกเพศ"
                            options={genderOptions}
                            disabled={loading}
                            onChange={(v) => {
                                setGender(v);
                                if (!prefix && genderToPrefix[v]) setPrefix(genderToPrefix[v]);
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="firstName">ชื่อจริง</Label>
                        <Input
                            id="firstName"
                            autoComplete="given-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            disabled={loading}
                            className={fieldClass}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="lastName">นามสกุล</Label>
                        <Input
                            id="lastName"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            disabled={loading}
                            className={fieldClass}
                        />
                    </div>
                </div>

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
                        autoComplete="new-password"
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className={fieldClass}
                    />
                    <p className="text-xs text-muted-foreground">อย่างน้อย 6 ตัวอักษร</p>
                </div>

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
                    สมัครสมาชิก
                </Button>
            </form>
        </AuthShell>
    );
}
