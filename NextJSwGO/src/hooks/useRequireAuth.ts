import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UserPayload {
    user_id: number;
    permission_id: number;
    email: string;
    first_name: string;
    last_name: string;
    prefix?: string;
    exp: number;
}

export function useRequireAuth(requiredPermissionId: number = 1) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserPayload | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            // Decode Base64Url JWT Payload (segment 2)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            
            // UTF-8 decode explicitly to perfectly handle Thai text
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decodedPayload: UserPayload = JSON.parse(jsonPayload);

            const exp = decodedPayload.exp;
            const currentTime = Math.floor(Date.now() / 1000);
            const refreshToken = localStorage.getItem("refresh_token");

            // ถ้า Access Token หมดอายุแล้ว และดันไม่มี Refresh Token สำรองไว้เลย = เด้งออกทันที
            if (exp && exp < currentTime && !refreshToken) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            // Extract User permission from JWT
            const userPermissionId = decodedPayload?.permission_id || 0;

            if (userPermissionId < requiredPermissionId) {
                // Not enough permission
                router.push("/");
                return;
            }

            setUser(decodedPayload);
            setIsAuthenticated(true);
        } catch (e) {
            // Token is malformed
            localStorage.removeItem("token");
            window.dispatchEvent(new Event("storage"));
            router.push("/login");
        }
    }, [router, requiredPermissionId]);

    return { isAuthenticated, user };
}
