import Orders from '@/app/(defaults)/apps/orders/Orders';
import { commonMetadata, generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
    ...commonMetadata.orders,
    image: '/images/orders-og-image.jpg',
});

const OrdersPage = () => {
    return <Orders />;
};

export default OrdersPage;
