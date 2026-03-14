'use client';

import { useArchiveNotificationMutation, useMarkAsReadMutation } from '@/store/features/notification/notificationApi';
import type { Notification } from '@/store/features/notification/notificationTypes';
import { AlertTriangle, Archive, Bell, CheckCircle, CircleAlert, Info, Mail, MailOpen, X, Trash2 } from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
    variant?: 'dropdown' | 'list';
    onClickItem?: () => void;
}

const severityConfig = {
    info: {
        icon: Info,
        borderColor: 'border-blue-200 dark:border-blue-900/50',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-500',
        badgeColor: 'bg-blue-100/50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    success: {
        icon: CheckCircle,
        borderColor: 'border-emerald-200 dark:border-emerald-900/50',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        iconColor: 'text-emerald-500',
        badgeColor: 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    warning: {
        icon: AlertTriangle,
        borderColor: 'border-amber-200 dark:border-amber-900/50',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        iconColor: 'text-amber-500',
        badgeColor: 'bg-amber-100/50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    critical: {
        icon: CircleAlert,
        borderColor: 'border-red-200 dark:border-red-900/50',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        iconColor: 'text-red-500',
        badgeColor: 'bg-red-100/50 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
};

const NotificationItem = ({ notification, variant = 'list', onClickItem }: NotificationItemProps) => {
    const [markAsRead, { isLoading: isMarking }] = useMarkAsReadMutation();
    const [archiveNotification, { isLoading: isArchiving }] = useArchiveNotificationMutation();

    const config = severityConfig[notification.severity] || severityConfig.info;
    const SeverityIcon = config.icon;

    const handleMarkRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await markAsRead(notification.id).unwrap();
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleArchive = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await archiveNotification(notification.id).unwrap();
        } catch (err) {
            console.error('Failed to archive:', err);
        }
    };

    if (variant === 'dropdown') {
        return (
            <div
                className={`group flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    !notification.is_read ? 'bg-gray-100/80 dark:bg-gray-800/80' : 'bg-transparent'
                }`}
                onClick={onClickItem}
            >
                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
                    <SeverityIcon className={`h-4 w-4 ${config.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className={`truncate text-sm ${!notification.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                        </p>
                        {!notification.is_read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{notification.created_at_human}</p>
                </div>
                <button
                    type="button"
                    className="mt-1 flex-shrink-0 rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    onClick={handleArchive}
                    disabled={isArchiving}
                    title="Dismiss"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        );
    }

    // List variant (full page)
    return (
        <div
            className={`rounded-xl border shadow-sm p-4 transition-colors ${config.borderColor} ${
                !notification.is_read 
                ? 'bg-white ring-1 ring-opacity-10 dark:bg-[#121c2c] ring-indigo-500' 
                : 'bg-white dark:bg-[#121c2c]'
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                {/* Left: Icon + Content */}
                <div className="flex flex-1 min-w-0 items-start gap-3">
                    {/* Icon Background */}
                    <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
                        <SeverityIcon className={`h-5 w-5 ${config.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h4 className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                {notification.title}
                            </h4>

                            {/* Unread dot indicator (next to title) */}
                            {!notification.is_read && (
                                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500 mt-0.5"></span>
                            )}

                            {/* Severity Badge */}
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${config.badgeColor}`}>
                                {notification.severity}
                            </span>

                            {/* Type Label */}
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {notification.type_label}
                            </span>
                        </div>

                        <p className="mb-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                            <span>{notification.created_at_human}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions (Mark Read / Archive) */}
                <div className="flex flex-shrink-0 items-center gap-2">
                    {!notification.is_read && (
                        <button
                            type="button"
                            onClick={(e) => void handleMarkRead(e)}
                            disabled={isMarking}
                            className="rounded-lg border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10 disabled:opacity-50"
                        >
                            Read
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => void handleArchive(e)}
                        disabled={isArchiving}
                        title="Archive"
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
