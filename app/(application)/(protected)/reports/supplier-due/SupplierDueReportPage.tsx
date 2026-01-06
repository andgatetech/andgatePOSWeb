'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import PurchaseReportFilter from '@/components/filters/reports/PurchaseReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSupplierDueReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, Banknote, FileText, Receipt, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SupplierDueReportPage = () => {
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('due');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getSupplierDueReport, { data: reportData, isLoading }] = useGetSupplierDueReportMutation();
    const [getSupplierDueReportForExport] = useGetSupplierDueReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getSupplierDueReport(queryParams);
        }
    }, [queryParams]);

    const orders = useMemo(() => reportData?.data?.orders || [], [reportData]);
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
            const result = await getSupplierDueReportForExport(exportParams).unwrap();
            return result?.data?.orders || [];
        } catch (e) {
            console.error('Export failed:', e);
            return orders;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, orders, getSupplierDueReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'reference', label: 'Reference', width: 15 },
            { key: 'supplier', label: 'Supplier', width: 20 },
            { key: 'total_amount', label: 'Total', width: 15, format: (v) => `৳${Number(v || 0).toLocaleString()}` },
            { key: 'paid', label: 'Paid', width: 15, format: (v) => `৳${Number(v || 0).toLocaleString()}` },
            { key: 'due', label: 'Due', width: 15, format: (v) => `৳${Number(v || 0).toLocaleString()}` },
            { key: 'status', label: 'Status', width: 10 },
            { key: 'created_at', label: 'Date', width: 12, format: (v) => (v ? new Date(v).toLocaleDateString('en-GB') : '') },
        ],
        []
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
            { label: 'Orders with Due', value: summary.total_orders_with_due || 0 },
            { label: 'Total Due', value: `৳${Number(summary.total_due || 0).toLocaleString()}` },
        ],
        [summary]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: 'Orders with Due',
                value: summary.total_orders_with_due || 0,
                icon: <Receipt className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Total Amount',
                value: `৳${Number(summary.total_amount || 0).toLocaleString()}`,
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'Total Paid',
                value: `৳${Number(summary.total_paid || 0).toLocaleString()}`,
                icon: <TrendingUp className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Total Due',
                value: `৳${Number(summary.total_due || 0).toLocaleString()}`,
                icon: <AlertCircle className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
        ],
        [summary]
    );

    const columns = useMemo(
        () => [
            { key: 'reference', label: 'Reference', sortable: true, render: (v: any) => <span className="font-mono text-sm font-semibold text-gray-900">{v}</span> },
            { key: 'supplier', label: 'Supplier', render: (v: any) => <span className="text-sm text-gray-700">{v || 'N/A'}</span> },
            { key: 'total_amount', label: 'Total Amount', sortable: true, render: (v: any) => <span className="font-semibold text-gray-900">৳{Number(v || 0).toLocaleString()}</span> },
            { key: 'paid', label: 'Paid', sortable: true, render: (v: any) => <span className="font-semibold text-green-600">৳{Number(v || 0).toLocaleString()}</span> },
            { key: 'due', label: 'Due', sortable: true, render: (v: any) => <span className="font-bold text-red-600">৳{Number(v || 0).toLocaleString()}</span> },
            {
                key: 'status',
                label: 'Status',
                render: (v: any) => {
                    const s = v?.toLowerCase();
                    let c = 'bg-gray-100 text-gray-800';
                    if (s === 'paid') c = 'bg-green-100 text-green-800';
                    else if (s === 'partial') c = 'bg-yellow-100 text-yellow-800';
                    else if (s === 'pending') c = 'bg-red-100 text-red-800';
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${c}`}>{v}</span>;
                },
            },
            {
                key: 'created_at',
                label: 'Order Date',
                sortable: true,
                render: (v: any) => (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{new Date(v).toLocaleDateString('en-GB')}</span>
                        <span className="text-xs text-gray-500">{new Date(v).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ),
            },
            {
                key: 'due_date',
                label: 'Due Date',
                render: (v: any) => (v ? <span className="text-sm text-gray-700">{new Date(v).toLocaleDateString('en-GB')}</span> : <span className="text-xs text-gray-400">Not set</span>),
            },
        ],
        []
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Supplier Due Report"
                    reportDescription="View outstanding supplier payments"
                    reportIcon={<AlertCircle className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-red-600 to-red-700"
                    data={orders}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="supplier_due_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <PurchaseReportFilter onFilterChange={handleFilterChange} />
                </div>
                <ReusableTable
                    data={orders}
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
                    emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Dues Found', description: 'All supplier payments are up to date!' }}
                />
            </div>
        </div>
    );
};

export default SupplierDueReportPage;
