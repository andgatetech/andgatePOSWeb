'use client';

import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';
import { useQuotaStatus } from '@/hooks/useFeatureAccess';
import { getTranslation } from '@/i18n';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface QuotaBannerProps {
    /** Live-quota feature slug — one of products.create | stores.create | users.create */
    quotaSlug: string;
    /** Resource name shown in the message, e.g. "products", "stores", "staff" (localized by caller). */
    resourceLabel: string;
}

/**
 * Warns at 80% of a live quota instead of letting the customer hit the hard block
 * mid-task (2026-07-25 lifecycle strategy, §Lifecycle Strategy). Renders nothing
 * below the threshold, on unlimited plans, or while loading.
 */
const QuotaBanner: React.FC<QuotaBannerProps> = ({ quotaSlug, resourceLabel }) => {
    const { t, i18n } = getTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const status = useQuotaStatus(quotaSlug);

    if (!status || !status.approaching_limit || status.limit === null) {
        return null;
    }

    return (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-amber-900">
                    {t('quota_banner_message', {
                        used: convertNumberByLanguage(status.used, lang),
                        limit: convertNumberByLanguage(status.limit, lang),
                        percent: convertNumberByLanguage(Math.round(status.percent_used ?? 0), lang),
                        resource: resourceLabel,
                    })}
                </p>
                <Link href="/subscription" className="mt-1.5 inline-block text-sm font-semibold text-primary hover:underline">
                    {t('quota_banner_cta')}
                </Link>
            </div>
        </div>
    );
};

export default QuotaBanner;
