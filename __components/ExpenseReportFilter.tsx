// 'use client';
// import UniversalFilter from '@/components/common/UniversalFilter';
// import { useUniversalFilter } from '@/hooks/useUniversalFilter';
// import React from 'react';

// interface ExpenseReportFilterProps {
//     onFilterChange: (apiParams: Record<string, any>) => void;
// }

// const ExpenseReportFilter: React.FC<ExpenseReportFilterProps> = ({ onFilterChange }) => {
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
//             placeholder="Search by title, notes, or user..."
//             showStoreFilter={true}
//             showDateFilter={true}
//             showSearch={true}
//             initialFilters={{
//                 dateRange: { type: 'this_month' },
//             }}
//         />
//     );
// };

// export default ExpenseReportFilter;

'use client';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import UniversalFilter from '@/components/common/UniversalFilter';

interface ExpenseReportFilterProps {
    onFilterChange: (params: Record<string, any>) => void;
}

const ExpenseReportFilter: React.FC<ExpenseReportFilterProps> = ({ onFilterChange }) => {
    const { handleFilterChange, buildApiParams } = useUniversalFilter();

    // When filters change inside UniversalFilter, immediately build params & send to parent
    const handleInternalFilterChange = (newFilters: Record<string, any>) => {
        handleFilterChange(newFilters); // update local state if needed
        const apiParams = buildApiParams(newFilters); // convert filters to API-ready params
        onFilterChange(apiParams); // trigger ExpenseReportPage -> fetchReport()
    };

    return (
        <UniversalFilter
            onFilterChange={handleInternalFilterChange}
            placeholder="Search by title, notes, or user..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            initialFilters={{
                dateRange: { type: 'this_month' },
            }}
        />
    );
};

export default ExpenseReportFilter;
