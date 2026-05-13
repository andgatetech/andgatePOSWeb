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
    const customerTypeLabels: Record<string, string> = {
        regular: t('customer_type_regular'),
        wholesale: t('customer_type_wholesale'),
        reseller: t('customer_type_reseller'),
        corporate: t('customer_type_corporate'),
    };
    const contactMethodLabels: Record<string, string> = {
        call: t('customer_contact_call'),
        sms: t('customer_contact_sms'),
        whatsapp: t('customer_contact_whatsapp'),
    };
    const genderLabels: Record<string, string> = {
        male: t('lbl_male'),
        female: t('lbl_female'),
        other: t('lbl_other'),
    };
    const address = [customer.address_line1, customer.address_line2, customer.city, customer.state].filter(Boolean).join(', ');

    const rows = [
        { label: t('customer_type'), value: customerTypeLabels[customer.customer_type] || customer.customer_type },
        { label: t('customer_trade_name'), value: customer.trade_name },
        { label: t('lbl_email'), value: customer.email },
        { label: t('lbl_phone'), value: customer.phone },
        { label: t('customer_alternative_phone'), value: customer.alternative_phone },
        { label: t('customer_preferred_contact_method'), value: contactMethodLabels[customer.preferred_contact_method] || customer.preferred_contact_method },
        { label: t('customer_date_of_birth'), value: customer.date_of_birth },
        { label: t('lbl_gender'), value: genderLabels[customer.gender] || customer.gender },
        { label: t('customer_address_information'), value: address },
        { label: t('customer_delivery_note'), value: customer.delivery_note },
        { label: t('lbl_credit_limit'), value: customer.credit_limit ? formatCurrency(customer.credit_limit) : null },
        { label: t('customer_nid_no'), value: customer.nid_no },
    ].filter((row) => row.value);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg border bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
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
                <div className="max-h-[64vh] space-y-3 overflow-y-auto p-6 text-sm">
                    {rows.map((row) => (
                        <div key={row.label} className="flex justify-between border-b border-gray-200 py-2">
                            <span className="pr-4 text-gray-500">{row.label}</span>
                            <span className="max-w-[60%] text-right font-medium">{row.value}</span>
                        </div>
                    ))}

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
