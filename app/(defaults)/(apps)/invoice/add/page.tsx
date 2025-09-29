import { Metadata } from 'next';
import PosLeftSide from '../../pos/PosLeftSide';

export const metadata: Metadata = {
    title: 'Invoice Add',
};

const InvoiceAdd = () => {
    return <PosLeftSide />;
};

export default InvoiceAdd;
