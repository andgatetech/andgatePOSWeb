'use client';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';

const SaleByCategory = () => {
    const { data: categoriesData, isLoading: isLoadingCategories, isError: isErrorCategories } = useGetCategoryQuery();
    const { data: ordersData, isLoading: isLoadingOrders, isError: isErrorOrders } = useGetAllOrdersQuery();

    const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
    const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];

    // Calculate sales per category
    const categorySales: Record<number, number> = {};
    categories.forEach((cat) => (categorySales[cat.id] = 0));
    orders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
            const catId = item.product?.category_id;
            const subtotal = Number(item.subtotal) || 0;
            if (catId && catId in categorySales) categorySales[catId] += subtotal;
        });
    });

    const series = Object.values(categorySales);
    const labels = categories.map((cat) => cat.name || 'N/A');
    const totalOrders = orders.length;

    const chartOptions = {
        chart: { type: 'donut', height: 460, fontFamily: 'Nunito, sans-serif' },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 25, colors: '#fff' },
        colors: ['#e2a03f', '#5c1ac3', '#e7515a', '#1abc9c', '#f39c12', '#6c757d', '#198754'],
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: { width: 10, height: 10, offsetX: -2 },
            height: 50,
            offsetY: 20,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '22px', offsetY: -10 },
                        value: { show: true, fontSize: '20px', color: '#bfc9d4', offsetY: 16 },
                        total: {
                            show: true,
                            label: 'Orders',
                            color: '#888ea8',
                            fontSize: '26px',
                            formatter: () => totalOrders,
                        },
                    },
                },
            },
        },
        labels,
        states: {
            hover: { filter: { type: 'none', value: 0.15 } },
            active: { filter: { type: 'none', value: 0.15 } },
        },
    };

    // Loading skeleton
    if (isLoadingOrders || isLoadingCategories) {
        return (
            <div className="grid min-h-[460px] animate-pulse place-content-center rounded-lg bg-gray-200 dark:bg-gray-700">
                <div className="mb-4 h-12 w-40 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                <div className="mx-auto h-64 w-64 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
        );
    }

    // Error
    if (isErrorOrders || isErrorCategories) return <div className="panel grid h-32 place-content-center text-center text-red-500 dark:text-red-400">Error loading sales data</div>;

    // No data
    if (!orders.length || !categories.length) return <div className="panel grid h-32 place-content-center text-center text-gray-500 dark:text-gray-400">No sales data available.</div>;

    return (
        <div className="panel h-full">
            <div className="mb-5 flex items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Sales By Category</h5>
            </div>
            <div className="rounded-lg bg-white dark:bg-black">
                <ReactApexChart series={series} options={chartOptions} type="donut" height={460} width="100%" />
            </div>
        </div>
    );
};

export default SaleByCategory;
