'use client';

import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import {
    useCloseFiscalPeriodMutation,
    useGetFiscalComplianceDashboardMutation,
    useRegisterFiscalDeviceMutation,
} from '@/store/features/fiscalCompliance/fiscalComplianceApi';
import { CheckCircle2, FileCheck2, HardDrive, Lock, RefreshCw, ShieldCheck, UploadCloud, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const currentPeriod = () => new Date().toISOString().slice(0, 7);

const FiscalCompliancePage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [filters, setFilters] = useState<Record<string, any>>({ period: currentPeriod() });
    const [deviceCode, setDeviceCode] = useState('');
    const [getDashboard, { data, isLoading }] = useGetFiscalComplianceDashboardMutation();
    const [registerDevice, { isLoading: registering }] = useRegisterFiscalDeviceMutation();
    const [closePeriod, { isLoading: closing }] = useCloseFiscalPeriodMutation();

    const storeId = Number(filters.store_id || currentStoreId || 0);
    const period = filters.period || currentPeriod();

    const loadDashboard = useCallback(() => {
        if (storeId) {
            getDashboard({ store_id: storeId, period });
        }
    }, [getDashboard, period, storeId]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const payload = useMemo(() => data?.data || {}, [data]);
    const totals = useMemo(() => payload.totals || {}, [payload]);
    const hashChain = useMemo(() => payload.hash_chain || {}, [payload]);
    const invoices = useMemo(() => payload.recent_invoices || [], [payload]);
    const periodStatus = payload.period?.status || 'open';

    const cards = useMemo(
        () => [
            { label: t('lbl_fiscal_invoices'), value: totals.fiscal_invoices || 0, icon: <FileCheck2 className="h-5 w-5 text-blue-600" /> },
            { label: t('lbl_queued_submissions'), value: totals.queued_submissions || 0, icon: <UploadCloud className="h-5 w-5 text-amber-600" /> },
            { label: t('lbl_failed_submissions'), value: totals.failed_submissions || 0, icon: <XCircle className="h-5 w-5 text-red-600" /> },
            { label: t('lbl_active_devices'), value: totals.active_devices || 0, icon: <HardDrive className="h-5 w-5 text-emerald-600" /> },
        ],
        [t, totals]
    );

    const columns = useMemo(
        () => [
            { key: 'fiscal_invoice_number', label: t('lbl_fiscal_invoice') },
            { key: 'source_invoice_number', label: t('lbl_source_invoice') },
            { key: 'invoice_type', label: t('lbl_invoice_type') },
            { key: 'vat_period', label: t('lbl_vat_period') },
            { key: 'vat_amount', label: t('lbl_vat_amount') },
            { key: 'gross_amount', label: t('lbl_gross_amount') },
            { key: 'status', label: t('lbl_status') },
        ],
        [t]
    );

    const onFilterChange = useCallback((apiParams: Record<string, any>) => {
        setFilters((prev) => ({ ...prev, ...apiParams, period: apiParams.period || prev.period || currentPeriod() }));
    }, []);

    const handleRegisterDevice = async () => {
        if (!storeId || !deviceCode.trim()) return;
        await registerDevice({ store_id: storeId, device_code: deviceCode.trim() }).unwrap();
        setDeviceCode('');
        loadDashboard();
    };

    const handleClosePeriod = async () => {
        if (!storeId) return;
        const confirmed = await Swal.fire({
            title: t('msg_lock_vat_period_confirm'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('btn_lock_period'),
            cancelButtonText: t('btn_cancel'),
        });
        if (!confirmed.isConfirmed) return;
        await closePeriod({ store_id: storeId, period }).unwrap();
        loadDashboard();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('lbl_fiscal_compliance')}</h1>
                    <p className="text-sm text-gray-500">{t('msg_fiscal_compliance_center')}</p>
                </div>
                <button
                    type="button"
                    onClick={loadDashboard}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gray-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
                    disabled={isLoading}
                >
                    <RefreshCw className="h-4 w-4" />
                    {t('btn_refresh')}
                </button>
            </div>

            <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <BasicReportFilter onFilterChange={onFilterChange} showDateFilter={false} placeholder={t('lbl_search_store')} />
                <div className="mt-4 flex max-w-sm items-center gap-2">
                    <input
                        type="month"
                        value={period}
                        onChange={(event) => setFilters((prev) => ({ ...prev, period: event.target.value }))}
                        className="h-10 rounded-md border border-gray-300 px-3 text-sm"
                    />
                    <button
                        type="button"
                        onClick={handleClosePeriod}
                        disabled={!storeId || closing || periodStatus === 'locked'}
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        <Lock className="h-4 w-4" />
                        {periodStatus === 'locked' ? t('lbl_locked') : t('btn_lock_period')}
                    </button>
                </div>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">{card.label}</span>
                            {card.icon}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                    </div>
                ))}
            </div>

            <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_380px]">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-base font-semibold text-gray-900">{t('lbl_hash_chain_verification')}</h2>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        {hashChain.valid ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                        <span className={hashChain.valid ? 'font-semibold text-emerald-700' : 'font-semibold text-red-700'}>
                            {hashChain.valid ? t('msg_hash_chain_valid') : t('msg_hash_chain_invalid')}
                        </span>
                        <span className="text-gray-500">({hashChain.checked || 0})</span>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-base font-semibold text-gray-900">{t('lbl_register_fiscal_device')}</h2>
                    <div className="flex gap-2">
                        <input
                            value={deviceCode}
                            onChange={(event) => setDeviceCode(event.target.value)}
                            placeholder={t('ph_device_code')}
                            className="h-10 min-w-0 flex-1 rounded-md border border-gray-300 px-3 text-sm"
                        />
                        <button
                            type="button"
                            onClick={handleRegisterDevice}
                            disabled={!storeId || !deviceCode.trim() || registering}
                            className="h-10 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {t('btn_register')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <ReusableTable
                    data={invoices}
                    columns={columns}
                    isLoading={isLoading}
                    emptyState={{
                        title: t('msg_no_data_found'),
                        description: t('msg_adjust_filters_and_try_again'),
                    }}
                />
            </div>
        </div>
    );
};

export default FiscalCompliancePage;
