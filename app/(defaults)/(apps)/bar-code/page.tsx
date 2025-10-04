'use client';

import BrCodeTable from '@/__components/BarCodeTable';
import { useGetAllProductsQuery, useGetProductBrCodeQuery } from '@/store/features/Product/productApi';
import { BarcodeIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function QrCode() {
    const { data: pd } = useGetAllProductsQuery();
    // State for tracking QR code generation
    const [selectedProductId, setSelectedProductId] = useState(null);

    // Fetch QR code when a product is selected for QR generation
    const { data: brCodeData } = useGetProductBrCodeQuery(selectedProductId, { skip: !selectedProductId });
    const products = pd?.data || [];

    // State for items in the table
    const [items, setItems] = useState([
        {
            id: 1,
            searchTerm: undefined,
            product_name: '',
            title: '',
            productId: undefined,
            description: '',
            rate: 0,
            quantity: 0,
            amount: 0,
            images: [],
            sku: '',
        },
    ]);

    // State for generated Barcodes
    const [brCodes, setBrCodes] = useState([]);

    // Track search input and dropdown visibility
    const [searchTerm, setSearchTerm] = useState({});
    const [showDropdown, setShowDropdown] = useState({});

    // Handle product name search input change
    const onSearchChange = (id, value) => {
        setSearchTerm((prev) => ({ ...prev, [id]: value }));
        setShowDropdown((prev) => ({ ...prev, [id]: true }));

        // Clear selected product if user types something new
        const list = [...items];
        const item = list.find((d) => d.id === id);
        if (!item) return;
        item.productId = undefined;
        item.description = '';
        item.rate = 0;
        item.amount = 0;
        item.quantity = 0;
        setItems(list);
    };

    // When user selects a product from dropdown
    const onSelectProduct = (id, product) => {
        const list = [...items];
        const item = list.find((d) => d.id === id);

        if (!item) return;

        item.productId = product.id;
        item.title = product.product_name;
        item.description = product.description || '';
        item.rate = Number(product.price) || 0;
        item.quantity = 1;
        item.images = product.images || [];
        // Calculate total quantity from stocks
        const totalQuantity = product.stocks?.reduce((sum: number, stock: any) => sum + parseFloat(stock.quantity || '0'), 0) || 0;
        item.PlaceholderQuantity = totalQuantity;
        item.amount = item.rate * item.quantity;
        item.sku = product.sku || '';

        setItems(list);
        setSearchTerm((prev) => ({ ...prev, [id]: product.product_name }));
        setShowDropdown((prev) => ({ ...prev, [id]: false }));
    };

    // Handle quantity change and update amount
    const changeQuantityPrice = (field, value, id) => {
        const list = [...items];
        const item = list.find((d) => d.id === id);

        if (!item) return;

        if (field === 'quantity') {
            item.quantity = Number(value) || 0;
            item.amount = item.rate * item.quantity;
        }

        setItems(list);
    };

    // Generate Bar code for selected product and quantity
    const generateBrCode = (id) => {
        const item = items.find((d) => d.id === id);
        if (!item || !item.productId || item.quantity <= 0) {
            alert('Please select a product and enter a valid quantity.');
            return;
        }

        // Set the product ID to trigger Bar code fetching
        setSelectedProductId(item.productId);

        // Use useEffect to handle brCodeData updates
        if (brCodeData) {
            setBrCodes((prev) => [
                ...prev,
                {
                    productId: item.productId,
                    sku: item.sku,
                    product_name: item.title,
                    quantity: item.quantity,
                    qrcode: brCodeData.barcode,
                },
            ]);
            // Reset selectedProductId after adding to qrCodes
            setSelectedProductId(null);
        }
    };

    // Effect to handle Bar code data updates
    useEffect(() => {
        if (brCodeData && selectedProductId) {
            const item = items.find((d) => d.productId === selectedProductId);
            if (item) {
                setBrCodes((prev) => [
                    ...prev,
                    {
                        productId: item.productId,
                        sku: item.sku,
                        product_name: item.title,
                        quantity: item.quantity,
                        barcode: brCodeData.barcode,
                    },
                ]);
            }
            // Reset selectedProductId after adding to brCodes
            setSelectedProductId(null);
        }
    }, [brCodeData, selectedProductId, items]);

    return (
        <div className="flex flex-col gap-2 xl:flex-row">
            <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <div className="flex flex-wrap justify-between px-4">
                    <div className="mb-6 w-full lg:w-1/2">
                        <div className="flex shrink-0 items-center text-black dark:text-white">
                            <Image src="/assets/images/Logo-PNG.png" alt="img" width={96} height={96} className="" />
                        </div>
                        <div className="mt-6 space-y-1 text-gray-500 dark:text-gray-400">
                            <div>Dhaka, Bangladesh</div>
                            <div>andgate@gmail.com</div>
                            <div>+8801610108851</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 lg:max-w-fit">
                        <div className="flex items-center">
                            <label htmlFor="number" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Product SKU
                            </label>
                            <input id="number" type="text" name="inv-num" className="form-input w-2/3 lg:w-[250px]" value={items[0]?.sku || ''} readOnly />
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

                <div className="mt-8">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th className="w-1">Quantity</th>
                                    <th className="w-1">Price</th>
                                    <th className="w-1">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length <= 0 && (
                                    <tr>
                                        <td colSpan={5} className="!text-center font-semibold">
                                            No Item Available
                                        </td>
                                    </tr>
                                )}
                                {items.map((item) => (
                                    <tr className="align-top" key={item.id}>
                                        <td className="relative">
                                            <input
                                                type="text"
                                                className="form-input min-w-[200px]"
                                                placeholder="Enter Item Name"
                                                value={searchTerm[item.id] ?? item.title}
                                                onChange={(e) => onSearchChange(item.id, e.target.value)}
                                                onFocus={() => setShowDropdown((prev) => ({ ...prev, [item.id]: true }))}
                                                onBlur={() => {
                                                    setTimeout(() => {
                                                        setShowDropdown((prev) => ({ ...prev, [item.id]: false }));
                                                    }, 200);
                                                }}
                                            />
                                            {showDropdown[item.id] && searchTerm[item.id] && (
                                                <ul className="absolute z-10 max-h-44 w-full overflow-auto rounded border bg-white p-1 shadow dark:bg-[#172638]">
                                                    {products
                                                        .filter((product) => product.product_name.toLowerCase().includes(searchTerm[item.id].toLowerCase()))
                                                        .slice(0, 10)
                                                        .map((product) => (
                                                            <li
                                                                key={product.id}
                                                                className="cursor-pointer rounded p-2 hover:bg-gray-100 dark:hover:bg-[#0e1629]"
                                                                onClick={() => onSelectProduct(item.id, product)}
                                                            >
                                                                {product.product_name}
                                                            </li>
                                                        ))}
                                                    {products.filter((product) => product.product_name.toLowerCase().includes(searchTerm[item.id].toLowerCase())).length === 0 && (
                                                        <li className="p-2 text-gray-400">No matching products</li>
                                                    )}
                                                </ul>
                                            )}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input w-32"
                                                placeholder="Quantity"
                                                min={0}
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    changeQuantityPrice('quantity', e.target.value, item.id);
                                                }}
                                            />
                                            {item.PlaceholderQuantity && <div className="text-xs text-gray-400">Available: {item.PlaceholderQuantity}</div>}
                                        </td>
                                        <td>{item.rate}</td>
                                        <td>
                                            <button type="button" className="btn btn-primary" onClick={() => generateBrCode(item.id)}>
                                                <BarcodeIcon />
                                                Generate Bar Code
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div>
                <BrCodeTable brCodes={brCodes} />
            </div>
        </div>
    );
}
