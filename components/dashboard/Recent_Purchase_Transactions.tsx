import React from 'react';
import dayjs from 'dayjs';
import { useGetAllPurchasesTransactionsQuery } from '@/store/features/purchase/purchase';

const Recent_Purchase_Transactions = () => {
  const { data, isLoading, isError } = useGetAllPurchasesTransactionsQuery();

  // Handle loading
  if (isLoading) {
    return (
      <div className="panel grid h-32 place-content-center text-center text-gray-500 dark:text-gray-400">
        Loading purchase transactions...
      </div>
    );
  }

  // Handle error
  if (isError) {
    return (
      <div className="panel grid h-32 place-content-center text-center text-red-500 dark:text-red-400">
        Could not fetch purchase transactions.
      </div>
    );
  }

  const purchases = Array.isArray(data?.data) ? data.data : [];

  // Empty database
  if (purchases.length === 0) {
    return (
      <div className="panel grid h-32 place-content-center text-center text-gray-500 dark:text-gray-400">
        No purchase transactions found in the database.
      </div>
    );
  }

  // If data exists, show simple list
  return (
    <div className="panel">
      <div className="mb-5 text-lg font-bold">Recent Purchase Transactions</div>
      <ul className="space-y-2">
        {purchases.slice(0, 7).map((p: any) => (
          <li key={p.id} className="flex justify-between border-b py-2">
            <span>#{p.id} | {p.purchase_id}</span>
            <span>{p.payment_method}</span>
            <span>৳{p.amount}</span>
            <span>{dayjs(p.created_at).format('MMM DD, YYYY')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recent_Purchase_Transactions;
