'use client';

import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useGetRunningBusinessMigrationQuery,
    useMarkRunningBusinessMigrationReadyMutation,
    usePostRunningBusinessOpeningBalanceMutation,
    useSaveRunningBusinessMigrationMutation,
    type RunningBusinessMigrationChecklist,
} from '@/store/features/accounting/runningBusinessMigrationApi';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { useGetProductStocksQuery } from '@/store/features/ProductStock/productStockApi';
import { AlertCircle, CalendarDays, CheckCircle2, ClipboardCheck, FileText, Loader2, LockKeyhole, Save, Send, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ChecklistKey = keyof RunningBusinessMigrationChecklist;

const checklistSteps: Array<{ key: ChecklistKey; titleKey: string; descKey: string }> = [
    { key: 'business_profile', titleKey: 'rbm_step_business_profile', descKey: 'rbm_step_business_profile_desc' },
    { key: 'opening_cash_bank', titleKey: 'rbm_step_cash_bank', descKey: 'rbm_step_cash_bank_desc' },
    { key: 'opening_stock', titleKey: 'rbm_step_opening_stock', descKey: 'rbm_step_opening_stock_desc' },
    { key: 'customer_receivables', titleKey: 'rbm_step_customer_receivables', descKey: 'rbm_step_customer_receivables_desc' },
    { key: 'supplier_payables', titleKey: 'rbm_step_supplier_payables', descKey: 'rbm_step_supplier_payables_desc' },
    { key: 'opening_expenses_liabilities', titleKey: 'rbm_step_expenses_liabilities', descKey: 'rbm_step_expenses_liabilities_desc' },
    { key: 'owner_equity', titleKey: 'rbm_step_owner_equity', descKey: 'rbm_step_owner_equity_desc' },
    { key: 'review_ready', titleKey: 'rbm_step_review_ready', descKey: 'rbm_step_review_ready_desc' },
];

const defaultChecklist = checklistSteps.reduce((acc, step) => {
    acc[step.key] = false;
    return acc;
}, {} as RunningBusinessMigrationChecklist);

const displayStatus = (value?: string | null) => (value || 'not_started').replace(/_/g, ' ');

export default function RunningBusinessMigrationPage() {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore } = useCurrentStore();
    const { data, isLoading, refetch } = useGetRunningBusinessMigrationQuery({ store_id: Number(currentStoreId) }, { skip: !currentStoreId });
    const { data: stockData } = useGetProductStocksQuery({ store_id: currentStoreId, per_page: 200 }, { skip: !currentStoreId });
    const [saveMigration, { isLoading: saving }] = useSaveRunningBusinessMigrationMutation();
    const [markReady, { isLoading: markingReady }] = useMarkRunningBusinessMigrationReadyMutation();
    const [postOpeningBalance, { isLoading: posting }] = usePostRunningBusinessOpeningBalanceMutation();

    const status = data?.data;
    const [migrationDate, setMigrationDate] = useState('');
    const [currentStep, setCurrentStep] = useState<ChecklistKey>('business_profile');
    const [checklist, setChecklist] = useState<RunningBusinessMigrationChecklist>(defaultChecklist);
    const [stepData, setStepData] = useState<Record<string, any>>({});
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!status) return;
        setMigrationDate(status.migration_date || '');
        setCurrentStep(status.current_step || 'business_profile');
        setChecklist({ ...defaultChecklist, ...(status.checklist || {}) });
        setStepData(status.step_data || {});
        setNotes(status.notes || '');
    }, [status]);

    const completedCount = useMemo(() => checklistSteps.filter((step) => checklist[step.key]).length, [checklist]);
    const progress = Math.round((completedCount / checklistSteps.length) * 100);
    const canMarkReady = Boolean(migrationDate) && checklistSteps.filter((step) => step.key !== 'review_ready').every((step) => checklist[step.key]);

    const toggleStep = (key: ChecklistKey) => {
        setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
        setCurrentStep(key);
    };

    const buildSavePayload = () => ({
        store_id: Number(currentStoreId),
        migration_date: migrationDate || null,
        status: status?.status === 'not_started' ? ('draft' as const) : status?.status === 'draft' || status?.status === 'in_progress' ? ('in_progress' as const) : undefined,
        current_step: currentStep,
        checklist,
        step_data: stepData,
        notes,
    });

    const saveCurrentMigration = async () => {
        if (!currentStoreId) return false;
        await saveMigration(buildSavePayload()).unwrap();
        return true;
    };

    const handleSave = async () => {
        try {
            await saveCurrentMigration();
            showSuccessDialog(t('rbm_saved'));
            refetch();
        } catch {
            showErrorDialog(t('msg_error_generic'));
        }
    };

    const activeStep = checklistSteps.find((step) => step.key === currentStep) || checklistSteps[0];
    const stockEntryMode = stepData.opening_stock?.entry_mode || (Array.isArray(stepData.opening_stock?.items) && stepData.opening_stock.items.length > 0 ? 'product' : 'total');

    const setStepField = (step: ChecklistKey, field: string, value: string) => {
        setStepData((prev) => ({
            ...prev,
            [step]: {
                ...(prev[step] || {}),
                [field]: value,
            },
        }));
    };

    const setStockEntryMode = (mode: 'total' | 'product') => {
        setStepData((prev) => ({
            ...prev,
            opening_stock: {
                ...(prev.opening_stock || {}),
                entry_mode: mode,
            },
        }));
    };

    const getAmount = (step: ChecklistKey, field: string) => Number(stepData[step]?.[field] || 0);
    const stockOptions = useMemo(() => {
        const rows = stockData?.data?.data || [];
        return rows.flatMap((product: any) =>
            (product.stocks || []).map((stock: any) => ({
                id: stock.stock_id,
                label: `${product.product_name}${stock.variant_name ? ` - ${stock.variant_name}` : ''}${stock.sku ? ` (${stock.sku})` : ''}`,
                currentQuantity: Number(stock.quantity || 0),
            }))
        );
    }, [stockData]);
    const sumItems = (step: ChecklistKey, field: string) => (Array.isArray(stepData[step]?.items) ? stepData[step].items.reduce((sum: number, item: any) => sum + Number(item[field] || 0), 0) : 0);
    const openingStockItemsValue = Array.isArray(stepData.opening_stock?.items)
        ? stepData.opening_stock.items.reduce((sum: number, item: any) => sum + (item.product_stock_id ? Number(item.quantity || 0) * Number(item.unit_cost || 0) : 0), 0)
        : 0;
    const debitTotal =
        getAmount('opening_cash_bank', 'cash_in_hand') +
        getAmount('opening_cash_bank', 'bank_balance') +
        getAmount('opening_cash_bank', 'mobile_banking') +
        (openingStockItemsValue || getAmount('opening_stock', 'inventory_value')) +
        (sumItems('customer_receivables', 'amount') || getAmount('customer_receivables', 'receivables')) +
        getAmount('opening_expenses_liabilities', 'other_assets');
    const creditTotal =
        (sumItems('supplier_payables', 'amount') || getAmount('supplier_payables', 'payables')) +
        getAmount('opening_expenses_liabilities', 'loans_payable') +
        getAmount('opening_expenses_liabilities', 'outstanding_expenses') +
        getAmount('owner_equity', 'owner_capital');
    const equityAdjustment = Math.max(0, debitTotal - creditTotal);
    const assetAdjustment = Math.max(0, creditTotal - debitTotal);
    const balancedDebit = debitTotal + assetAdjustment;
    const balancedCredit = creditTotal + equityAdjustment;

    const handleMarkReady = async () => {
        if (!currentStoreId) return;
        try {
            await saveCurrentMigration();
            await markReady({ store_id: Number(currentStoreId) }).unwrap();
            showSuccessDialog(t('rbm_marked_ready'));
            refetch();
        } catch (error: any) {
            const missing = error?.data?.errors?.missing;
            showErrorDialog(Array.isArray(missing) ? `${t('rbm_missing_steps')}: ${missing.join(', ')}` : t('msg_error_generic'));
        }
    };

    const handlePostOpeningBalance = async () => {
        if (!currentStoreId) return;
        const confirmed = await showConfirmDialog(t('rbm_post_opening_balance'), t('rbm_post_confirm'), t('rbm_post_opening_balance'), t('btn_cancel'));
        if (!confirmed) return;

        try {
            await saveCurrentMigration();
            await postOpeningBalance({ store_id: Number(currentStoreId) }).unwrap();
            showSuccessDialog(t('rbm_posted'));
            refetch();
        } catch (error: any) {
            showErrorDialog(error?.data?.errors?.opening_balance || error?.data?.message || t('msg_error_generic'));
        }
    };

    const updateArrayItem = (step: ChecklistKey, index: number, patch: Record<string, any>) => {
        setStepData((prev) => {
            const items = Array.isArray(prev[step]?.items) ? [...prev[step].items] : [];
            items[index] = { ...(items[index] || {}), ...patch };
            return { ...prev, [step]: { ...(prev[step] || {}), items } };
        });
    };

    const addArrayItem = (step: ChecklistKey, item: Record<string, any>) => {
        setStepData((prev) => {
            const items = Array.isArray(prev[step]?.items) ? [...prev[step].items] : [];
            return { ...prev, [step]: { ...(prev[step] || {}), items: [...items, item] } };
        });
    };

    const removeArrayItem = (step: ChecklistKey, index: number) => {
        setStepData((prev) => {
            const items = Array.isArray(prev[step]?.items) ? [...prev[step].items] : [];
            items.splice(index, 1);
            return { ...prev, [step]: { ...(prev[step] || {}), items } };
        });
    };

    if (isLoading) return <Loader />;

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                        <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('rbm_title')}</h1>
                        <p className="text-sm text-gray-500">{currentStore?.store_name || t('lbl_store')} · AngateBOS</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || markingReady || posting || !currentStoreId || status?.status === 'posted'}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {t('btn_save')}
                    </button>
                    <button
                        type="button"
                        onClick={handleMarkReady}
                        disabled={markingReady || posting || !canMarkReady || !currentStoreId || status?.status === 'posted'}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {markingReady ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        {t('rbm_mark_ready')}
                    </button>
                    <button
                        type="button"
                        onClick={handlePostOpeningBalance}
                        disabled={posting || status?.status !== 'ready' || !currentStoreId}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {t('rbm_post_opening_balance')}
                    </button>
                </div>
            </div>

            {status?.status === 'posted' && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <div className="flex gap-2">
                        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{t('rbm_posted_lock_note')}</p>
                    </div>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <div className="space-y-4">
                    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">{t('rbm_progress')}</span>
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-md bg-gray-50 px-3 py-2">
                                <p className="text-gray-500">{t('lbl_status')}</p>
                                <p className="mt-1 font-bold capitalize text-gray-900">{displayStatus(status?.status)}</p>
                            </div>
                            <div className="rounded-md bg-gray-50 px-3 py-2">
                                <p className="text-gray-500">{t('rbm_opening_balance')}</p>
                                <p className="mt-1 font-bold capitalize text-gray-900">{displayStatus(status?.opening_balance?.status || 'not_configured')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                        <div className="flex gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>{t('rbm_stock_note')}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
                            <label className="block">
                                <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <CalendarDays className="h-4 w-4 text-primary" />
                                    {t('rbm_migration_date')}
                                </span>
                                <input type="date" className="form-input w-full" value={migrationDate} onChange={(event) => setMigrationDate(event.target.value)} />
                            </label>
                            <label className="block">
                                <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <FileText className="h-4 w-4 text-primary" />
                                    {t('lbl_notes')}
                                </span>
                                <input className="form-input w-full" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t('rbm_notes_placeholder')} />
                            </label>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-4 py-3">
                            <h2 className="text-sm font-bold text-gray-800">{t('rbm_checklist_title')}</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {checklistSteps.map((step, index) => {
                                const checked = checklist[step.key];
                                const active = currentStep === step.key;
                                return (
                                    <button
                                        key={step.key}
                                        type="button"
                                        onClick={() => toggleStep(step.key)}
                                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${active ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                    >
                                        <span
                                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                checked ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {checked ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-bold text-gray-900">{t(step.titleKey)}</span>
                                            <span className="mt-0.5 block text-xs text-gray-500">{t(step.descKey)}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-800">{t(activeStep.titleKey)}</h2>
                        <p className="mt-1 text-xs text-gray-500">{t(activeStep.descKey)}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {currentStep === 'opening_cash_bank' && (
                                <>
                                    <AmountField label={t('rbm_cash_in_hand')} placeholder={t('rbm_cash_example')} value={stepData.opening_cash_bank?.cash_in_hand} onChange={(value) => setStepField('opening_cash_bank', 'cash_in_hand', value)} />
                                    <AmountField label={t('rbm_bank_balance')} placeholder={t('rbm_bank_example')} value={stepData.opening_cash_bank?.bank_balance} onChange={(value) => setStepField('opening_cash_bank', 'bank_balance', value)} />
                                    <AmountField label={t('rbm_mobile_banking')} placeholder={t('rbm_mobile_example')} value={stepData.opening_cash_bank?.mobile_banking} onChange={(value) => setStepField('opening_cash_bank', 'mobile_banking', value)} />
                                </>
                            )}
                            {currentStep === 'opening_stock' && (
                                <>
                                    <div className="sm:col-span-2">
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <StockModeButton active={stockEntryMode === 'total'} title={t('rbm_stock_mode_total')} description={t('rbm_stock_mode_total_desc')} onClick={() => setStockEntryMode('total')} />
                                            <StockModeButton active={stockEntryMode === 'product'} title={t('rbm_stock_mode_product')} description={t('rbm_stock_mode_product_desc')} onClick={() => setStockEntryMode('product')} />
                                        </div>
                                    </div>
                                    <AmountField
                                        label={t('rbm_inventory_value')}
                                        placeholder={t('rbm_inventory_value_example')}
                                        disabled={stockEntryMode === 'product'}
                                        value={stockEntryMode === 'product' ? openingStockItemsValue || '' : stepData.opening_stock?.inventory_value}
                                        onChange={(value) => setStepField('opening_stock', 'inventory_value', value)}
                                    />
                                    <AmountField label={t('rbm_inventory_qty')} placeholder={t('rbm_inventory_qty_example')} value={stepData.opening_stock?.quantity_counted} onChange={(value) => setStepField('opening_stock', 'quantity_counted', value)} />
                                </>
                            )}
                            {currentStep === 'customer_receivables' && (
                                <AmountField label={t('rbm_receivables')} placeholder={t('rbm_receivables_example')} value={stepData.customer_receivables?.receivables} onChange={(value) => setStepField('customer_receivables', 'receivables', value)} />
                            )}
                            {currentStep === 'supplier_payables' && (
                                <AmountField label={t('rbm_payables')} placeholder={t('rbm_payables_example')} value={stepData.supplier_payables?.payables} onChange={(value) => setStepField('supplier_payables', 'payables', value)} />
                            )}
                            {currentStep === 'opening_expenses_liabilities' && (
                                <>
                                    <AmountField label={t('rbm_loans_payable')} placeholder={t('rbm_loans_example')} value={stepData.opening_expenses_liabilities?.loans_payable} onChange={(value) => setStepField('opening_expenses_liabilities', 'loans_payable', value)} />
                                    <AmountField label={t('rbm_outstanding_expenses')} placeholder={t('rbm_expense_example')} value={stepData.opening_expenses_liabilities?.outstanding_expenses} onChange={(value) => setStepField('opening_expenses_liabilities', 'outstanding_expenses', value)} />
                                    <AmountField label={t('rbm_other_assets')} placeholder={t('rbm_other_assets_example')} value={stepData.opening_expenses_liabilities?.other_assets} onChange={(value) => setStepField('opening_expenses_liabilities', 'other_assets', value)} />
                                </>
                            )}
                            {currentStep === 'owner_equity' && (
                                <AmountField label={t('rbm_owner_capital')} placeholder={t('rbm_owner_capital_example')} value={stepData.owner_equity?.owner_capital} onChange={(value) => setStepField('owner_equity', 'owner_capital', value)} />
                            )}
                        </div>
                        {currentStep === 'opening_stock' && stockEntryMode === 'product' && (
                            <StockItemsEditor
                                t={t}
                                stockOptions={stockOptions}
                                items={stepData.opening_stock?.items || []}
                                onAdd={() => addArrayItem('opening_stock', { product_stock_id: '', quantity: '', unit_cost: '' })}
                                onUpdate={(index, patch) => updateArrayItem('opening_stock', index, patch)}
                                onRemove={(index) => removeArrayItem('opening_stock', index)}
                            />
                        )}
                        {currentStep === 'opening_stock' && stockEntryMode === 'total' && <p className="mt-3 text-xs text-gray-500">{t('rbm_stock_total_note')}</p>}
                        {currentStep === 'customer_receivables' && (
                            <SimpleAmountItemsEditor
                                t={t}
                                title={t('rbm_customer_receivable_lines')}
                                nameLabel={t('lbl_customer')}
                                idLabel={t('rbm_customer_id')}
                                idField="customer_id"
                                amountLabel={t('rbm_receivables')}
                                items={stepData.customer_receivables?.items || []}
                                onAdd={() => addArrayItem('customer_receivables', { name: '', amount: '' })}
                                onUpdate={(index, patch) => updateArrayItem('customer_receivables', index, patch)}
                                onRemove={(index) => removeArrayItem('customer_receivables', index)}
                            />
                        )}
                        {currentStep === 'supplier_payables' && (
                            <SimpleAmountItemsEditor
                                t={t}
                                title={t('rbm_supplier_payable_lines')}
                                nameLabel={t('lbl_supplier')}
                                idLabel={t('rbm_supplier_id')}
                                idField="supplier_id"
                                amountLabel={t('rbm_payables')}
                                items={stepData.supplier_payables?.items || []}
                                onAdd={() => addArrayItem('supplier_payables', { name: '', amount: '' })}
                                onUpdate={(index, patch) => updateArrayItem('supplier_payables', index, patch)}
                                onRemove={(index) => removeArrayItem('supplier_payables', index)}
                            />
                        )}
                        <textarea
                            className="form-textarea mt-3 min-h-28 w-full"
                            value={String(stepData[currentStep]?.summary || '')}
                            onChange={(event) =>
                                setStepData((prev) => ({
                                    ...prev,
                                    [currentStep]: {
                                        ...(prev[currentStep] || {}),
                                        summary: event.target.value,
                                    },
                                }))
                            }
                            placeholder={t('rbm_step_data_placeholder')}
                        />
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-800">{t('rbm_review_totals')}</h2>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <SummaryBox label={t('lbl_debit')} value={formatCurrency(balancedDebit)} />
                            <SummaryBox label={t('lbl_credit')} value={formatCurrency(balancedCredit)} />
                            <SummaryBox label={t('rbm_equity_adjustment')} value={formatCurrency(equityAdjustment)} />
                            <SummaryBox label={t('rbm_asset_adjustment')} value={formatCurrency(assetAdjustment)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const AmountField = ({ label, value, placeholder, disabled, onChange }: { label: string; value: any; placeholder?: string; disabled?: boolean; onChange: (value: string) => void }) => (
    <label className="block">
        <span className="mb-1 block text-xs font-semibold text-gray-600">{label}</span>
        <input type="number" min="0" step="0.01" disabled={disabled} placeholder={placeholder} className="form-input w-full disabled:cursor-not-allowed disabled:bg-gray-100" value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </label>
);

const StockModeButton = ({ active, title, description, onClick }: { active: boolean; title: string; description: string; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`min-h-20 rounded-lg border px-3 py-2 text-left transition ${active ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40'}`}
    >
        <span className="block text-sm font-bold">{title}</span>
        <span className="mt-1 block text-xs text-gray-500">{description}</span>
    </button>
);

const SummaryBox = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
    </div>
);

const StockItemsEditor = ({
    t,
    stockOptions,
    items,
    onAdd,
    onUpdate,
    onRemove,
}: {
    t: (key: string) => string;
    stockOptions: Array<{ id: number; label: string; currentQuantity: number }>;
    items: any[];
    onAdd: () => void;
    onUpdate: (index: number, patch: Record<string, any>) => void;
    onRemove: (index: number) => void;
}) => (
    <div className="mt-4 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <h3 className="text-xs font-bold text-gray-700">{t('rbm_product_stock_lines')}</h3>
            <button type="button" onClick={onAdd} className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white">
                {t('btn_add')}
            </button>
        </div>
        <div className="space-y-2 p-3">
            {items.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-lg bg-gray-50 p-2 md:grid-cols-[1fr_110px_120px_auto]">
                    <select className="form-select" value={item.product_stock_id || ''} onChange={(event) => onUpdate(index, { product_stock_id: event.target.value })}>
                        <option value="">{t('rbm_select_stock_item')}</option>
                        {stockOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <input type="number" min="0" step="0.01" className="form-input" placeholder={t('rbm_inventory_qty')} value={item.quantity || ''} onChange={(event) => onUpdate(index, { quantity: event.target.value })} />
                    <input type="number" min="0" step="0.01" className="form-input" placeholder={t('rbm_unit_cost')} value={item.unit_cost || ''} onChange={(event) => onUpdate(index, { unit_cost: event.target.value })} />
                    <button type="button" onClick={() => onRemove(index)} className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                        {t('btn_delete')}
                    </button>
                </div>
            ))}
            {items.length === 0 && <p className="py-3 text-center text-xs text-gray-400">{t('rbm_no_lines')}</p>}
        </div>
    </div>
);

const SimpleAmountItemsEditor = ({
    t,
    title,
    nameLabel,
    idLabel,
    idField,
    amountLabel,
    items,
    onAdd,
    onUpdate,
    onRemove,
}: {
    t: (key: string) => string;
    title: string;
    nameLabel: string;
    idLabel?: string;
    idField?: string;
    amountLabel: string;
    items: any[];
    onAdd: () => void;
    onUpdate: (index: number, patch: Record<string, any>) => void;
    onRemove: (index: number) => void;
}) => (
    <div className="mt-4 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <h3 className="text-xs font-bold text-gray-700">{title}</h3>
            <button type="button" onClick={onAdd} className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white">
                {t('btn_add')}
            </button>
        </div>
        <div className="space-y-2 p-3">
            {items.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-lg bg-gray-50 p-2 md:grid-cols-[100px_1fr_140px_auto]">
                    <input
                        type="number"
                        min="0"
                        className="form-input"
                        placeholder={idLabel || 'ID'}
                        value={(idField ? item[idField] : '') || ''}
                        onChange={(event) => idField && onUpdate(index, { [idField]: event.target.value })}
                    />
                    <input className="form-input" placeholder={nameLabel} value={item.name || ''} onChange={(event) => onUpdate(index, { name: event.target.value })} />
                    <input type="number" min="0" step="0.01" className="form-input" placeholder={amountLabel} value={item.amount || ''} onChange={(event) => onUpdate(index, { amount: event.target.value })} />
                    <button type="button" onClick={() => onRemove(index)} className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                        {t('btn_delete')}
                    </button>
                </div>
            ))}
            {items.length === 0 && <p className="py-3 text-center text-xs text-gray-400">{t('rbm_no_lines')}</p>}
        </div>
    </div>
);
