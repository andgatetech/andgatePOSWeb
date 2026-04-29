'use client';

import DateColumn from '@/components/common/DateColumn';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ViewCustomerModalProps {
    customer: any;
    isOpen: boolean;
    onClose: () => void;
}

const ViewCustomerModal: React.FC<ViewCustomerModalProps> = ({ customer, isOpen, onClose }) => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !customer) return null;

    const isActive = customer.is_active === true || customer.is_active === 1;
    const membership = customer.membership?.toLowerCase() || 'normal';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-[360px] rounded-lg border bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="border-b px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium">{customer.name}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">{customer.store_name || 'N/A'}</p>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="space-y-3 p-6 text-sm">
                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">{t('lbl_email')}</span>
                        <span className="font-medium">{customer.email || '—'}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">{t('lbl_phone')}</span>
                        <span className="font-medium">{customer.phone || '—'}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">{t('lbl_loyalty_tier')}</span>
                        <span className="font-medium capitalize">{membership}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">{t('lbl_loyalty_points')}</span>
                        <span className="font-medium">{customer.points || 0}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">{t('lbl_balance')}</span>
                        <span className={`font-medium ${customer.balance > 0 ? 'text-green-600' : customer.balance < 0 ? 'text-red-600' : ''}`}>
                            {formatCurrency(Math.abs(customer.balance || 0))}
                            {customer.balance < 0 && ` (${t('lbl_due')})`}
                        </span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">{t('lbl_status')}</span>
                        <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>{isActive ? t('status_active') : t('status_inactive')}</span>
                    </div>

                    {customer.details && (
                        <div className="border-b border-gray-200 py-2">
                            <p className="mb-1 text-gray-500">{t('lbl_notes')}</p>
                            <p className="text-gray-900">{customer.details}</p>
                        </div>
                    )}

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">{t('customer_col_joined_date')}</span>
                        <DateColumn date={customer.created_at} />
                    </div>

                    <div className="flex justify-between py-2">
                        <span className="text-gray-500">{t('lbl_updated')}</span>
                        <DateColumn date={customer.updated_at} />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-2 px-6 pb-6 pt-3">
                    <button onClick={onClose} className="h-9 flex-1 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">
                        {t('btn_close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewCustomerModal;
