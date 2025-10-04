'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetExpensesQuery } from '@/store/features/expense/expenseApi';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ChevronLeft, ChevronRight, DollarSign, Download, FileText, Printer, TrendingUp } from 'lucide-react';
import { useRef, useState } from 'react';
import UniversalFilter, { FilterOptions } from '@/__components/Universalfilters';
import { useGetJournalsQuery } from '@/store/features/journals/journals';

const ExpenseReportPage = () => {
    const printRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const { currentStoreId } = useCurrentStore();

    // Fetch data for filter options
    const { data: ledgersResponse } = useGetLedgersQuery({ per_page: 1000 });
    const { data: journalsResponse } = useGetJournalsQuery({ per_page: 1000 });
    const { data: storesResponse } = useFullStoreListWithFilterQuery({});
    const ledgers = ledgersResponse?.data?.data || [];
    const journals = journalsResponse?.data || [];
    const stores = storesResponse?.data || [];

    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        store_id: currentStoreId || undefined,
        ledger_id: undefined,
        journal_id: undefined,
        from_date: '',
        to_date: '',
        per_page: 15,
        page: 1,
    });

    // Fetch expenses with filters
    const { data: response, isLoading, error } = useGetExpensesQuery(filters);
    const expenses = response?.data?.data || [];
    const pagination = response?.data;

    // Calculate summary statistics
    const summary = {
        total: expenses?.length || 0,
        totalAmount: expenses.reduce((sum, exp) => sum + parseFloat(exp.debit || 0), 0),
        avgExpense: expenses.length > 0 ? expenses.reduce((sum, exp) => sum + parseFloat(exp.debit || 0), 0) / expenses.length : 0,
    };

    // Handle filter changes from UniversalFilter
    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters((prev) => ({
            ...prev,
            search: newFilters.search || '',
            store_id: newFilters.storeId === 'all' ? undefined : newFilters.storeId,
            ledger_id: newFilters.ledgerId === 'all' ? undefined : newFilters.ledgerId,
            journal_id: newFilters.journalId === 'all' ? undefined : newFilters.journalId,
            from_date: newFilters.dateRange?.startDate || '',
            to_date: newFilters.dateRange?.endDate || '',
            page: 1, // Reset to first page when filters change
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
                <title>Expense Report</title>
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
        if (!expenses.length) return;

        const headers = ['ID', 'Title', 'Notes', 'Amount', 'Balance', 'Store', 'Ledger', 'Journal', 'User', 'Date'];

        const csvContent = [
            headers.join(','),
            ...expenses.map((expense) =>
                [
                    expense.id,
                    `"${expense.title || ''}"`,
                    `"${expense.notes || ''}"`,
                    expense.debit,
                    expense.balance,
                    `"${expense.ledger?.store?.store_name || 'N/A'}"`,
                    `"${expense.ledger?.name || 'N/A'}"`,
                    `"${expense.journal?.name || 'N/A'}"`,
                    `"${expense.user?.name || 'N/A'}"`,
                    `"${new Date(expense.created_at).toLocaleDateString()}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `expense-report-${new Date().toISOString().split('T')[0]}.csv`);
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

            const headerClone = headerRef.current.cloneNode(true);
            const tableClone = printRef.current.cloneNode(true);

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
            pdf.save(`expense-report-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    // Handle per page change
    const handlePerPageChange = (perPage) => {
        setFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div ref={headerRef}>
                <div className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="store-header text-center">
                            <h1 className="store-name text-3xl font-bold text-gray-900">Agora</h1>
                            <p className="mt-2 text-sm text-gray-600">Store Management System</p>
                        </div>
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <h2 className="text-2xl font-semibold text-gray-900">Expense Report</h2>
                            <p className="mt-1 text-sm text-gray-600">Track and analyze all business expenses</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Universal Filter */}
                <UniversalFilter
                    onFilterChange={handleFilterChange}
                    placeholder="Search by title, notes, or user..."
                    showStoreFilter={true}
                    showDateFilter={true}
                    showSearch={true}
                    customFilters={[
                        {
                            key: 'ledgerId',
                            label: 'Ledger',
                            type: 'select',
                            options: ledgers.map((ledger) => ({
                                value: ledger.id,
                                label: ledger.title || `Ledger ${ledger.id}`,
                            })),
                            icon: <FileText className="h-5 w-5 text-gray-400" />,
                            defaultValue: 'all',
                        },
                    ]}
                    className="mb-6"
                />

                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">Total: {pagination?.total || 0} expenses</div>
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
                <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Total Expenses</dt>
                                    <dd className="text-lg font-semibold text-gray-900">{summary.total}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">Total Amount</dt>
                                    <dd className="text-lg font-semibold text-gray-900">${summary.totalAmount.toFixed(2)}</dd>
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
                                    <dt className="truncate text-sm font-medium text-gray-500">Average Expense</dt>
                                    <dd className="text-lg font-semibold text-gray-900">${summary.avgExpense.toFixed(2)}</dd>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Notes</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ledger</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Store</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">
                                            Loading expenses...
                                        </td>
                                    </tr>
                                ) : expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No expenses found
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{expense.title || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="max-w-xs truncate" title={expense.notes}>
                                                    {expense.notes || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">${parseFloat(expense.debit || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-900">${parseFloat(expense.balance || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{expense.ledger?.title || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{expense.ledger?.store?.store_name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div>
                                                    <div className="font-medium text-gray-900">{expense.user?.name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{expense.user?.email || ''}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div>
                                                    <div>{new Date(expense.created_at).toLocaleDateString()}</div>
                                                    <div className="text-xs text-gray-400">{new Date(expense.created_at).toLocaleTimeString()}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
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
                                    disabled={filters.page === pagination.last_page}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> results
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
                                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                                            .filter((page) => page === 1 || page === pagination.last_page || Math.abs(page - filters.page) <= 1)
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
                                            disabled={filters.page === pagination.last_page}
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

export default ExpenseReportPage;
