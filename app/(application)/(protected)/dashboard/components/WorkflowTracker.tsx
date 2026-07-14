'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { SIMPLIFICATION_FLAGS } from '@/lib/simplification-flags';
import type { RootState } from '@/store';

const WORKFLOW_ROUTES: Record<string, string> = {
    '/dashboard': 'dashboard_view',
    '/pos': 'pos_opened',
    '/products/create': 'product_create_opened',
    '/purchases/create': 'purchase_create_opened',
    '/expenses/create': 'expense_create_opened',
    '/customers/due': 'customer_due_opened',
    '/suppliers/due': 'supplier_due_opened',
    '/reports/low-stock': 'low_stock_report_opened',
    '/roles/create': 'role_create_opened',
};

export default function WorkflowTracker() {
    const pathname = usePathname();
    const currentStoreId = useSelector((state: RootState) => state.auth.currentStoreId);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (!SIMPLIFICATION_FLAGS.workflowTracking) return;
        if (!pathname) return;

        const eventName = WORKFLOW_ROUTES[pathname];
        if (!eventName) return;

        trackEvent(eventName, 'ViewContent', {
            surface: 'protected_app',
            store_id: currentStoreId,
            role: user?.role || 'unknown',
        });
    }, [currentStoreId, pathname, user?.role]);

    return null;
}
