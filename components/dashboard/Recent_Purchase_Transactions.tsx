import React from 'react';
import dayjs from 'dayjs';
import { useGetAllPurchasesTransactionsQuery } from '@/store/features/purchase/purchase';
import Link from 'next/link';

const Recent_Purchase_Transactions = () => {
    const { data, isLoading, isError } = useGetAllPurchasesTransactionsQuery();

    // Skeleton loader row
    const SkeletonRow = () => (
        <tr>
            <td className="h-6 py-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
        </tr>
    );

    if (isError) return <div className="panel grid h-32 place-content-center text-center text-red-500 dark:text-red-400">Could not fetch purchase transactions.</div>;

    const purchasesArray = Array.isArray(data?.data) ? data.data : [];

    // Sort descending by created_at
    const sortedPurchases = purchasesArray.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Get recent 7
    const recent7 = sortedPurchases.slice(0, 7);

    return (
        <div className="panel w-full">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Recent Purchase Transactions</h5>
            </div>
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Purchase ID</th>
                            <th>Payment Method</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading
                            ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                            : recent7.map((p: any) => (
                                  <tr key={p.id} className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                      <td>
                                          <Link href={`/purchases/${p.id}`}>{p.purchase_id}</Link>
                                      </td>
                                      <td>{p.payment_method}</td>
                                      <td>৳{Number(p.amount || 0).toFixed(2)}</td>
                                      <td>{dayjs(p.created_at).format('MMM DD, YYYY')}</td>
                                  </tr>
                              ))}
                        {!isLoading && recent7.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center">
                                    No purchase transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Recent_Purchase_Transactions;
