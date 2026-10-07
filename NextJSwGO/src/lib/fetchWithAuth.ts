// src/lib/fetchWithAuth.ts
import { clearTokens, decodeToken, getTokens, refreshTokens } from "./session";

function redirectToLogin(): Response {
    clearTokens();
    window.location.href = "/login";
    return new Response(null, { status: 401 });
}

/**
 * ตัวครอบ (Wrapper) สำหรับคำสั่ง fetch เพื่อเช็คเปอร์เซ็นต์อายุของ Token
 * ถ้าน้อยกว่า 35% จะจัดการขอใหม่ (Refresh Token) ให้อัตโนมัติ ก่อนที่จะยิง API จริง
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    let { token } = getTokens();

    if (token) {
        try {
            // อ่านค่าระบุตัวตน (Payload) จาก JWT ตรงๆ โดยไม่ต้องพึ่งเซิร์ฟเวอร์
            const { iat, exp } = decodeToken(token);
            const currentTime = Math.floor(Date.now() / 1000);

            if (exp && iat) {
                const totalLifespan = exp - iat;
                const remaining = exp - currentTime;

                // ถ้าน้อยกว่า 35% ของอายุทั้งหมด หรือหมดอายุไปแล้ว
                if (remaining < 0.35 * totalLifespan) {
                    const newToken = await refreshTokens();
                    if (newToken) {
                        token = newToken;
                    } else if (remaining <= 0) {
                        // refresh ไม่ผ่าน และ token เดิมก็หมดอายุแล้ว = ต้อง login ใหม่
                        return redirectToLogin();
                    }
                    // ถ้า token เดิมยังไม่หมดอายุ ใช้ต่อไปก่อนได้ (เช่น API สะดุดชั่วคราว)
                }
            }
        } catch (e) {
            console.error("Token decoding error", e);
        }
    }

    // จัดการแนบ Header และยิง API ไปหาเป้าหมายตัวจริงที่เราต้องการ
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });

    // ดักไว้อีกชั้น เผื่อเซิร์ฟเวอร์ตอบ 401 กลับมา (เช่น token ถูก logout จากที่อื่น)
    if (response.status === 401) {
        redirectToLogin();
    }

    return response;
}
