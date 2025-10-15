import { Metadata } from 'next';
import PurchaseDuesComponent from './PurchaseDuesComponent';

export const metadata: Metadata = {
    title: 'Purchase Dues - AndGate POS',
    description: 'Manage and track all purchase dues',
};

const PurchaseDuesPage = () => {
    return <PurchaseDuesComponent />;
};

export default PurchaseDuesPage;
