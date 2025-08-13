import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useGetCategoriesQuery } from '@/store/features/category/categoryApi';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';

const Sale_by = () => {
    const { data: categoriesData } = useGetCategoriesQuery();
    const { data: ordersData, isLoading, isError } = useGetAllOrdersQuery();

    const categories = categoriesData?.data || [];
    const orders = ordersData?.data || [];

    // Count total sales per category
    const categorySales: Record<number, number> = {};
    categories.forEach((cat: any) => {
        categorySales[cat.id] = 0;
    });

    orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
            const catId = item.product.category_id;
            if (catId in categorySales) {
                categorySales[catId] += item.subtotal; // sum subtotal per category
            }
        });
    });

    const series = Object.values(categorySales);
    const labels = categories.map((cat: any) => cat.name);
    const totalOrders = orders.length; // total orders to display in center

    const salesByCategory = {
        series,
        options: {
            chart: { type: 'donut', height: 460, fontFamily: 'Nunito, sans-serif' },
            dataLabels: { enabled: false },
            stroke: { show: true, width: 25, colors: '#fff' },
            colors: ['#e2a03f', '#5c1ac3', '#e7515a', '#1abc9c', '#f39c12'],
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
        },
    };

    if (isLoading) {
        // Skeleton placeholder for chart
        return (
            <div className="grid min-h-[460px] animate-pulse place-content-center rounded-lg bg-gray-200 dark:bg-gray-700">
                <div className="mb-4 h-12 w-40 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                <div className="mx-auto h-64 w-64 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
        );
    }

    if (isError) return <div>Error loading sales data</div>;

    return (
        <div className="">
            <div className="panel h-full">
                <div className="mb-5 flex items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Sales By Category</h5>
                </div>
                <div>
                    <div className="rounded-lg bg-white dark:bg-black">
                        <ReactApexChart series={salesByCategory.series} options={salesByCategory.options} type="donut" height={460} width={'100%'} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sale_by;
