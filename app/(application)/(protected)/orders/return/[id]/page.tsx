'use client';

import Loader from '@/lib/Loader';
import { useGetOrderReturnByIdQuery } from '@/store/features/Order/Order';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import OrderReturnDetails from './components/OrderReturnDetails';

const OrderReturnDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const returnId = params?.id ? parseInt(params.id as string) : null;

    const [isLoadingReturn, setIsLoadingReturn] = useState(true);

    // Fetch return data
    const {
        data: returnData,
        isLoading,
        error,
    } = useGetOrderReturnByIdQuery(returnId!, {
        skip: !returnId,
    });

    // Redirect if no return ID
    if (!returnId) {
        router.push('/orders/return/list');
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !returnData?.success) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-4">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Error Loading Return</h2>
                    <p className="mb-6 text-gray-600">Unable to load the return details. Please try again.</p>
                    <Link href="/orders/return/list" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Returns
                    </Link>
                </div>
            </div>
        );
    }

    const orderReturn = returnData.data;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <Link href="/orders/return/list" className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Return Details</h1>
                            <p className="text-sm text-gray-600">Return #{orderReturn.return_number || `#${orderReturn.id}`}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <OrderReturnDetails orderReturn={orderReturn} />
            </div>
        </div>
    );
};

export default OrderReturnDetailsPage;
