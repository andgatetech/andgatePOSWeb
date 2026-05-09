'use client';

import { getTranslation } from '@/i18n';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useRequestEcommerceStoreStatusMutation } from '@/store/features/ecommerce/ecommerceManagementApi';
import { AlertCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { formatApiError, getEcommerceRequestedStatusLabel, getStoreName } from './ecommerceUtils';

interface EcommerceServiceRequestProps {
    store?: any;
    requestedStatus?: 'enable' | 'disable';
    title?: string;
}

const EcommerceServiceRequest = ({ store, requestedStatus = 'enable', title }: EcommerceServiceRequestProps) => {
    const { t } = getTranslation();
    const [note, setNote] = useState('');
    const [requestStatus, { isLoading }] = useRequestEcommerceStoreStatusMutation();

    const handleSubmit = async () => {
        if (!store?.id) {
            showErrorDialog(t('msg_error'), t('ecommerce_no_store_selected'));
            return;
        }

        try {
            await requestStatus({
                storeId: store.id,
                requested_status: requestedStatus,
                note: note || t('ecommerce_request_note_default').replace('{action}', getEcommerceRequestedStatusLabel(requestedStatus).toLowerCase()).replace('{store}', getStoreName(store)),
            }).unwrap();
            setNote('');
            showSuccessDialog(t('ecommerce_request_sent_title'), t('ecommerce_request_sent_desc'));
        } catch (error) {
            showErrorDialog(t('ecommerce_request_failed_title'), formatApiError(error));
        }
    };

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-amber-900">{title || t('ecommerce_service_not_enabled_title')}</h3>
                        <p className="mt-1 text-sm text-amber-800">
                            {t('ecommerce_service_not_enabled_desc').replace('{store}', getStoreName(store))}
                        </p>
                    </div>
                </div>
                <div className="w-full md:max-w-md">
                    <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        rows={3}
                        placeholder={t('ecommerce_request_note_placeholder')}
                        className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Send className="h-4 w-4" />
                        {isLoading ? t('ecommerce_sending') : getEcommerceRequestedStatusLabel(requestedStatus)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EcommerceServiceRequest;
