import ComponentsAppsInvoiceAdd from '@/app/(defaults)/apps/pos/PosLeftSide';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invoice Add',
};

const InvoiceAdd = () => {
    return <ComponentsAppsInvoiceAdd />;
};

export default InvoiceAdd;
