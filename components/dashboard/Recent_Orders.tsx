'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { Calendar, ChevronDown, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DATE_FILTER_OPTIONS = [
    { value: 'none', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
];

const Recent_Orders = () => {
    const { currentStoreId } = useCurrentStore();

    const [dateFilterType, setDateFilterType] = useState<'none' | 'today' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom'>('none');
    const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showDateDropdown, setShowDateDropdown] = useState(false);

    // Track when filters change, to force refetch
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    // Compute date range
    const getDateRange = useCallback(() => {
        const now = new Date();
        switch (dateFilterType) {
            case 'today':
                return {
                    start_date: format(startOfDay(now), 'yyyy-MM-dd HH:mm:ss'),
                    end_date: format(endOfDay(now), 'yyyy-MM-dd HH:mm:ss'),
                };
            case 'this_week':
                return {
                    start_date: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss'),
                    end_date: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss'),
                };
            case 'last_week':
                return {
                    start_date: format(startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss'),
                    end_date: format(endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss'),
                };
            case 'this_month':
                return {
                    start_date: format(startOfMonth(now), 'yyyy-MM-dd HH:mm:ss'),
                    end_date: format(endOfMonth(now), 'yyyy-MM-dd HH:mm:ss'),
                };
            case 'last_month':
                return {
                    start_date: format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd HH:mm:ss'),
                    end_date: format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd HH:mm:ss'),
                };
            case 'custom':
                return {
                    start_date: `${customStartDate} 00:00:00`,
                    end_date: `${customEndDate} 23:59:59`,
                };
            default:
                return null;
        }
    }, [dateFilterType, customStartDate, customEndDate]);

    // Build API query params
    const filters = useMemo(() => {
        const params: any = { store_id: currentStoreId, refetchTrigger }; // refetchTrigger ensures hook refresh
        const dateRange = getDateRange();
        if (dateRange) {
            params.start_date = dateRange.start_date;
            params.end_date = dateRange.end_date;
        }
        return params;
    }, [currentStoreId, getDateRange, refetchTrigger]);

    // Fetch data from API
    const { data, isLoading, isError, refetch } = useGetAllOrdersQuery(filters);

    // Force refetch when filters change
    useEffect(() => {
        refetch();
    }, [filters, refetch]);

    // Reset filters
    const resetFilters = () => {
        setDateFilterType('none');
        setCustomStartDate(format(new Date(), 'yyyy-MM-dd'));
        setCustomEndDate(format(new Date(), 'yyyy-MM-dd'));
        setRefetchTrigger((prev) => prev + 1);
    };

    if (isError) return <p>Failed to load orders</p>;

    // Handle response safely
    const ordersArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    const sortedOrders = ordersArray.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const recent7 = sortedOrders.slice(0, 7);

    const SkeletonRow = () => (
        <tr>
            {[1, 2, 3, 4, 5].map((i) => (
                <td key={i} className="h-6 py-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
                </td>
            ))}
        </tr>
    );

    return (
        <div className="panel h-full w-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h5 className="text-lg font-semibold dark:text-white-light">Recent Orders</h5>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDateDropdown(!showDateDropdown)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                        >
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{DATE_FILTER_OPTIONS.find((opt) => opt.value === dateFilterType)?.label || 'All Dates'}</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {showDateDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)} />
                                <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                                    {DATE_FILTER_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                setDateFilterType(opt.value as any);

                                                if (opt.value !== 'custom') {
                                                    setShowDateDropdown(false);
                                                    setRefetchTrigger((prev) => prev + 1);
                                                }
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${dateFilterType === opt.value ? 'bg-blue-50 text-blue-600' : ''}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}

                                    {dateFilterType === 'custom' && (
                                        <div className="space-y-3 border-t border-gray-100 p-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-700">From Date</label>
                                                <input
                                                    type="date"
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-700">To Date</label>
                                                <input
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setRefetchTrigger((prev) => prev + 1);
                                                    setShowDateDropdown(false);
                                                }}
                                                className="w-full rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Reset */}
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        title="Reset Filters"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Order ID</th>
                            <th>Grand Total</th>
                            <th>Items</th>
                            <th>Payment Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading
                            ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                            : recent7.map((order) => (
                                  <tr key={order.id} className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                      <td className="min-w-[150px] text-black dark:text-white">{order.customer?.name || 'Unknown'}</td>
                                      <td>
                                          <Link href={`/orders/${order.id}`}>{order.id}</Link>
                                      </td>
                                      <td>৳{Number(order.grand_total || 0).toFixed(2)}</td>
                                      <td>{order.items?.length || 0}</td>
                                      <td>
                                          <span className={`badge shadow-md ${order.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}`}>{order.payment_status}</span>
                                      </td>
                                  </tr>
                              ))}
                        {!isLoading && recent7.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Recent_Orders;
