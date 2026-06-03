'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';

import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useRunCourierFraudCheckMutation, useRunStoreOrderFraudCheckMutation } from '@/store/features/ecommerce/ecommerceManagementApi';
import { formatApiError } from './ecommerceUtils';

const PROVIDERS = [
    { value: 'pathao', label: 'Pathao' },
    { value: 'steadfast', label: 'Steadfast' },
    { value: 'redx', label: 'RedX' },
    { value: 'paperfly', label: 'Paperfly' },
    { value: 'carrybee', label: 'Carrybee' },
];

const riskStyles: Record<string, string> = {
    low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    medium: 'border-amber-200 bg-amber-50 text-amber-800',
    high: 'border-rose-200 bg-rose-50 text-rose-800',
    unknown: 'border-slate-200 bg-slate-50 text-slate-700',
};

type CourierFraudCheckPanelProps = {
    storeId?: number | null;
    storeOrderId?: number | null;
    defaultPhone?: string;
    title?: string;
    description?: string;
};

const resolveCheckPayload = (response: any) => response?.data || response?.data?.data || response;

const providerLabel = (provider: string) => PROVIDERS.find((item) => item.value === provider)?.label || provider;

const CourierFraudCheckPanel = ({ storeId, storeOrderId, defaultPhone = '', title = 'Courier fraud checker', description }: CourierFraudCheckPanelProps) => {
    const [phone, setPhone] = useState(defaultPhone || '');
    const [forceRefresh, setForceRefresh] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [runManualCheck, { isLoading: isRunningManual }] = useRunCourierFraudCheckMutation();
    const [runOrderCheck, { isLoading: isRunningOrder }] = useRunStoreOrderFraudCheckMutation();
    const isRunning = isRunningManual || isRunningOrder;
    const canRun = storeOrderId ? Boolean(storeOrderId) : Boolean(storeId && phone.trim());

    const providerResults = useMemo(() => {
        const providers = result?.providers || {};
        return Object.entries(providers).map(([provider, value]: [string, any]) => ({ provider, ...(value || {}) }));
    }, [result]);

    useEffect(() => {
        if (defaultPhone) setPhone(defaultPhone);
    }, [defaultPhone]);

    const handleRunCheck = async () => {
        if (!canRun) {
            showErrorDialog('Missing data', storeOrderId ? 'Order information is not ready yet.' : 'Select a store and enter a Bangladeshi phone number.');
            return;
        }

        const body: Record<string, any> = {};
        if (forceRefresh) body.force_refresh = true;
        if (storeOrderId && phone.trim()) body.phone = phone.trim();

        try {
            const response = storeOrderId
                ? await runOrderCheck({ id: Number(storeOrderId), ...body }).unwrap()
                : await runManualCheck({ store_id: Number(storeId), phone: phone.trim(), ...body }).unwrap();
            const payload = resolveCheckPayload(response);
            setResult(payload);
            showSuccessDialog('Fraud check complete', `Risk level: ${String(payload?.risk_level || 'unknown').toUpperCase()}`);
        } catch (error) {
            showErrorDialog('Fraud check failed', formatApiError(error));
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">{description || 'Check courier delivery history before dispatching COD or high-value orders.'}</p>
                    </div>
                </div>

                {result && (
                    <span className={cn('inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold', riskStyles[result.risk_level] || riskStyles.unknown)}>
                        {result.risk_level === 'high' ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {String(result.risk_level || 'unknown').toUpperCase()}
                    </span>
                )}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                {!storeOrderId && (
                    <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="017XXXXXXXX"
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-primary"
                    />
                )}

                <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700">
                        <input type="checkbox" checked={forceRefresh} onChange={(event) => setForceRefresh(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary" />
                        Refresh
                    </label>
                    <button
                        type="button"
                        onClick={handleRunCheck}
                        disabled={isRunning || !canRun}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Run check
                    </button>
                </div>
            </div>

            {result && (
                <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                    <div className="grid gap-3 sm:grid-cols-4">
                        <Metric label="Success" value={result.summary?.success ?? 0} />
                        <Metric label="Cancel" value={result.summary?.cancel ?? 0} />
                        <Metric label="Total" value={result.summary?.total ?? 0} />
                        <Metric label="Success ratio" value={`${Number(result.summary?.success_ratio || 0).toFixed(2)}%`} />
                    </div>

                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">{result.recommendation || 'Review this customer before dispatch.'}</p>

                    {providerResults.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[620px] text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <th className="py-2 pr-3">Provider</th>
                                        <th className="py-2 pr-3">Status</th>
                                        <th className="py-2 pr-3 text-right">Success</th>
                                        <th className="py-2 pr-3 text-right">Cancel</th>
                                        <th className="py-2 pr-3 text-right">Ratio</th>
                                        <th className="py-2">Error</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {providerResults.map((item: any) => (
                                        <tr key={item.provider}>
                                            <td className="py-2 pr-3 font-semibold text-slate-900">{providerLabel(item.provider)}</td>
                                            <td className="py-2 pr-3 text-slate-700">{String(item.status || 'unknown').replace('_', ' ')}</td>
                                            <td className="py-2 pr-3 text-right text-slate-700">{item.success ?? 0}</td>
                                            <td className="py-2 pr-3 text-right text-slate-700">{item.cancel ?? 0}</td>
                                            <td className="py-2 pr-3 text-right text-slate-700">{Number(item.success_ratio || 0).toFixed(2)}%</td>
                                            <td className="max-w-[260px] py-2 text-xs text-slate-500">{item.error || '--'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Metric = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
);

export default CourierFraudCheckPanel;
