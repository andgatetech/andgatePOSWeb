'use client';

import DateColumn from '@/components/common/DateColumn';
import { getTranslation } from '@/i18n';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ViewSupplierModalProps {
    supplier: any;
    isOpen: boolean;
    onClose: () => void;
}

const ViewSupplierModal: React.FC<ViewSupplierModalProps> = ({ supplier, isOpen, onClose }) => {
    const { t } = getTranslation();
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

    if (!isOpen || !supplier) return null;

    const currentStatus = supplier.status?.toLowerCase() || 'inactive';
    const supplierTypeLabels: Record<string, string> = {
        wholesaler: t('supplier_type_wholesaler'),
        distributor: t('supplier_type_distributor'),
        manufacturer: t('supplier_type_manufacturer'),
        service_provider: t('supplier_type_service_provider'),
        other: t('supplier_type_other'),
    };
    const paymentTermLabels: Record<string, string> = {
        cash: t('supplier_terms_cash'),
        '7_days': t('supplier_terms_7_days'),
        '15_days': t('supplier_terms_15_days'),
        '30_days': t('supplier_terms_30_days'),
    };
    const paymentMethodLabels: Record<string, string> = {
        cash: t('bd_payments_cash'),
        mobile_banking: t('lbl_mobile_banking'),
        bank_transfer: t('lbl_bank_transfer'),
        cheque: t('supplier_payment_method_cheque'),
    };

    const rows = [
        { label: t('supplier_company_name'), value: supplier.company_name },
        { label: t('supplier_contact_person'), value: supplier.contact_person },
        { label: t('supplier_type'), value: supplierTypeLabels[supplier.supplier_type] || supplier.supplier_type },
        { label: t('lbl_email'), value: supplier.email },
        { label: t('lbl_phone'), value: supplier.phone },
        { label: t('supplier_mobile_banking_number'), value: supplier.mobile_banking_number },
        { label: t('supplier_opening_balance'), value: supplier.opening_balance ? `৳${supplier.opening_balance}` : null },
        { label: t('supplier_payment_terms'), value: paymentTermLabels[supplier.payment_terms] || supplier.payment_terms },
        { label: t('supplier_credit_limit'), value: supplier.credit_limit ? `৳${supplier.credit_limit}` : null },
        { label: t('supplier_preferred_payment_method'), value: paymentMethodLabels[supplier.preferred_payment_method] || supplier.preferred_payment_method },
        { label: t('supplier_bank_name'), value: supplier.bank_name },
        { label: t('supplier_bank_account_name'), value: supplier.bank_account_name },
        { label: t('supplier_bank_account_number'), value: supplier.bank_account_number },
        { label: t('lbl_trade_license_no'), value: supplier.trade_license_no },
        { label: t('lbl_tin_no'), value: supplier.tin_no },
        { label: t('lbl_bin_no'), value: supplier.bin_no },
        { label: t('lbl_address'), value: supplier.address },
        { label: t('lbl_notes'), value: supplier.notes },
    ].filter((row) => row.value);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg border bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="border-b px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-medium">{supplier.name}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">{supplier.store_name || 'N/A'}</p>
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
                        <span className="text-gray-500">{t('lbl_status')}</span>
                        <span className={`font-medium ${currentStatus === 'active' ? 'text-green-600' : currentStatus === 'blocked' ? 'text-red-600' : ''}`}>
                            {currentStatus === 'active' ? t('status_active') : currentStatus === 'blocked' ? t('status_blocked') : t('status_inactive')}
                        </span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 py-2">
                        <span className="text-gray-500">{t('lbl_created')}</span>
                        <DateColumn date={supplier.created_at} />
                    </div>

                    <div className="flex justify-between py-2">
                        <span className="text-gray-500">{t('lbl_updated')}</span>
                        <DateColumn date={supplier.updated_at} />
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

export default ViewSupplierModal;
