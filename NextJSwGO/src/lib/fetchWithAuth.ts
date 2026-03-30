// src/lib/fetchWithAuth.ts

/**
 * ตัวครอบ (Wrapper) สำหรับคำสั่ง fetch เพื่อเช็คเปอร์เซ็นต์อายุของ Token
 * ถ้าน้อยกว่า 35% จะจัดการขอใหม่ (Refresh Token) ให้อัตโนมัติ ก่อนที่จะยิง API จริง
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    let token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    let refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refresh_token") : null;

    if (token) {
        try {
            // อ่านค่าระบุตัวตน (Payload) จาก JWT ตรงๆ โดยไม่ต้องพึ่งเซิร์ฟเวอร์
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const decoded = JSON.parse(jsonPayload);

            const iat = decoded.iat; // เวลาที่สร้าง (เป็นวินาที)
            const exp = decoded.exp; // เวลาที่หมดอายุ (เป็นวินาที)
            const currentTime = Math.floor(Date.now() / 1000); // 

            if (exp && iat) {
                const totalLifespan = exp - iat;
                const remaining = exp - currentTime;
                
                // ถ้าน้อยกว่า 35% ของอายุทั้งหมด หรือหมดอายุไปแล้ว (remaining <= 0)
                if (remaining < (0.35 * totalLifespan) || remaining <= 0) {
                    if (refreshToken) {
                        try {
                            // ยิงไปขอ Token ใหม่ จากฝั่ง Go กาอนเลย
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ refresh_token: refreshToken })
                            });

                            if (res.ok) {
                                const data = await res.json();
                                token = data.token; // ได้ Access Token ใหม่ที่หอมกรุ่นสดใหม่มาจาก Go
                                
                                // เซฟของใหม่ลง localStorage
                                localStorage.setItem("token", data.token);
                                localStorage.setItem("refresh_token", data.refresh_token);
                            } else {
                                // ถ้า Refresh Token เองมันก็หมดอายุ 7 วันด้วยเหมือนกัน = จบเห่
                                throw new Error("Refresh token expired");
                            }
                        } catch (err) {
                            // ถ้าเจอปัญหาอะไรก็ตามในการจำชุบชีวิต เช่น เน็ตหลุด หรือตั๋วพัง
                            localStorage.removeItem("token");
                            localStorage.removeItem("refresh_token");
                            window.location.href = "/login";
                            return new Response(null, { status: 401 });
                        }
                    } else {
                        // ถ้าไม่มี Refresh Token เก็บไว้ให้สู้ต่อ
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                        return new Response(null, { status: 401 });
                    }
                }
            }
        } catch (e) {
            console.error("Token decoding error", e);
        }
    }

    // เมื่อถึงตรงนี้ Token มั่นใจได้ว่าอายุเหลือกินเหลือใช้ชัวร์ๆ (เกิน 35%)
    // จัดการแนบ Header และยิง API ไปหาเป้าหมายตัวจริงที่เราต้องการ
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });
    
    // Fallback: ดักจับไว้อีกชั้นเผื่อเซิร์ฟเวอร์ด่า 401 สวนกลับมาอีก (กันเหนียว)
    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
    }

    return response;
}
