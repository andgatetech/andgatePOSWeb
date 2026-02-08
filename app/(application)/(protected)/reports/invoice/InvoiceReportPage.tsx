'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetInvoiceReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, CreditCard, FileText, Hash, Package, Receipt, TrendingDown, User, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const InvoiceReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getInvoiceReport, { data: reportData, isLoading }] = useGetInvoiceReportMutation();
    const [getInvoiceReportForExport] = useGetInvoiceReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    // Reset lastQueryParams when store changes to force API recall
    useEffect(() => {
        lastQueryParams.current = '';
    }, [currentStoreId]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getInvoiceReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getInvoiceReport]);

    const invoices = useMemo(() => reportData?.data?.invoices || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const pagination = useMemo(() => reportData?.data?.pagination || {}, [reportData]);

    const handleFilterChange = useCallback((n: Record<string, any>) => {
        setApiParams(n);
        setCurrentPage(1);
    }, []);
    const handleSort = useCallback(
        (f: string) => {
            if (sortField === f) setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
            else {
                setSortField(f);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField]
    );
    const handlePageChange = useCallback((p: number) => setCurrentPage(p), []);
    const handleItemsPerPageChange = useCallback((i: number) => {
        setItemsPerPage(i);
        setCurrentPage(1);
    }, []);

    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = { ...apiParams, export: true, sort_field: sortField, sort_direction: sortDirection };
        if (!exportParams.store_id && !exportParams.store_ids && currentStoreId) exportParams.store_id = currentStoreId;
        try {
            const result = await getInvoiceReportForExport(exportParams).unwrap();
            return result?.data?.invoices || [];
        } catch (e) {
            console.error('Export failed:', e);
            return invoices;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, invoices, getInvoiceReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'invoice_no', label: 'Invoice No', width: 15 },
            { key: 'customer', label: 'Customer', width: 20 },
            { key: 'items_count', label: 'Items', width: 8 },
            { key: 'amount', label: 'Total', width: 15, format: (v) => formatCurrency(v) },
            { key: 'paid', label: 'Paid', width: 15, format: (v) => formatCurrency(v) },
            { key: 'amount_due', label: 'Due', width: 15, format: (v) => formatCurrency(v) },
            { key: 'method', label: 'Method', width: 10 },
            { key: 'status', label: 'Status', width: 10 },
            { key: 'created_at', label: 'Date', width: 12, format: (v) => v || '' },
        ],
        [formatCurrency]
    );

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? 'All Stores'
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || 'All Stores'
            : currentStore?.store_name || 'All Stores';
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters: [] };
    }, [apiParams, currentStore, userStores]);

    const exportSummary = useMemo(
        () => [
            { label: 'Total Invoices', value: summary.total_invoices || 0 },
            { label: 'Total Amount', value: formatCurrency(summary.total_amount) },
            { label: 'Total Due', value: formatCurrency(summary.total_due) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Invoices',
                value: summary.total_invoices || 0,
                icon: <FileText className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Amount',
                value: formatCurrency(summary.total_amount),
                icon: <Banknote className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Total Paid',
                value: formatCurrency(summary.total_paid),
                icon: <Wallet className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: 'Total Due',
                value: formatCurrency(summary.total_due),
                icon: <TrendingDown className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
        ],
        [summary, formatCurrency]
    );

    const columns = useMemo(
        () => [
            {
                key: 'invoice_no',
                label: 'Invoice',
                sortable: true,
                render: (v: any) => (
                    <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-900">{v}</span>
                    </div>
                ),
            },
            {
                key: 'customer',
                label: 'Customer',
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-medium text-gray-900">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            {v}
                        </div>
                        {r.customer_phone && <span className="pl-5 text-[10px] text-gray-500">{r.customer_phone}</span>}
                    </div>
                ),
            },
            {
                key: 'created_at',
                label: 'Order Date',
                sortable: true,
                render: (v) => <DateColumn date={v} />,
            },
            {
                key: 'due_date',
                label: 'Due Date',
                render: (v) => (v ? <DateColumn date={v} /> : <span className="text-xs text-gray-400">not specified</span>),
            },
            {
                key: 'items_count',
                label: 'Items',
                render: (v: any) => (
                    <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-gray-400" />
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{v}</span>
                    </div>
                ),
            },
            {
                key: 'amount',
                label: 'Amount',
                sortable: true,
                render: (v: any, r: any) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{formatCurrency(v)}</span>
                        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-gray-500">
                            <CreditCard className="h-2.5 w-2.5" /> {r.method || 'N/A'}
                        </div>
                    </div>
                ),
            },
            {
                key: 'amount_due',
                label: 'Paid / Due',
                render: (v: any, r: any) => {
                    const d = Number(v || 0);
                    return (
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-emerald-600">P: {formatCurrency(r.paid)}</span>
                            <span className={`text-xs font-semibold ${d > 0 ? 'text-red-600' : 'text-gray-400'}`}>D: {formatCurrency(d)}</span>
                        </div>
                    );
                },
            },
            {
                key: 'status',
                label: 'Status',
                render: (v: any) => {
                    const s = v?.toLowerCase() || '';
                    const c: any = {
                        paid: { bg: 'bg-green-100', text: 'text-green-800' },
                        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                        due: { bg: 'bg-red-100', text: 'text-red-800' },
                        pending: { bg: 'bg-blue-100', text: 'text-blue-800' },
                    };
                    const { bg, text } = c[s] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>{v}</span>;
                },
            },
        ],
        []
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="All Invoices"
                    reportDescription="View and track all customer billing history"
                    reportIcon={<Receipt className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-purple-600 to-indigo-700"
                    data={invoices}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="invoice_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search invoices, customer name, phone..." />
                </div>
                <ReusableTable
                    data={invoices}
                    columns={columns}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages: pagination.last_page || 1,
                        itemsPerPage,
                        totalItems: pagination.total || 0,
                        onPageChange: handlePageChange,
                        onItemsPerPageChange: handleItemsPerPageChange,
                    }}
                    sorting={{ field: sortField, direction: sortDirection, onSort: handleSort }}
                    emptyState={{
                        icon: <FileText className="mx-auto h-16 w-16 text-gray-300" />,
                        title: 'No Invoices Found',
                        description: 'Try adjusting your date range or filters to locate specific invoices.',
                    }}
                />
            </div>
        </div>
    );
};

export default InvoiceReportPage;
