import ComponentsAppsInvoiceAdd from '@/components/apps/mailbox/invoice/components-apps-invoice-add';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'POS',
};

const InvoiceAdd = () => {
    return <ComponentsAppsInvoiceAdd/>;
};

export default InvoiceAdd;
