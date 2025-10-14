'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { RootState } from '@/store';

// Icons
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Calendar, DollarSign, Eye, Package, ShoppingCart, Store, Users } from 'lucide-react';

// Components
import { useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { useGetAllLowStockProductsQuery, useGetAllProductsQuery } from '@/store/features/Product/productApi';
import Low_Stock_Products from './low_stock_products';
import Recent_Orders from './Recent_Orders';
import Revenue from './Revenue';
import Sale_by from './Sale_by';
import Top_Selling_Products from './top_selling_products';

const ComponentsDashboardSales = () => {
    const { currentStoreId, currentStore } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: lowStockProducts, isLoading: isLoadingLowStock, isError: isErrorLowStock } = useGetAllLowStockProductsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });

    // ✅ Fetch customers (store_id filter only)
    const { data: customersData, isLoading: isLoadingCustomers } = useGetStoreCustomersListQuery({ store_id: currentStoreId }, { skip: !currentStoreId });

    // ✅ Fetch products (store_id filter only)
    const { data: productsData, isLoading: isLoadingProducts } = useGetAllProductsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });

    const { data: orderData, isLoading: isLoadingOrders, isError: isErrorOrders } = useGetAllOrdersQuery();
    const orders = Array.isArray(orderData?.data) ? orderData.data : [];

    // ✅ Extract totals safely
    const totalCustomers = customersData?.data?.length || 0;
    const totalProducts = productsData?.data?.length || 0;

    // Calculate total revenue and total orders
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.grand_total || 0), 0);
    const totalOrders = orders.length;

    const [dateRange, setDateRange] = useState('today');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Mock stats data (replace with actual API)
    const stats = {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_products: totalProducts,
        total_customers: totalCustomers,
        total_low_stock_products: lowStockProducts ? lowStockProducts.data.length : 0,
    };

    const statCards = [
        {
            title: 'Total Revenue',
            value: `৳${stats.total_revenue}`,
            change: '+12.5%',
            trend: 'up',
            icon: <DollarSign className="h-6 w-6" />,
            color: 'bg-gradient-to-r from-blue-500 to-blue-600',
            href: '/reports/sales',
        },
        {
            title: 'Total Orders',
            value: stats.total_orders,
            change: '+8.2%',
            trend: 'up',
            icon: <ShoppingCart className="h-6 w-6" />,
            color: 'bg-gradient-to-r from-green-500 to-green-600',
            href: '/orders',
        },
        {
            title: 'Total Products',
            value: stats.total_products,
            change: '+3.1%',
            trend: 'up',
            icon: <Package className="h-6 w-6" />,
            color: 'bg-gradient-to-r from-purple-500 to-purple-600',
            href: '/products',
        },
        {
            title: 'Total Customers',
            value: stats.total_customers,
            change: '+15.3%',
            trend: 'up',
            icon: <Users className="h-6 w-6" />,
            color: 'bg-gradient-to-r from-orange-500 to-orange-600',
            href: '/customer',
        },
        {
            title: 'Low Stock Products',
            value: stats.total_low_stock_products,
            change: '-5.4%',
            trend: 'down',
            icon: <AlertTriangle className="h-6 w-6" />,
            color: 'bg-gradient-to-r from-red-500 to-red-600',
            href: '/products/low-stock',
        },
    ];

    const quickActions = [
        {
            title: 'New Sale',
            description: 'Start a new POS transaction',
            icon: <ShoppingCart className="h-6 w-6" />,
            href: '/pos',
            color: 'bg-blue-500',
        },
        {
            title: 'Add Product',
            description: 'Add new product to inventory',
            icon: <Package className="h-6 w-6" />,
            href: '/products/create',
            color: 'bg-green-500',
        },
        {
            title: 'View Reports',
            description: 'Check sales and analytics',
            icon: <BarChart3 className="h-6 w-6" />,
            href: '/reports/sales',
            color: 'bg-purple-500',
        },
        {
            title: 'Manage Customers',
            description: 'View and manage customers',
            icon: <Users className="h-6 w-6" />,
            href: '/customer',
            color: 'bg-orange-500',
        },
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name || 'User'}! 👋</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Here&apos;s what&apos;s happening with your {currentStore?.store_name || 'store'} today</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>

                    <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                        <Calendar className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Current Store Info */}
            {currentStore && (
                <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary p-2 text-white">
                            <Store className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary">Current Store: {currentStore.store_name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">All data shown below is for this store only</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, index) => (
                    <Link key={index} href={card.href} className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-gray-800">
                        <div className={`absolute inset-0 opacity-5 ${card.color}`}></div>

                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div className={`rounded-lg p-3 text-white ${card.color}`}>{card.icon}</div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {card.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                    {card.change}
                                </div>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                            </div>
                        </div>

                        <div className="absolute bottom-0 right-0 opacity-0 transition-opacity group-hover:opacity-100">
                            <Eye className="h-5 w-5 text-gray-400" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                <Revenue orders={orders} isLoading={isLoadingOrders} isError={isErrorOrders} />
                {/* <Sale_by /> */}
                <Sale_by orders={orders} isLoading={isLoadingOrders} isError={isErrorOrders} />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Quick Actions */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.href}
                                className="group flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-all hover:border-primary hover:shadow-md dark:border-gray-700 dark:hover:border-primary"
                            >
                                <div className={`rounded-lg p-2 text-white ${action.color}`}>{action.icon}</div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{action.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Summary */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Summary</h3>
                        <Link href="/reports/activity" className="text-sm text-primary hover:text-primary/80">
                            View Details
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-500 p-2">
                                    <ShoppingCart className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-green-900 dark:text-green-200">Sales Today</p>
                                    <p className="text-sm text-green-700 dark:text-green-300">23 orders completed</p>
                                </div>
                            </div>
                            <p className="font-bold text-green-900 dark:text-green-200">৳12,340</p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-500 p-2">
                                    <Users className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-blue-900 dark:text-blue-200">New Customers</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">5 customers registered</p>
                                </div>
                            </div>
                            <p className="font-bold text-blue-900 dark:text-blue-200">+5</p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-orange-500 p-2">
                                    <AlertTriangle className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-orange-900 dark:text-orange-200">Low Stock Items</p>
                                    <p className="text-sm text-orange-700 dark:text-orange-300">3 items need restocking</p>
                                </div>
                            </div>
                            <Link href="/products?filter=low-stock" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                                View
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Recent_Orders orders={orders} isLoading={isLoadingOrders} isError={isErrorOrders} />
                {/* <Top_Selling_Products /> */}
                <Top_Selling_Products orders={orders} isLoading={isLoadingOrders} isError={isErrorOrders} />

                <Low_Stock_Products lowStockProducts={lowStockProducts} isLoading={!lowStockProducts} />
            </div>
        </div>
    );
};

export default ComponentsDashboardSales;
