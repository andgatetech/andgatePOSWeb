import ComponentsDashboardFinance from '@/components/dashboard/supplierdash';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Finance',
};

const Finance = () => {
    return <ComponentsDashboardFinance />;
};

export default Finance;
