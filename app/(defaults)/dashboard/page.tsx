import ComponentsDashboardSales from '@/components/dashboard/components-dashboard-sales';
import { generateMetadata, commonMetadata } from '@/lib/seo';
import React from 'react';

export const metadata = generateMetadata({
    ...commonMetadata.dashboard,
    image: '/images/dashboard-og-image.jpg'
});

const Sales = () => {
    return <ComponentsDashboardSales />;
};

export default Sales;
