import ProductTable from '@/components/datatables/components-datatables-multiple-tables';
import ComponentsDatatablesMultipleTables from '@/components/datatables/components-datatables-multiple-tables';
import IconBell from '@/components/icon/icon-bell';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Multiple Tables',
};

const MultipleTables = () => {
    return (
        <div>
           
            <ProductTable />
        </div>
    );
};

export default MultipleTables;
