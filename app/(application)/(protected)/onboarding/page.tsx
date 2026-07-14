'use client';

import Link from 'next/link';
import { ArrowRight, BookOpenCheck, CheckCircle2, Circle, PackagePlus, RefreshCw, ShoppingCart, Store, Tags, UserPlus, WalletCards } from 'lucide-react';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDashboardOnboardingQuery } from '@/store/features/dashboard/dashboad';

const FALLBACK_STEPS = [
    { key: 'store_profile', href: '/store/setting', icon: Store },
    { key: 'payment_methods', href: '/store/setting', icon: WalletCards },
    { key: 'product_setup', href: '/category/create', icon: Tags },
    { key: 'first_product', href: '/products/create', icon: PackagePlus },
    { key: 'opening_stock', href: '/products/stock/adjustments', icon: PackagePlus },
    { key: 'first_customer', href: '/customers/create', icon: UserPlus },
    { key: 'first_sale', href: '/pos', icon: ShoppingCart },
];

const titleKey = (key: string) => `onboarding_step_${key}`;
const descKey = (key: string) => `onboarding_step_${key}_desc`;
const actionKey = (key: string) => `onboarding_action_${key}`;

export default function OnboardingPage() {
    const { t } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();
    const { data, isLoading } = useGetDashboardOnboardingQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    ) as any;

    const payload = data?.data;
    const apiSteps = Array.isArray(payload?.steps) ? payload.steps : [];
    const steps = FALLBACK_STEPS.map((fallback) => {
        const apiStep = apiSteps.find((step: any) => step.key === fallback.key) || {};
        return { ...fallback, ...apiStep, href: apiStep.href || fallback.href };
    });
    const completed = Number(payload?.completed_count ?? steps.filter((step) => step.completed).length);
    const total = Number(payload?.total_count ?? steps.length);
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const nextStep = steps.find((step) => !step.completed);

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <section className="rounded-xl border border-sky-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">{currentStore?.store_name || t('lbl_store')}</p>
                        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{t('onboarding_title')}</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">{t('onboarding_subtitle')}</p>
                    </div>
                    {nextStep && (
                        <Link href={nextStep.href} className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
                            {t(actionKey(nextStep.key))}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
                <div className="mt-5">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                        <span>{t('onboarding_progress')}</span>
                        <span>{isLoading ? '-' : `${completed}/${total}`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700">
                        <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <Link
                    href={nextStep?.href || '/store/setting'}
                    className="group rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <BookOpenCheck className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{t('onboarding_path_new_shop_badge')}</p>
                            <h2 className="mt-1 text-base font-bold text-gray-900 dark:text-white">{t('onboarding_path_new_shop_title')}</h2>
                            <p className="mt-2 text-sm leading-5 text-gray-500 dark:text-gray-400">{t('onboarding_path_new_shop_desc')}</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:text-emerald-800 dark:text-emerald-300">
                                {nextStep ? t(actionKey(nextStep.key)) : t('onboarding_path_continue')}
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/accounting/running-business-migration"
                    className="group rounded-xl border border-amber-100 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <RefreshCw className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">{t('onboarding_path_running_shop_badge')}</p>
                            <h2 className="mt-1 text-base font-bold text-gray-900 dark:text-white">{t('onboarding_path_running_shop_title')}</h2>
                            <p className="mt-2 text-sm leading-5 text-gray-500 dark:text-gray-400">{t('onboarding_path_running_shop_desc')}</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 group-hover:text-amber-800 dark:text-amber-300">
                                {t('onboarding_path_running_shop_action')}
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </div>
                </Link>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const StatusIcon = step.completed ? CheckCircle2 : Circle;
                    return (
                        <Link
                            key={step.key}
                            href={step.href}
                            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                        >
                            <div className="flex gap-3">
                                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${step.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {index + 1}. {t(titleKey(step.key))}
                                        </p>
                                        <StatusIcon className={`h-4 w-4 flex-shrink-0 ${step.completed ? 'text-emerald-500' : 'text-gray-300'}`} />
                                    </div>
                                    <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">{t(descKey(step.key))}</p>
                                    {!step.completed && (
                                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 group-hover:text-sky-800 dark:text-sky-300">
                                            {t(actionKey(step.key))}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </section>
        </div>
    );
}
