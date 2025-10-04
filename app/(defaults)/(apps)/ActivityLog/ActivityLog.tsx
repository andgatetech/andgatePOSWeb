'use client';

import { useGetActivityLogsQuery } from '@/store/features/Product/productApi';
import { Activity, ArrowRight, Calendar, Clock, Package, RefreshCw, Search, TrendingDown, TrendingUp, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const ActivityLog = () => {
    const { data: apiResponse, isLoading: apiLoading, refetch } = useGetActivityLogsQuery();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [userFilter, setUserFilter] = useState('all');
    const [storeFilter, setStoreFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Extract activities from API response
    const activities = apiResponse?.success ? apiResponse.data : [];

    // Get unique users and stores for filters
    const uniqueUsers = useMemo(() => {
        return [...new Set(activities.map((activity) => activity.user?.name).filter(Boolean))];
    }, [activities]);

    const uniqueStores = useMemo(() => {
        // Since store info isn't directly in the response, we'll use store_id for now
        // You might need to modify this based on your actual store data structure
        return [...new Set(activities.map((activity) => `Store ${activity.store_id}`))];
    }, [activities]);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
    };

    // Get change type styling
    const getChangeType = (field, oldValue, newValue) => {
        if (field === 'price') {
            const oldPrice = parseFloat(oldValue);
            const newPrice = parseFloat(newValue);
            if (oldPrice !== newPrice) {
                return newPrice > oldPrice ? 'increase' : 'decrease';
            }
        }
        if (field === 'quantity') {
            const oldQty = parseInt(oldValue);
            const newQty = parseInt(newValue);
            if (oldQty !== newQty) {
                return newQty > oldQty ? 'increase' : 'decrease';
            }
        }
        return 'update';
    };

    // Get change styling
    const getChangeStyle = (type) => {
        switch (type) {
            case 'increase':
                return {
                    icon: TrendingUp,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                };
            case 'decrease':
                return {
                    icon: TrendingDown,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                };
            default:
                return {
                    icon: RefreshCw,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                };
        }
    };

    // Filter activities by date
    const filterByDate = (activity) => {
        if (dateFilter === 'all') return true;

        const activityDate = new Date(activity.created_at);
        const today = new Date();

        switch (dateFilter) {
            case 'today':
                return activityDate.toDateString() === today.toDateString();
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return activityDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                return activityDate >= monthAgo;
            default:
                return true;
        }
    };

    // Get actual changes between before and after
    const getActualChanges = (changes) => {
        const actualChanges = {};
        const { before, after } = changes;

        // Compare each field
        Object.keys(after).forEach((key) => {
            if (before[key] !== after[key] && key !== 'created_at' && key !== 'updated_at' && key !== 'id') {
                actualChanges[key] = {
                    before: before[key],
                    after: after[key],
                };
            }
        });

        return actualChanges;
    };

    // Filter and sort activities
    const filteredAndSortedActivities = useMemo(() => {
        let filtered = activities.filter((activity) => {
            const productName = activity.product?.product_name || '';
            const userName = activity.user?.name || '';
            const storeName = `Store ${activity.store_id}`;

            const matchesSearch =
                productName.toLowerCase().includes(searchTerm.toLowerCase()) || userName.toLowerCase().includes(searchTerm.toLowerCase()) || storeName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesUser = userFilter === 'all' || userName === userFilter;
            const matchesStore = storeFilter === 'all' || storeName === storeFilter;
            const matchesDate = filterByDate(activity);

            return matchesSearch && matchesUser && matchesStore && matchesDate;
        });

        // Sort activities
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (sortField === 'created_at') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [activities, searchTerm, userFilter, storeFilter, dateFilter, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedActivities.length / itemsPerPage);
    const currentActivities = filteredAndSortedActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, userFilter, storeFilter, dateFilter]);

    // Get stats
    const getStats = () => {
        const today = new Date();
        const todayActivities = activities.filter((activity) => new Date(activity.created_at).toDateString() === today.toDateString());

        return {
            total: activities.length,
            today: todayActivities.length,
            uniqueProducts: new Set(activities.map((a) => a.product_id)).size,
            uniqueUsers: new Set(activities.map((a) => a.user_id)).size,
        };
    };

    const stats = getStats();

    // Handle refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } catch (error) {
            console.error('Failed to refresh:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (apiLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                            <p className="mt-2 text-gray-600">Loading activity logs...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
                        <p className="mt-2 text-gray-600">Track all product changes and updates</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                                <p className="text-2xl font-bold text-green-600">{stats.today}</p>
                            </div>
                            <Clock className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Products Updated</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.uniqueProducts}</p>
                            </div>
                            <Package className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search activities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:w-64"
                                />
                            </div>

                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Show:</label>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Activity List */}
                <div className="space-y-4">
                    {currentActivities.map((activity) => {
                        const { date, time } = formatDate(activity.created_at);
                        const actualChanges = getActualChanges(activity.changes);

                        return (
                            <div key={activity.id} className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    {/* Activity Header */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                    <User className="h-5 w-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-medium text-gray-900">{activity.user?.name || 'Unknown User'}</span>
                                                    <span className="text-gray-500">updated</span>
                                                    <span className="font-medium text-blue-600">{activity.product?.product_name || 'Unknown Product'}</span>
                                                    <span className="text-gray-500">in</span>
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-600">Store {activity.store_id}</span>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{date}</span>
                                                    <Clock className="ml-2 h-4 w-4" />
                                                    <span>{time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Changes */}
                                    <div className="max-w-2xl flex-1">
                                        <div className="space-y-3">
                                            {Object.keys(actualChanges).length > 0 ? (
                                                Object.entries(actualChanges).map(([field, change]) => {
                                                    const changeType = getChangeType(field, change.before, change.after);
                                                    const style = getChangeStyle(changeType);
                                                    const IconComponent = style.icon;

                                                    return (
                                                        <div key={field} className={`flex items-center gap-3 rounded-lg border p-3 ${style.bgColor} ${style.borderColor}`}>
                                                            <IconComponent className={`h-4 w-4 ${style.color} flex-shrink-0`} />
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <span className="font-medium capitalize text-gray-700">{field.replace('_', ' ')}:</span>
                                                                    <span className="rounded border bg-white px-2 py-1 text-gray-600">{field === 'price' ? `৳${change.before}` : change.before}</span>
                                                                    <ArrowRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                                                    <span className={`rounded border px-2 py-1 font-medium ${style.color} bg-white`}>
                                                                        {field === 'price' ? `৳${change.after}` : change.after}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                    <RefreshCw className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                                    <span className="text-sm text-gray-600">No significant changes detected</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 rounded-lg border bg-white px-6 py-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedActivities.length)} of {filteredAndSortedActivities.length}{' '}
                                activities
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`rounded-md px-3 py-1 text-sm font-medium ${
                                                    currentPage === pageNumber ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {currentActivities.length === 0 && (
                    <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
                        <Activity className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || userFilter !== 'all' || storeFilter !== 'all' || dateFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'No product updates have been recorded yet.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
