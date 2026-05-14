'use client';

import { useParams } from 'next/navigation';
import { OrderReturnPageContent } from '../../page';

const OrderReturnCreatePage = () => {
    const params = useParams<{ orderId: string }>();
    const orderId = Number(params.orderId);

    return <OrderReturnPageContent routeOrderId={Number.isFinite(orderId) ? orderId : undefined} />;
};

export default OrderReturnCreatePage;
