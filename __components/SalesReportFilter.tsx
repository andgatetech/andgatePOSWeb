// 'use client';
// import UniversalFilter from '@/components/common/UniversalFilter';
// import { useUniversalFilter } from '@/hooks/useUniversalFilter';
// import { CheckCircle } from 'lucide-react';
// import React from 'react';

// interface SalesReportFilterProps {
//     onFilterChange: (apiParams: Record<string, any>) => void;
// }

// const SalesReportFilter: React.FC<SalesReportFilterProps> = ({ onFilterChange }) => {
//     const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

//     // Handle all filter changes
//     React.useEffect(() => {
//         const apiParams = buildApiParams();
//         onFilterChange(apiParams);
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [filters]);

//     return (
//         <UniversalFilter
//             onFilterChange={handleFilterChange}
//             placeholder="Search by invoice, customer name, or phone..."
//             showStoreFilter={true}
//             showDateFilter={true}
//             showSearch={true}
//             customFilters={[
//                 {
//                     key: 'payment_status',
//                     label: 'Payment Status',
//                     type: 'select',
//                     options: [
//                         { value: 'paid', label: 'Paid' },
//                         { value: 'pending', label: 'Pending' },
//                         { value: 'failed', label: 'Failed' },
//                     ],
//                     icon: <CheckCircle className="h-5 w-5 text-gray-400" />,
//                     defaultValue: 'all',
//                 },
//             ]}
//             initialFilters={{
//                 dateRange: { type: 'this_month' },
//             }}
//         />
//     );
// };

// export default SalesReportFilter;

'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { CheckCircle } from 'lucide-react';
import React from 'react';

interface SalesReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const SalesReportFilter: React.FC<SalesReportFilterProps> = ({ onFilterChange }) => {
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes
    React.useEffect(() => {
        const apiParams = buildApiParams();
        onFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search by invoice, customer name, or phone..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={[
                // ✅ FIX: Use JSX instead of object
                <div key="payment_status" className="flex flex-col">
                    {/* <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <CheckCircle className="h-5 w-5 text-gray-400" />
                        Payment Status
                    </label> */}
                    <select
                        defaultValue="all"
                        onChange={(e) => handleFilterChange({ payment_status: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>,
            ]}
            initialFilters={{
                dateRange: { type: 'this_month' },
            }}
        />
    );
};

export default SalesReportFilter;
