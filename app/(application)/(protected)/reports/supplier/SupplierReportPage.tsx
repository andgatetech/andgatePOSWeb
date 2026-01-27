'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import ReusableTable from '@/components/common/ReusableTable';
import PurchaseReportFilter from '@/components/filters/reports/PurchaseReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSupplierReportMutation } from '@/store/features/reports/reportApi';
import { Banknote, FileText, Package, Receipt, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SupplierReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [getSupplierReport, { data: reportData, isLoading }] = useGetSupplierReportMutation();
    const [getSupplierReportForExport] = useGetSupplierReportMutation();

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
            getSupplierReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const orders = useMemo(() => reportData?.data?.pos_orders || [], [reportData]);
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
            const result = await getSupplierReportForExport(exportParams).unwrap();
            return result?.data?.pos_orders || [];
        } catch (e) {
            console.error('Export failed:', e);
            return orders;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, orders, getSupplierReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'reference', label: 'Reference', width: 15 },
            { key: 'supplier', label: 'Supplier', width: 20 },
            { key: 'total_items', label: 'Items', width: 10 },
            { key: 'amount', label: 'Amount', width: 15, format: (v) => formatCurrency(v) },
            { key: 'payment_method', label: 'Payment', width: 12 },
            { key: 'status', label: 'Status', width: 12 },
            { key: 'created_at', label: 'Date', width: 12, format: (v) => (v ? new Date(v).toLocaleDateString('en-GB') : '') },
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
            { label: 'Total Orders', value: summary.total_orders || 0 },
            { label: 'Total Amount', value: formatCurrency(summary.total_amount) },
            { label: 'Total Due', value: formatCurrency(summary.total_due) },
        ],
        [summary, formatCurrency]
    );

    const summaryItems = useMemo(
        () => [
            { label: 'Total Orders', value: summary.total_orders || 0, icon: <Receipt className="h-4 w-4 text-blue-600" />, bgColor: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
            {
                label: 'Total Amount',
                value: formatCurrency(summary.total_amount),
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: 'Total Paid',
                value: formatCurrency(summary.total_paid),
                icon: <Banknote className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: 'Total Due',
                value: formatCurrency(summary.total_due),
                icon: <Banknote className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
        ],
        [summary, formatCurrency]
    );

    const columns = useMemo(
        () => [
            { key: 'reference', label: 'Reference', sortable: true, render: (v: any) => <span className="font-mono text-sm font-semibold text-gray-900">{v || 'N/A'}</span> },
            {
                key: 'supplier',
                label: 'Supplier',
                render: (v: any) => (
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{v || 'N/A'}</span>
                    </div>
                ),
            },
            {
                key: 'total_items',
                label: 'Items',
                sortable: true,
                render: (v: any) => (
                    <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{v}</span>
                    </div>
                ),
            },
            { key: 'amount', label: 'Amount', sortable: true, render: (v: any) => <span className="font-semibold text-gray-900">{formatCurrency(v)}</span> },
            {
                key: 'payment_method',
                label: 'Payment Method',
                render: (v: any) =>
                    !v || v === 'N/A' ? (
                        <span className="text-xs text-gray-400">Not specified</span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-800">{v}</span>
                    ),
            },
            {
                key: 'status',
                label: 'Status',
                render: (v: any) => {
                    const s = v?.toLowerCase();
                    let c = 'bg-gray-100 text-gray-800';
                    if (s === 'received') c = 'bg-green-100 text-green-800';
                    else if (s === 'ordered') c = 'bg-blue-100 text-blue-800';
                    else if (s === 'pending') c = 'bg-yellow-100 text-yellow-800';
                    else if (s === 'cancelled') c = 'bg-red-100 text-red-800';
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
        ],
        [formatCurrency]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Supplier Report"
                    reportDescription="View all supplier purchase orders"
                    reportIcon={<Users className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-cyan-600 to-cyan-700"
                    data={orders}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="supplier_report"
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
                    emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: 'No Orders Found', description: 'No supplier orders match your current filters.' }}
                />
            </div>
        </div>
    );
};

export default SupplierReportPage;
