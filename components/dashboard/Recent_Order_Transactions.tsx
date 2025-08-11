import React from 'react';
 // update path if needed
import dayjs from 'dayjs';
import { useGetAllTransactionsQuery } from '@/store/features/transactions/transactions';

const Recent_Order_Transactions = () => {
    const { data, isLoading, isError } = useGetAllTransactionsQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error loading transactions</div>;
    }

    const transactions = data?.data || [];

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
                            {transactions.map((tx: any) => (
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
