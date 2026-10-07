"use client";

import { useEffect, useState } from "react";
import { decodeToken, getTokens } from "@/lib/session";
import type { UserPayload } from "./useRequireAuth";

/**
 * อ่านข้อมูลผู้ใช้จาก token ปัจจุบันแบบไม่บังคับล็อกอิน (ใช้กับ header หน้าร้าน)
 * อัปเดตเองเมื่อ login / logout เพราะ session.ts ยิง event "storage" ทุกครั้ง
 */
export function useSessionUser() {
    const [user, setUser] = useState<UserPayload | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const read = () => {
            const { token } = getTokens();
            try {
                setUser(token ? decodeToken<UserPayload>(token) : null);
            } catch {
                setUser(null);
            }
            setReady(true);
        };
        read();
        window.addEventListener("storage", read);
        return () => window.removeEventListener("storage", read);
    }, []);

    return { user, ready };
}

export function initials(user: Pick<UserPayload, "first_name" | "last_name">) {
    return `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "?";
}
