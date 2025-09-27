import ComponentsAppsInvoicePreview from '@/app/(defaults)/apps/pos/PosInvoicePreview';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invoice Preview',
};

const InvoicePreview = () => {
    return <ComponentsAppsInvoicePreview />;
};

export default InvoicePreview;
