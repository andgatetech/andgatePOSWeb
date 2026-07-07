'use client';

import { getTranslation } from '@/i18n';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface GatedWidgetFallbackProps {
    /** Compact title shown inside the widget's own card frame. */
    title?: string;
}

/**
 * Inline "upgrade to unlock" placeholder for dashboard widgets whose data call
 * 403s with a subscription/feature-gate error. The dashboard route intentionally
 * suppresses the global redirect-to-/subscription behavior (baseApi.ts) to avoid
 * bouncing users off their landing page — so a gated widget needs its own small,
 * in-place fallback instead of silently rendering nothing.
 */
export default function GatedWidgetFallback({ title }: GatedWidgetFallbackProps) {
    const { t } = getTranslation();

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                <Lock className="h-4 w-4 text-amber-600" />
            </div>
            {title && <p className="mb-1 text-xs font-semibold text-gray-500">{title}</p>}
            <p className="mb-3 text-xs text-gray-500">
                {t('msg_widget_not_in_plan') || 'This isn\'t included in your current plan.'}
            </p>
            <Link
                href="/subscription"
                className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
            >
                {t('btn_upgrade_plan') || 'Upgrade Plan'}
            </Link>
        </div>
    );
}
