'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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

const businessCategories = [
    ['grocery', 'মুদি / Grocery'],
    ['fashion', 'ফ্যাশন / Clothing'],
    ['electronics', 'ইলেকট্রনিক্স'],
    ['mobile', 'মোবাইল ও এক্সেসরিজ'],
    ['pharmacy', 'ফার্মেসি'],
    ['restaurant', 'রেস্টুরেন্ট'],
    ['wholesale', 'হোলসেল'],
    ['service', 'সার্ভিস ব্যবসা'],
    ['retail', 'রিটেইল / Other retail'],
];

export default function OnboardingPage() {
    const { t, i18n } = getTranslation();
    const router = useRouter();
    const { currentStoreId, currentStore } = useCurrentStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);

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
    const completed = Number(payload?.completed_count ?? 0);
    const total = Number(payload?.total_count ?? 7);
    const progress = Number(payload?.progress_percent ?? (total ? Math.round((completed / total) * 100) : 0));

    const steps = useMemo<Step[]>(() => {
        const existing = draft.status === 'existing' || draft.status === 'assisted';
        return [
            {
                id: 'welcome',
                icon: Languages,
                title: 'স্বাগতম',
                desc: 'কয়েকটি সহজ ধাপে আপনার ব্যবসা সেটআপ করুন। বেশিরভাগ তথ্য পরে পরিবর্তন করা যাবে।',
            },
            {
                id: 'business',
                icon: Building2,
                title: 'ব্যবসার অবস্থা',
                desc: 'আপনি নতুন শুরু করছেন, নাকি আগে থেকেই ব্যবসা চলছে - এই অনুযায়ী পরের ধাপ সাজানো হবে।',
            },
            {
                id: 'operations',
                icon: WalletCards,
                title: 'দোকান চালানোর সেটিংস',
                desc: 'Main branch, cash payment, BDT currency, Asia/Dhaka timezone, walk-in customer - এগুলো ডিফল্ট হিসেবে থাকবে।',
                href: '/store/setting',
                action: 'দোকানের সেটিংস খুলুন',
            },
            existing
                ? {
                    id: 'opening',
                    icon: Banknote,
                    title: 'চলমান ব্যবসার শুরুর অবস্থা',
                    desc: 'আজকের ক্যাশ, ব্যাংক, কাস্টমার পাওনা, সাপ্লায়ার দেনা ও স্টক নিরাপদভাবে আনুন।',
                    href: '/accounting/running-business-migration',
                    action: 'মাইগ্রেশন সেটআপ খুলুন',
                    warning: 'Accounting/stock data সরাসরি সংখ্যা বদলে নয়; balanced entry ও stock movement দিয়ে পোস্ট করতে হবে।',
                }
                : {
                    id: 'capital',
                    icon: Banknote,
                    title: 'নতুন ব্যবসার শুরু',
                    desc: 'শুরুর ক্যাশ/মূলধন থাকলে পরে হিসাব অংশে দিন। এখন চাইলে সরাসরি পণ্য যোগ করতে পারেন।',
                    href: '/products/create',
                    action: 'প্রথম পণ্য যোগ করুন',
                    skippable: true,
                },
            {
                id: 'products',
                icon: PackagePlus,
                title: 'পণ্য ও স্টক',
                desc: 'প্রথম পণ্যের জন্য শুধু নাম, বিক্রয় মূল্য, ক্রয় মূল্য, পরিমাণ, ইউনিট, বারকোড যথেষ্ট। Advanced fields পরে।',
                href: '/products/create',
                action: 'পণ্য যোগ করুন',
                skippable: true,
            },
            {
                id: 'people',
                icon: Users,
                title: 'কর্মচারী ও দায়িত্ব',
                desc: draft.hasEmployees
                    ? 'Cashier, Salesperson, Manager, Accountant, Storekeeper - সহজ role দিয়ে শুরু করুন।'
                    : 'আপনি একা চালালে employee setup skip করতে পারেন। Owner access প্রস্তুত থাকে।',
                href: draft.hasEmployees ? '/employees/create' : '/dashboard',
                action: draft.hasEmployees ? 'কর্মচারী যোগ করুন' : 'এখন বাদ দিন',
                skippable: true,
            },
            {
                id: 'launch',
                icon: ClipboardCheck,
                title: 'রিভিউ ও চালু করুন',
                desc: 'যা সম্পন্ন হয়েছে দেখুন, অসম্পূর্ণ optional কাজ পরে dashboard checklist থেকে করুন।',
                href: '/dashboard',
                action: 'AndgateBOS ব্যবহার শুরু করুন',
            },
        ];
    }, [draft.hasEmployees, draft.status]);

    useEffect(() => {
        const workflow = workflowData?.data;
        if (workflow?.draft) {
            const nextDraft = { ...DEFAULT_DRAFT, ...workflow.draft };
            setDraft(nextDraft);
            const stepIndex = steps.findIndex((step) => step.id === workflow.current_step);
            if (stepIndex >= 0) setCurrentStep(stepIndex);
            return;
        }
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) setDraft({ ...DEFAULT_DRAFT, ...JSON.parse(saved) });
        } catch {
            setDraft(DEFAULT_DRAFT);
        }
    }, [steps, storageKey, workflowData]);

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(draft));
        } catch {
            // Local draft remains a fallback if the API request fails.
        }
        if (!currentStoreId) return;
        const stepIds = steps.map((step) => step.id);
        const timer = window.setTimeout(() => {
            saveWorkflow({
                store_id: currentStoreId,
                business_status: draft.status,
                business_category: draft.category,
                current_step: stepIds[currentStep] || 'welcome',
                draft,
                completed_steps: stepIds.slice(0, currentStep),
                status: currentStep === stepIds.length - 1 ? 'completed' : 'in_progress',
            }).catch(() => {});
        }, 450);
        return () => window.clearTimeout(timer);
    }, [currentStep, currentStoreId, draft, saveWorkflow, steps, storageKey]);

    const active = steps[currentStep];
    const ActiveIcon = active.icon;
    const activeDetected = apiSteps.find((step: any) => step.key === active?.id);

    const goNext = () => setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
    const goBack = () => setCurrentStep((value) => Math.max(value - 1, 0));
    const primaryAction = () => {
        if (currentStep === steps.length - 1) {
            router.push('/dashboard');
            return;
        }
        goNext();
    };

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            <section className="border-b border-slate-200 bg-white px-4 py-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">{currentStore?.store_name || t('lbl_store')}</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">ব্যবসা সেটআপ গাইড</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                            নতুন দোকান বা চলমান ব্যবসা - দুটির জন্যই নিরাপদভাবে AndgateBOS চালু করার ধাপ। Save automatic; refresh হলেও draft থাকবে।
                        </p>
                    </div>
                    <div className="min-w-[180px]">
                        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <span>{t('onboarding_progress')}</span>
                            <span>{isLoading ? '-' : `${progress}%`}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <aside className="space-y-2">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const activeItem = index === currentStep;
                        const complete = index < currentStep || apiSteps.some((apiStep: any) => apiStep.key === step.id && apiStep.completed);
                        const StatusIcon = complete ? CheckCircle2 : Circle;
                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setCurrentStep(index)}
                                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                                    activeItem
                                        ? 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-700 dark:bg-sky-950/40 dark:text-white'
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
                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                            <ActiveIcon className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Step {currentStep + 1} of {steps.length}</p>
                            <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{active.title}</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{active.desc}</p>
                        </div>
                    </div>

                    {active.id === 'welcome' && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Info icon={ShieldCheck} title="নিরাপদ সেটআপ" text="Opening balance ও opening stock হিসাব/স্টক ledger ছাড়া সরাসরি বদলানো হবে না।" />
                            <Info icon={RefreshCw} title="Resume করা যাবে" text="এই ডিভাইসে draft থাকবে। Backend workflow persistence next technical step." />
                            <Info icon={Store} title="ডিফল্ট তৈরি আছে" text="BDT, Cash, Main store settings, payment methods registration থেকেই আসে।" />
                            <Info icon={ShoppingCart} title="প্রথম কাজ" text="শেষে dashboard checklist আপনাকে first product ও first sale পর্যন্ত গাইড করবে।" />
                        </div>
                    )}

                    {active.id === 'business' && (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                <Choice selected={draft.status === 'existing'} title="আমার ব্যবসা আগে থেকেই চলছে" text="ক্যাশ, স্টক, বাকি/দেনা আনতে হবে" onClick={() => setDraft({ ...draft, status: 'existing' })} />
                                <Choice selected={draft.status === 'new'} title="আমি নতুন ব্যবসা শুরু করছি" text="সিম্পল সেটআপ, opening history লাগবে না" onClick={() => setDraft({ ...draft, status: 'new' })} />
                                <Choice selected={draft.status === 'assisted'} title="আগে সফটওয়্যার ব্যবহার করেছি" text="Excel/CSV বা support assisted migration" onClick={() => setDraft({ ...draft, status: 'assisted' })} />
                            </div>
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">ব্যবসার ধরন</span>
                                <select
                                    value={draft.category}
                                    onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-600 dark:bg-slate-800"
                                >
                                    {businessCategories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                </select>
                                <span className="mt-1 block text-xs text-slate-500">এই অনুযায়ী product field, unit, barcode/serial recommendation দেখানো হবে।</span>
                            </label>
                        </div>
                    )}

                    {active.id === 'operations' && (
                        <div className="space-y-3">
                            <Toggle label="কাস্টমার বাকিতে বিক্রি করেন?" checked={draft.sellsOnCredit} onChange={(value) => setDraft({ ...draft, sellsOnCredit: value })} />
                            <Toggle label="সাপ্লায়ারের কাছ থেকে বাকিতে কেনেন?" checked={draft.buysOnCredit} onChange={(value) => setDraft({ ...draft, buysOnCredit: value })} />
                            <Toggle label="বারকোড ব্যবহার করেন?" checked={draft.usesBarcode} onChange={(value) => setDraft({ ...draft, usesBarcode: value })} />
                            <Info icon={WalletCards} title="Recommended defaults" text="Cash payment, BDT currency, Asia/Dhaka timezone, default receipt settings পরে edit করা যাবে।" />
                        </div>
                    )}

                    {active.id === 'opening' && (
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <Info icon={Banknote} title="Simple setup" text="Cash, bank, mobile banking, customer due, supplier due, opening stock." />
                                <Info icon={FileSpreadsheet} title="Advanced setup" text="Full trial balance, account-wise balance, branch-wise stock, receivable/payable import." />
                            </div>
                            {active.warning && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100">
                                    {active.warning}
                                </div>
                            )}
                        </div>
                    )}

                    {active.id === 'capital' && (
                        <div className="grid gap-3 md:grid-cols-2">
                            <Info icon={Banknote} title="ক্যাশ/মূলধন পরে দিন" text="না জানলে এখন skip করুন। হিসাব ঠিক রাখতে posting flow দিয়ে পরে দিন।" />
                            <Info icon={PackagePlus} title="পণ্য আগে যোগ করুন" text="নতুন ব্যবসার জন্য পণ্য তৈরি করাই সবচেয়ে দ্রুত operational path." />
                        </div>
                    )}

                    {active.id === 'products' && (
                        <div className="grid gap-3 md:grid-cols-2">
                            <Info icon={PackagePlus} title="Manual first product" text="নাম, বিক্রয় মূল্য, ক্রয় মূল্য, quantity, unit, barcode enough." />
                            <Info icon={Boxes} title="Business presets" text={draft.category === 'pharmacy' ? 'Batch ও expiry পরে enable করুন।' : draft.category === 'mobile' ? 'Serial/IMEI পরে enable করুন।' : draft.category === 'fashion' ? 'Size/color variants পরে enable করুন।' : 'Unit ও stock alert দিয়ে শুরু করুন।'} />
                        </div>
                    )}

                    {active.id === 'people' && (
                        <div className="space-y-4">
                            <Toggle label="আমার কর্মচারী আছে" checked={draft.hasEmployees} onChange={(value) => setDraft({ ...draft, hasEmployees: value })} />
                            <div className="grid gap-3 md:grid-cols-3">
                                {['Cashier', 'Salesperson', 'Manager', 'Accountant', 'Storekeeper', 'Custom role'].map((role) => (
                                    <div key={role} className="rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">{role}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {active.id === 'launch' && (
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <Info icon={ClipboardCheck} title="Detected progress" text={`${completed}/${total} checklist items complete from current system data.`} />
                                <Info icon={Languages} title="Language" text={`Current language: ${i18n.language || 'bn'}. Bangla copy is primary for shopkeeper flow.`} />
                            </div>
                            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                                <p className="font-semibold text-slate-900 dark:text-white">Optional incomplete items can be finished later from dashboard checklist.</p>
                            </div>
                        </div>
                    )}

                    {activeDetected?.completed && (
                        <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            This step is already detected as complete.
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
                            আগে যান
                        </button>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {active.skippable && (
                                <button type="button" onClick={goNext} className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                                    পরে করব
                                </button>
                            )}
                            {active.href && (
                                <Link href={active.href} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sky-200 px-4 text-sm font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-300 dark:hover:bg-sky-950/30">
                                    {active.action}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                            <button type="button" onClick={primaryAction} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700">
                                {currentStep === steps.length - 1 ? 'Dashboard খুলুন' : 'সংরক্ষণ করে এগিয়ে যান'}
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
