'use client';
import ProfitLossReportFilter from '@/components/custom/ProfitLossReportFilter';
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
