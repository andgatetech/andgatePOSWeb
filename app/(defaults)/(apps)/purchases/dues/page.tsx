import { Metadata } from 'next';
import PurchaseDuesComponent from './components/PurchaseDuesComponent';

export const metadata: Metadata = {
    title: 'Purchase Dues - Andgate POS',
    description: 'Manage and track all purchase dues',
};

const PurchaseDuesPage = () => {
    return <PurchaseDuesComponent />;
};

export default PurchaseDuesPage;
