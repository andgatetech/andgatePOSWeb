'use client';

import React from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import Link from 'next/link';

interface PackageGateProps {
    featureSlug: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showUpgradeCTA?: boolean;
}

export function PackageGate({
    featureSlug,
    children,
    fallback,
    showUpgradeCTA = true,
}: PackageGateProps) {
    const { canAccess, isLoading, planName, planTier } = useFeatureAccess(featureSlug);
    const { t } = useTranslation();

    if (isLoading) {
        return <>{children}</>;
    }

    if (canAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (!showUpgradeCTA) {
        return null;
    }

    return <UpgradePrompt planName={planName} planTier={planTier} featureSlug={featureSlug} />;
}

interface UpgradePromptProps {
    planName: string;
    planTier: number;
    featureSlug: string;
}

function UpgradePrompt({ planName, planTier, featureSlug }: UpgradePromptProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-600 dark:bg-gray-800">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('lbl_upgrade_required') || 'Upgrade Required'}
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                {t('msg_feature_not_in_plan') || `This feature is not available in your current plan (${planName}).`}
            </p>
            <Link
                href={`/subscription?feature=${featureSlug}`}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
            >
                {t('btn_upgrade_plan') || 'Upgrade Plan'}
            </Link>
        </div>
    );
}

interface FeatureLockIconProps {
    featureSlug: string;
    className?: string;
}

export function FeatureLockIcon({ featureSlug, className = '' }: FeatureLockIconProps) {
    const { canAccess, isLoading } = useFeatureAccess(featureSlug);

    if (isLoading || canAccess) {
        return null;
    }

    return (
        <span className={`inline-flex items-center text-amber-500 ${className}`} title="Requires upgrade">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V7c0-1.654 1.346-3 3-3z" />
            </svg>
        </span>
    );
}
