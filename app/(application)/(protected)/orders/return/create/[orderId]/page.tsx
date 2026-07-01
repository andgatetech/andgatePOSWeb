'use client';

import Loader from '@/lib/Loader';
import { getTranslation } from '@/i18n';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const OrderReturnCreatePage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const params = useParams<{ orderId: string }>();
    const orderId = Number(params.orderId);

    useEffect(() => {
        if (Number.isFinite(orderId)) {
            router.replace(`/orders/return?orderId=${orderId}`);
        } else {
            router.replace('/orders');
        }
    }, [orderId, router]);

    return <Loader message={t('order_loading')} />;
};

export default OrderReturnCreatePage;
