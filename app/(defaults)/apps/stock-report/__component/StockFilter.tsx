'use client';
import React from 'react';

const StockFilter = ({ storeList, selectedStore, setSelectedStore, selectedRange, setSelectedRange }) => {
    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
            {/* Store Select */}
            {/* <div>
                <label className="mb-1 block text-sm font-medium">Select Store</label>
                <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="rounded border p-2">
                    <option value="all">All Stores</option>
                    {storeList.map((store) => (
                        <option key={store.id} value={store.id}>
                            {store.name}
                        </option>
                    ))}
                </select>
            </div> */}

            {/* Date Range Select */}
            <div>
                <label className="mb-1 block text-sm font-medium">Date Range</label>
                <select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)} className="rounded border p-2">
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last90days">Last 90 Days</option>
                </select>
            </div>
        </div>
    );
};

export default StockFilter;
