import React from 'react';
import dayjs from 'dayjs';
import { useGetAllPurchasesTransactionsQuery } from '@/store/features/purchase/purchase';

const Recent_Purchase_Transactions = () => {
    const { data, isLoading, isError } = useGetAllPurchasesTransactionsQuery();

    // Skeleton row for loading state
    const SkeletonRow = () => (
        <tr>
            <td className="h-6 py-2">
                <div className="h-4 w-10 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2 text-center">
                <div className="mx-auto h-4 w-16 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
        </tr>
    );

    if (isError) {
        return <div>Error loading purchase transactions</div>;
    }

    const purchases = (data?.data || []).slice(0, 7);

    return (
        <div>
            <div className="panel">
                <div className="mb-5 text-lg font-bold">Recent Purchase Transactions</div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th className="ltr:rounded-l-md rtl:rounded-r-md">ID</th>
                                <th>PURCHASE ID</th>
                                <th>PAYMENT METHOD</th>
                                <th>AMOUNT</th>
                                <th className="ltr:rounded-r-md rtl:rounded-l-md">DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                                : purchases.map((p: any) => (
                                      <tr key={p.id}>
                                          <td className="font-semibold">#{p.id}</td>
                                          <td>{p.purchase_id}</td>
                                          <td className="text-center">
                                              <span className={`badge rounded-full px-3 py-1 ${p.payment_method === 'cash' ? 'bg-success/20 text-success' : 'bg-gray-200 text-gray-700'}`}>
                                                  {p.payment_method}
                                              </span>
                                          </td>
                                          <td>${p.amount}</td>
                                          <td>{dayjs(p.created_at).format('MMM DD, YYYY')}</td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Recent_Purchase_Transactions;
