'use client';

import ReportHeader from '@/__components/ReportHeader';
import { useGetStockReportQuery } from '@/store/features/StockAdjustment/stockAdjustmentApi';
import { useState } from 'react';

export default function StockReport() {
    const [entries, setEntries] = useState(25);
    const [search, setSearch] = useState('');
    const { data, error, isLoading } = useGetStockReportQuery({ entries, search });

    const handleEntriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEntries(Number(e.target.value));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading stock report</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <ReportHeader title="Stock Report" subtitle="Overview of current stock levels" showStoreSelector />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <select
                        name="entries"
                        id="entries"
                        value={entries}
                        onChange={handleEntriesChange}
                        className="block w-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <div>
                        <button type="button" className="mr-2 rounded bg-gray-200 px-4 py-2 text-sm">
                            Export CSV
                        </button>
                        <button type="button" className="mr-2 rounded bg-gray-200 px-4 py-2 text-sm">
                            Export Excel
                        </button>
                        <button type="button" className="mr-2 rounded bg-gray-200 px-4 py-2 text-sm">
                            Print
                        </button>
                        <button type="button" className="mr-2 rounded bg-gray-200 px-4 py-2 text-sm">
                            Column Visibility
                        </button>
                        <button type="button" className="mr-2 rounded bg-gray-200 px-4 py-2 text-sm">
                            Export PDF
                        </button>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={handleSearchChange}
                            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 bg-gray-200 p-2">Action</th>
                            <th className="border border-gray-300 bg-gray-200 p-2">SKU</th>
                            <th className="border border-gray-300 bg-gray-200 p-2">Product</th>
                            <th className="border border-gray-300 bg-gray-200 p-2">Variation</th>
                            <th className="border border-gray-300 bg-gray-200 p-2">Category</th>
                            <th className="border border-gray-300 bg-gray-200 p-2">Store</th>
                            <th className="border border-gray-300 bg-gray-200 p-2">Unit Selling Price</th>
                            <th className="border border-gray-300 bg-gray-200 p-2">Current Stock</th>
                            <th className="border border-gray-300 bg-gray-200 p-2">Purchase Price (By Value)</th>
                            <th className="border border-gray-300 bg-gray-200 p-2">Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data?.map((product: any) => (
                            <tr key={product.id}>
                                <td className="border border-gray-300 p-2">
                                    <a href="#" className="text-blue-500 underline">
                                        Product stock history
                                    </a>
                                </td>
                                <td className="border border-gray-300 p-2">{product.sku}</td>
                                <td className="border border-gray-300 p-2">{product.product_name}</td>
                                <td className="border border-gray-300 p-2">{product.variation || '-'}</td>
                                <td className="border border-gray-300 p-2">{product.category?.name || '-'}</td>
                                <td className="border border-gray-300 p-2">{product.store?.store_name || 'NEWTON'}</td>
                                <td className="border border-gray-300 p-2">
                                    {product.price || '0.00'} {product.currency || '৳'}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {product.quantity || 0} {product.unit || 'Pcs'}
                                </td>
                                <td className="border border-gray-300 p-2">{product.purchase_price || '0.00'}</td>
                                <td className="border border-gray-300 p-2">{product.available ? '✓' : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
