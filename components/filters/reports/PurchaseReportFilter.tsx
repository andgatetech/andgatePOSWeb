'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { getTranslation } from '@/i18n';
import { useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { ClipboardList, CreditCard, Truck } from 'lucide-react';
import React, { useMemo } from 'react';

interface PurchaseReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const PurchaseReportFilter: React.FC<PurchaseReportFilterProps> = ({ onFilterChange }) => {
    const { t } = getTranslation();
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');
    const [selectedSupplierId, setSelectedSupplierId] = React.useState<string>('all');

    const { currentStoreId, userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Backend already supports supplier_id (PurchaseReportController.php) — it just had no
    // way to reach it from the UI, forcing anyone tracking a specific supplier to scan every
    // page of the full purchase list by hand.
    const { data: suppliersResponse } = useGetSuppliersQuery({ store_id: currentStoreId, per_page: 100 }, { skip: !currentStoreId });
    const suppliers: any[] = useMemo(() => suppliersResponse?.data?.data || suppliersResponse?.data || [], [suppliersResponse]);

    // Stabilize the callback to prevent unnecessary re-renders
    const stableOnFilterChange = React.useCallback(onFilterChange, [onFilterChange]);

    const handleReset = React.useCallback(() => {
        setSelectedStatus('all');
        setSelectedPaymentStatus('all');
        setSelectedSupplierId('all');
    }, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedStatus !== 'all') {
            additionalParams.status = selectedStatus;
        }
        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }
        if (selectedSupplierId !== 'all') {
            additionalParams.supplier_id = selectedSupplierId;
        }

        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds;
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        }

        const apiParams = buildApiParams(additionalParams);
        stableOnFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, selectedStatus, selectedPaymentStatus, selectedSupplierId, userStores]);

    React.useEffect(() => {
        setSelectedStatus('all');
        setSelectedPaymentStatus('all');
        setSelectedSupplierId('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            <div className="relative">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('lbl_all_status')}</option>
                    <option value="draft">{t('lbl_draft')}</option>
                    <option value="approved">{t('lbl_approved')}</option>
                    <option value="ordered">{t('lbl_ordered')}</option>
                    <option value="partially_received">{t('lbl_partially_received')}</option>
                    <option value="received">{t('lbl_received')}</option>
                    <option value="cancelled">{t('lbl_cancelled')}</option>
                </select>
                <ClipboardList className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('lbl_all_payment')}</option>
                    <option value="pending">{t('lbl_pending')}</option>
                    <option value="partial">{t('lbl_partial')}</option>
                    <option value="paid">{t('lbl_paid')}</option>
                </select>
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
                <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('lbl_all_suppliers')}</option>
                    {suppliers.map((supplier: any) => (
                        <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                        </option>
                    ))}
                </select>
                <Truck className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder={t('placeholder_search_purchases')}
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            customActiveCount={(selectedStatus !== 'all' ? 1 : 0) + (selectedPaymentStatus !== 'all' ? 1 : 0) + (selectedSupplierId !== 'all' ? 1 : 0)}
            onResetFilters={handleReset}
        />
    );
};

export default PurchaseReportFilter;
