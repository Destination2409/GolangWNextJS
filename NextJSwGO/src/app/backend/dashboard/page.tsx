"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function Dashboard() {
    // 1 แถวนี้จะทำหน้าที่สแกน Token, ตรวจสอบสิทธิ์ และดึงข้อมูล User ออกมาพร้อมใช้ทันที
    const { isAuthenticated, user } = useRequireAuth();

    if (!isAuthenticated || !user) {
        return <div className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
    }

    return (
        <div className="container">

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>Protected Resources Access Granted!</h2>
                <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
                    ยินดีต้อนรับ, {user.prefix}{user.first_name} {user.last_name}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
                    <pre style={{ margin: 0 }}>
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
