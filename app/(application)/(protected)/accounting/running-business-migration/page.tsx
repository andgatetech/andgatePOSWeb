'use client';

import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { escapePrintHtml, printInWindow } from '@/lib/printUtil';
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
import { useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import { useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, ClipboardCheck, FileText, Loader2, LockKeyhole, Printer, Save, Send, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
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

const parseCsvText = (text: string) => {
    const rows = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));

    if (rows.length === 0) return [];

    const first = rows[0].map((cell) => cell.toLowerCase());
    const hasHeader = first.some((cell) => ['name', 'product', 'customer', 'supplier', 'amount', 'quantity', 'qty', 'unit_cost', 'cost'].includes(cell));
    const headers = hasHeader ? first : [];
    const body = hasHeader ? rows.slice(1) : rows;

    return body.map((row) => {
        const get = (keys: string[], fallbackIndex: number) => {
            const index = headers.findIndex((header) => keys.includes(header));
            return row[index >= 0 ? index : fallbackIndex] || '';
        };

        return {
            name: get(['name', 'product', 'customer', 'supplier'], 0),
            quantity: get(['quantity', 'qty'], 1),
            unit_cost: get(['unit_cost', 'unit cost', 'cost', 'purchase_price'], 2),
            amount: get(['amount', 'due', 'balance', 'payable', 'receivable'], 1),
        };
    });
};

const positiveNumber = (value: unknown) => {
    const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export default function RunningBusinessMigrationPage() {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore } = useCurrentStore();
    const { data, isLoading, refetch } = useGetRunningBusinessMigrationQuery({ store_id: Number(currentStoreId) }, { skip: !currentStoreId });
    const { data: stockData } = useGetProductStocksQuery({ store_id: currentStoreId, per_page: 200 }, { skip: !currentStoreId });
    const [customerSearch, setCustomerSearch] = useState('');
    const [supplierSearch, setSupplierSearch] = useState('');
    const { data: customersData } = useGetStoreCustomersListQuery({ store_id: currentStoreId, search: customerSearch, per_page: 25, sort_field: 'name', sort_direction: 'asc' }, { skip: !currentStoreId });
    const { data: suppliersData } = useGetSuppliersQuery({ store_id: currentStoreId, search: supplierSearch, per_page: 25, sort_field: 'name', sort_direction: 'asc' }, { skip: !currentStoreId });
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

    const assistedMigration = stepData.assisted_migration || {};
    const assistedMigrationBlocked = Boolean(assistedMigration.required) && !assistedMigration.support_reviewed;
    const completedCount = useMemo(() => checklistSteps.filter((step) => checklist[step.key]).length, [checklist]);
    const progress = Math.round((completedCount / checklistSteps.length) * 100);
    const canMarkReady = Boolean(migrationDate)
        && !assistedMigrationBlocked
        && checklistSteps.filter((step) => step.key !== 'review_ready').every((step) => checklist[step.key]);

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

    const setAssistedMigrationField = (field: string, value: string | boolean) => {
        setStepData((prev) => ({
            ...prev,
            assisted_migration: {
                ...(prev.assisted_migration || {}),
                [field]: value,
            },
        }));
    };

    const applyAssistedImport = (target: 'opening_stock' | 'customer_receivables' | 'supplier_payables') => {
        const rows = parseCsvText(String(assistedMigration.import_text || ''));
        if (rows.length === 0) {
            showErrorDialog(t('rbm_import_empty'));
            return;
        }

        setStepData((prev) => {
            if (target === 'opening_stock') {
                const existing = Array.isArray(prev.opening_stock?.items) ? prev.opening_stock.items : [];
                const items = rows
                    .map((row) => ({
                        name: row.name,
                        product_stock_id: '',
                        quantity: positiveNumber(row.quantity) || '',
                        unit_cost: positiveNumber(row.unit_cost) || '',
                    }))
                    .filter((row) => row.name || row.quantity || row.unit_cost);

                return {
                    ...prev,
                    opening_stock: {
                        ...(prev.opening_stock || {}),
                        entry_mode: 'product',
                        items: [...existing, ...items],
                    },
                };
            }

            const existing = Array.isArray(prev[target]?.items) ? prev[target].items : [];
            const items = rows
                .map((row) => ({ name: row.name, amount: positiveNumber(row.amount) || '' }))
                .filter((row) => row.name || row.amount);

            return {
                ...prev,
                [target]: {
                    ...(prev[target] || {}),
                    items: [...existing, ...items],
                },
            };
        });

        setAssistedMigrationField('support_reviewed', false);
        showSuccessDialog(t('rbm_import_applied'));
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
    const customerOptions = useMemo(() => customersData?.data?.items || customersData?.data || [], [customersData]);
    const supplierOptions = useMemo(() => suppliersData?.data?.items || suppliersData?.data || [], [suppliersData]);
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
    const totalAssets = debitTotal;
    const totalDuesAndInvestment = creditTotal;

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
        const confirmed = await showConfirmDialog(t('rbm_post_opening_balance'), t('rbm_post_confirm_final'), t('rbm_post_opening_balance'), t('btn_cancel'));
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

    const printReview = () => {
        const esc = escapePrintHtml;
        const stockItems = stepData.opening_stock?.items || [];
        const customerItems = stepData.customer_receivables?.items || [];
        const supplierItems = stepData.supplier_payables?.items || [];
        const row = (label: string, value: string) => `<tr><td>${esc(label)}</td><td>${esc(value)}</td></tr>`;
        const amountLines = (items: any[]) =>
            items.length
                ? items.map((item) => `<tr><td>${esc(item.name || '-')}</td><td>${esc(formatCurrency(Number(item.amount || 0)))}</td></tr>`).join('')
                : `<tr><td colspan="2">${esc(t('rbm_no_lines'))}</td></tr>`;
        const stockLines = stockItems
            .filter((item: any) => item.product_stock_id)
            .map((item: any) => `<tr><td>${esc(item.name || item.product_stock_id || '-')}</td><td>${esc(formatCurrency(Number(item.quantity || 0) * Number(item.unit_cost || 0)))}</td></tr>`)
            .join('');
        const html = `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <title>${esc(t('rbm_print_title'))}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
                        .sheet { max-width: 760px; margin: 0 auto; }
                        h1 { font-size: 22px; margin: 0; }
                        h2 { font-size: 14px; margin: 22px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
                        .meta { color: #6b7280; font-size: 12px; margin-top: 4px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                        td, th { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
                        th { background: #f9fafb; }
                        td:last-child, th:last-child { text-align: right; font-weight: 700; }
                        .sign { display: flex; justify-content: space-between; gap: 24px; margin-top: 42px; font-size: 12px; }
                        .sign div { width: 45%; border-top: 1px solid #9ca3af; padding-top: 8px; text-align: center; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="sheet">
                        <h1>${esc(t('rbm_print_title'))}</h1>
                        <div class="meta">${esc(currentStore?.store_name || t('lbl_store'))} · ${esc(t('rbm_migration_date'))}: ${esc(migrationDate || '-')} · ${esc(new Date().toLocaleString())}</div>
                        <h2>${esc(t('rbm_review_totals'))}</h2>
                        <table><tbody>
                            ${row(t('rbm_total_assets'), formatCurrency(totalAssets))}
                            ${row(t('rbm_total_dues_investment'), formatCurrency(totalDuesAndInvestment))}
                            ${row(t('rbm_equity_adjustment'), formatCurrency(equityAdjustment))}
                            ${row(t('rbm_asset_adjustment'), formatCurrency(assetAdjustment))}
                        </tbody></table>
                        <h2>${esc(t('rbm_step_cash_bank'))}</h2>
                        <table><tbody>
                            ${row(t('rbm_cash_in_hand'), formatCurrency(getAmount('opening_cash_bank', 'cash_in_hand')))}
                            ${row(t('rbm_bank_balance'), formatCurrency(getAmount('opening_cash_bank', 'bank_balance')))}
                            ${row(t('rbm_mobile_banking'), formatCurrency(getAmount('opening_cash_bank', 'mobile_banking')))}
                        </tbody></table>
                        <h2>${esc(t('rbm_step_opening_stock'))}</h2>
                        <table><tbody>
                            ${row(t('rbm_inventory_value'), formatCurrency(openingStockItemsValue || getAmount('opening_stock', 'inventory_value')))}
                            ${row(t('rbm_inventory_qty'), String(stepData.opening_stock?.quantity_counted || '-'))}
                        </tbody></table>
                        ${stockLines ? `<table><thead><tr><th>${esc(t('rbm_product_stock_lines'))}</th><th>${esc(t('rbm_inventory_value'))}</th></tr></thead><tbody>${stockLines}</tbody></table>` : ''}
                        <h2>${esc(t('rbm_customer_receivable_lines'))}</h2>
                        <table><thead><tr><th>${esc(t('lbl_customer'))}</th><th>${esc(t('rbm_receivables'))}</th></tr></thead><tbody>${amountLines(customerItems)}</tbody></table>
                        <h2>${esc(t('rbm_supplier_payable_lines'))}</h2>
                        <table><thead><tr><th>${esc(t('lbl_supplier'))}</th><th>${esc(t('rbm_payables'))}</th></tr></thead><tbody>${amountLines(supplierItems)}</tbody></table>
                        <h2>${esc(t('rbm_step_expenses_liabilities'))}</h2>
                        <table><tbody>
                            ${row(t('rbm_loans_payable'), formatCurrency(getAmount('opening_expenses_liabilities', 'loans_payable')))}
                            ${row(t('rbm_outstanding_expenses'), formatCurrency(getAmount('opening_expenses_liabilities', 'outstanding_expenses')))}
                            ${row(t('rbm_other_assets'), formatCurrency(getAmount('opening_expenses_liabilities', 'other_assets')))}
                            ${row(t('rbm_owner_capital'), formatCurrency(getAmount('owner_equity', 'owner_capital')))}
                        </tbody></table>
                        <div class="sign"><div>${esc(t('rbm_owner_signature'))}</div><div>${esc(t('rbm_prepared_by'))}</div></div>
                    </div>
                </body>
            </html>`;
        printInWindow(html);
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
                        <p className="text-sm text-gray-500">{currentStore?.store_name || t('lbl_store')} · AndgateBOS</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/onboarding"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('rbm_back_to_onboarding')}
                    </Link>
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
                        onClick={printReview}
                        disabled={!currentStoreId}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Printer className="h-4 w-4" />
                        {t('btn_print')}
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

                    <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={Boolean(assistedMigration.required)}
                                onChange={(event) => setAssistedMigrationField('required', event.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span>
                                <span className="block text-sm font-bold text-gray-800">{t('rbm_assisted_title')}</span>
                                <span className="mt-1 block text-xs leading-5 text-gray-500">{t('rbm_assisted_desc')}</span>
                            </span>
                        </label>
                        {assistedMigration.required && (
                            <div className="mt-4 space-y-3">
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold text-gray-600">{t('rbm_assisted_source')}</span>
                                    <input
                                        className="form-input w-full"
                                        value={assistedMigration.source_system || ''}
                                        onChange={(event) => setAssistedMigrationField('source_system', event.target.value)}
                                        placeholder={t('rbm_assisted_source_placeholder')}
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold text-gray-600">{t('rbm_assisted_file_summary')}</span>
                                    <textarea
                                        className="form-textarea min-h-20 w-full"
                                        value={assistedMigration.file_summary || ''}
                                        onChange={(event) => setAssistedMigrationField('file_summary', event.target.value)}
                                        placeholder={t('rbm_assisted_file_placeholder')}
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold text-gray-600">{t('rbm_assisted_contact')}</span>
                                    <input
                                        className="form-input w-full"
                                        value={assistedMigration.contact_preference || ''}
                                        onChange={(event) => setAssistedMigrationField('contact_preference', event.target.value)}
                                        placeholder={t('rbm_assisted_contact_placeholder')}
                                    />
                                </label>
                                <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
                                    <label className="block">
                                        <span className="mb-1 block text-xs font-semibold text-sky-800">{t('rbm_import_paste_label')}</span>
                                        <textarea
                                            className="form-textarea min-h-24 w-full bg-white"
                                            value={assistedMigration.import_text || ''}
                                            onChange={(event) => setAssistedMigrationField('import_text', event.target.value)}
                                            placeholder={t('rbm_import_paste_placeholder')}
                                        />
                                    </label>
                                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                        <button
                                            type="button"
                                            onClick={() => applyAssistedImport('opening_stock')}
                                            className="rounded-md border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-50"
                                        >
                                            {t('rbm_import_stock')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyAssistedImport('customer_receivables')}
                                            className="rounded-md border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-50"
                                        >
                                            {t('rbm_import_customer_due')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyAssistedImport('supplier_payables')}
                                            className="rounded-md border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-50"
                                        >
                                            {t('rbm_import_supplier_due')}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-sky-700">{t('rbm_import_review_note')}</p>
                                </div>
                                <label className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(assistedMigration.support_reviewed)}
                                        onChange={(event) => setAssistedMigrationField('support_reviewed', event.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                                    />
                                    <span>{t('rbm_assisted_reviewed')}</span>
                                </label>
                            </div>
                        )}
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
                                idField="customer_id"
                                amountLabel={t('rbm_receivables')}
                                options={customerOptions}
                                search={customerSearch}
                                searchPlaceholder={t('rbm_search_customer')}
                                onSearch={setCustomerSearch}
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
                                idField="supplier_id"
                                amountLabel={t('rbm_payables')}
                                options={supplierOptions}
                                search={supplierSearch}
                                searchPlaceholder={t('rbm_search_supplier')}
                                onSearch={setSupplierSearch}
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
                            <SummaryBox label={t('rbm_total_assets')} value={formatCurrency(totalAssets)} />
                            <SummaryBox label={t('rbm_total_dues_investment')} value={formatCurrency(totalDuesAndInvestment)} />
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
                    <select
                        className="form-select"
                        value={item.product_stock_id || ''}
                        onChange={(event) => {
                            const selected = stockOptions.find((option) => String(option.id) === event.target.value);
                            onUpdate(index, { product_stock_id: event.target.value, name: selected?.label || '' });
                        }}
                    >
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
    idField,
    amountLabel,
    options,
    search,
    searchPlaceholder,
    onSearch,
    items,
    onAdd,
    onUpdate,
    onRemove,
}: {
    t: (key: string) => string;
    title: string;
    nameLabel: string;
    idField?: string;
    amountLabel: string;
    options?: any[];
    search?: string;
    searchPlaceholder?: string;
    onSearch?: (value: string) => void;
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
            {onSearch && (
                <input
                    className="form-input"
                    placeholder={searchPlaceholder}
                    value={search || ''}
                    onChange={(event) => onSearch(event.target.value)}
                />
            )}
            {items.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-lg bg-gray-50 p-2 md:grid-cols-[1fr_1fr_140px_auto]">
                    <select
                        className="form-select"
                        value={(idField ? item[idField] : '') || ''}
                        onChange={(event) => {
                            const selected = (options || []).find((option) => String(option.id) === event.target.value);
                            if (idField) onUpdate(index, { [idField]: event.target.value, name: selected?.name || selected?.company_name || '' });
                        }}
                    >
                        <option value="">{searchPlaceholder || nameLabel}</option>
                        {(options || []).map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name || option.company_name || option.phone || option.id}
                                {option.phone ? ` (${option.phone})` : ''}
                            </option>
                        ))}
                    </select>
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
