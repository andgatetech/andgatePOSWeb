'use client';

import { useMarkAsReadMutation, useGetUnreadCountQuery } from '@/store/features/notification/notificationApi';
import { AlertTriangle, CircleAlert, Megaphone, X } from 'lucide-react';
import Marquee from 'react-fast-marquee';

const CriticalBanner = () => {
    // Shares cached data with the dropdown — no extra API call
    const { data: unreadData } = useGetUnreadCountQuery(undefined, {
        pollingInterval: 1800000, // 30 minutes
    });

    const [markAsRead] = useMarkAsReadMutation();

    const criticalNotifications = unreadData?.critical || [];
    const infoNotifications = unreadData?.info || [];
    
    // Combine both arrays to render them all
    const allBanners = [...criticalNotifications, ...infoNotifications];

    const handleDismiss = async (id: number) => {
        try {
            await markAsRead(id).unwrap();
        } catch (err) {
            console.error('Failed to dismiss notification:', err);
        }
    };

    if (allBanners.length === 0) return null;

    return (
        <div className="space-y-0">
            {allBanners.map((notification) => {
                const isCritical = notification.severity === 'critical';
                const isInfo = notification.severity === 'info';

                let bgColor = 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
                let hoverBg = 'hover:bg-amber-200/50 dark:hover:bg-amber-800/50';
                
                if (isCritical) {
                    bgColor = 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200';
                    hoverBg = 'hover:bg-red-200/50 dark:hover:bg-red-800/50';
                } else if (isInfo) {
                    bgColor = 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
                    hoverBg = 'hover:bg-blue-200/50 dark:hover:bg-blue-800/50';
                }

                return (
                    <div
                        key={notification.id}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium ${bgColor}`}
                    >
                        {isCritical ? (
                            <CircleAlert className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        ) : isInfo ? (
                            <Megaphone className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                        )}

                        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
                            <span className="whitespace-nowrap font-bold ltr:mr-2 rtl:ml-2">{notification.title}:</span>
                            <div className="flex-1 overflow-hidden">
                                <Marquee speed={60} pauseOnHover={true} gradient={false} className="w-full">
                                    <span className="opacity-90 leading-tight block">{notification.message}</span>
                                </Marquee>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={`flex-shrink-0 rounded p-1 transition-colors ${hoverBg}`}
                            onClick={() => handleDismiss(notification.id)}
                            title="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default CriticalBanner;
