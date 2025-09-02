'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Filter, Download, AlertTriangle, Package, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetAllProductsQuery } from '@/store/Product/productApi';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';


const IdleInventoryReport = () => {
    const { data: productsResponse, isLoading: productsLoading, error: productsError } = useGetAllProductsQuery();
    const { data: ordersResponse, isLoading: ordersLoading, error: ordersError } = useGetAllOrdersQuery();

    const [selectedPeriod, setSelectedPeriod] = useState('30');

    // Process products and find last sold date from orders
    const processedData = useMemo(() => {
        if (!productsResponse?.success || !productsResponse?.data) return [];
        if (!ordersResponse?.success || !ordersResponse?.data) return [];

        const today = new Date();

        return productsResponse.data.map((product: any) => {
            // find all orders that include this product
            const relatedOrders = ordersResponse.data.filter((order: any) => order.items?.some((item: any) => item.product_id === product.id));

            // find latest sold date
            let lastSoldDate: Date | null = null;
            relatedOrders.forEach((order: any) => {
                const orderDate = new Date(order.created_at);
                if (!lastSoldDate || orderDate > lastSoldDate) {
                    lastSoldDate = orderDate;
                }
            });

            // calculate days idle
            const daysIdle = lastSoldDate
                ? Math.floor((today.getTime() - lastSoldDate.getTime()) / (1000 * 60 * 60 * 24))
                : Math.floor((today.getTime() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)); // never sold → since created

            const dailyLossRate = parseFloat(product.price) * 0.02; // assume 2% opportunity cost per day
            const revenueLost = daysIdle * dailyLossRate;

            return {
                ...product,
                daysIdle,
                lastSoldDate: lastSoldDate ? lastSoldDate.toLocaleDateString() : 'Never Sold',
                revenueLost: revenueLost.toFixed(2),
                isIdle: daysIdle >= parseInt(selectedPeriod),
                profitMargin: (((parseFloat(product.price) - parseFloat(product.purchase_price)) / parseFloat(product.price)) * 100).toFixed(1),
            };
        });
    }, [productsResponse, ordersResponse, selectedPeriod]);

    // Filter idle products
    const idleProducts = useMemo(() => {
        return processedData.filter((product: any) => product.daysIdle >= parseInt(selectedPeriod));
    }, [processedData, selectedPeriod]);

    // Summary metrics
    const summaryMetrics = useMemo(() => {
        const totalIdleProducts = idleProducts.length;
        const totalIdleStock = idleProducts.reduce((sum: number, p: any) => sum + p.quantity, 0);
        const totalRevenueLost = idleProducts.reduce((sum: number, p: any) => sum + parseFloat(p.revenueLost), 0);
        const totalInventoryValue = idleProducts.reduce((sum: number, p: any) => sum + p.quantity * parseFloat(p.price), 0);

        return {
            totalIdleProducts,
            totalIdleStock,
            totalRevenueLost: totalRevenueLost.toFixed(2),
            totalInventoryValue: totalInventoryValue.toFixed(2),
        };
    }, [idleProducts]);

    // Chart data
    const chartData = useMemo(() => {
        return idleProducts
            .sort((a: any, b: any) => b.quantity - a.quantity)
            .slice(0, 6)
            .map((product: any) => ({
                name: product.product_name.length > 15 ? product.product_name.substring(0, 15) + '...' : product.product_name,
                stock: product.quantity,
                daysIdle: product.daysIdle,
                value: product.quantity * parseFloat(product.price),
            }));
    }, [idleProducts]);

    // CSV Export
    const exportToCSV = () => {
        const headers = ['Product Name', 'SKU', 'Stock Quantity', 'Days Idle', 'Last Sold', 'Price', 'Revenue Lost'];
        const csvData = [headers.join(','), ...idleProducts.map((p: any) => [`"${p.product_name}"`, p.sku, p.quantity, p.daysIdle, p.lastSoldDate, p.price, p.revenueLost].join(','))].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `idle-inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (productsLoading || ordersLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (productsError || ordersError) {
        return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">Error loading report data. Please try again.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col items-center justify-between rounded-lg border bg-white p-6 shadow-sm md:flex-row">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Package className="text-orange-600" />
                        Idle Inventory Report
                    </h1>
                    <p className="mt-1 text-gray-600">Identify slow-moving products based on real sales history</p>
                </div>
                <div className="mt-4 flex items-center gap-3 md:mt-0">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="15">Last 15 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="60">Last 60 Days</option>
                        <option value="90">Last 90 Days</option>
                    </select>
                    <button onClick={exportToCSV} className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Idle Products</p>
                            <p className="text-2xl font-bold text-gray-900">{summaryMetrics.totalIdleProducts}</p>
                        </div>
                        <div className="rounded-lg bg-orange-100 p-3">
                            <AlertTriangle className="text-orange-600" size={24} />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Products not sold in {selectedPeriod} days</p>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Idle Stock</p>
                            <p className="text-2xl font-bold text-gray-900">{summaryMetrics.totalIdleStock}</p>
                        </div>
                        <div className="rounded-lg bg-red-100 p-3">
                            <Package className="text-red-600" size={24} />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Units sitting in inventory</p>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                            <p className="text-2xl font-bold text-gray-900">${summaryMetrics.totalInventoryValue}</p>
                        </div>
                        <div className="rounded-lg bg-blue-100 p-3">
                            <DollarSign className="text-blue-600" size={24} />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Total value of idle stock</p>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                            <p className="text-2xl font-bold text-red-600">${summaryMetrics.totalRevenueLost}</p>
                        </div>
                        <div className="rounded-lg bg-red-100 p-3">
                            <TrendingDown className="text-red-600" size={24} />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Estimated opportunity cost</p>
                </div>
            </div>

            {/* Chart Section */}
            {chartData.length > 0 && (
                <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Idle Products by Stock Quantity</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value, name) => [name === 'stock' ? `${value} units` : `$${value}`, name === 'stock' ? 'Stock Quantity' : 'Inventory Value']}
                                    labelFormatter={(label) => `Product: ${label}`}
                                />
                                <Bar dataKey="stock" fill="#f59e0b" radius={[4, 4, 0, 0]} name="stock" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Idle Products Details</h3>
                    <p className="mt-1 text-sm text-gray-600">
                        {idleProducts.length} products have been idle for {selectedPeriod}+ days
                    </p>
                </div>

                {idleProducts.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="mx-auto mb-4 text-gray-400" size={48} />
                        <h4 className="mb-2 text-lg font-medium text-gray-900">No Idle Products Found</h4>
                        <p className="text-gray-600">All products have been active within the selected period.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Days Idle</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Sold</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Revenue Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {idleProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                                                <div className="max-w-xs truncate text-sm text-gray-500">{product.description}</div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    product.quantity === 0 ? 'bg-red-100 text-red-800' : product.quantity > 30 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {product.quantity} units
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    product.daysIdle > 60 ? 'bg-red-100 text-red-800' : product.daysIdle > 30 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {product.daysIdle} days
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.lastSoldDate}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">${product.price}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    product.available === 'no' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {product.available === 'yes' ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">-${product.revenueLost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action Recommendations */}
            {idleProducts.length > 0 && (
                <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <AlertTriangle className="text-orange-600" />
                        Recommended Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                            <h4 className="mb-2 font-medium text-orange-900">High Stock Items</h4>
                            <p className="text-sm text-orange-700">Consider running promotions for products with high quantities (30+ units) that haven't sold recently.</p>
                        </div>
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <h4 className="mb-2 font-medium text-red-900">Zero Stock Items</h4>
                            <p className="text-sm text-red-700">Review out-of-stock products that might need restocking or should be discontinued.</p>
                        </div>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <h4 className="mb-2 font-medium text-blue-900">Price Optimization</h4>
                            <p className="text-sm text-blue-700">Review pricing strategy for products idle more than 60 days to improve movement.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdleInventoryReport;
