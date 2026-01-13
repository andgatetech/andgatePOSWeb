'use client';
import StatusGuard from '@/components/protected/StatusGuard';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return <StatusGuard>{children}</StatusGuard>;
}
