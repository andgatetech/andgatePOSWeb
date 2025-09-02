'use client';

import React, { useState, useMemo } from 'react';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { Download, Calendar, TrendingUp, Package, DollarSign, FileText, Filter } from 'lucide-react';

const SalesManagement = () => {
    const { data: ordersResponse, isLoading, error } = useGetAllOrdersQuery();
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const processedData = useMemo(() => {
        if (!ordersResponse?.data) return { orders: [], summary: {}, productSales: [] };

        const orders = ordersResponse.data;
        const selectedDateTime = new Date(selectedDate);

        // Calculate start & end dates based on selectedPeriod
        let startDate: Date;
        let endDate: Date = new Date(selectedDateTime);

        switch (selectedPeriod) {
            case 'daily':
                startDate = new Date(selectedDateTime);
                startDate.setDate(startDate.getDate() - 1); // previous day
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'weekly':
                startDate = new Date(selectedDateTime);
                startDate.setDate(startDate.getDate() - 7); // 7 days back
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'monthly':
                startDate = new Date(selectedDateTime);
                startDate.setMonth(startDate.getMonth() - 1); // 1 month back
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'yearly':
                startDate = new Date(selectedDateTime);
                startDate.setFullYear(startDate.getFullYear() - 1); // 1 year back
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            default:
                startDate = new Date(selectedDateTime);
                startDate.setHours(0, 0, 0, 0);
        }

        const filteredOrders = orders.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startDate && orderDate <= endDate;
        });

        // Summary calculation
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.grand_total), 0);
        const totalOrders = filteredOrders.length;
        const totalItems = filteredOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

        // Product sales aggregation
        const productSales: any = {};
        filteredOrders.forEach((order) => {
            order.items.forEach((item) => {
                const productName = item.product.product_name;
                if (!productSales[productName]) productSales[productName] = { name: productName, quantity: 0, revenue: 0, orders: 0 };
                productSales[productName].quantity += item.quantity;
                productSales[productName].revenue += parseFloat(item.subtotal);
                productSales[productName].orders += 1;
            });
        });

        return {
            orders: filteredOrders,
            summary: { totalRevenue, totalOrders, totalItems },
            productSales: Object.values(productSales).sort((a: any, b: any) => b.revenue - a.revenue),
        };
    }, [ordersResponse, selectedPeriod, selectedDate]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(amount);

    const exportToPDF = () => {
        const printContent = document.getElementById('sales-report-content');
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <html>
                <head>
                    <title>Sales Report - ${selectedPeriod}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f5f5f5; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        newWindow.document.close();
        newWindow.print();
    };

    const exportToExcel = () => {
        const csvContent = [
            ['Product Name', 'Quantity Sold', 'Revenue', 'Orders Count'],
            ...processedData.productSales.map((product: any) => [product.name, product.quantity, product.revenue.toFixed(2), product.orders]),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${selectedPeriod}-${selectedDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (isLoading)
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading sales data...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mb-4 text-xl text-red-500">Error loading sales data</div>
                    <p className="text-gray-600">Please try refreshing the page</p>
                </div>
            </div>
        );

    const periodLabel = selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                                <TrendingUp className="text-blue-600" /> Sales Report
                            </h1>
                            <p className="mt-1 text-gray-600">Track your {periodLabel.toLowerCase()} performance and sales analytics</p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button onClick={exportToPDF} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                                    <FileText className="h-4 w-4" /> PDF
                                </button>
                                <button onClick={exportToExcel} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                    <Download className="h-4 w-4" /> Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div id="sales-report-content">
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{periodLabel} Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(processedData.summary.totalRevenue)}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{periodLabel} Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{processedData.summary.totalOrders}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{periodLabel} Items Sold</p>
                                    <p className="text-2xl font-bold text-gray-900">{processedData.summary.totalItems}</p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Package className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Sales Table */}
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900">Product Sales Performance</h2>
                            <p className="mt-1 text-gray-600">{periodLabel} sales breakdown by product</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity Sold</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Revenue</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Orders</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {processedData.productSales.length > 0 ? (
                                        processedData.productSales.map((product: any, index) => (
                                            <tr key={index} className="transition-colors hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                            <Package className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{product.quantity}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-semibold text-green-600">{formatCurrency(product.revenue)}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-900">{product.orders}</div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center">
                                                <div className="text-gray-500">
                                                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                                    <p className="text-lg font-medium">No sales data found</p>
                                                    <p className="text-sm">No products were sold during the selected period</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-gray-200 p-6 text-right font-semibold text-gray-800">
                            {periodLabel} Sales Total: {formatCurrency(processedData.summary.totalRevenue)}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        Report generated on{' '}
                        {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SalesManagement;
