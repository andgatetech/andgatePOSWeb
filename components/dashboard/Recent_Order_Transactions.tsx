import React from 'react';
import dayjs from 'dayjs';
import { useGetAllTransactionsQuery } from '@/store/features/transactions/transactions';

const Recent_Order_Transactions = () => {
    const { data, isLoading, isError } = useGetAllTransactionsQuery();

    // Skeleton row for loading state
    const SkeletonRow = () => (
        <tr>
            <td className="h-6 py-2">
                <div className="h-4 w-10 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2 text-center">
                <div className="mx-auto h-4 w-16 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
        </tr>
    );

    if (isError) {
        return <div>Error loading transactions</div>;
    }

    const transactions = (data?.data || []).slice(0, 7);

    return (
        <div>
            <div className="panel">
                <div className="mb-5 text-lg font-bold">Recent Order Transactions</div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th className="ltr:rounded-l-md rtl:rounded-r-md">ID</th>
                                <th>ORDER ID</th>
                                <th>AMOUNT</th>
                                <th>STATUS</th>
                                <th className="ltr:rounded-r-md rtl:rounded-l-md">DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                                : transactions.map((tx: any) => (
                                      <tr key={tx.id}>
                                          <td className="font-semibold">#{tx.id}</td>
                                          <td>{tx.order_id}</td>
                                          <td>${tx.amount}</td>
                                          <td className="text-center">
                                              <span className={`badge rounded-full px-3 py-1 ${tx.payment_status === 'paid' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                                  {tx.payment_status}
                                              </span>
                                          </td>
                                          <td>{dayjs(tx.created_at).format('MMM DD, YYYY')}</td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Recent_Order_Transactions;
