'use client';

import QrCodeTable from '@/__components/QrCodeTable';
import { useGetAllProductsQuery } from '@/store/Product/productApi';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function ProductAndQrTable() {
    const token = useSelector((state) => state.auth.token);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const { data: pd, isLoading } = useGetAllProductsQuery();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (pd?.data) {
            // Set default quantity to 0 for all products
            const productsWithQuantity = pd.data.map((product) => ({
                ...product,
                quantity: 0,
            }));
            setProducts(productsWithQuantity);
        }
    }, [pd?.data]);

    const [search, setSearch] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [qrCodes, setQrCodes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const filteredProducts = products.filter((p) => p.product_name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

    // Only show products with quantity > 0 as selectable
    const selectableProducts = filteredProducts.filter((p) => p.quantity > 0);

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const displayedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleSelectAll = (checked) => {
        if (checked) {
            // Only select products with quantity > 0
            const selectableIds = displayedProducts.filter((p) => p.quantity > 0).map((p) => p.id);
            setSelectedProducts(selectableIds);
        } else {
            setSelectedProducts([]);
        }
    };

    const toggleSelect = (id) => {
        const product = products.find((p) => p.id === id);
        // Only allow selection if quantity > 0
        if (product && product.quantity > 0) {
            setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
        }
    };

    const changeQuantity = (id, value) => {
        const numValue = Math.max(0, parseInt(value) || 0);
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: numValue } : p)));

        // Remove from selected if quantity becomes 0
        if (numValue === 0) {
            setSelectedProducts((prev) => prev.filter((selectedId) => selectedId !== id));
        }
    };

    const handleGenerateMultipleQR = async () => {
        const selected = products.filter((p) => selectedProducts.includes(p.id) && p.quantity > 0);

        if (selected.length === 0) {
            alert('Please select products with quantity greater than 0');
            return;
        }

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

    const displayedSelectableCount = displayedProducts.filter((p) => p.quantity > 0).length;
    const allDisplayedSelectableSelected = displayedSelectableCount > 0 && displayedProducts.filter((p) => p.quantity > 0).every((p) => selectedProducts.includes(p.id));

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
                                        checked={allDisplayedSelectableSelected}
                                        onChange={(e) => toggleSelectAll(e.target.checked)}
                                        className="rounded"
                                        disabled={displayedSelectableCount === 0}
                                    />
                                </th>
                                <th className="p-3 text-left font-semibold text-gray-700">Product Name</th>
                                <th className="p-3 text-left font-semibold text-gray-700">SKU</th>
                                <th className="p-3 text-left font-semibold text-gray-700">QR Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedProducts.map((p) => (
                                <tr key={p.id} className={`border-b transition-colors hover:bg-gray-50 ${p.quantity === 0 ? 'opacity-50' : ''}`}>
                                    <td className="p-3 text-center">
                                        <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" disabled={p.quantity === 0} />
                                    </td>
                                    <td className="p-3 font-medium text-gray-800">{p.product_name}</td>
                                    <td className="p-3 text-gray-600">{p.sku}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                // value={p.quantity}
                                                onChange={(e) => changeQuantity(p.id, e.target.value)}
                                                className="w-20 rounded border border-gray-300 px-2 py-1 text-center [appearance:textfield] focus:border-blue-500 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                // min="0"
                                                placeholder="0"
                                            />
                                            {p.quantity > 0 && <span className="text-sm font-medium text-green-600">✓</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* No results message */}
                {filteredProducts.length === 0 && <div className="py-8 text-center text-gray-500">No products found matching "{search}"</div>}

                {/* Info message */}
                <div className="mt-2 text-sm text-gray-600">
                    {selectableProducts.length} of {filteredProducts.length} products have quantity &gt; 0 and can be selected
                </div>

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
