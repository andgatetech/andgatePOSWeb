'use client';

import UniversalFilter, { FilterOptions } from '@/__components/Universalfilters';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetIncomeReportMutation } from '@/store/features/report/reportApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ChevronLeft, ChevronRight, CreditCard, DollarSign, Download, FileText, Package, Printer, Store, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const IncomeReportPage = () => {
    const printRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const { currentStore, currentStoreId } = useCurrentStore();

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        store_id: currentStoreId || undefined,
        category_id: undefined,
        brand_id: undefined,
        from_date: '',
        to_date: '',
        per_page: 15,
        page: 1,
    });

    // Use mutation hook
    const [getIncomeReport, { data: response, isLoading, isError, error }] = useGetIncomeReportMutation();

    // Fetch data when filters change
    useEffect(() => {
        const queryParams = {
            ...(filters.store_id && { store_id: filters.store_id }),
            ...(filters.category_id && filters.category_id !== 'all' && { category_id: filters.category_id }),
            ...(filters.brand_id && filters.brand_id !== 'all' && { brand_id: filters.brand_id }),
            ...(filters.from_date && { from_date: filters.from_date }),
            ...(filters.to_date && { to_date: filters.to_date }),
        };

        getIncomeReport(queryParams);
    }, [filters.store_id, filters.category_id, filters.brand_id, filters.from_date, filters.to_date, getIncomeReport]);

    const records = response?.records || [];
    const totalIncome = response?.total || 0;

    // Apply search filter on frontend
    const filteredRecords = filters.search
        ? records.filter(
              (record) =>
                  record.reference_no.toLowerCase().includes(filters.search.toLowerCase()) ||
                  record.income_for.toLowerCase().includes(filters.search.toLowerCase()) ||
                  record.store.toLowerCase().includes(filters.search.toLowerCase()) ||
                  record.category.toLowerCase().includes(filters.search.toLowerCase()) ||
                  record.brand.toLowerCase().includes(filters.search.toLowerCase())
          )
        : records;

    // Manual pagination
    const totalRecords = filteredRecords.length;
    const totalPages = Math.ceil(totalRecords / filters.per_page);
    const startIndex = (filters.page - 1) * filters.per_page;
    const endIndex = startIndex + filters.per_page;
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
        totalIncome: totalIncome,
        totalTransactions: filteredRecords.length,
        averageIncome: filteredRecords.length > 0 ? totalIncome / filteredRecords.length : 0,
        cashPayments: filteredRecords.filter((r) => r.payment_type?.toLowerCase() === 'cash').length,
        digitalPayments: filteredRecords.filter((r) => r.payment_type?.toLowerCase() !== 'cash').length,
    };

    // Handle filter changes
    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters((prev) => ({
            ...prev,
            search: newFilters.search || '',
            store_id: newFilters.storeId === 'all' ? undefined : newFilters.storeId,
            category_id: newFilters.categoryId === 'all' ? undefined : newFilters.categoryId,
            brand_id: newFilters.brandId === 'all' ? undefined : newFilters.brandId,
            from_date: newFilters.dateRange?.startDate || '',
            to_date: newFilters.dateRange?.endDate || '',
            page: 1,
        }));
    };

    // Print functionality
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const headerHtml = headerRef.current?.innerHTML || '';
        const tableHtml = printRef.current?.innerHTML || '';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Income Report</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: white; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f9fafb; 
                        font-weight: bold; 
                    }
                    .header-content {
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .store-header {
                        text-align: center;
                        margin-bottom: 24px;
                    }
                    .store-name {
                        font-size: 28px;
                        font-weight: bold;
                        color: #111827;
                        margin: 0;
                    }
                    .report-title {
                        font-size: 24px;
                        font-weight: 600;
                        color: #111827;
                        margin-top: 16px;
                        padding-top: 16px;
                        border-top: 1px solid #e5e7eb;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header-content">${headerHtml}</div>
                <div>${tableHtml}</div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    // Export to CSV
    const handleExportCSV = () => {
        if (!filteredRecords.length) return;

        const headers = ['SL', 'Reference No', 'Income For', 'Store', 'Category', 'Brand', 'Payment Type', 'Amount', 'Income Date'];

        const csvContent = [
            headers.join(','),
            ...filteredRecords.map((record) =>
                [
                    record.sl,
                    `"${record.reference_no}"`,
                    `"${record.income_for}"`,
                    `"${record.store}"`,
                    `"${record.category}"`,
                    `"${record.brand}"`,
                    `"${record.payment_type}"`,
                    record.amount.toFixed(2),
                    `"${record.income_date}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `income-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download PDF functionality
    const handleDownloadPDF = async () => {
        if (!printRef.current || !headerRef.current) return;

        try {
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm';
            tempContainer.style.backgroundColor = 'white';
            tempContainer.style.padding = '20px';
            tempContainer.style.fontFamily = 'Arial, sans-serif';

            const headerClone = headerRef.current.cloneNode(true) as HTMLElement;
            const tableClone = printRef.current.cloneNode(true) as HTMLElement;

            tempContainer.appendChild(headerClone);
            tempContainer.appendChild(tableClone);
            document.body.appendChild(tempContainer);

            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
            });

            document.body.removeChild(tempContainer);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`income-report-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    // Handle per page change
    const handlePerPageChange = (perPage: number) => {
        setFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div ref={headerRef}>
                <div className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="store-header text-center">
                            <h1 className="store-name text-3xl font-bold text-gray-900">{currentStore?.store_name || 'Agora'}</h1>
                            <p className="mt-2 text-sm text-gray-600">Store Management System</p>
                        </div>
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <h2 className="text-2xl font-semibold text-gray-900">Income Report</h2>
                            <p className="mt-1 text-sm text-gray-600">Track and analyze all income transactions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Universal Filter */}
                <UniversalFilter
                    onFilterChange={handleFilterChange}
                    placeholder="Search by invoice, customer, store, category, or brand..."
                    showStoreFilter={true}
                    showDateFilter={true}
                    showSearch={true}
                    showCategoryFilter={true}
                    showBrandFilter={true}
                    className="mb-6"
                />

                {/* Error Message */}
                {isError && (
                    <div className="mb-6 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading income report</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error?.data?.message || 'Failed to fetch income data. Please try again.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handlePrint}
                            disabled={isLoading || paginatedRecords.length === 0}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isLoading || paginatedRecords.length === 0}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={handleExportCSV}
                            disabled={isLoading || paginatedRecords.length === 0}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">Total: {totalRecords} transactions</div>
                        <select
                            value={filters.per_page}
                            onChange={(e) => handlePerPageChange(Number(e.target.value))}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value={10}>10 per page</option>
                            <option value={15}>15 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Total Income</dt>
                                    <dd className="text-lg font-semibold text-gray-900">৳{summary.totalIncome.toFixed(2)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                                    <Package className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Total Transactions</dt>
                                    <dd className="text-lg font-semibold text-gray-900">{summary.totalTransactions}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Average Income</dt>
                                    <dd className="text-lg font-semibold text-gray-900">৳{summary.averageIncome.toFixed(2)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
                                    <CreditCard className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Cash / Digital</dt>
                                    <dd className="text-lg font-semibold text-gray-900">
                                        {summary.cashPayments} / {summary.digitalPayments}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div ref={printRef} className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reference No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Income For</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Store</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Brand</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payment Type</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">
                                            Loading income data...
                                        </td>
                                    </tr>
                                ) : paginatedRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No income records found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRecords.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-blue-600">{record.reference_no}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{record.income_for}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Store className="mr-2 h-4 w-4 text-gray-400" />
                                                    {record.store}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{record.category}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{record.brand}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        record.payment_type?.toLowerCase() === 'cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}
                                                >
                                                    {record.payment_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">৳{record.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{record.income_date}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {paginatedRecords.length > 0 && (
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                            Total Income:
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-green-600">৳{summary.totalIncome.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(filters.page - 1)}
                                    disabled={filters.page === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    disabled={filters.page === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalRecords)}</span> of{' '}
                                        <span className="font-medium">{totalRecords}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                        <button
                                            onClick={() => handlePageChange(filters.page - 1)}
                                            disabled={filters.page === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter((page) => page === 1 || page === totalPages || Math.abs(page - filters.page) <= 1)
                                            .map((page, index, array) => {
                                                if (index > 0 && array[index - 1] < page - 1) {
                                                    return [
                                                        <span
                                                            key={`ellipsis-${page}`}
                                                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                                                        >
                                                            ...
                                                        </span>,
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                filters.page === page ? 'z-10 bg-blue-600 text-white focus:ring-blue-500' : 'text-gray-900'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>,
                                                    ];
                                                }
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                            filters.page === page ? 'z-10 bg-blue-600 text-white focus:ring-blue-500' : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                        <button
                                            onClick={() => handlePageChange(filters.page + 1)}
                                            disabled={filters.page === totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncomeReportPage;
