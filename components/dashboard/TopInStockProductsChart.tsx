'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetTopBrandsByStockQuery } from '@/store/features/brand/brandApi';
import { Package, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const TopInStockProductsChart: React.FC = () => {
    const { currentStoreId, currentStore } = useCurrentStore();

    // Fetch top products data
    // const { data, isLoading, isError } = useGetTopInStockProductsQuery(currentStoreId, {
    //     skip: !currentStoreId,
    // });
    const { data, isLoading, isError } = useGetTopBrandsByStockQuery(currentStoreId, {
        skip: !currentStoreId,
    });

    const products = data?.data || [];

    // Prepare chart data
    const productLabels = products.map((p) => `${p.product_name} (${p.brand_name})`);
    const stockQuantities = products.map((p) => p.total_stock);

    // Apex Chart Config
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            height: 400,
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: true,
                distributed: true,
                barHeight: '70%',
                dataLabels: {
                    position: 'top',
                },
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => val.toLocaleString(),
            offsetX: 30,
            style: {
                fontSize: '12px',
                colors: ['#304758'],
                fontWeight: 600,
            },
        },
        xaxis: {
            categories: productLabels,
            labels: {
                style: {
                    fontSize: '11px',
                },
            },
            title: {
                text: 'Total Stock Quantity',
                style: {
                    fontSize: '13px',
                    fontWeight: 600,
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '11px',
                },
                maxWidth: 200,
            },
        },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'],
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val: number) => `${val.toLocaleString()} units`,
                title: {
                    formatter: () => 'Stock:',
                },
            },
        },
        legend: {
            show: false,
        },
        grid: {
            borderColor: '#e5e7eb',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: false,
                },
            },
        },
    };

    const series = [
        {
            name: 'Stock Quantity',
            data: stockQuantities,
        },
    ];

    return (
        <div className="panel h-full w-full">
            <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-500" />
                    <h5 className="text-lg font-semibold dark:text-white-light">Top 10 In-Stock Products</h5>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 dark:bg-green-900/20">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Best Performers</span>
                </div>
            </div>

            {/* Chart */}
            <div className="w-full">
                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
                            <p className="text-sm text-gray-500">Loading product data...</p>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="text-center">
                            <Package className="mx-auto mb-2 h-12 w-12 text-red-300" />
                            <p className="text-red-500">Failed to load products.</p>
                            <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="text-center">
                            <Package className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                            <p className="text-gray-500">No products in stock.</p>
                            <p className="mt-1 text-sm text-gray-400">Start adding inventory to see data here.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <ReactApexChart options={chartOptions} series={series} type="bar" height={400} />

                        {/* Summary Stats */}
                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-4">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Products</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{products.length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Stock</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{stockQuantities.reduce((sum, qty) => sum + qty, 0).toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Highest Stock</p>
                                <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">{Math.max(...stockQuantities).toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Average Stock</p>
                                <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {Math.round(stockQuantities.reduce((sum, qty) => sum + qty, 0) / products.length).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TopInStockProductsChart;
