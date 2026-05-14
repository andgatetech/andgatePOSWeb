'use client';

import { getTranslation } from '@/i18n';
import { unwrapApiData } from '@/lib/api-response';
import Loader from '@/lib/Loader';
import { useGetOrderReturnByIdQuery } from '@/store/features/Order/Order';
import { ArrowLeft, Printer, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import OrderReturnDetails from './components/OrderReturnDetails';

const OrderReturnDetailsPage = () => {
    const { t } = getTranslation();
    const params = useParams();
    const router = useRouter();
    const returnId = params?.id ? parseInt(params.id as string) : null;

    // Fetch return data
    const {
        data: returnData,
        isLoading,
        isFetching,
        error,
    } = useGetOrderReturnByIdQuery(returnId!, {
        skip: !returnId,
    });
    const orderReturn = unwrapApiData(returnData, ['return', 'order_return']);

    // Redirect if no return ID
    useEffect(() => {
        if (!returnId) router.push('/orders/return/list');
    }, [returnId, router]);

    if (!returnId) return null;

    if (isLoading || isFetching) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !orderReturn) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-4">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('msg_failed_load')}</h2>
                    <p className="mb-6 text-gray-600">{t('msg_try_again')}</p>
                    <Link href="/orders/return/list" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
                        <ArrowLeft className="h-4 w-4" />
                        {t('btn_back')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-transparent">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <Link href="/orders/return/list" className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                            <RotateCcw className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('lbl_return_details')}</h1>
                            <p className="text-sm text-gray-500">Return #{orderReturn.return_number || `#${orderReturn.id}`}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="print:hidden inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        <Printer className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('btn_print')}</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
                <OrderReturnDetails orderReturn={orderReturn} />
            </div>
        </div>
    );
};

export default OrderReturnDetailsPage;
