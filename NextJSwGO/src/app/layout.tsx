import './globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/toast-provider';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
    title: 'Microservices Admin',
    description: 'Golang + Next.js Microservices architecture demo',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased text-foreground bg-background">
                <ToastProvider>
                    <Navbar />
                    <main>
                        {children}
                    </main>
                </ToastProvider>
            </body>
        </html>
    );
}
