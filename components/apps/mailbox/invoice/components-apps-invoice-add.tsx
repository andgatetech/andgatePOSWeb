'use client';

import { useGetAllProductsQuery } from '@/store/Product/productApi';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { setItemsRedux, addItemRedux, updateItemRedux } from '@/store/features/Order/OrderSlice';
import type { RootState } from '@/store';
import BillToForm from './components-apps-invoice-right-billing';
import Image from 'next/image';
import IconEye from '@/components/icon/icon-eye';
import ImageShowModal from '@/__components/ImageShowModal';

const ComponentsAppsInvoiceAdd = () => {
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const dispatch = useDispatch();

    // Fetch all products from API
    const { data: productsData, isLoading } = useGetAllProductsQuery({ available: 'yes'});
    const products = productsData?.data || [];
    console.log(products[0]);
    // Get items from Redux store
    const reduxItems = useSelector((state: RootState) => state.invoice.items);

    // Local state for UI interactions - start with only one empty row
    const [items, setItems] = useState<any[]>([
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
        },
    ]);

    // Track search input for each item
    const [searchTerm, setSearchTerm] = useState<Record<number, string>>({});
    // Show dropdown list per item for product search
    const [showDropdown, setShowDropdown] = useState<Record<number, boolean>>({});

    // Sync Redux state with local state - only for display, don't override single row
    useEffect(() => {
        // Don't sync Redux items to local state since we maintain only one input row
        // Local state is only for the current product being selected
    }, [reduxItems]);

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const handleImageShow = (product) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    const changeQuantityPrice = (type: string, value: string, id: number) => {
        setItems((prevItems) => {
            return prevItems.map((d) => {
                if (d.id !== id) return d;

                let qty = d.quantity;
                let rate = d.rate;

                if (type === 'quantity') {
                    const newQty = Number(value);
                    if (newQty < 0) return d;
                    if (d.PlaceholderQuantity && newQty > d.PlaceholderQuantity) {
                        showMessage(`Maximum available quantity is ${d.PlaceholderQuantity}`, 'error');
                        return d;
                    }
                    qty = newQty;
                }

                if (type === 'price') {
                    const newRate = Number(value);
                    if (newRate < 0) return d;
                    rate = newRate;
                }

                return {
                    ...d,
                    quantity: qty,
                    rate,
                    amount: qty * rate,
                };
            });
        });
    };

    // Handle product name search input change
    const onSearchChange = (id: number, value: string) => {
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
    const onSelectProduct = (id: number, product: any) => {
        const list = [...items];
        const item = list.find((d) => d.id === id);
        if (!item) return;

        item.productId = product.id;
        item.title = product.product_name;
        item.description = product.description || '';
        item.rate = Number(product.price) || 0;
        item.quantity = 1;
        item.images = product.images || [];
        item.PlaceholderQuantity = product.quantity || 0;
        item.amount = item.rate * item.quantity;

        setItems(list);
        // DO NOT add to Redux store yet - only when "Add Item" is clicked

        setSearchTerm((prev) => ({ ...prev, [id]: product.product_name }));
        setShowDropdown((prev) => ({ ...prev, [id]: false }));
    };

    const beepRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        beepRef.current = new Audio('/assets/sound/store-scanner-beep-90395.mp3');
    }, []);

    const addItem = () => {
        const currentItem = items.find((item) => item.productId);

        if (!currentItem) {
            showMessage('Please select a product first', 'error');
            return;
        }
        if (beepRef.current) {
            beepRef.current.currentTime = 0;
            beepRef.current.play().catch((e) => {
                console.warn('Audio play failed:', e);
            });
        }

        // Assign a unique ID before dispatching (using timestamp + random for safety)
        const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
        const itemToAdd = { ...currentItem, id: uniqueId };

        dispatch(addItemRedux(itemToAdd));

        // Reset the local item with a new unique id for next input
        setItems([
            {
                id: uniqueId + 1, // or just uniqueId + 1, any unique number here
                searchTerm: undefined,
                product_name: '',
                title: '',
                productId: undefined,
                description: '',
                rate: 0,
                quantity: 0,
                amount: 0,
            },
        ]);
        setSearchTerm({});
        setShowDropdown({});

        showMessage('Item added successfully!', 'success');
    };

   

    // Calculate subtotal from Redux items only
    const subtotal = reduxItems.reduce((acc, item) => acc + item.amount, 0);

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
                    
                </div>
                <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

                <div className="mt-8">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th className="w-1">Quantity</th>
                                    <th className="w-1">Image</th>
                                    <th className="w-1">Price</th>
                                    <th>Total</th>
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
                                {items.map((item: any) => (
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
                                                    // Delay hiding dropdown to allow clicking on items
                                                    setTimeout(() => {
                                                        setShowDropdown((prev) => ({ ...prev, [item.id]: false }));
                                                    }, 200);
                                                }}
                                            />
                                            {/* Dropdown list */}
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
                                            <textarea className="form-textarea mt-4" placeholder="Enter Description" value={item.description} readOnly></textarea>
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                className="form-input w-32"
                                                placeholder="Quantity"
                                                min={0}
                                                value={item.quantity}
                                                onChange={(e) => changeQuantityPrice('quantity', e.target.value, item.id)}
                                            />
                                            {item.PlaceholderQuantity && <div className="text-xs text-gray-400">Available: {item.PlaceholderQuantity}</div>}
                                        </td>
                                        <td>
                                            <button className="cursor-pointer" onClick={() => handleImageShow(item)}>
                                                <IconEye />
                                            </button>
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                className="form-input w-32"
                                                placeholder="Price"
                                                min={0}
                                                step="0.01"
                                                value={item.rate}
                                                readOnly
                                                onChange={(e) => changeQuantityPrice('price', e.target.value, item.id)}
                                            />
                                        </td>

                                        <td>৳{(item.quantity * item.rate).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                        <div className="mb-6 sm:mb-0">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={addItem}
                                disabled={!items.some((item) => item.productId)}
                                title={!items.some((item) => item.productId) ? 'Select a product first' : 'Add item to order'}
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-8 px-4">
                    <label htmlFor="notes">Notes</label>
                    <textarea id="notes" name="notes" className="form-textarea min-h-[130px]" placeholder="Notes...."></textarea>
                </div>
            </div>

            {/* Right side form */}
            <div>
                <BillToForm />
            </div>
            <ImageShowModal isOpen={open} onClose={() => setOpen(false)} product={selectedProduct} />
        </div>
    );
};

export default ComponentsAppsInvoiceAdd;
