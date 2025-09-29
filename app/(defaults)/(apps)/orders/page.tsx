
import { commonMetadata, generateMetadata } from '@/lib/seo';
import Orders from './Orders';

export const metadata = generateMetadata({
    ...commonMetadata.orders,
    image: '/images/orders-og-image.jpg',
});

const OrdersPage = () => {
    return <Orders />;
};

export default OrdersPage;
