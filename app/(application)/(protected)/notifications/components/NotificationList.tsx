'use client';

import NotificationItem from '@/app/(application)/(protected)/notifications/components/NotificationItem';
import { useGetNotificationsQuery, useMarkAllReadMutation } from '@/store/features/notification/notificationApi';
import type { GetNotificationsParams } from '@/store/features/notification/notificationTypes';
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FilterTab = 'all' | 'unread' | 'read';

const NotificationList = () => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

    const queryParams: GetNotificationsParams = {
        page: currentPage,
        per_page: 20,
    };

    if (activeFilter === 'unread') queryParams.is_read = 0;
    if (activeFilter === 'read') queryParams.is_read = 1;

    const { data, isLoading, isFetching } = useGetNotificationsQuery(queryParams);
    const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();

    const notifications = data?.data?.items || [];
    const pagination = data?.data?.pagination;

    const handleFilterChange = (filter: FilterTab) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead().unwrap();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    // Generate visible page numbers
    const getPageNumbers = () => {
        if (!pagination) return [];
        const pages: (number | string)[] = [];
        const { current_page, last_page } = pagination;

        if (last_page <= 7) {
            for (let i = 1; i <= last_page; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current_page > 3) pages.push('...');

            const start = Math.max(2, current_page - 1);
            const end = Math.min(last_page - 1, current_page + 1);
            for (let i = start; i <= end; i++) pages.push(i);

            if (current_page < last_page - 2) pages.push('...');
            pages.push(last_page);
        }

        return pages;
    };

    const filterTabs: { key: FilterTab; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'unread', label: 'Unread' },
        { key: 'read', label: 'Read' },
    ];

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                                activeFilter === tab.key
                                    ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                            onClick={() => handleFilterChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {pagination && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {pagination.from}–{pagination.to} of {pagination.total}
                        </span>
                    )}
                    <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={handleMarkAllRead}
                        disabled={isMarkingAll}
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#121c2c]">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="flex-1 space-y-3 py-1">
                                        <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <div className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-8 w-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : notifications.length > 0 ? (
                <div className={`space-y-2 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                    {notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} variant="list" onClickItem={() => router.push(`/notifications/${notification.id}`)} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white py-16 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                        <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">No notifications</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {activeFilter === 'unread' ? "You're all caught up!" : activeFilter === 'read' ? 'No read notifications yet.' : 'No notifications to show.'}
                    </p>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-1 pt-2">
                    <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.current_page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {getPageNumbers().map((page, idx) =>
                        typeof page === 'string' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                                …
                            </span>
                        ) : (
                            <button
                                key={page}
                                type="button"
                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                    page === pagination.current_page
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                        disabled={!pagination.has_more_pages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationList;
