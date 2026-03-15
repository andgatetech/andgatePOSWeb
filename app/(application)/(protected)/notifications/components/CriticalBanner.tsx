'use client';

import { useGetUnreadCountQuery, useMarkAsReadMutation } from '@/store/features/notification/notificationApi';
import { AlertTriangle, CircleAlert, Megaphone, Sparkles, X } from 'lucide-react';
import Marquee from 'react-fast-marquee';

const CriticalBanner = () => {
    // Shares cached data with the dropdown — no extra API call
    const { data: unreadData } = useGetUnreadCountQuery(undefined, {
        pollingInterval: 1800000, // 30 minutes
    });

    const [markAsRead] = useMarkAsReadMutation();

    const criticalNotifications = unreadData?.critical || [];
    const infoNotifications = unreadData?.info || [];
    // If you plan to show warnings or successes in the banner, you could add them here too

    // Combine arrays to render them all
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
        <div className="flex flex-col gap-2 mb-4">
            {allBanners.map((notification) => {
                const sev = notification.severity;

                let config = {
                    bgColor: 'bg-[#E9D5FF] text-[#3B0764] dark:bg-[#5B21B6] dark:text-[#E9D5FF]',
                    Icon: Megaphone,
                    iconColor: 'text-[#3B0764] dark:text-[#E9D5FF]',
                    label: 'Notice',
                };

                if (sev === 'critical') {
                    config = {
                        bgColor: 'bg-[#CC071E] text-white',
                        Icon: CircleAlert,
                        iconColor: 'text-white',
                        label: 'Critical',
                    };
                } else if (sev === 'warning') {
                    config = {
                        bgColor: 'bg-[#FEF3C7] text-black dark:bg-[#B45309] dark:text-amber-100',
                        Icon: AlertTriangle,
                        iconColor: 'text-[#D97706] dark:text-amber-200',
                        label: 'Warning',
                    };
                } else if (sev === 'success') {
                    config = {
                        bgColor: 'bg-[#CCFBF1] text-[#1F2937] dark:bg-[#115E59] dark:text-[#CCFBF1]',
                        Icon: Sparkles,
                        iconColor: 'text-[#FBBF24] dark:text-[#FDE047]',
                        label: 'New Feature',
                    };
                }

                return (
                    <div key={notification.id} className={`flex items-center gap-3 px-6 py-2.5 text-sm ${config.bgColor}`}>
                        <config.Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />

                        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
                            <span className="whitespace-nowrap font-extrabold ltr:mr-2 rtl:ml-2">{config.label}:</span>
                            <div className="flex-1 overflow-hidden">
                                <Marquee speed={60} pauseOnHover={true} gradient={false} className="w-full">
                                    <span className="block font-semibold leading-tight opacity-95">{notification.message}</span>
                                </Marquee>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="flex-shrink-0 rounded p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
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
