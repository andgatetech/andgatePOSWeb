import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import Dropdown from '../dropdown';
import IconHorizontalDots from '../icon/icon-horizontal-dots';

const Revenue = ({ isRtl = false, orders, isLoading, isError }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="animate-pulse space-y-4 p-6">
            <div className="h-6 w-32 rounded bg-gray-300"></div>
            <div className="flex space-x-4">
                <div className="h-6 w-24 rounded bg-gray-300"></div>
                <div className="h-6 w-24 rounded bg-gray-300"></div>
                <div className="h-6 w-24 rounded bg-gray-300"></div>
            </div>
            <div className="mt-6 h-80 rounded bg-gray-300"></div>
        </div>
    );

    if (isLoading)
        return (
            <div className="panel h-full xl:col-span-2">
                <LoadingSkeleton />
            </div>
        );

    if (isError)
        return (
            <div className="panel grid h-full place-content-center xl:col-span-2">
                <p>Failed to load revenue data</p>
            </div>
        );

    // const orders = Array.isArray(data?.data) ? data.data : [];

    if (orders.length === 0) {
        return (
            <div className="panel grid h-full place-content-center xl:col-span-2">
                <p className="text-lg text-gray-500 dark:text-gray-400">No orders found yet. Your revenue data will appear here once you have orders.</p>
            </div>
        );
    }

    // Group orders by month
    const revenueByMonth: Record<string, number> = {};
    const expenseByMonth: Record<string, number> = {};

    orders.forEach((order) => {
        const date = new Date(order.created_at);
        const monthKey = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
        });

        // Revenue
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + Number(order.grand_total || 0);

        // Expense
        const orderExpense =
            order.items?.reduce((sum, item) => {
                const purchasePrice = item.product?.purchase_price ?? 0;
                return sum + Number(item.quantity || 0) * Number(purchasePrice);
            }, 0) || 0;

        expenseByMonth[monthKey] = (expenseByMonth[monthKey] || 0) + orderExpense;
    });

    const months = Object.keys(revenueByMonth).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const revenueData = months.map((month) => revenueByMonth[month]);
    const expenseData = months.map((month) => expenseByMonth[month]);

    const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0);
    const totalExpense = expenseData.reduce((sum, val) => sum + val, 0);
    const totalProfit = totalRevenue - totalExpense;

    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, stacked: false },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        xaxis: { categories: months },
        colors: ['#3b82f6', '#ef4444'],
        fill: { opacity: 0.3 },
        grid: { borderColor: '#f1f1f1' },
        tooltip: {
            y: {
                formatter: (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            },
        },
    };

    const chartSeries = [
        { name: 'Revenue', data: revenueData },
        { name: 'Expense', data: expenseData },
    ];

    return (
        <div className="panel h-full xl:col-span-2">
            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">Revenue</h5>
                <div className="dropdown">
                    <Dropdown offset={[0, 1]} placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />}>
                        <ul>
                            <li>
                                <button type="button">Monthly</button>
                            </li>
                        </ul>
                    </Dropdown>
                </div>
            </div>

            <p className="text-lg dark:text-white-light/90">
                Total Revenue: <span className="ml-2 text-primary">৳{totalRevenue.toLocaleString()}</span>
            </p>
            <p className="text-lg dark:text-white-light/90">
                Total Expense: <span className="ml-2 text-red-500">৳{totalExpense.toLocaleString()}</span>
            </p>
            <p className="text-lg font-semibold dark:text-white-light/90">
                Total Profit: <span className={`${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>৳{totalProfit.toLocaleString()}</span>
            </p>

            <div className="relative mt-6 rounded-lg bg-white dark:bg-black">
                {isMounted ? (
                    <ReactApexChart series={chartSeries} options={chartOptions} type="area" height={325} width={'100%'} />
                ) : (
                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Revenue;
