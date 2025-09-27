
import React from 'react';
import { generateMetadata, commonMetadata } from '@/lib/seo';
import ProductTable from './ProductTable';

export const metadata = generateMetadata({
    ...commonMetadata.products,
    image: '/images/products-og-image.jpg'
});

const MultipleTables = () => {
    return (
        <div>
            <ProductTable />
        </div>
    );
};

export default MultipleTables;
