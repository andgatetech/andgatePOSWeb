'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Banknote,
    Boxes,
    Building2,
    CheckCircle2,
    Circle,
    ClipboardCheck,
    FileSpreadsheet,
    Languages,
    PackagePlus,
    RefreshCw,
    ShieldCheck,
    ShoppingCart,
    Store,
    UserPlus,
    Users,
    WalletCards,
} from 'lucide-react';

import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { trackGTMEvent } from '@/lib/analytics';
import {
    useGetDashboardOnboardingQuery,
    useGetOnboardingWorkflowQuery,
    useUpdateOnboardingWorkflowMutation,
} from '@/store/features/dashboard/dashboad';

type BusinessStatus = 'existing' | 'new' | 'assisted';
type Draft = {
    status: BusinessStatus;
    category: string;
    sellsOnCredit: boolean;
    buysOnCredit: boolean;
    usesBarcode: boolean;
    hasEmployees: boolean;
};

type Step = {
    id: string;
    icon: typeof Store;
    title: string;
    desc: string;
    action?: string;
    href?: string;
    skippable?: boolean;
    warning?: string;
};

const DEFAULT_DRAFT: Draft = {
    status: 'existing',
    category: 'retail',
    sellsOnCredit: true,
    buysOnCredit: true,
    usesBarcode: false,
    hasEmployees: false,
};

const businessCategories: Array<[string, string]> = [
    ['grocery', 'onboarding_category_grocery'],
    ['fashion', 'onboarding_category_fashion'],
    ['electronics', 'onboarding_category_electronics'],
    ['mobile', 'onboarding_category_mobile'],
    ['pharmacy', 'onboarding_category_pharmacy'],
    ['restaurant', 'onboarding_category_restaurant'],
    ['wholesale', 'onboarding_category_wholesale'],
    ['service', 'onboarding_category_service'],
    ['retail', 'onboarding_category_retail'],
];

const stepIdsForDraft = (draft: Draft) => [
    'welcome',
    'business',
    'operations',
    draft.status === 'existing' || draft.status === 'assisted' ? 'opening' : 'capital',
    'products',
    'people',
    'launch',
];

export default function OnboardingPage() {
    const { t, i18n } = getTranslation();
    const router = useRouter();
    const { currentStoreId, currentStore } = useCurrentStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
    const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
    const hydratedStoreRef = useRef<string | number | null>(null);
    const viewedStepRef = useRef<string | null>(null);

    const storageKey = `andgatebos_onboarding_draft_${currentStoreId || 'default'}`;
    const { data, isLoading } = useGetDashboardOnboardingQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    ) as any;
    const { data: workflowData } = useGetOnboardingWorkflowQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    ) as any;
    const [saveWorkflow] = useUpdateOnboardingWorkflowMutation();

    const payload = data?.data;
    const apiSteps = Array.isArray(payload?.steps) ? payload.steps : [];
    const detectedCompleted = Number(payload?.completed_count ?? 0);
    const detectedTotal = Number(payload?.total_count ?? 7);

    const steps = useMemo<Step[]>(() => {
        const existing = draft.status === 'existing' || draft.status === 'assisted';
        return [
            {
                id: 'welcome',
                icon: Languages,
                title: t('onboarding_welcome_title'),
                desc: t('onboarding_welcome_desc'),
            },
            {
                id: 'business',
                icon: Building2,
                title: t('onboarding_business_title'),
                desc: t('onboarding_business_desc'),
            },
            {
                id: 'operations',
                icon: WalletCards,
                title: t('onboarding_operations_title'),
                desc: t('onboarding_operations_desc'),
                href: '/store/setting',
                action: t('onboarding_operations_action'),
            },
            existing
                ? {
                    id: 'opening',
                    icon: Banknote,
                    title: t('onboarding_opening_title'),
                    desc: t('onboarding_opening_desc'),
                    href: '/accounting/running-business-migration',
                    action: t('onboarding_opening_action'),
                    warning: t('onboarding_opening_warning'),
                }
                : {
                    id: 'capital',
                    icon: Banknote,
                    title: t('onboarding_capital_title'),
                    desc: t('onboarding_capital_desc'),
                    href: '/products/create',
                    action: t('onboarding_capital_action'),
                    skippable: true,
                },
            {
                id: 'products',
                icon: PackagePlus,
                title: t('onboarding_products_title'),
                desc: t('onboarding_products_desc'),
                href: '/products/create',
                action: t('onboarding_products_action'),
                skippable: true,
            },
            {
                id: 'people',
                icon: Users,
                title: t('onboarding_people_title'),
                desc: draft.hasEmployees
                    ? t('onboarding_people_with_staff_desc')
                    : t('onboarding_people_alone_desc'),
                href: draft.hasEmployees ? '/employees/create' : '/dashboard',
                action: draft.hasEmployees ? t('onboarding_people_action_add') : t('onboarding_people_action_skip'),
                skippable: true,
            },
            {
                id: 'launch',
                icon: ClipboardCheck,
                title: t('onboarding_launch_title'),
                desc: t('onboarding_launch_desc'),
                href: '/dashboard',
                action: t('onboarding_launch_action'),
            },
        ];
    }, [draft.hasEmployees, draft.status, t]);

    const stepIds = useMemo(() => stepIdsForDraft(draft), [draft]);
    const workflowCompleted = useMemo(
        () => completedStepIds.filter((stepId) => stepIds.includes(stepId)),
        [completedStepIds, stepIds]
    );
    const progress = Math.round((workflowCompleted.length / stepIds.length) * 100);
    const active = steps[currentStep];
    const ActiveIcon = active.icon;
    const activeComplete = workflowCompleted.includes(active?.id);

    useEffect(() => {
        const storeKey = currentStoreId || 'default';
        if (hydratedStoreRef.current === storeKey) return;

        const workflow = workflowData?.data;
        if (workflow?.draft) {
            const nextDraft = { ...DEFAULT_DRAFT, ...workflow.draft };
            setDraft(nextDraft);
            setCompletedStepIds(Array.isArray(workflow.completed_steps) ? workflow.completed_steps : []);
            const stepIndex = stepIdsForDraft(nextDraft).findIndex((stepId) => stepId === workflow.current_step);
            if (stepIndex >= 0) setCurrentStep(stepIndex);
            trackGTMEvent('onboarding_resumed', {
                store_id: currentStoreId,
                business_status: workflow.business_status,
                current_step: workflow.current_step,
            });
            hydratedStoreRef.current = storeKey;
            return;
        }

        if (currentStoreId && workflowData === undefined) return;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) setDraft({ ...DEFAULT_DRAFT, ...JSON.parse(saved) });
        } catch {
            setDraft(DEFAULT_DRAFT);
        }
        trackGTMEvent('onboarding_started', { store_id: currentStoreId });
        hydratedStoreRef.current = storeKey;
    }, [currentStoreId, storageKey, workflowData]);

    useEffect(() => {
        if (!active?.id || viewedStepRef.current === active.id) return;
        viewedStepRef.current = active.id;
        trackGTMEvent('onboarding_step_viewed', {
            store_id: currentStoreId,
            step: active.id,
            business_status: draft.status,
            business_category: draft.category,
        });
    }, [active?.id, currentStoreId, draft.category, draft.status]);

    useEffect(() => {
        if (hydratedStoreRef.current !== (currentStoreId || 'default')) return;

        try {
            localStorage.setItem(storageKey, JSON.stringify(draft));
        } catch {
            // Local draft remains a fallback if the API request fails.
        }
        if (!currentStoreId) return;
        const timer = window.setTimeout(() => {
            saveWorkflow({
                store_id: currentStoreId,
                business_status: draft.status,
                business_category: draft.category,
                current_step: stepIds[currentStep] || 'welcome',
                draft,
                completed_steps: workflowCompleted,
                status: workflowCompleted.includes('launch') ? 'completed' : 'in_progress',
            }).catch(() => {});
        }, 450);
        return () => window.clearTimeout(timer);
    }, [currentStep, currentStoreId, draft, saveWorkflow, stepIds, storageKey, workflowCompleted]);

    const markStepComplete = (stepId = active?.id) => {
        if (!stepId) return;
        setCompletedStepIds((prev) => {
            if (prev.includes(stepId)) return prev;
            trackGTMEvent('onboarding_step_completed', {
                store_id: currentStoreId,
                step: stepId,
                business_status: draft.status,
                business_category: draft.category,
            });
            return [...prev, stepId];
        });
    };
    const goNext = () => {
        markStepComplete();
        setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
    };
    const goBack = () => setCurrentStep((value) => Math.max(value - 1, 0));
    const primaryAction = () => {
        markStepComplete();
        if (currentStep === steps.length - 1) {
            router.push('/dashboard');
            return;
        }
        setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
    };

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            <section className="overflow-hidden rounded-xl border border-[#046ca9]/10 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="h-1 bg-gradient-to-r from-[#046ca9] to-[#034d79]" />
                <div className="px-4 py-5 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-3">
                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#046ca9]/10 bg-white shadow-sm">
                            <Image src="/images/andgatebos-icon-square.png" alt="AndgateBOS" width={32} height={32} className="h-8 w-8 object-contain" />
                        </span>
                        <div>
                        <p className="text-sm font-semibold text-[#046ca9] dark:text-sky-300">{currentStore?.store_name || t('lbl_store')} · AndgateBOS</p>
                        <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{t('onboarding_page_title')}</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {t('onboarding_page_subtitle')}
                        </p>
                        </div>
                    </div>
                    <div className="min-w-[180px]">
                        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <span>{t('onboarding_progress')}</span>
                            <span>{isLoading ? '-' : `${progress}%`}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-[#046ca9] transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
                </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <aside className="space-y-2">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const activeItem = index === currentStep;
                        const complete = workflowCompleted.includes(step.id);
                        const StatusIcon = complete ? CheckCircle2 : Circle;
                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setCurrentStep(index)}
                                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                                    activeItem
                                        ? 'border-[#046ca9]/30 bg-[#046ca9]/5 text-slate-950 dark:border-sky-700 dark:bg-sky-950/40 dark:text-white'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                                }`}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{step.title}</span>
                                <StatusIcon className={`h-4 w-4 flex-shrink-0 ${complete ? 'text-emerald-500' : 'text-slate-300'}`} />
                            </button>
                        );
                    })}
                </aside>

                <main className="min-h-[520px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                    <div className="mb-5 flex items-start gap-3">
                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#046ca9]/10 text-[#046ca9] dark:bg-sky-950 dark:text-sky-300">
                            <ActiveIcon className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('onboarding_step_counter', { current: currentStep + 1, total: steps.length })}</p>
                            <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{active.title}</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{active.desc}</p>
                        </div>
                    </div>

                    {active.id === 'welcome' && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Info icon={ShieldCheck} title={t('onboarding_info_safe_title')} text={t('onboarding_info_safe_text')} />
                            <Info icon={RefreshCw} title={t('onboarding_resume_title')} text={t('onboarding_resume_text')} />
                            <Info icon={Store} title={t('onboarding_info_defaults_title')} text={t('onboarding_info_defaults_text')} />
                            <Info icon={ShoppingCart} title={t('onboarding_info_first_task_title')} text={t('onboarding_info_first_task_text')} />
                        </div>
                    )}

                    {active.id === 'business' && (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                <Choice selected={draft.status === 'existing'} title={t('onboarding_choice_existing_title')} text={t('onboarding_choice_existing_text')} onClick={() => setDraft({ ...draft, status: 'existing' })} />
                                <Choice selected={draft.status === 'new'} title={t('onboarding_choice_new_title')} text={t('onboarding_choice_new_text')} onClick={() => setDraft({ ...draft, status: 'new' })} />
                                <Choice selected={draft.status === 'assisted'} title={t('onboarding_choice_assisted_title')} text={t('onboarding_choice_assisted_text')} onClick={() => setDraft({ ...draft, status: 'assisted' })} />
                            </div>
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('onboarding_business_category_label')}</span>
                                <select
                                    value={draft.category}
                                    onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-600 dark:bg-slate-800"
                                >
                                    {businessCategories.map(([value, labelKey]) => <option key={value} value={value}>{t(labelKey)}</option>)}
                                </select>
                                <span className="mt-1 block text-xs text-slate-500">{t('onboarding_business_category_help')}</span>
                            </label>
                        </div>
                    )}

                    {active.id === 'operations' && (
                        <div className="space-y-3">
                            <Toggle label={t('onboarding_toggle_customer_credit')} checked={draft.sellsOnCredit} onChange={(value) => setDraft({ ...draft, sellsOnCredit: value })} />
                            <Toggle label={t('onboarding_toggle_supplier_credit')} checked={draft.buysOnCredit} onChange={(value) => setDraft({ ...draft, buysOnCredit: value })} />
                            <Toggle label={t('onboarding_toggle_barcode')} checked={draft.usesBarcode} onChange={(value) => setDraft({ ...draft, usesBarcode: value })} />
                            <Info icon={WalletCards} title={t('onboarding_info_recommended_defaults_title')} text={t('onboarding_info_recommended_defaults_text')} />
                        </div>
                    )}

                    {active.id === 'opening' && (
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <Info
                                    icon={Banknote}
                                    title={t('onboarding_opening_supported_title')}
                                    text={t('onboarding_opening_supported_text')}
                                />
                                <Info
                                    icon={FileSpreadsheet}
                                    title={t('onboarding_opening_assisted_title')}
                                    text={t('onboarding_opening_assisted_text')}
                                />
                            </div>
                            <Info
                                icon={ShieldCheck}
                                title={t('onboarding_opening_why_title')}
                                text={t('onboarding_opening_why_text')}
                            />
                            {active.warning && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100">
                                    {active.warning}
                                </div>
                            )}
                        </div>
                    )}

                    {active.id === 'capital' && (
                        <div className="grid gap-3 md:grid-cols-2">
                            <Info icon={Banknote} title={t('onboarding_capital_cash_title')} text={t('onboarding_capital_cash_text')} />
                            <Info icon={PackagePlus} title={t('onboarding_capital_product_title')} text={t('onboarding_capital_product_text')} />
                        </div>
                    )}

                    {active.id === 'products' && (
                        <div className="grid gap-3 md:grid-cols-2">
                            <Info icon={PackagePlus} title={t('onboarding_products_manual_title')} text={t('onboarding_products_manual_text')} />
                            <Info icon={Boxes} title={t('onboarding_products_preset_title')} text={draft.category === 'pharmacy' ? t('onboarding_products_preset_pharmacy') : draft.category === 'mobile' ? t('onboarding_products_preset_mobile') : draft.category === 'fashion' ? t('onboarding_products_preset_fashion') : t('onboarding_products_preset_default')} />
                        </div>
                    )}

                    {active.id === 'people' && (
                        <div className="space-y-4">
                            <Toggle label={t('onboarding_toggle_has_employees')} checked={draft.hasEmployees} onChange={(value) => setDraft({ ...draft, hasEmployees: value })} />
                            <div className="grid gap-3 md:grid-cols-3">
                                {['onboarding_role_cashier', 'onboarding_role_salesperson', 'onboarding_role_manager', 'onboarding_role_accountant', 'onboarding_role_storekeeper', 'onboarding_role_custom'].map((roleKey) => (
                                    <div key={roleKey} className="rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">{t(roleKey)}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {active.id === 'launch' && (
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <Info icon={ClipboardCheck} title={t('onboarding_launch_progress_title')} text={t('onboarding_launch_progress_text', { completed: workflowCompleted.length, total: stepIds.length })} />
                                <Info icon={CheckCircle2} title={t('onboarding_launch_detected_title')} text={t('onboarding_launch_detected_text', { completed: detectedCompleted, total: detectedTotal })} />
                                <Info icon={Languages} title={t('onboarding_launch_language_title')} text={t('onboarding_launch_language_text', { language: i18n.language || 'bn' })} />
                            </div>
                            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                                <p className="font-semibold text-slate-900 dark:text-white">{t('onboarding_launch_optional_text')}</p>
                            </div>
                        </div>
                    )}

                    {activeComplete && (
                        <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            {t('onboarding_detected_complete')}
                        </div>
                    )}

                    <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={goBack}
                            disabled={currentStep === 0}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('btn_back')}
                        </button>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {active.skippable && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        trackGTMEvent('onboarding_step_skipped', {
                                            store_id: currentStoreId,
                                            step: active.id,
                                            business_status: draft.status,
                                        });
                                        goNext();
                                    }}
                                    className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    {t('onboarding_do_later')}
                                </button>
                            )}
                            {active.href && (
                                <Link href={active.href} onClick={() => markStepComplete()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#046ca9]/20 px-4 text-sm font-semibold text-[#046ca9] hover:bg-[#046ca9]/5 dark:border-sky-700 dark:text-sky-300 dark:hover:bg-sky-950/30">
                                    {active.action}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                            <button type="button" onClick={primaryAction} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#046ca9] px-4 text-sm font-semibold text-white hover:bg-[#034d79]">
                                {currentStep === steps.length - 1 ? t('onboarding_open_dashboard') : t('onboarding_save_next')}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

const Info = ({ icon: Icon, title, text }: { icon: typeof Store; title: string; text: string }) => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <Icon className="h-5 w-5 text-sky-600 dark:text-sky-300" />
        <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
    </div>
);

const Choice = ({ selected, title, text, onClick }: { selected: boolean; title: string; text: string; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`min-h-28 rounded-lg border p-4 text-left transition ${
            selected ? 'border-sky-400 bg-sky-50 dark:border-sky-600 dark:bg-sky-950/40' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
        }`}
    >
        <span className="text-sm font-bold text-slate-950 dark:text-white">{title}</span>
        <span className="mt-2 block text-sm leading-5 text-slate-600 dark:text-slate-300">{text}</span>
    </button>
);

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => (
    <label className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
    </label>
);
