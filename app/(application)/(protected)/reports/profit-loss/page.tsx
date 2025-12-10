// 'use client';

// import UniversalFilter, { FilterOptions } from '@/__components/Universalfilters';
// import { useCurrentStore } from '@/hooks/useCurrentStore';
// import { useGetProfitLossReportMutation } from '@/store/features/reports/reportApi';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import { ArrowDownCircle, ArrowUpCircle, Download, Package, Printer, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';

// const ProfitLossReportPage = () => {
//     const printRef = useRef<HTMLDivElement>(null);
//     const headerRef = useRef<HTMLDivElement>(null);
//     const { currentStore, currentStoreId } = useCurrentStore();

//     // Filter state
//     const [filters, setFilters] = useState({
//         store_id: currentStoreId || undefined,
//         from_date: '',
//         to_date: '',
//     });

//     // Use mutation hook
//     const [getProfitLossReport, { data: response, isLoading, isError, error }] = useGetProfitLossReportMutation();
//     console.log('Profit & Loss Report Response:', response);

//     // Fetch data when filters change
//     useEffect(() => {
//         const queryParams = {
//             ...(filters.store_id && filters.store_id !== 'all' && { store_id: filters.store_id }),
//             ...(filters.from_date && { from_date: filters.from_date }),
//             ...(filters.to_date && { to_date: filters.to_date }),
//         };

//         getProfitLossReport(queryParams);
//     }, [filters.store_id, filters.from_date, filters.to_date, getProfitLossReport]);

//     const reportData = response || null;

//     // Calculate correct values
//     const netPurchase = reportData ? reportData.total_purchase - reportData.total_purchase_discount - reportData.total_purchase_return : 0;
//     const netSales = reportData ? reportData.total_sales - reportData.total_sell_discount - reportData.total_sell_return : 0;

//     // CORRECT CALCULATION: COGS = Opening Stock + Net Purchase - Closing Stock
//     const costOfGoodsSold = reportData ? reportData.opening_stock_purchase + netPurchase - reportData.closing_stock_purchase : 0;

//     // CORRECT CALCULATION: Gross Profit = Net Sales - COGS
//     const correctGrossProfit = netSales - costOfGoodsSold;

//     // Handle filter changes
//     const handleFilterChange = (newFilters: FilterOptions) => {
//         setFilters({
//             store_id: newFilters.storeId === 'all' ? undefined : newFilters.storeId,
//             from_date: newFilters.dateRange?.startDate || '',
//             to_date: newFilters.dateRange?.endDate || '',
//         });
//     };

//     const parseNumeric = (value: any): number => {
//         const num = parseFloat(value);
//         return isNaN(num) ? 0 : num;
//     };

//     // Print functionality
//     const handlePrint = () => {
//         const printWindow = window.open('', '_blank');
//         if (!printWindow) return;

//         const headerHtml = headerRef.current?.innerHTML || '';
//         const contentHtml = printRef.current?.innerHTML || '';

//         const printContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <title>Profit & Loss Report</title>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         margin: 0;
//                         padding: 20px;
//                         background: white;
//                     }
//                     .header-content {
//                         border-bottom: 2px solid #e5e7eb;
//                         padding-bottom: 20px;
//                         margin-bottom: 20px;
//                     }
//                     .store-header {
//                         text-align: center;
//                         margin-bottom: 24px;
//                     }
//                     .store-name {
//                         font-size: 28px;
//                         font-weight: bold;
//                         color: #111827;
//                         margin: 0;
//                     }
//                     .section {
//                         margin-bottom: 24px;
//                         page-break-inside: avoid;
//                     }
//                     .section-title {
//                         font-size: 18px;
//                         font-weight: 600;
//                         color: #374151;
//                         margin-bottom: 12px;
//                         padding-bottom: 8px;
//                         border-bottom: 1px solid #d1d5db;
//                     }
//                     .data-row {
//                         display: flex;
//                         justify-content: space-between;
//                         padding: 8px 12px;
//                         border-bottom: 1px solid #f3f4f6;
//                     }
//                     .total-row {
//                         background-color: #f9fafb;
//                         font-weight: bold;
//                         font-size: 16px;
//                         padding: 12px;
//                         margin-top: 8px;
//                         border: 2px solid #e5e7eb;
//                     }
//                     @media print {
//                         body { margin: 0; }
//                         .no-print { display: none !important; }
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="header-content">${headerHtml}</div>
//                 <div>${contentHtml}</div>
//             </body>
//             </html>
//         `;

//         printWindow.document.write(printContent);
//         printWindow.document.close();

//         setTimeout(() => {
//             printWindow.print();
//             printWindow.close();
//         }, 500);
//     };

//     // Download PDF functionality
//     const handleDownloadPDF = async () => {
//         if (!printRef.current || !headerRef.current) return;

//         try {
//             const tempContainer = document.createElement('div');
//             tempContainer.style.position = 'absolute';
//             tempContainer.style.left = '-9999px';
//             tempContainer.style.top = '0';
//             tempContainer.style.width = '210mm';
//             tempContainer.style.backgroundColor = 'white';
//             tempContainer.style.padding = '20px';
//             tempContainer.style.fontFamily = 'Arial, sans-serif';

//             const headerClone = headerRef.current.cloneNode(true) as HTMLElement;
//             const contentClone = printRef.current.cloneNode(true) as HTMLElement;

//             tempContainer.appendChild(headerClone);
//             tempContainer.appendChild(contentClone);
//             document.body.appendChild(tempContainer);

//             const canvas = await html2canvas(tempContainer, {
//                 scale: 2,
//                 useCORS: true,
//                 allowTaint: true,
//                 backgroundColor: '#ffffff',
//             });

//             document.body.removeChild(tempContainer);

//             const imgData = canvas.toDataURL('image/png');
//             const pdf = new jsPDF({
//                 orientation: 'portrait',
//                 unit: 'mm',
//                 format: 'a4',
//             });

//             const pdfWidth = pdf.internal.pageSize.getWidth();
//             const pdfHeight = pdf.internal.pageSize.getHeight();
//             const imgWidth = canvas.width;
//             const imgHeight = canvas.height;
//             const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
//             const imgX = (pdfWidth - imgWidth * ratio) / 2;
//             const imgY = 10;

//             pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
//             pdf.save(`profit-loss-report-${new Date().toISOString().split('T')[0]}.pdf`);
//         } catch (error) {
//             console.error('Error generating PDF:', error);
//         }
//     };

//     const formatCurrency = (value: number) => {
//         return `৳${value.toFixed(2)}`;
//     };

//     const DataRow = ({ label, value, isSubItem = false }: { label: string; value: number; isSubItem?: boolean }) => (
//         <div className={`flex justify-between border-b border-gray-100 px-4 py-2 hover:bg-gray-50 ${isSubItem ? 'pl-8' : ''}`}>
//             <span className={`${isSubItem ? 'text-sm text-gray-600' : 'font-medium text-gray-700'}`}>{label}</span>
//             <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
//         </div>
//     );

//     const SectionTotal = ({ label, value, variant = 'default' }: { label: string; value: number; variant?: 'default' | 'success' | 'danger' }) => {
//         const colorClass = variant === 'success' ? 'text-green-600' : variant === 'danger' ? 'text-red-600' : 'text-gray-900';
//         const bgClass = variant === 'success' ? 'bg-green-50' : variant === 'danger' ? 'bg-red-50' : 'bg-gray-100';

//         return (
//             <div className={`mt-2 flex justify-between px-4 py-3 ${bgClass} border-l-4 ${variant === 'success' ? 'border-green-500' : variant === 'danger' ? 'border-red-500' : 'border-gray-400'}`}>
//                 <span className={`font-bold ${colorClass}`}>{label}</span>
//                 <span className={`text-lg font-bold ${colorClass}`}>{formatCurrency(value)}</span>
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <div ref={headerRef}>
//                 <div className="bg-white shadow-sm">
//                     <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
//                         <div className="mt-4 border-t border-gray-200 pt-4">
//                             <h2 className="text-2xl font-semibold text-gray-900">Profit & Loss Report</h2>
//                             <p className="mt-1 text-sm text-gray-600">
//                                 {reportData?.date_range ? `Period: ${reportData.date_range.from} to ${reportData.date_range.to}` : 'Comprehensive financial performance analysis'}
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//                 {/* Universal Filter - Only Date Filter */}
//                 <UniversalFilter onFilterChange={handleFilterChange} showStoreFilter={false} showDateFilter={true} showSearch={false} className="mb-6" />

//                 {/* Error Message */}
//                 {isError && (
//                     <div className="mb-6 rounded-md bg-red-50 p-4">
//                         <div className="flex">
//                             <div className="ml-3">
//                                 <h3 className="text-sm font-medium text-red-800">Error loading profit & loss report</h3>
//                                 <div className="mt-2 text-sm text-red-700">
//                                     <p>{(error as any)?.data?.message || 'Failed to fetch report data. Please try again.'}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Action Buttons */}
//                 <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
//                     <div className="flex flex-wrap gap-2">
//                         <button
//                             onClick={handlePrint}
//                             disabled={isLoading || !reportData}
//                             className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                             <Printer className="mr-2 h-4 w-4" />
//                             Print
//                         </button>
//                         <button
//                             onClick={handleDownloadPDF}
//                             disabled={isLoading || !reportData}
//                             className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                             <Download className="mr-2 h-4 w-4" />
//                             Download PDF
//                         </button>
//                     </div>
//                 </div>

//                 {/* Summary Cards */}
//                 {reportData && (
//                     <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//                         <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
//                             <div className="flex items-center">
//                                 <div className="flex-shrink-0">
//                                     <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
//                                         <ShoppingCart className="h-5 w-5 text-white" />
//                                     </div>
//                                 </div>
//                                 <div className="ml-3 w-0 flex-1">
//                                     <dl>
//                                         <dt className="truncate text-sm font-medium text-gray-500">Net Sales</dt>
//                                         <dd className="text-lg font-semibold text-gray-900">{formatCurrency(netSales)}</dd>
//                                     </dl>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
//                             <div className="flex items-center">
//                                 <div className="flex-shrink-0">
//                                     <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
//                                         <Package className="h-5 w-5 text-white" />
//                                     </div>
//                                 </div>
//                                 <div className="ml-3 w-0 flex-1">
//                                     <dl>
//                                         <dt className="truncate text-sm font-medium text-gray-500">COGS</dt>
//                                         <dd className="text-lg font-semibold text-gray-900">{formatCurrency(costOfGoodsSold)}</dd>
//                                     </dl>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
//                             <div className="flex items-center">
//                                 <div className="flex-shrink-0">
//                                     <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
//                                         <ArrowUpCircle className="h-5 w-5 text-white" />
//                                     </div>
//                                 </div>
//                                 <div className="ml-3 w-0 flex-1">
//                                     <dl>
//                                         <dt className="truncate text-sm font-medium text-gray-500">Opening Stock</dt>
//                                         <dd className="text-lg font-semibold text-gray-900">{formatCurrency(parseNumeric(reportData.opening_stock_purchase))}</dd>
//                                     </dl>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
//                             <div className="flex items-center">
//                                 <div className="flex-shrink-0">
//                                     <div className={`flex h-8 w-8 items-center justify-center rounded-md ${correctGrossProfit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
//                                         {correctGrossProfit >= 0 ? <TrendingUp className="h-5 w-5 text-white" /> : <TrendingDown className="h-5 w-5 text-white" />}
//                                     </div>
//                                 </div>
//                                 <div className="ml-3 w-0 flex-1">
//                                     <dl>
//                                         <dt className="truncate text-sm font-medium text-gray-500">Gross Profit</dt>
//                                         <dd className={`text-lg font-semibold ${correctGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(correctGrossProfit)}</dd>
//                                     </dl>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Report Content */}
//                 <div ref={printRef} className="space-y-6">
//                     {isLoading ? (
//                         <div className="rounded-lg bg-white p-12 text-center shadow-sm">
//                             <div className="text-gray-500">Loading profit & loss report...</div>
//                         </div>
//                     ) : !reportData ? (
//                         <div className="rounded-lg bg-white p-12 text-center shadow-sm">
//                             <div className="text-gray-500">No data available. Please select a date range and try again.</div>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//                             {/* Stock Information */}
//                             <div className="rounded-lg bg-white shadow-sm">
//                                 <div className="border-b border-gray-200 px-6 py-4">
//                                     <h3 className="flex items-center text-lg font-semibold text-gray-900">
//                                         <Package className="mr-2 h-5 w-5 text-blue-600" />
//                                         Stock Information
//                                     </h3>
//                                 </div>
//                                 <div className="p-4">
//                                     <div className="space-y-1">
//                                         <DataRow label="Opening Stock (Purchase)" value={parseNumeric(reportData.opening_stock_purchase)} />
//                                         <DataRow label="Closing Stock (Purchase)" value={parseNumeric(reportData.closing_stock_purchase)} />
//                                         <div className="my-3 border-t border-gray-200"></div>
//                                         <DataRow label="Opening Stock (Sale)" value={parseNumeric(reportData.opening_stock_sale)} />
//                                         <DataRow label="Closing Stock (Sale)" value={parseNumeric(reportData.closing_stock_sale)} />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Purchase Information */}
//                             <div className="rounded-lg bg-white shadow-sm">
//                                 <div className="border-b border-gray-200 px-6 py-4">
//                                     <h3 className="flex items-center text-lg font-semibold text-gray-900">
//                                         <ArrowDownCircle className="mr-2 h-5 w-5 text-orange-600" />
//                                         Purchase Information
//                                     </h3>
//                                 </div>
//                                 <div className="p-4">
//                                     <div className="space-y-1">
//                                         <DataRow label="Total Purchase" value={parseNumeric(reportData.total_purchase)} />
//                                         <DataRow label="Purchase Discount" value={parseNumeric(reportData.total_purchase_discount)} isSubItem />
//                                         <DataRow label="Purchase Return" value={parseNumeric(reportData.total_purchase_return)} isSubItem />
//                                         <SectionTotal label="Net Purchase" value={netPurchase} />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Sales Information */}
//                             <div className="rounded-lg bg-white shadow-sm">
//                                 <div className="border-b border-gray-200 px-6 py-4">
//                                     <h3 className="flex items-center text-lg font-semibold text-gray-900">
//                                         <ShoppingCart className="mr-2 h-5 w-5 text-green-600" />
//                                         Sales Information
//                                     </h3>
//                                 </div>
//                                 <div className="p-4">
//                                     <div className="space-y-1">
//                                         <DataRow label="Total Sales" value={parseNumeric(reportData.total_sales)} />
//                                         <DataRow label="Sales Discount" value={parseNumeric(reportData.total_sell_discount)} isSubItem />
//                                         <DataRow label="Sales Return" value={parseNumeric(reportData.total_sell_return)} isSubItem />
//                                         <SectionTotal label="Net Sales" value={netSales} />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Cost of Goods Sold */}
//                             <div className="rounded-lg bg-white shadow-sm">
//                                 <div className="border-b border-gray-200 px-6 py-4">
//                                     <h3 className="flex items-center text-lg font-semibold text-gray-900">
//                                         <Package className="mr-2 h-5 w-5 text-purple-600" />
//                                         Cost of Goods Sold (COGS)
//                                     </h3>
//                                 </div>
//                                 <div className="p-4">
//                                     <div className="space-y-1">
//                                         <DataRow label="Opening Stock" value={parseNumeric(reportData.opening_stock_purchase)} />
//                                         <DataRow label="Add: Net Purchase" value={netPurchase} isSubItem />
//                                         <DataRow label="Less: Closing Stock" value={parseNumeric(reportData.closing_stock_purchase)} isSubItem />
//                                         <SectionTotal label="Cost of Goods Sold" value={costOfGoodsSold} />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Gross Profit Calculation */}
//                     {reportData && (
//                         <div className="rounded-lg bg-white shadow-sm">
//                             <div className="border-b border-gray-200 px-6 py-4">
//                                 <h3 className="flex items-center text-lg font-semibold text-gray-900">
//                                     {correctGrossProfit >= 0 ? <TrendingUp className="mr-2 h-5 w-5 text-green-600" /> : <TrendingDown className="mr-2 h-5 w-5 text-red-600" />}
//                                     Gross Profit Calculation
//                                 </h3>
//                             </div>
//                             <div className="p-4">
//                                 <div className="space-y-1">
//                                     <DataRow label="Net Sales" value={netSales} />
//                                     <DataRow label="Less: Cost of Goods Sold" value={costOfGoodsSold} isSubItem />
//                                     <SectionTotal label={correctGrossProfit >= 0 ? 'Gross Profit' : 'Gross Loss'} value={correctGrossProfit} variant={correctGrossProfit >= 0 ? 'success' : 'danger'} />
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Final Summary */}
//                     {reportData && (
//                         <div className={`rounded-lg p-6 shadow-lg ${correctGrossProfit >= 0 ? 'border-2 border-green-200 bg-green-50' : 'border-2 border-red-200 bg-red-50'}`}>
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <h3 className="text-lg font-medium text-gray-900">{correctGrossProfit >= 0 ? 'Total Gross Profit' : 'Total Gross Loss'}</h3>
//                                     <p className="mt-1 text-sm text-gray-600">
//                                         Period: {reportData.date_range.from} to {reportData.date_range.to}
//                                     </p>
//                                     <p className="mt-2 text-xs text-gray-500">Formula: Net Sales - (Opening Stock + Net Purchase - Closing Stock)</p>
//                                 </div>
//                                 <div className="text-right">
//                                     <div className={`text-3xl font-bold ${correctGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(Math.abs(correctGrossProfit))}</div>
//                                     <div className="mt-2 flex items-center justify-end">
//                                         {correctGrossProfit >= 0 ? <TrendingUp className="h-6 w-6 text-green-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProfitLossReportPage;
'use client';
import ProfitLossReportFilter from '@/__components/ProfitLossReportFilter';
import Loading from '@/components/layouts/loading';
import { downloadBase64File } from '@/lib/downloadFile';
import { useGetProfitLossReportMutation } from '@/store/features/reports/reportApi';
import { ArrowDownCircle, ArrowUpCircle, Building2, DollarSign, FileDown, FileSpreadsheet, Printer, ShoppingBag, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

interface ExpenseBreakdown {
    ledger_id: number;
    ledger_name: string;
    total_amount: number;
    transaction_count: number;
}

interface ProfitLossData {
    period: {
        from_date: string;
        to_date: string;
        from_datetime: string;
        to_datetime: string;
        days: number;
    };
    stock: {
        opening_stock_purchase_value: number;
        opening_stock_sale_value: number;
        closing_stock_purchase_value: number;
        closing_stock_sale_value: number;
    };
    purchase: {
        total_purchase: number;
        purchase_paid: number;
        purchase_due: number;
    };
    sales: {
        total_sales: number;
        total_sales_tax: number;
        total_sales_discount: number;
        total_sales_grand_total: number;
        net_sales: number;
        sales_paid: number;
        sales_due: number;
    };
    expenses: {
        total_expenses: number;
        expense_breakdown: ExpenseBreakdown[];
    };
    profit: {
        cost_of_goods_sold: number;
        gross_profit: number;
        gross_profit_margin_percentage: number;
        net_profit: number;
        net_profit_margin_percentage: number;
    };
    summary: {
        total_revenue: number;
        total_cost: number;
        total_expenses: number;
        net_profit_loss: number;
        profit_status: 'profit' | 'loss';
    };
}

const ProfitLossReportPage = () => {
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [reportData, setReportData] = useState<ProfitLossData | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [getProfitLossReport, { isLoading }] = useGetProfitLossReportMutation();

    // Fetch report data
    const fetchReport = useCallback(
        async (params: Record<string, any>, format: string = 'json') => {
            try {
                const payload = { ...params, format };
                const response = await getProfitLossReport(payload).unwrap();

                if (format === 'json') {
                    setReportData(response.data);
                }
            } catch (error: any) {
                console.error('Error fetching profit & loss report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.data?.message || 'Failed to fetch profit & loss report',
                });
            }
        },
        [getProfitLossReport]
    );

    // Handle filter changes
    const handleFilterChange = useCallback(
        (params: Record<string, any>) => {
            setFilterParams(params);
            fetchReport(params);
        },
        [fetchReport]
    );

    // Export handlers
    const handleExportPDF = async () => {
        try {
            const payload = {
                ...filterParams,
                format: 'pdf',
            };

            const response = await getProfitLossReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(response.data.file, response.data.filename || `profit-loss-report-${new Date().getTime()}.pdf`, response.data.mime_type || 'application/pdf');

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'PDF downloaded successfully',
                    timer: 2000,
                });
            }
        } catch (error: any) {
            console.error('Failed to export PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.data?.message || 'Failed to export PDF',
            });
        }
    };

    const handleExportExcel = async () => {
        try {
            const payload = {
                ...filterParams,
                format: 'excel',
            };

            const response = await getProfitLossReport(payload).unwrap();

            if (response?.data?.file) {
                downloadBase64File(
                    response.data.file,
                    response.data.filename || `profit-loss-report-${new Date().getTime()}.xlsx`,
                    response.data.mime_type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Excel downloaded successfully',
                    timer: 2000,
                });
            }
        } catch (error: any) {
            console.error('Failed to export Excel:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.data?.message || 'Failed to export Excel',
            });
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Profit & Loss Report - ${new Date().toLocaleDateString()}`,
    });

    const formatCurrency = (value: number) => `৳${Number(value || 0).toFixed(2)}`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 shadow-lg">
                            <TrendingUp className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Profit & Loss Report</h1>
                            <p className="text-sm text-gray-500">Comprehensive financial performance overview</p>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2.5 text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Printer className="h-5 w-5" />
                            Print
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FileDown className="h-5 w-5" />
                            PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={!reportData || isLoading}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FileSpreadsheet className="h-5 w-5" />
                            Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <ProfitLossReportFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Loading State */}
            {isLoading && <Loading />}

            {/* Summary Cards */}
            {!isLoading && reportData && (
                <>
                    {/* Top Summary Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium opacity-90">Total Revenue</p>
                                <DollarSign className="h-6 w-6 opacity-80" />
                            </div>
                            <p className="text-3xl font-bold">{formatCurrency(reportData.summary.total_revenue)}</p>
                            <p className="mt-1 text-xs opacity-75">{reportData.period.days} days</p>
                        </div>

                        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium opacity-90">Total Cost</p>
                                <ShoppingBag className="h-6 w-6 opacity-80" />
                            </div>
                            <p className="text-3xl font-bold">{formatCurrency(reportData.summary.total_cost)}</p>
                            <p className="mt-1 text-xs opacity-75">COGS + Expenses</p>
                        </div>

                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium opacity-90">Gross Profit</p>
                                <TrendingUp className="h-6 w-6 opacity-80" />
                            </div>
                            <p className="text-3xl font-bold">{formatCurrency(reportData.profit.gross_profit)}</p>
                            <p className="mt-1 text-xs opacity-75">{reportData.profit.gross_profit_margin_percentage}% margin</p>
                        </div>

                        <div
                            className={`rounded-xl bg-gradient-to-br p-6 text-white shadow-lg ${
                                reportData.summary.profit_status === 'profit' ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
                            }`}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium opacity-90">Net {reportData.summary.profit_status === 'profit' ? 'Profit' : 'Loss'}</p>
                                {reportData.summary.profit_status === 'profit' ? <ArrowUpCircle className="h-6 w-6 opacity-80" /> : <ArrowDownCircle className="h-6 w-6 opacity-80" />}
                            </div>
                            <p className="text-3xl font-bold">{formatCurrency(Math.abs(reportData.summary.net_profit_loss))}</p>
                            <p className="mt-1 text-xs opacity-75">{reportData.profit.net_profit_margin_percentage}% margin</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div ref={printRef} className="space-y-6">
                        {/* Print Header (hidden on screen) */}
                        <div className="mb-6 hidden text-center print:block">
                            <h1 className="text-2xl font-bold">Profit & Loss Report</h1>
                            <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">
                                Period: {reportData.period.from_date} to {reportData.period.to_date}
                            </p>
                        </div>

                        {/* Stock Section */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 border-b pb-3">
                                <Building2 className="h-5 w-5 text-indigo-600" />
                                <h2 className="text-lg font-bold text-gray-900">Stock Valuation</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm font-medium text-gray-600">Opening Stock (Purchase Price)</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(reportData.stock.opening_stock_purchase_value)}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm font-medium text-gray-600">Opening Stock (Sale Price)</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(reportData.stock.opening_stock_sale_value)}</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <p className="text-sm font-medium text-blue-600">Closing Stock (Purchase Price)</p>
                                    <p className="mt-1 text-2xl font-bold text-blue-900">{formatCurrency(reportData.stock.closing_stock_purchase_value)}</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <p className="text-sm font-medium text-blue-600">Closing Stock (Sale Price)</p>
                                    <p className="mt-1 text-2xl font-bold text-blue-900">{formatCurrency(reportData.stock.closing_stock_sale_value)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Purchase & Sales Side by Side */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Purchase Section */}
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-2 border-b pb-3">
                                    <ShoppingBag className="h-5 w-5 text-orange-600" />
                                    <h2 className="text-lg font-bold text-gray-900">Purchase</h2>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                                        <span className="text-sm font-medium text-gray-600">Total Purchase:</span>
                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(reportData.purchase.total_purchase)}</span>
                                    </div>
                                    <div className="flex justify-between rounded-lg bg-green-50 p-3">
                                        <span className="text-sm font-medium text-green-600">Paid:</span>
                                        <span className="text-sm font-bold text-green-900">{formatCurrency(reportData.purchase.purchase_paid)}</span>
                                    </div>
                                    <div className="flex justify-between rounded-lg bg-red-50 p-3">
                                        <span className="text-sm font-medium text-red-600">Due:</span>
                                        <span className="text-sm font-bold text-red-900">{formatCurrency(reportData.purchase.purchase_due)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sales Section */}
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-2 border-b pb-3">
                                    <Wallet className="h-5 w-5 text-green-600" />
                                    <h2 className="text-lg font-bold text-gray-900">Sales</h2>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                                        <span className="text-sm font-medium text-gray-600">Total Sales:</span>
                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(reportData.sales.total_sales)}</span>
                                    </div>
                                    <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                                        <span className="text-sm font-medium text-gray-600">Tax:</span>
                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(reportData.sales.total_sales_tax)}</span>
                                    </div>
                                    <div className="flex justify-between rounded-lg bg-red-50 p-3">
                                        <span className="text-sm font-medium text-red-600">Discount:</span>
                                        <span className="text-sm font-bold text-red-900">{formatCurrency(reportData.sales.total_sales_discount)}</span>
                                    </div>
                                    <div className="flex justify-between rounded-lg bg-blue-50 p-3">
                                        <span className="text-sm font-medium text-blue-600">Grand Total:</span>
                                        <span className="text-sm font-bold text-blue-900">{formatCurrency(reportData.sales.total_sales_grand_total)}</span>
                                    </div>
                                    <div className="flex justify-between rounded-lg bg-green-50 p-3">
                                        <span className="text-sm font-medium text-green-600">Paid:</span>
                                        <span className="text-sm font-bold text-green-900">{formatCurrency(reportData.sales.sales_paid)}</span>
                                    </div>
                                    <div className="flex justify-between rounded-lg bg-yellow-50 p-3">
                                        <span className="text-sm font-medium text-yellow-600">Due:</span>
                                        <span className="text-sm font-bold text-yellow-900">{formatCurrency(reportData.sales.sales_due)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expenses Section */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between border-b pb-3">
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    <h2 className="text-lg font-bold text-gray-900">Expenses</h2>
                                </div>
                                <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-bold text-red-800">{formatCurrency(reportData.expenses.total_expenses)}</span>
                            </div>

                            {reportData.expenses.expense_breakdown && reportData.expenses.expense_breakdown.length > 0 ? (
                                <div className="space-y-2">
                                    {reportData.expenses.expense_breakdown.map((expense) => (
                                        <div key={expense.ledger_id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{expense.ledger_name}</p>
                                                <p className="text-xs text-gray-500">{expense.transaction_count} transactions</p>
                                            </div>
                                            <span className="text-sm font-bold text-red-600">{formatCurrency(expense.total_amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-gray-500">No expenses recorded for this period</p>
                            )}
                        </div>

                        {/* Profit Calculation */}
                        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-lg font-bold text-gray-900">Profit Calculation</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between rounded-lg bg-white p-4">
                                    <span className="font-medium text-gray-700">Cost of Goods Sold (COGS):</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(reportData.profit.cost_of_goods_sold)}</span>
                                </div>
                                <div className="flex justify-between rounded-lg bg-purple-50 p-4">
                                    <div>
                                        <span className="font-medium text-purple-700">Gross Profit:</span>
                                        <span className="ml-2 text-xs text-purple-600">({reportData.profit.gross_profit_margin_percentage}%)</span>
                                    </div>
                                    <span className="font-bold text-purple-900">{formatCurrency(reportData.profit.gross_profit)}</span>
                                </div>
                                <div className="flex justify-between rounded-lg bg-red-50 p-4">
                                    <span className="font-medium text-red-700">Total Expenses:</span>
                                    <span className="font-bold text-red-900">{formatCurrency(reportData.expenses.total_expenses)}</span>
                                </div>
                                <div className={`flex justify-between rounded-lg p-4 ${reportData.summary.profit_status === 'profit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <div>
                                        <span className={`text-lg font-bold ${reportData.summary.profit_status === 'profit' ? 'text-green-800' : 'text-red-800'}`}>
                                            Net {reportData.summary.profit_status === 'profit' ? 'Profit' : 'Loss'}:
                                        </span>
                                        <span className={`ml-2 text-sm ${reportData.summary.profit_status === 'profit' ? 'text-green-600' : 'text-red-600'}`}>
                                            ({reportData.profit.net_profit_margin_percentage}%)
                                        </span>
                                    </div>
                                    <span className={`text-xl font-bold ${reportData.summary.profit_status === 'profit' ? 'text-green-900' : 'text-red-900'}`}>
                                        {formatCurrency(Math.abs(reportData.summary.net_profit_loss))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Empty State */}
            {!isLoading && !reportData && (
                <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 text-center shadow-sm">
                    <TrendingUp className="mb-4 h-16 w-16 text-gray-400" />
                    <h3 className="mb-2 text-xl font-bold text-gray-900">No Data Available</h3>
                    <p className="text-sm text-gray-500">Select filters above to generate your profit & loss report</p>
                </div>
            )}
        </div>
    );
};

export default ProfitLossReportPage;
