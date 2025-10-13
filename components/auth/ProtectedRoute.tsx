'use client';

import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermissions?: string[];
    redirectTo?: string;
}

/**
 * ProtectedRoute Component
 *
 * Wraps pages/components to check if user has permission to access
 * Redirects to dashboard if user doesn't have permission
 *
 * Usage:
 * <ProtectedRoute requiredPermissions={['products.view']}>
 *   <YourPageComponent />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children, requiredPermissions = [], redirectTo = '/dashboard' }: ProtectedRouteProps) {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Admin always has access
        if (user?.role === 'store_admin') {
            setIsAuthorized(true);
            setIsLoading(false);
            return;
        }

        // Check if user has any of the required permissions
        if (requiredPermissions.length === 0) {
            setIsAuthorized(true);
            setIsLoading(false);
            return;
        }

        const hasPermission = requiredPermissions.some((permission) => user?.permissions?.includes(permission));

        if (!hasPermission) {
            // Redirect if no permission
            router.push(redirectTo);
        } else {
            setIsAuthorized(true);
        }

        setIsLoading(false);
    }, [user, requiredPermissions, router, redirectTo]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-gray-600">Checking permissions...</p>
                </div>
            </div>
        );
    }

    // Show nothing if not authorized (already redirecting)
    if (!isAuthorized) {
        return null;
    }

    // Render children if authorized
    return <>{children}</>;
}

/**
 * withProtectedRoute HOC
 *
 * Higher-order component to wrap page components with route protection
 *
 * Usage:
 * export default withProtectedRoute(YourPage, ['products.view']);
 */
export function withProtectedRoute<P extends object>(Component: React.ComponentType<P>, requiredPermissions: string[] = []) {
    return function ProtectedComponent(props: P) {
        return (
            <ProtectedRoute requiredPermissions={requiredPermissions}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
}
