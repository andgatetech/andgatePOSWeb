'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { getTranslation } from '@/i18n';
import { CreditCard, RefreshCw, Tag } from 'lucide-react';
import React from 'react';

interface OrderReturnsReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const OrderReturnsReportFilter: React.FC<OrderReturnsReportFilterProps> = ({ onFilterChange }) => {
    const { t } = getTranslation();
    const [selectedReturnType, setSelectedReturnType] = React.useState<string>('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');
    const [selectedReturnReason, setSelectedReturnReason] = React.useState<string>('all');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    const stableOnFilterChange = React.useCallback(onFilterChange, [onFilterChange]);

    const handleReset = React.useCallback(() => {
        setSelectedReturnType('all');
        setSelectedPaymentStatus('all');
        setSelectedReturnReason('all');
    }, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedReturnType !== 'all') {
            additionalParams.return_type = selectedReturnType;
        }
        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }
        if (selectedReturnReason !== 'all') {
            additionalParams.return_reason = selectedReturnReason;
        }

        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds.join(',');
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        }

        const apiParams = buildApiParams(additionalParams);
        stableOnFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, selectedReturnType, selectedPaymentStatus, selectedReturnReason]);

    React.useEffect(() => {
        setSelectedReturnType('all');
        setSelectedPaymentStatus('all');
        setSelectedReturnReason('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Return Type Filter */}
            <div className="relative">
                <select
                    value={selectedReturnType}
                    onChange={(e) => setSelectedReturnType(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('lbl_all_types')}</option>
                    <option value="return">{t('lbl_return_only')}</option>
                    <option value="exchange">{t('lbl_exchange')}</option>
                </select>
                <RefreshCw className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('lbl_all_status')}</option>
                    <option value="pending">{t('lbl_pending')}</option>
                    <option value="completed">{t('lbl_completed')}</option>
                    <option value="partial">{t('lbl_partial')}</option>
                </select>
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Return Reason Filter */}
            <div className="relative">
                <select
                    value={selectedReturnReason}
                    onChange={(e) => setSelectedReturnReason(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('lbl_all_reasons')}</option>
                    <option value="defective">{t('lbl_defective')}</option>
                    <option value="wrong_item">{t('lbl_wrong_item')}</option>
                    <option value="damaged">{t('lbl_damaged')}</option>
                    <option value="customer_request">{t('lbl_customer_request')}</option>
                    <option value="other">{t('lbl_other')}</option>
                </select>
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder={t('placeholder_search_returns')}
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default OrderReturnsReportFilter;
