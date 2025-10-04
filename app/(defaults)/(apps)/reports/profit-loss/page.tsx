'use client';

import UniversalFilter, { FilterOptions } from '@/__components/Universalfilters';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetProfitLossReportMutation } from '@/store/features/report/reportApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ArrowDownCircle, ArrowUpCircle, Download, Package, Printer, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ProfitLossReportPage = () => {
    const printRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const { currentStore, currentStoreId } = useCurrentStore();

    // Filter state
    const [filters, setFilters] = useState({
        store_id: currentStoreId || undefined,
        from_date: '',
        to_date: '',
    });

    // Use mutation hook
    const [getProfitLossReport, { data: response, isLoading, isError, error }] = useGetProfitLossReportMutation();
    console.log('Profit & Loss Report Response:', response);

    // Fetch data when filters change
    useEffect(() => {
        const queryParams = {
            ...(filters.store_id && filters.store_id !== 'all' && { store_id: filters.store_id }),
            ...(filters.from_date && { from_date: filters.from_date }),
            ...(filters.to_date && { to_date: filters.to_date }),
        };

        getProfitLossReport(queryParams);
    }, [filters.store_id, filters.from_date, filters.to_date, getProfitLossReport]);

    const reportData = response || null;

    // Calculate correct values
    const netPurchase = reportData ? reportData.total_purchase - reportData.total_purchase_discount - reportData.total_purchase_return : 0;
    const netSales = reportData ? reportData.total_sales - reportData.total_sell_discount - reportData.total_sell_return : 0;

    // CORRECT CALCULATION: COGS = Opening Stock + Net Purchase - Closing Stock
    const costOfGoodsSold = reportData ? reportData.opening_stock_purchase + netPurchase - reportData.closing_stock_purchase : 0;

    // CORRECT CALCULATION: Gross Profit = Net Sales - COGS
    const correctGrossProfit = netSales - costOfGoodsSold;

    // Handle filter changes
    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters({
            store_id: newFilters.storeId === 'all' ? undefined : newFilters.storeId,
            from_date: newFilters.dateRange?.startDate || '',
            to_date: newFilters.dateRange?.endDate || '',
        });
    };

    const parseNumeric = (value: any): number => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // Print functionality
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const headerHtml = headerRef.current?.innerHTML || '';
        const contentHtml = printRef.current?.innerHTML || '';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Profit & Loss Report</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: white; 
                    }
                    .header-content {
                        border-bottom: 2px solid #e5e7eb;
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
                    .section {
                        margin-bottom: 24px;
                        page-break-inside: avoid;
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #374151;
                        margin-bottom: 12px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #d1d5db;
                    }
                    .data-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 12px;
                        border-bottom: 1px solid #f3f4f6;
                    }
                    .total-row {
                        background-color: #f9fafb;
                        font-weight: bold;
                        font-size: 16px;
                        padding: 12px;
                        margin-top: 8px;
                        border: 2px solid #e5e7eb;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header-content">${headerHtml}</div>
                <div>${contentHtml}</div>
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
            const contentClone = printRef.current.cloneNode(true) as HTMLElement;

            tempContainer.appendChild(headerClone);
            tempContainer.appendChild(contentClone);
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
            pdf.save(`profit-loss-report-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const formatCurrency = (value: number) => {
        return `৳${value.toFixed(2)}`;
    };

    const DataRow = ({ label, value, isSubItem = false }: { label: string; value: number; isSubItem?: boolean }) => (
        <div className={`flex justify-between border-b border-gray-100 px-4 py-2 hover:bg-gray-50 ${isSubItem ? 'pl-8' : ''}`}>
            <span className={`${isSubItem ? 'text-sm text-gray-600' : 'font-medium text-gray-700'}`}>{label}</span>
            <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
        </div>
    );

    const SectionTotal = ({ label, value, variant = 'default' }: { label: string; value: number; variant?: 'default' | 'success' | 'danger' }) => {
        const colorClass = variant === 'success' ? 'text-green-600' : variant === 'danger' ? 'text-red-600' : 'text-gray-900';
        const bgClass = variant === 'success' ? 'bg-green-50' : variant === 'danger' ? 'bg-red-50' : 'bg-gray-100';

        return (
            <div className={`mt-2 flex justify-between px-4 py-3 ${bgClass} border-l-4 ${variant === 'success' ? 'border-green-500' : variant === 'danger' ? 'border-red-500' : 'border-gray-400'}`}>
                <span className={`font-bold ${colorClass}`}>{label}</span>
                <span className={`text-lg font-bold ${colorClass}`}>{formatCurrency(value)}</span>
            </div>
        );
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
                            <h2 className="text-2xl font-semibold text-gray-900">Profit & Loss Report</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {reportData?.date_range ? `Period: ${reportData.date_range.from} to ${reportData.date_range.to}` : 'Comprehensive financial performance analysis'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Universal Filter - Only Date Filter */}
                <UniversalFilter onFilterChange={handleFilterChange} showStoreFilter={false} showDateFilter={true} showSearch={false} className="mb-6" />

                {/* Error Message */}
                {isError && (
                    <div className="mb-6 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading profit & loss report</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{(error as any)?.data?.message || 'Failed to fetch report data. Please try again.'}</p>
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
                            disabled={isLoading || !reportData}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isLoading || !reportData}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {reportData && (
                    <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                                        <ShoppingCart className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Net Sales</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{formatCurrency(netSales)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">COGS</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{formatCurrency(costOfGoodsSold)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                                        <ArrowUpCircle className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Opening Stock</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{formatCurrency(parseNumeric(reportData.opening_stock_purchase))}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${correctGrossProfit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {correctGrossProfit >= 0 ? <TrendingUp className="h-5 w-5 text-white" /> : <TrendingDown className="h-5 w-5 text-white" />}
                                    </div>
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">Gross Profit</dt>
                                        <dd className={`text-lg font-semibold ${correctGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(correctGrossProfit)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Content */}
                <div ref={printRef} className="space-y-6">
                    {isLoading ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                            <div className="text-gray-500">Loading profit & loss report...</div>
                        </div>
                    ) : !reportData ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                            <div className="text-gray-500">No data available. Please select a date range and try again.</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Stock Information */}
                            <div className="rounded-lg bg-white shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                        <Package className="mr-2 h-5 w-5 text-blue-600" />
                                        Stock Information
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-1">
                                        <DataRow label="Opening Stock (Purchase)" value={parseNumeric(reportData.opening_stock_purchase)} />
                                        <DataRow label="Closing Stock (Purchase)" value={parseNumeric(reportData.closing_stock_purchase)} />
                                        <div className="my-3 border-t border-gray-200"></div>
                                        <DataRow label="Opening Stock (Sale)" value={parseNumeric(reportData.opening_stock_sale)} />
                                        <DataRow label="Closing Stock (Sale)" value={parseNumeric(reportData.closing_stock_sale)} />
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Information */}
                            <div className="rounded-lg bg-white shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                        <ArrowDownCircle className="mr-2 h-5 w-5 text-orange-600" />
                                        Purchase Information
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-1">
                                        <DataRow label="Total Purchase" value={parseNumeric(reportData.total_purchase)} />
                                        <DataRow label="Purchase Discount" value={parseNumeric(reportData.total_purchase_discount)} isSubItem />
                                        <DataRow label="Purchase Return" value={parseNumeric(reportData.total_purchase_return)} isSubItem />
                                        <SectionTotal label="Net Purchase" value={netPurchase} />
                                    </div>
                                </div>
                            </div>

                            {/* Sales Information */}
                            <div className="rounded-lg bg-white shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                        <ShoppingCart className="mr-2 h-5 w-5 text-green-600" />
                                        Sales Information
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-1">
                                        <DataRow label="Total Sales" value={parseNumeric(reportData.total_sales)} />
                                        <DataRow label="Sales Discount" value={parseNumeric(reportData.total_sell_discount)} isSubItem />
                                        <DataRow label="Sales Return" value={parseNumeric(reportData.total_sell_return)} isSubItem />
                                        <SectionTotal label="Net Sales" value={netSales} />
                                    </div>
                                </div>
                            </div>

                            {/* Cost of Goods Sold */}
                            <div className="rounded-lg bg-white shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                        <Package className="mr-2 h-5 w-5 text-purple-600" />
                                        Cost of Goods Sold (COGS)
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-1">
                                        <DataRow label="Opening Stock" value={parseNumeric(reportData.opening_stock_purchase)} />
                                        <DataRow label="Add: Net Purchase" value={netPurchase} isSubItem />
                                        <DataRow label="Less: Closing Stock" value={parseNumeric(reportData.closing_stock_purchase)} isSubItem />
                                        <SectionTotal label="Cost of Goods Sold" value={costOfGoodsSold} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gross Profit Calculation */}
                    {reportData && (
                        <div className="rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                    {correctGrossProfit >= 0 ? <TrendingUp className="mr-2 h-5 w-5 text-green-600" /> : <TrendingDown className="mr-2 h-5 w-5 text-red-600" />}
                                    Gross Profit Calculation
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="space-y-1">
                                    <DataRow label="Net Sales" value={netSales} />
                                    <DataRow label="Less: Cost of Goods Sold" value={costOfGoodsSold} isSubItem />
                                    <SectionTotal label={correctGrossProfit >= 0 ? 'Gross Profit' : 'Gross Loss'} value={correctGrossProfit} variant={correctGrossProfit >= 0 ? 'success' : 'danger'} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Final Summary */}
                    {reportData && (
                        <div className={`rounded-lg p-6 shadow-lg ${correctGrossProfit >= 0 ? 'border-2 border-green-200 bg-green-50' : 'border-2 border-red-200 bg-red-50'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{correctGrossProfit >= 0 ? 'Total Gross Profit' : 'Total Gross Loss'}</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Period: {reportData.date_range.from} to {reportData.date_range.to}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500">Formula: Net Sales - (Opening Stock + Net Purchase - Closing Stock)</p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-3xl font-bold ${correctGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(Math.abs(correctGrossProfit))}</div>
                                    <div className="mt-2 flex items-center justify-end">
                                        {correctGrossProfit >= 0 ? <TrendingUp className="h-6 w-6 text-green-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfitLossReportPage;
