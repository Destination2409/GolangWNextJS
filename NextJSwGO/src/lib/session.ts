// src/lib/session.ts
// จุดเดียวที่จัดการ token ใน localStorage (บันทึก / ล้าง / ขอใหม่ / logout)

const TOKEN_KEY = "token";
const REFRESH_KEY = "refresh_token";

export function getTokens() {
    if (typeof window === "undefined") return { token: null, refreshToken: null };
    return {
        token: localStorage.getItem(TOKEN_KEY),
        refreshToken: localStorage.getItem(REFRESH_KEY),
    };
}

export function saveTokens(token: string, refreshToken: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    window.dispatchEvent(new Event("storage"));
}

export function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    window.dispatchEvent(new Event("storage"));
}

/** อ่าน payload ของ JWT (รองรับภาษาไทยด้วยการ decode UTF-8) */
export function decodeToken<T = any>(token: string): T {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        window.atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload);
}

// Refresh token ใช้ได้ครั้งเดียว (ฝั่ง Go หมุนใบใหม่ให้ทุกครั้ง) ถ้ามีหลาย request ขอพร้อมกัน
// ต้องรอผลจากคำขอเดียวกัน ไม่งั้นใบที่สองจะโดนปฏิเสธแล้วเด้งออกจากระบบ
let refreshPromise: Promise<string | null> | null = null;

/** ขอ access token ใหม่ คืนค่า token ใหม่ หรือ null ถ้า refresh ไม่ผ่าน */
export function refreshTokens(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const { refreshToken } = getTokens();
        if (!refreshToken) return null;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!res.ok) return null;
            const data = await res.json();
            saveTokens(data.token, data.refresh_token);
            return data.token as string;
        } catch {
            return null;
        }
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
}

/** แจ้ง Go ให้เพิกถอน token ทั้งสองใบ แล้วล้างออกจากเครื่อง */
export async function logout() {
    const { token, refreshToken } = getTokens();
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
    } catch {
        // ถึง API จะล่ม ก็ยังต้องล้าง token ฝั่ง client ให้ออกจากระบบได้
    }
    clearTokens();
}
