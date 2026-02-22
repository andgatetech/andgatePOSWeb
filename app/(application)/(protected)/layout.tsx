'use client';
import StatusGuard from '@/lib/protected/StatusGuard';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return <StatusGuard>{children}</StatusGuard>;
}
