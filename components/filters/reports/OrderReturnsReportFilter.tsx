'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { getTranslation } from '@/i18n';
import { CreditCard, RefreshCw } from 'lucide-react';
import React from 'react';

interface OrderReturnsReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const OrderReturnsReportFilter: React.FC<OrderReturnsReportFilterProps> = ({ onFilterChange }) => {
    const { t } = getTranslation();
    const [selectedReturnType, setSelectedReturnType] = React.useState<string>('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    const stableOnFilterChange = React.useCallback(onFilterChange, [onFilterChange]);

    const handleReset = React.useCallback(() => {
        setSelectedReturnType('all');
        setSelectedPaymentStatus('all');
    }, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedReturnType !== 'all') {
            additionalParams.return_type = selectedReturnType;
        }
        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
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
    }, [filters, selectedReturnType, selectedPaymentStatus]);

    React.useEffect(() => {
        setSelectedReturnType('all');
        setSelectedPaymentStatus('all');
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
                    <option value="paid">{t('lbl_paid')}</option>
                    <option value="refunded">{t('status_refunded')}</option>
                    <option value="settled">{t('lbl_settled')}</option>
                </select>
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
            customActiveCount={(selectedReturnType !== 'all' ? 1 : 0) + (selectedPaymentStatus !== 'all' ? 1 : 0)}
            onResetFilters={handleReset}
        />
    );
};

export default OrderReturnsReportFilter;
