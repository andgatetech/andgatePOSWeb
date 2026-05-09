import { getEcommerceFallbackText, getEcommerceStatusLabel, statusBadgeClass, visibilityLabel } from './ecommerceUtils';

export const StatusBadge = ({ status, label }: { status?: string; label?: string }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(status)}`}>
        {label || getEcommerceStatusLabel(status) || getEcommerceFallbackText()}
    </span>
);

export const VisibilityBadge = ({ value }: { value?: string }) => <StatusBadge status={value} label={visibilityLabel(value)} />;
