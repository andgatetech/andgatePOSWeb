// 'use client';
// import { useUniversalFilter } from '@/hooks/useUniversalFilter';
// import UniversalFilter from '@/components/common/UniversalFilter';

// interface ExpenseReportFilterProps {
//     onFilterChange: (params: Record<string, any>) => void;
// }

// const ExpenseReportFilter: React.FC<ExpenseReportFilterProps> = ({ onFilterChange }) => {
//     const { handleFilterChange, buildApiParams } = useUniversalFilter();

//     // When filters change inside UniversalFilter, immediately build params & send to parent
//     const handleInternalFilterChange = (newFilters: Record<string, any>) => {
//         handleFilterChange(newFilters); // update local state if needed
//         const apiParams = buildApiParams(newFilters); // convert filters to API-ready params
//         onFilterChange(apiParams); // trigger ExpenseReportPage -> fetchReport()
//     };

//     return (
//         <UniversalFilter
//             onFilterChange={handleInternalFilterChange}
//             placeholder="Search by title, notes, or user..."
//             showStoreFilter={true}
//             showDateFilter={true}
//             showSearch={true}
//             initialFilters={{
//                 dateRange: { type: 'none' },
//             }}
//         />
//     );
// };

// export default ExpenseReportFilter;
'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import React from 'react';

interface ExpenseReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const ExpenseReportFilter: React.FC<ExpenseReportFilterProps> = ({ onFilterChange }) => {
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
            placeholder="Search by title, notes, or user..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={[
                <div key="source" className="flex flex-col space-y-1">
                    <select
                        defaultValue="all"
                        onChange={(e) => {
                            const value = e.target.value;
                            // ✅ Merge with existing filters and nest under customFilters
                            handleFilterChange({
                                ...filters,
                                customFilters: {
                                    ...(filters.customFilters || {}),
                                    source: value === 'all' ? undefined : value, // Backend skips if falsy
                                },
                            });
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All Sources</option>
                        <option value="Expense Table">Expense Table</option>
                        <option value="Journal Table">Journal Table</option>
                    </select>
                </div>,
            ]}
            initialFilters={{
                dateRange: { type: 'this_month' },
            }}
        />
    );
};

export default ExpenseReportFilter;
