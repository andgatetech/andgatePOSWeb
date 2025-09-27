
import { Metadata } from 'next';
import React from 'react';
import ProductTable from './ProductTable';

export const metadata: Metadata = {
    title: 'POS Products',
};

const MultipleTables = () => {
    return (
        <div>
            <ProductTable />
        </div>
    );
};

export default MultipleTables;
