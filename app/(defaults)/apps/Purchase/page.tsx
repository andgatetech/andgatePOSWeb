
import PurchaseManagement from '@/components/tables/components-tables-dropdown';
import ComponentsTablesDropdown from '@/components/tables/components-tables-dropdown';

import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Tables',
};

const Tables = () => {
    return (
        <div className="grid grid-cols-1 gap-1 xl:grid-cols-1">
            {/* dropdown */}
            <PurchaseManagement />
        </div>
    );
};

export default Tables;
