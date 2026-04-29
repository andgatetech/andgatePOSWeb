'use client';

import Dropdown from '@/components/dropdown';
import IconBellBing from '@/components/icon/icon-bell-bing';
import IconInfoCircle from '@/components/icon/icon-info-circle';
import NotificationItem from '@/app/(application)/(protected)/notifications/components/NotificationItem';
import { useGetUnreadCountQuery, useMarkAllReadMutation } from '@/store/features/notification/notificationApi';
import { CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const NotificationDropdown = () => {
    const dropdownRef = useRef<any>(null);
    const isRtl = useSelector((state: RootState) => state.themeConfig.rtlClass) === 'rtl';

    const { data: unreadData, isLoading } = useGetUnreadCountQuery(undefined, {
        pollingInterval: 1800000, // 30 minutes
    });

    const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();

    const unreadCount = unreadData?.count || 0;
    const recentNotifications = unreadData?.recent || [];

    const router = useRouter();

    const handleMarkAllRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await markAllRead().unwrap();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const closeDropdown = () => {
        dropdownRef.current?.close();
    };

    const handleNotificationClick = () => {
        closeDropdown();
        router.push('/notifications');
    };

    return (
        <div className="dropdown shrink-0">
            <Dropdown
                ref={dropdownRef}
                offset={[0, 8]}
                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                btnClassName="relative flex items-center rounded-md bg-white/[0.08] p-2 text-white/75 transition-colors hover:bg-white/[0.15] hover:text-white"
                button={
                    <span>
                        <IconBellBing />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 flex items-center justify-center ltr:-right-1 rtl:-left-1">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger/40"></span>
                                <span className="relative inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            </span>
                        )}
                    </span>
                }
            >
                <ul className="w-[320px] divide-y !py-0 text-dark dark:divide-white/10 dark:text-white-dark sm:w-[380px]">
                    {/* Header */}
                    <li onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                                <h4 className="text-base font-semibold">Notifications</h4>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                    onClick={handleMarkAllRead}
                                    disabled={isMarkingAll}
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </li>

                    {/* Notification Items */}
                    {isLoading ? (
                        <li onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-3 p-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex animate-pulse items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </li>
                    ) : recentNotifications.length > 0 ? (
                        <>
                            {recentNotifications.map((notification) => (
                                <li key={notification.id} className="dark:text-white-light/90" onClick={(e) => e.stopPropagation()}>
                                    <NotificationItem notification={notification} variant="dropdown" onClickItem={handleNotificationClick} />
                                </li>
                            ))}
                            {/* Footer */}
                            <li>
                                <div className="p-3">
                                    <Link
                                        href="/notifications"
                                        className="btn btn-primary btn-small block w-full rounded-lg py-2 text-center text-sm font-medium"
                                        onClick={closeDropdown}
                                    >
                                        View All Notifications
                                    </Link>
                                </div>
                            </li>
                        </>
                    ) : (
                        <>
                            <li onClick={(e) => e.stopPropagation()}>
                                <div className="!grid min-h-[200px] place-content-center p-4 text-center">
                                    <div className="mx-auto mb-4 rounded-full ring-4 ring-primary/30">
                                        <IconInfoCircle fill={true} className="h-10 w-10 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No new notifications</p>
                                </div>
                            </li>
                            <li>
                                <div className="p-3">
                                    <Link
                                        href="/notifications"
                                        className="btn btn-primary btn-small block w-full rounded-lg py-2 text-center text-sm font-medium"
                                        onClick={closeDropdown}
                                    >
                                        View All Notifications
                                    </Link>
                                </div>
                            </li>
                        </>
                    )}
                </ul>
            </Dropdown>
        </div>
    );
};

export default NotificationDropdown;
