'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ShieldAlert } from 'lucide-react';

import SubscriptionError from '@/components/common/SubscriptionError';
import { getTranslation } from '@/i18n';
import Loading from '@/app/loading';
import { RootState } from '@/store';
import { canAccessRoute, canAccessRoutePackageFeature, findMatchingRouteKey, routeRequiresPackageFeature } from '@/lib/permissions';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface RouteAccessGateProps {
    children: React.ReactNode;
}

function UnauthorizedPanel() {
    const { t } = getTranslation();

    return (
        <div className="flex min-h-[calc(100vh-220px)] items-center justify-center">
            <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <ShieldAlert className="h-7 w-7" />
                </div>
                <h1 className="mt-4 text-lg font-bold text-gray-900">{t('msg_unauthorized_title')}</h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">{t('msg_unauthorized_desc')}</p>
                <Link href="/dashboard" className="btn btn-primary mx-auto mt-5 w-max">
                    {t('btn_go_dashboard')}
                </Link>
            </div>
        </div>
    );
}

export default function RouteAccessGate({ children }: RouteAccessGateProps) {
    const { t } = getTranslation();
    const pathname = usePathname();
    const user = useSelector((state: RootState) => state.auth.user);
    const { accessibleFeatures, isLoading } = useFeatureAccess();
    const routeKey = findMatchingRouteKey(pathname || '');

    if (!routeKey) {
        return <>{children}</>;
    }

    if (!canAccessRoute(user?.role, user?.permissions, routeKey)) {
        return <UnauthorizedPanel />;
    }

    if (routeRequiresPackageFeature(routeKey) && isLoading) {
        return <Loading />;
    }

    if (!canAccessRoutePackageFeature(routeKey, accessibleFeatures)) {
        return (
            <SubscriptionError
                errorType="feature_not_in_plan"
                message={t('msg_feature_not_in_plan') || 'This feature is not included in your current plan.'}
                details={{ feature: routeKey }}
            />
        );
    }

    return <>{children}</>;
}
