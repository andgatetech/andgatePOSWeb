'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDashboardAlertsQuery } from '@/store/features/dashboard/dashboad';
import { AlertTriangle, Bell, CalendarClock, Package, ShoppingBag, Wallet } from 'lucide-react';
import Link from 'next/link';

interface NotificationAlert {
    type: string;
    label: string;
    severity: 'warning' | 'critical';
    count: number;
    action_url: string | null;
}

export default function AlertStrip() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();

    const { data, isLoading } = useGetDashboardAlertsQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );

    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 w-44 animate-pulse rounded-xl bg-gray-200" />
                ))}
            </div>
        );
    }

    const alerts = data?.data;
    if (!alerts) return null;

    const chips = [
        {
            show: alerts.pending_orders > 0,
            icon: ShoppingBag,
            label: `${alerts.pending_orders} ${t('lbl_pending_orders')}`,
            href: '/orders',
            bg: 'bg-amber-50 border-amber-200 text-amber-700',
            dot: 'bg-amber-500',
        },
        {
            show: alerts.low_stock > 0,
            icon: Package,
            label: `${alerts.low_stock} ${t('lbl_low_stock')}`,
            href: '/reports/stock',
            bg: 'bg-orange-50 border-orange-200 text-orange-700',
            dot: 'bg-orange-500',
        },
        {
            show: alerts.out_of_stock > 0,
            icon: AlertTriangle,
            label: `${alerts.out_of_stock} ${t('lbl_out_of_stock')}`,
            href: '/reports/stock',
            bg: 'bg-red-50 border-red-200 text-red-700',
            dot: 'bg-red-500',
        },
        {
            show: alerts.receivable > 0,
            icon: Wallet,
            label: `${formatCurrency(alerts.receivable)} ${t('lbl_receivable')}`,
            href: '/reports/sales',
            bg: 'bg-blue-50 border-blue-200 text-blue-700',
            dot: 'bg-blue-500',
        },
        {
            show: alerts.expired_stock > 0,
            icon: CalendarClock,
            label: `${alerts.expired_stock} ${t('lbl_expired_stock')}`,
            href: '/reports/stock',
            bg: 'bg-red-50 border-red-200 text-red-700',
            dot: 'bg-red-500',
        },
        {
            show: alerts.near_expiry_stock > 0,
            icon: CalendarClock,
            label: `${alerts.near_expiry_stock} ${t('lbl_near_expiry_stock')}`,
            href: '/reports/stock',
            bg: 'bg-amber-50 border-amber-200 text-amber-700',
            dot: 'bg-amber-500',
        },
    ].filter((c) => c.show);

    // Notification-derived chips — unread warning/critical notifications
    // (subscription expiring, purchase order pending, customer due overdue,
    // etc.) surfaced here instead of only living in the bell dropdown.
    const notificationChips = ((alerts.notifications || []) as NotificationAlert[]).map((n) => ({
        show: true,
        icon: Bell,
        label: `${n.count} ${n.label}`,
        href: n.action_url || '/notifications',
        bg: n.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700',
        dot: n.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500',
    }));

    const allChips = [...chips, ...notificationChips];

    if (!allChips.length) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">{t('lbl_alerts')}:</span>
            {allChips.map(({ icon: Icon, label, href, bg, dot }) => (
                <Link
                    key={href + label}
                    href={href}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 ${bg}`}
                >
                    <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`} />
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    {label}
                </Link>
            ))}
        </div>
    );
}
