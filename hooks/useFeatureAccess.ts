'use client';

import { useMemo } from 'react';
import { useGetAccessibleFeaturesQuery } from '@/store/features/plans/plansApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface FeatureAccessResult {
    canAccess: boolean;
    isLoading: boolean;
    featureSlug: string | null;
    planName: string;
    planTier: number;
    subscriptionStatus: string | null;
    quotaRemaining: Record<string, number | null>;
    /** All feature slugs the account's plan includes, or undefined while loading. */
    accessibleFeatures: string[] | undefined;
}

export function useFeatureAccess(featureSlug?: string): FeatureAccessResult {
    const { data, isLoading } = useGetAccessibleFeaturesQuery();
    const user = useSelector((state: RootState) => state.auth.user);

    const fallbackPlanName = user?.subscription_user?.plan_name_en ?? 'Unknown';
    const fallbackStatus = user?.subscription_user?.status ?? null;

    return useMemo(() => {
        if (isLoading || !data?.data) {
            return {
                canAccess: true,
                isLoading,
                featureSlug: featureSlug ?? null,
                planName: fallbackPlanName,
                planTier: 0,
                subscriptionStatus: fallbackStatus,
                quotaRemaining: {},
                accessibleFeatures: undefined,
            };
        }

        const features = data.data.features ?? [];
        const plan = data.data.plan;

        const canAccess = featureSlug ? features.includes(featureSlug) : true;

        return {
            canAccess,
            isLoading: false,
            featureSlug: featureSlug ?? null,
            planName: plan?.plan_name_en ?? fallbackPlanName,
            planTier: plan?.tier ?? 0,
            subscriptionStatus: plan?.status ?? fallbackStatus,
            quotaRemaining: plan?.quota_remaining ?? {},
            accessibleFeatures: features,
        };
    }, [data, isLoading, featureSlug, fallbackPlanName, fallbackStatus]);
}

export function useQuotaRemaining(quotaSlug: string): {
    remaining: number | null;
    isUnlimited: boolean;
} {
    const { quotaRemaining, isLoading } = useFeatureAccess();

    if (isLoading) {
        return { remaining: null, isUnlimited: true };
    }

    const value = quotaRemaining[quotaSlug];
    if (value === null || value === undefined) {
        return { remaining: null, isUnlimited: true };
    }

    return { remaining: value, isUnlimited: false };
}
