import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens, decodeToken } from '@/lib/session';

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
            const decodedPayload = decodeToken<UserPayload>(token);

            const exp = decodedPayload.exp;
            const currentTime = Math.floor(Date.now() / 1000);
            const refreshToken = localStorage.getItem("refresh_token");

            // ถ้า Access Token หมดอายุแล้ว และดันไม่มี Refresh Token สำรองไว้เลย = เด้งออกทันที
            if (exp && exp < currentTime && !refreshToken) {
                clearTokens();
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
            clearTokens();
            router.push("/login");
        }
    }, [router, requiredPermissionId]);

    return { isAuthenticated, user };
}
