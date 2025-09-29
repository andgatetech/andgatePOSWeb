
import { Metadata } from 'next';
import PosLeftSide from './PosLeftSide';


export const metadata: Metadata = {
    title: 'Point of Sale Terminal',
    description: 'Process sales transactions, manage inventory, and serve customers efficiently with our intuitive POS terminal interface.',
    keywords: ['POS terminal', 'sales processing', 'transaction management', 'inventory tracking', 'customer service', 'retail checkout', 'restaurant orders'],
    openGraph: {
        title: 'POS Terminal - AndgatePOS System',
        description: 'Streamline your sales process with our user-friendly POS terminal. Fast, reliable, and feature-rich.',
        images: [
            {
                url: '/images/pos-terminal-og.jpg',
                width: 1200,
                height: 630,
                alt: 'AndgatePOS Terminal Interface',
            },
        ],
    },
};

const InvoiceAdd = () => {
    return <PosLeftSide />;
};

export default InvoiceAdd;
