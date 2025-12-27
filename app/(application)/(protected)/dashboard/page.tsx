

import ComponentsDashboardSales from './components/components-dashboard-sales';
import { commonMetadata, generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
    ...commonMetadata.dashboard,
    image: '/images/dashboard-og-image.jpg',
});

const Sales = () => {
    return <ComponentsDashboardSales />;
};

export default Sales;
