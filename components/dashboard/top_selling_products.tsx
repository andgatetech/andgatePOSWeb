// 'use client';
// import { useCurrentStore } from '@/hooks/useCurrentStore';
// import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
// import { useGetTopSellingProductsQuery } from '@/store/features/Order/Order';
// import { endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
// import { Calendar, ChevronDown, Package, RotateCcw } from 'lucide-react';
// import { useState } from 'react';

// const DATE_FILTER_OPTIONS = [
//     { value: 'none', label: 'All Dates' },
//     { value: 'today', label: 'Today' },
//     { value: 'this_week', label: 'This Week' },
//     { value: 'last_week', label: 'Last Week' },
//     { value: 'this_month', label: 'This Month' },
//     { value: 'last_month', label: 'Last Month' },
//     { value: 'custom', label: 'Custom Range' },
// ];

// const Top_Selling_Products = () => {
//     const { currentStoreId } = useCurrentStore();
//     const [dateFilterType, setDateFilterType] = useState<'none' | 'today' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom'>('none');
//     const [showDateDropdown, setShowDateDropdown] = useState(false);
//     const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//     const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//     const [refetchTrigger, setRefetchTrigger] = useState(0);

//     const { data: categoriesResponse } = useGetCategoryQuery();
//     const categories = categoriesResponse?.data || [];

//     // Compute date range based on filter type
//     const getDateRange = () => {
//         const now = new Date();
//         switch (dateFilterType) {
//             case 'today':
//                 return { start: startOfDay(now), end: endOfDay(now) };
//             case 'this_week':
//                 return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
//             case 'last_week':
//                 return { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) };
//             case 'this_month':
//                 return { start: startOfMonth(now), end: endOfMonth(now) };
//             case 'last_month':
//                 return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
//             case 'custom':
//                 return { start: new Date(customStartDate), end: new Date(customEndDate) };
//             default:
//                 return null;
//         }
//     };

//     const range = getDateRange();

//     // Normal query with refetchTrigger in args to auto refetch
//     const {
//         data: topProductsResponse,
//         isLoading,
//         isError,
//     } = useGetTopSellingProductsQuery({
//         store_id: currentStoreId,
//         start_date: range?.start ? format(range.start, 'yyyy-MM-dd') : undefined,
//         end_date: range?.end ? format(range.end, 'yyyy-MM-dd') : undefined,
//         refetchTrigger,
//     });

//     const topProducts = topProductsResponse?.data || [];

//     const resetFilters = () => {
//         setDateFilterType('none');
//         setCustomStartDate(format(new Date(), 'yyyy-MM-dd'));
//         setCustomEndDate(format(new Date(), 'yyyy-MM-dd'));
//         setRefetchTrigger((prev) => prev + 1); // triggers auto refetch
//     };

//     const SkeletonRow = () => (
//         <tr>
//             <td className="py-2">
//                 <div className="flex items-center gap-2">
//                     <div className="h-8 w-8 animate-pulse rounded-md bg-gray-300"></div>
//                     <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
//                 </div>
//             </td>
//             <td className="py-2">
//                 <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
//             </td>
//             <td className="py-2">
//                 <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
//             </td>
//             <td className="py-2">
//                 <div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
//             </td>
//         </tr>
//     );

//     if (isError) return <p>Failed to load top selling products.</p>;

//     return (
//         <div className="panel h-full w-full">
//             {/* Header with Date Filter & Reset */}
//             <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
//                 <h5 className="text-lg font-semibold dark:text-white-light">Top Selling Products</h5>

//                 <div className="flex items-center gap-2">
//                     {/* Date Filter */}
//                     <div className="relative">
//                         <button
//                             onClick={() => setShowDateDropdown(!showDateDropdown)}
//                             className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
//                         >
//                             <Calendar className="h-4 w-4 text-gray-400" />
//                             <span>{DATE_FILTER_OPTIONS.find((opt) => opt.value === dateFilterType)?.label || 'All Dates'}</span>
//                             <ChevronDown className="h-4 w-4 text-gray-400" />
//                         </button>

//                         {showDateDropdown && (
//                             <>
//                                 <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)} />
//                                 <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
//                                     {DATE_FILTER_OPTIONS.map((opt) => (
//                                         <button
//                                             key={opt.value}
//                                             onClick={() => {
//                                                 setDateFilterType(opt.value as any);
//                                                 if (opt.value !== 'custom') {
//                                                     setShowDateDropdown(false);
//                                                     setRefetchTrigger((prev) => prev + 1);
//                                                 }
//                                             }}
//                                             className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${dateFilterType === opt.value ? 'bg-blue-50 text-blue-600' : ''}`}
//                                         >
//                                             {opt.label}
//                                         </button>
//                                     ))}

//                                     {/* Custom Range Inputs */}
//                                     {dateFilterType === 'custom' && (
//                                         <div className="space-y-3 border-t border-gray-100 p-4">
//                                             <div>
//                                                 <label className="mb-1 block text-xs font-medium text-gray-700">From Date</label>
//                                                 <input
//                                                     type="date"
//                                                     value={customStartDate}
//                                                     onChange={(e) => setCustomStartDate(e.target.value)}
//                                                     className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="mb-1 block text-xs font-medium text-gray-700">To Date</label>
//                                                 <input
//                                                     type="date"
//                                                     value={customEndDate}
//                                                     onChange={(e) => setCustomEndDate(e.target.value)}
//                                                     className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                                                 />
//                                             </div>
//                                             <button
//                                                 onClick={() => {
//                                                     setRefetchTrigger((prev) => prev + 1);
//                                                     setShowDateDropdown(false);
//                                                 }}
//                                                 className="w-full rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
//                                             >
//                                                 Apply
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </>
//                         )}
//                     </div>

//                     {/* Reset button */}
//                     <button
//                         onClick={resetFilters}
//                         className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                         title="Reset Filters"
//                     >
//                         <RotateCcw className="h-4 w-4" />
//                         Reset
//                     </button>
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="table-responsive">
//                 <table className="w-full border-collapse text-left">
//                     <thead>
//                         <tr className="border-b">
//                             <th className="px-4 py-2 ltr:rounded-l-md rtl:rounded-r-md">Product</th>
//                             <th className="px-4 py-2">Price</th>
//                             <th className="px-4 py-2">Discount</th>
//                             <th className="px-4 py-2">Sold</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {isLoading
//                             ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
//                             : topProducts.map((product: any) => {
//                                   const category = categories.find((cat: any) => cat.id === product.category_id);
//                                   return (
//                                       <tr key={product.id} className="group hover:bg-gray-50">
//                                           <td className="min-w-[150px] px-4 py-2">
//                                               <div className="flex items-center gap-2">
//                                                   <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200">
//                                                       <Package className="h-5 w-5 text-gray-600" />
//                                                   </div>
//                                                   <div>
//                                                       <p>{product.name}</p>
//                                                       <span className="block text-xs text-primary">{category?.name || 'Uncategorized'}</span>
//                                                   </div>
//                                               </div>
//                                           </td>
//                                           <td className="px-4 py-2">৳{Number(product.price).toFixed(2)}</td>
//                                           <td className="px-4 py-2">৳{Number(product.discount).toFixed(2)}</td>
//                                           <td className="px-4 py-2">{product.sold}</td>
//                                       </tr>
//                                   );
//                               })}
//                         {!isLoading && topProducts.length === 0 && (
//                             <tr>
//                                 <td colSpan={4} className="py-4 text-center">
//                                     No sales data found.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default Top_Selling_Products;
