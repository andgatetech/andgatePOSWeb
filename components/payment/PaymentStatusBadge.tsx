'use client';

import { getTranslation } from '@/i18n';
import { getPaymentStatusConfig } from '@/lib/paymentConstants';

interface PaymentStatusBadgeProps {
    status: string;
    className?: string;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className = '' }) => {
    const { t } = getTranslation();
    const config = getPaymentStatusConfig(status);
    const label = config.labelKey ? t(config.labelKey) : status || t('lbl_unknown');
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text} ${className}`}>
            {label}
        </span>
    );
};

export default PaymentStatusBadge;
