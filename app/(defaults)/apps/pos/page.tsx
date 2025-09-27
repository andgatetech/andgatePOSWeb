import PosLeftSide from '@/app/(defaults)/apps/pos/PosLeftSide';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'POS',
};

const InvoiceAdd = () => {
    return <PosLeftSide />;
};

export default InvoiceAdd;
