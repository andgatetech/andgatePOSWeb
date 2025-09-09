'use client';

import QrCodeTable from '@/__components/QrCodeTable';
import { useGetAllProductsQuery } from '@/store/Product/productApi';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function ProductAndQrTable() {
    // Mock Redux state
    const token = useSelector((state) => state.auth.token);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const { data: pd, isLoading } = useGetAllProductsQuery();
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        if (pd?.data) {
            setProducts(pd.data);
        }
    }, [pd?.data]);

    const [search, setSearch] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [qrCodes, setQrCodes] = useState([]); // QR Code data array
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const filteredProducts = products.filter((p) => p.product_name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const displayedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleSelectAll = (checked) => {
        if (checked) {
            setSelectedProducts(displayedProducts.map((p) => p.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const toggleSelect = (id) => {
        setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const changeQuantity = (id, delta) => {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p)));
    };

    const handleGenerateMultipleQR = async () => {
        const selected = products.filter((p) => selectedProducts.includes(p.id));
        if (selected.length === 0) return;

        const qrResults = [];

        for (const product of selected) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${product.id}/qrcode`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                qrResults.push({
                    productId: product.id,
                    sku: product.sku,
                    product_name: product.product_name,
                    qrcode: data.qrcode,
                    quantity: product.quantity,
                });
            } catch (err) {
                console.error(`Failed to generate QR for ${product.product_name}`, err);
            }
        }

        setQrCodes(qrResults);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-gray-500">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:flex-row">
            {/* Left Side: Product Table */}
            <div className="w-full md:w-1/2">
                {/* Top Search + Bulk Button */}
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder="Search products or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none md:w-1/2"
                    />
                    <button
                        className="btn btn-primary rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        onClick={handleGenerateMultipleQR}
                        disabled={selectedProducts.length === 0}
                    >
                        Generate QR ({selectedProducts.length})
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full rounded border border-gray-300 bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={displayedProducts.length > 0 && displayedProducts.every((p) => selectedProducts.includes(p.id))}
                                        onChange={(e) => toggleSelectAll(e.target.checked)}
                                        className="rounded"
                                    />
                                </th>
                                <th className="p-3 text-left font-semibold text-gray-700">Product Name</th>
                                <th className="p-3 text-left font-semibold text-gray-700">SKU</th>
                                <th className="p-3 text-left font-semibold text-gray-700">QR Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedProducts.map((p) => (
                                <tr key={p.id} className="border-b transition-colors hover:bg-gray-50">
                                    <td className="p-3 text-center">
                                        <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" />
                                    </td>
                                    <td className="p-3 font-medium text-gray-800">{p.product_name}</td>
                                    <td className="p-3 text-gray-600">{p.sku}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="rounded bg-gray-200 px-3 py-1 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                                                onClick={() => changeQuantity(p.id, -1)}
                                                disabled={p.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={p.quantity}
                                                onChange={(e) => {
                                                    const value = Math.max(1, parseInt(e.target.value) || 1);
                                                    setProducts((prev) => prev.map((prod) => (prod.id === p.id ? { ...prod, quantity: value } : prod)));
                                                }}
                                                className="w-16 rounded border border-gray-300 px-2 py-1 text-center focus:border-blue-500 focus:outline-none"
                                                min="1"
                                            />
                                            <button className="rounded bg-gray-200 px-3 py-1 font-medium text-gray-700 transition-colors hover:bg-gray-300" onClick={() => changeQuantity(p.id, 1)}>
                                                +
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* No results message */}
                {filteredProducts.length === 0 && <div className="py-8 text-center text-gray-500">No products found matching "{search}"</div>}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            className="rounded border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                        >
                            Previous
                        </button>
                        <span className="text-gray-600">
                            Page {currentPage} of {totalPages} ({filteredProducts.length} products)
                        </span>
                        <button
                            className="rounded border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Right Side: QR Code Table */}
            <div className="w-full md:w-1/2">
                <QrCodeTable qrCodes={qrCodes} />
            </div>
        </div>
    );
}
