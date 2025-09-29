'use client';
import React from 'react';

const StockSummaryCard = ({ summary }) => {
    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded bg-white p-4 shadow">
                <h3>Total Products</h3>
                <p className="text-2xl font-bold">{summary.total_products}</p>
            </div>
            <div className="rounded bg-white p-4 shadow">
                <h3>Total Stock Value</h3>
                <p className="text-2xl font-bold">৳{summary.total_stock_value}</p>
            </div>
            <div className="rounded bg-white p-4 shadow">
                <h3>Low Stock Items</h3>
                <p className="text-2xl font-bold">{summary.low_stock_items}</p>
            </div>
            <div className="rounded bg-white p-4 shadow">
                <h3>Out of Stock</h3>
                <p className="text-2xl font-bold">{summary.out_of_stock}</p>
            </div>
        </div>
    );
};

export default StockSummaryCard;
