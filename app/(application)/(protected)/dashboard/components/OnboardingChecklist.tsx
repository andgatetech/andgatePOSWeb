'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { getTranslation } from '@/i18n';
import { useGetDashboardOnboardingQuery } from '@/store/features/dashboard/dashboad';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import {
    ArrowRight,
    Boxes,
    CheckCircle2,
    Circle,
    CreditCard,
    PackagePlus,
    ShoppingCart,
    Store,
    Tags,
    UserPlus,
    X,
} from 'lucide-react';
import Link from 'next/link';

type OnboardingStepKey =
    | 'store_profile'
    | 'payment_methods'
    | 'product_setup'
    | 'first_product'
    | 'opening_stock'
    | 'first_customer'
    | 'first_sale';

type OnboardingStep = {
    key: OnboardingStepKey;
    completed: boolean;
    count: number;
    href: string;
};

type OnboardingResponse = {
    data?: {
        steps?: OnboardingStep[];
        completed_count?: number;
        total_count?: number;
        progress_percent?: number;
        is_complete?: boolean;
    };
};

const STEP_META: Record<OnboardingStepKey, { icon: ElementType; titleKey: string; descKey: string; actionKey: string }> = {
    store_profile: {
        icon: Store,
        titleKey: 'onboarding_step_store_profile',
        descKey: 'onboarding_step_store_profile_desc',
        actionKey: 'onboarding_action_store_profile',
    },
    payment_methods: {
        icon: CreditCard,
        titleKey: 'onboarding_step_payment_methods',
        descKey: 'onboarding_step_payment_methods_desc',
        actionKey: 'onboarding_action_payment_methods',
    },
    product_setup: {
        icon: Tags,
        titleKey: 'onboarding_step_product_setup',
        descKey: 'onboarding_step_product_setup_desc',
        actionKey: 'onboarding_action_product_setup',
    },
    first_product: {
        icon: PackagePlus,
        titleKey: 'onboarding_step_first_product',
        descKey: 'onboarding_step_first_product_desc',
        actionKey: 'onboarding_action_first_product',
    },
    opening_stock: {
        icon: Boxes,
        titleKey: 'onboarding_step_opening_stock',
        descKey: 'onboarding_step_opening_stock_desc',
        actionKey: 'onboarding_action_opening_stock',
    },
    first_customer: {
        icon: UserPlus,
        titleKey: 'onboarding_step_first_customer',
        descKey: 'onboarding_step_first_customer_desc',
        actionKey: 'onboarding_action_first_customer',
    },
    first_sale: {
        icon: ShoppingCart,
        titleKey: 'onboarding_step_first_sale',
        descKey: 'onboarding_step_first_sale_desc',
        actionKey: 'onboarding_action_first_sale',
    },
};

export default function OnboardingChecklist() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const storageKey = `andgatepos_onboarding_dismissed_${currentStoreId || 'all'}`;
    const [dismissed, setDismissed] = useState(false);

    const { data, isLoading } = useGetDashboardOnboardingQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    ) as { data?: OnboardingResponse; isLoading: boolean };

    useEffect(() => {
        setDismissed(localStorage.getItem(storageKey) === '1');
    }, [storageKey]);

    const payload = data?.data;
    const steps = useMemo(() => payload?.steps || [], [payload?.steps]);
    const nextStep = steps.find((step) => !step.completed);
    const progress = payload?.progress_percent || 0;

    if (dismissed || payload?.is_complete || (!isLoading && steps.length === 0)) {
        return null;
    }

    const handleDismiss = () => {
        localStorage.setItem(storageKey, '1');
        setDismissed(true);
    };

    return (
        <section className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-gray-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 px-4 py-4 dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                                <Store className="h-4 w-4" />
                            </span>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {t('onboarding_title')}
                                </h2>
                                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                                    {t('onboarding_subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {nextStep && (
                            <Link
                                href={nextStep.href}
                                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                            >
                                {t(STEP_META[nextStep.key].actionKey)}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-white hover:text-gray-800 dark:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                            aria-label={t('lbl_close')}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                        <span>{t('onboarding_progress')}</span>
                        <span>{payload?.completed_count || 0}/{payload?.total_count || 0}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700">
                        <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-slate-700 md:grid-cols-2 md:divide-x md:divide-y-0">
                {steps.map((step) => {
                    const meta = STEP_META[step.key];
                    const Icon = meta.icon;
                    const StatusIcon = step.completed ? CheckCircle2 : Circle;

                    return (
                        <Link
                            key={step.key}
                            href={step.href}
                            className="group flex min-h-[104px] gap-3 p-4 transition hover:bg-gray-50 dark:hover:bg-slate-800/80"
                        >
                            <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${step.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {t(meta.titleKey)}
                                    </h3>
                                    <StatusIcon className={`h-4 w-4 flex-shrink-0 ${step.completed ? 'text-emerald-500' : 'text-gray-300'}`} />
                                </div>
                                <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                                    {t(meta.descKey)}
                                </p>
                                {!step.completed && (
                                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 group-hover:text-sky-800 dark:text-sky-300">
                                        {t(meta.actionKey)}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
