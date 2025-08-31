'use client';

import QrCodeTable from '@/__components/QrCodeTable';
import { useGetAllProductsQuery, useGetProductQRCodeQuery } from '@/store/Product/productApi';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function ProductAndQrTable() {
    const token = useSelector((state) => state.auth.token);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const { refetch: getProductQRCode } = useGetProductQRCodeQuery(selectedProductId!, {
        skip: !selectedProductId,
    });

    const { data: pd, isLoading } = useGetAllProductsQuery();
    const [products, setProducts] = useState<any[]>([]);
    useEffect(() => {
        if (pd?.data) {
            setProducts(pd.data);
        }
    }, [pd?.data]);

    const [search, setSearch] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [qrCodes, setQrCodes] = useState<any[]>([]); // QR Code data array
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const filteredProducts = products.filter((p) => p.product_name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const displayedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProducts(displayedProducts.map((p) => p.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const changeQuantity = (id: number, delta: number) => {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p)));
    };

    const handleGenerateMultipleQR = async () => {
        const selected = products.filter((p) => selectedProducts.includes(p.id));
        if (selected.length === 0) return;

        const qrResults: any[] = [];

        for (const product of selected) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/${product.id}/qrcode`, {
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

    return (
        <div className="flex flex-col gap-6 p-4 md:flex-row">
            {/* Left Side: Product Table */}
            <div className="w-full md:w-1/2">
                {/* Top Search + Bulk Button */}
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded border px-2 py-1 md:w-1/2" />
                    <button className="btn btn-primary rounded bg-blue-600 px-4 py-1 text-white" onClick={handleGenerateMultipleQR} disabled={selectedProducts.length === 0}>
                        Generate QR
                    </button>
                </div>

                {/* Table */}
                <table className="w-full rounded border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2">
                                <input
                                    type="checkbox"
                                    checked={displayedProducts.length > 0 && displayedProducts.every((p) => selectedProducts.includes(p.id))}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="p-2 text-left">Product Name</th>
                            <th className="p-2 text-left">SKU</th>
                            <th className="p-2 text-left">Qr Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedProducts.map((p) => (
                            <tr key={p.id} className="border-b">
                                <td className="p-2 text-center">
                                    <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                                </td>
                                <td className="p-2">{p.product_name}</td>
                                <td className="p-2">{p.sku}</td>
                                <td className="p-2">
                                    <div className="flex items-center gap-2">
                                        <button className="rounded bg-gray-200 px-2" onClick={() => changeQuantity(p.id, -1)}>
                                            -
                                        </button>
                                        <span>{p.quantity}</span>
                                        <button className="rounded bg-gray-200 px-2" onClick={() => changeQuantity(p.id, 1)}>
                                            +
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="mt-3 flex items-center justify-between">
                    <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                        Prev
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                        Next
                    </button>
                </div>
            </div>

            {/* Right Side: QR Code Table */}
            <div className="w-full md:w-1/2">
                <QrCodeTable qrCodes={qrCodes} />
            </div>
        </div>
    );
}
