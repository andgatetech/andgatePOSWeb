'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetTaxReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, Calculator, FileText, Percent, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TaxReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'summary' | 'transactions'>('summary');

    const [getTaxReport, { data: reportData, isLoading }] = useGetTaxReportMutation();
    const [getTaxReportForExport] = useGetTaxReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, group_by: 'date', ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getTaxReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getTaxReport]);

    const items = useMemo(() => {
        if (viewMode === 'transactions') return reportData?.data?.pos_transactions || [];
        if (apiParams.group_by === 'category') return reportData?.data?.by_category || [];
        return reportData?.data?.by_period || [];
    }, [reportData, apiParams.group_by, viewMode]);

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
        const exportParams: Record<string, any> = { ...apiParams, export: true, sort_field: sortField, sort_direction: sortDirection, group_by: 'date' };
        if (!exportParams.store_id && !exportParams.store_ids && currentStoreId) exportParams.store_id = currentStoreId;
        try {
            const result = await getTaxReportForExport(exportParams).unwrap();
            if (viewMode === 'transactions') return result?.data?.pos_transactions || [];
            if (apiParams.group_by === 'category') return result?.data?.by_category || [];
            return result?.data?.by_period || [];
        } catch (e) {
            console.error('Export failed:', e);
            return items;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, items, getTaxReportForExport, viewMode]);

    const exportColumns: ExportColumn[] = useMemo(() => {
        if (viewMode === 'transactions') {
            return [
                { key: 'invoice', label: 'Invoice', width: 15 },
                { key: 'date', label: 'Date', width: 15 },
                { key: 'store_name', label: 'Store', width: 15 },
                { key: 'customer_name', label: 'Customer', width: 15 },
                { key: 'total', label: 'Net Total', width: 10, format: (v) => formatCurrency(v) },
                { key: 'tax', label: 'Tax', width: 10, format: (v) => formatCurrency(v) },
                { key: 'grand_total', label: 'Total', width: 10, format: (v) => formatCurrency(v) },
            ];
        }
        return [
            { key: 'date', label: 'Period', width: 20 },
            { key: 'total_tax', label: 'Tax Collected', width: 15, format: (v) => formatCurrency(v) },
            { key: 'order_count', label: 'Orders', width: 10 },
            { key: 'total_sales', label: 'Total Sales', width: 15, format: (v) => formatCurrency(v) },
            { key: 'effective_rate', label: 'Eff. Rate', width: 10, format: (v, r) => `${Number(r.total_sales > 0 ? (r.total_tax / r.total_sales) * 100 : 0).toFixed(2)}%` },
        ];
    }, [formatCurrency, viewMode]);

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
            { label: 'Total Tax', value: formatCurrency(summary.total_tax_collected) },
            { label: 'Total Sales', value: formatCurrency(summary.total_sales) },
            { label: 'Eff. Rate', value: `${Number(summary.effective_tax_rate || 0).toFixed(2)}%` },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Total Tax',
                value: formatCurrency(Number(summary.total_tax_collected || 0)),
                icon: <Calculator className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Orders',
                value: summary.total_orders || 0,
                icon: <ShoppingCart className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Total Sales',
                value: formatCurrency(Number(summary.total_sales || 0)),
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'Effective Rate',
                value: `${Number(summary.effective_tax_rate || 0).toFixed(2)}%`,
                icon: <Percent className="h-4 w-4 text-orange-600" />,
                bgColor: 'bg-orange-500',
                lightBg: 'bg-orange-50',
                textColor: 'text-orange-600',
            },
        ],
        [summary, formatCurrency]
    );

    const columns = useMemo(() => {
        if (viewMode === 'transactions') {
            return [
                { key: 'invoice', label: 'Invoice', sortable: true, render: (v: any) => <span className="font-semibold text-gray-900">{v}</span> },
                {
                    key: 'date',
                    label: 'Date',
                    sortable: true,
                    render: (v: any, r: any) => (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{v}</span>
                            <span className="text-xs text-gray-500">{r.time}</span>
                        </div>
                    ),
                },
                { key: 'store_name', label: 'Store', render: (v: any) => <span className="text-gray-700">{v}</span> },
                { key: 'customer_name', label: 'Customer', render: (v: any) => <span className="text-gray-700">{v}</span> },
                { key: 'total', label: 'Net Total', render: (v: any) => <span className="text-gray-900">{formatCurrency(v)}</span> },
                { key: 'tax', label: 'Tax', render: (v: any) => <span className="font-semibold text-red-600">{formatCurrency(v)}</span> },
                { key: 'grand_total', label: 'Total', sortable: true, render: (v: any) => <span className="font-bold text-gray-900">{formatCurrency(v)}</span> },
            ];
        }
        return [
            {
                key: 'date',
                label: 'Period',
                sortable: true,
                render: (v: any, r: any) => <span className="font-semibold text-gray-900">{v || r.category_name || '-'}</span>,
            },
            {
                key: 'total_tax',
                label: 'Tax Collected',
                sortable: true,
                render: (v: any) => <span className="font-semibold text-blue-600">{formatCurrency(v)}</span>,
            },
            {
                key: 'order_count',
                label: 'Orders',
                render: (v: any) => <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">{v || 0}</span>,
            },
            { key: 'total_sales', label: 'Sales', sortable: true, render: (v: any) => <span className="text-gray-900">{formatCurrency(v)}</span> },
            {
                key: 'effective_rate',
                label: 'Rate',
                render: (v: any, r: any) => {
                    const rate = v !== undefined ? v : r.total_sales > 0 ? (r.total_tax / r.total_sales) * 100 : 0;
                    return <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">{Number(rate || 0).toFixed(2)}%</span>;
                },
            },
        ];
    }, [formatCurrency, viewMode]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Tax Report"
                    reportDescription="View tax collection summary"
                    reportIcon={<Calculator className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-sky-600 to-sky-700"
                    data={items}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="tax_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6 space-y-4">
                    <div className="flex border-b border-gray-200 bg-white px-4 shadow-sm">
                        <button
                            onClick={() => setViewMode('summary')}
                            className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                                viewMode === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Summary
                        </button>
                        <button
                            onClick={() => setViewMode('transactions')}
                            className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                                viewMode === 'transactions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Transactions
                        </button>
                    </div>
                    <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search..." />
                </div>
                <ReusableTable
                    data={items}
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
                    emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Tax Data Found', description: 'No tax records match your current filters.' }}
                />
            </div>
        </div>
    );
};

export default TaxReportPage;
