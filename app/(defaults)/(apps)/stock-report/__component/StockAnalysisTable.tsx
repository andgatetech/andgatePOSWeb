'use client'
import React from 'react';

const StockAnalysisTable = ({ analysis }) => {
    return (
        <div className="overflow-x-auto rounded bg-white p-4 shadow">
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Category</th>
                        <th className="border px-4 py-2">Current Stock</th>
                        <th className="border px-4 py-2">Min Level</th>
                        <th className="border px-4 py-2">Max Level</th>
                        <th className="border px-4 py-2">Stock Value</th>
                        <th className="border px-4 py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {analysis.map((cat) => (
                        <tr key={cat.category_name}>
                            <td className="border px-4 py-2">{cat.category_name}</td>
                            <td className="border px-4 py-2">{cat.current_stock}</td>
                            <td className="border px-4 py-2">{cat.min_level}</td>
                            <td className="border px-4 py-2">{cat.max_level}</td>
                            <td className="border px-4 py-2">৳{cat.stock_value}</td>
                            <td className="border px-4 py-2">{cat.stock_status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockAnalysisTable;
