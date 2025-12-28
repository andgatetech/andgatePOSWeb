'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDashboardSectionsQuery } from '@/store/features/dashboard/dashboad';
import { Calendar, Package, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Skeleton components for loading state
const SectionSkeleton = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-40 rounded bg-gray-200"></div>
            <div className="h-8 w-32 rounded-lg bg-gray-200"></div>
        </div>
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                    </div>
                    <div className="h-6 w-16 rounded bg-gray-200"></div>
                </div>
            ))}
        </div>
    </div>
);

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
        partial: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Partial' },
        pending: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pending' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
        onhold: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'On Hold' },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>{config.label}</span>;
};

// Stock status badge component
const StockStatusBadge = ({ status, quantity }: { status: string; quantity: number }) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
        low: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Low Stock' },
        instock: { bg: 'bg-green-100', text: 'text-green-700', label: 'In Stock' },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.instock;

    return (
        <div className="text-right">
            <p className="mb-1 text-xs text-gray-500">Status</p>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>{config.label}</span>
            <p className="mt-1 text-xs text-gray-500">
                Stock: <span className="font-bold text-gray-900">{quantity}</span>
            </p>
        </div>
    );
};

export default function DashboardSections() {
    const { currentStoreId } = useCurrentStore();
    const [topSellingFilter, setTopSellingFilter] = useState('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState(10);

    const {
        data: sectionsData,
        isLoading,
        isError,
    } = useGetDashboardSectionsQuery({
        store_id: currentStoreId,
        filter: topSellingFilter,
        start_date: topSellingFilter === 'custom' ? customStartDate : undefined,
        end_date: topSellingFilter === 'custom' ? customEndDate : undefined,
        top_selling_limit: 5,
        low_stock_threshold: lowStockThreshold,
        low_stock_limit: 5,
        recent_sales_limit: 5,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                <SectionSkeleton />
                <SectionSkeleton />
                <SectionSkeleton />
            </div>
        );
    }

    if (isError || !sectionsData?.data) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center sm:p-6">
                <p className="text-sm text-red-600 sm:text-base">Failed to load dashboard sections. Please try again.</p>
            </div>
        );
    }

    const { top_selling_products, low_stock_products, recent_sales } = sectionsData.data;

    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Top Selling Products Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        Top Selling Products
                    </h2>
                    <select
                        value={topSellingFilter}
                        onChange={(e) => setTopSellingFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="today">Today</option>
                        <option value="last_week">Last Week</option>
                        <option value="custom">Custom Date</option>
                    </select>
                </div>

                {/* Custom Date Range Picker */}
                {topSellingFilter === 'custom' && (
                    <div className="mb-4 flex gap-2 rounded-lg bg-gray-50 p-3">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>
                )}

                {/* View All Button */}
                <button className="mb-3 w-full text-center text-sm font-medium text-orange-600 transition-colors hover:text-orange-700">View All</button>

                {/* Divider */}
                <div className="mb-3 border-t border-gray-200"></div>

                <div className="space-y-2">
                    {top_selling_products.products.length > 0 ? (
                        top_selling_products.products.map((product, index) => (
                            <div key={product.product_id}>
                                {index > 0 && <div className="my-2 border-t border-gray-200"></div>}
                                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all hover:bg-gray-100">
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                                        {product.product_image ? (
                                            <Image src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${product.product_image}`} alt={product.product_name} fill className="object-contain p-1" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900">{product.product_name}</p>
                                        <p className="text-xs text-gray-600">
                                            ৳{product.total_revenue.toLocaleString()} • {product.total_sales} Sales
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${product.trend === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.trend === 'positive' ? '↑' : '↓'} {product.percentage_change}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-2 text-sm text-gray-500">No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Low Stock Products Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Package className="h-5 w-5 text-red-500" />
                        Low Stock Products
                    </h2>
                    <select
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value={5}>Under 5</option>
                        <option value={10}>Under 10</option>
                        <option value={15}>Under 15</option>
                        <option value={50}>Under 50</option>
                        <option value={100}>Under 100</option>
                    </select>
                </div>

                {/* View All Button */}
                <button className="mb-3 w-full text-center text-sm font-medium text-red-600 transition-colors hover:text-red-700">View All</button>

                {/* Divider */}
                <div className="mb-3 border-t border-gray-200"></div>

                <div className="space-y-2">
                    {low_stock_products.products.length > 0 ? (
                        low_stock_products.products.map((product, index) => (
                            <div key={product.product_id}>
                                {index > 0 && <div className="my-2 border-t border-gray-200"></div>}
                                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all hover:bg-gray-100">
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                                        {product.product_image ? (
                                            <Image src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${product.product_image}`} alt={product.product_name} fill className="object-contain p-1" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900">{product.product_name}</p>
                                        <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                                    </div>
                                    <StockStatusBadge status={product.stock_status} quantity={product.stock_quantity} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-2 text-sm text-gray-500">No low stock products</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Sales Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        Recent Sales
                    </h2>
                </div>

                {/* View All Button */}
                <button className="mb-3 w-full text-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">View All</button>

                {/* Divider */}
                <div className="mb-3 border-t border-gray-200"></div>

                <div className="space-y-2">
                    {recent_sales.sales.length > 0 ? (
                        recent_sales.sales.map((sale, index) => (
                            <div key={sale.order_id}>
                                {index > 0 && <div className="my-2 border-t border-gray-200"></div>}
                                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all hover:bg-gray-100">
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                                        {sale.primary_product.image ? (
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${sale.primary_product.image}`}
                                                alt={sale.primary_product.name}
                                                fill
                                                className="object-contain p-1"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900">{sale.primary_product.name}</p>
                                        <p className="text-xs text-gray-600">
                                            {sale.customer_name} • ৳{sale.total_amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">{sale.order_date_formatted}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <p className="mb-1 text-xs text-gray-500">Status</p>
                                        <StatusBadge status={sale.status} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-2 text-sm text-gray-500">No recent sales</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
