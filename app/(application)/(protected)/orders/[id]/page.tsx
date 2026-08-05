import { commonMetadata, generateMetadata } from '@/lib/seo';
import OrderDetailsPage from './component/OrderDetailsPage';

export const metadata = generateMetadata({
    title: 'Order Details | POS Management',
    description: 'View complete order transaction details, warranty coverage, serial numbers, and customer receipts.',
    keywords: ['pos order', 'order details', 'receipt', 'warranty', 'serials'],
    path: '/orders',
});

const Page = () => {
    return <OrderDetailsPage />;
};

export default Page;
