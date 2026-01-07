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
    const [sortField, setSortField] = useState('period');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

    const items = useMemo(() => reportData?.data?.items || [], [reportData]);
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
            return result?.data?.items || [];
        } catch (e) {
            console.error('Export failed:', e);
            return items;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, items, getTaxReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'period', label: 'Period', width: 20 },
            { key: 'tax_collected', label: 'Tax Collected', width: 15, format: (v) => formatCurrency(v) },
            { key: 'orders_count', label: 'Orders', width: 10 },
            { key: 'total_sales', label: 'Total Sales', width: 15, format: (v) => formatCurrency(v) },
            { key: 'taxable_sales', label: 'Taxable Sales', width: 15, format: (v) => formatCurrency(v) },
            { key: 'non_taxable_sales', label: 'Non-Taxable', width: 15, format: (v) => formatCurrency(v) },
            { key: 'effective_rate', label: 'Eff. Rate', width: 10, format: (v) => `${Number(v || 0).toFixed(2)}%` },
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
            { label: 'Total Tax', value: formatCurrency(summary.total_tax_collected) },
            { label: 'Total Sales', value: formatCurrency(summary.total_sales) },
            { label: 'Eff. Rate', value: `${Number(summary.effective_tax_rate || 0).toFixed(2)}%` },
        ],
        [summary]
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
        [summary]
    );

    const columns = useMemo(
        () => [
            { key: 'period', label: 'Period', sortable: true, render: (v: any) => <span className="font-semibold text-gray-900">{v}</span> },
            { key: 'tax_collected', label: 'Tax Collected', sortable: true, render: (v: any) => <span className="font-semibold text-blue-600">{formatCurrency(v)}</span> },
            {
                key: 'orders_count',
                label: 'Orders',
                render: (v: any) => <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">{v}</span>,
            },
            { key: 'total_sales', label: 'Sales', sortable: true, render: (v: any) => <span className="text-gray-900">{formatCurrency(v)}</span> },
            { key: 'taxable_sales', label: 'Taxable Sales', render: (v: any) => <span className="text-gray-700">{formatCurrency(v)}</span> },
            { key: 'non_taxable_sales', label: 'Non-Taxable', render: (v: any) => <span className="text-gray-500">{formatCurrency(v)}</span> },
            { key: 'items_count', label: 'Items', render: (v: any) => <span className="text-gray-700">{value}</span> },
            {
                key: 'effective_rate',
                label: 'Rate',
                render: (v: any) => <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">{Number(v || 0).toFixed(2)}%</span>,
            },
        ],
        []
    );

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
                <div className="mb-6">
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
