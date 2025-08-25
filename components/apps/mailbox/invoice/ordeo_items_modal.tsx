'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useGetOrderItemsQuery } from '@/store/features/Order/Order';

interface OrderItemsModalProps {
    open: boolean;
    onClose: () => void;
    id: any;
}

export default function OrderItemsModal({ open, onClose, id }: OrderItemsModalProps) {
    const { data } = useGetOrderItemsQuery(id);

    const columns = [
        { key: 'category', label: 'Category' },
        { key: 'product_name', label: 'Product Name' },
        { key: 'purchase_price', label: 'Purchase Price' },
        { key: 'price', label: 'Price' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'unit_price', label: 'Unit Price' },
        { key: 'subtotal', label: 'Subtotal' },
    ];

    const items = data?.items || [];

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" open={open} onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                    <div className="flex min-h-screen items-center justify-center px-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel as="div" className="panel my-8 w-full max-w-5xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                {/* Header */}
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <h5 className="text-lg font-bold">Order Items</h5>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <svg width="20" height="20" fill="currentColor">
                                            <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto p-5">
                                    <table className="table-striped w-full border-collapse border border-gray-200 dark:border-gray-700">
                                        <thead className="bg-gray-100 dark:bg-gray-800">
                                            <tr>
                                                {columns.map((column) => (
                                                    <th key={column.key} className="border border-gray-200 px-4 py-2 text-left dark:border-gray-700">
                                                        {column.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.length > 0 ? (
                                                items.map((item: any) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="border px-4 py-2">{item.product?.category?.name}</td>
                                                        <td className="border px-4 py-2">{item.product?.product_name}</td>
                                                        <td className="border px-4 py-2">${Number(item.product?.purchase_price).toFixed(2)}</td>
                                                        <td className="border px-4 py-2">${Number(item.product?.price).toFixed(2)}</td>
                                                        <td className="border px-4 py-2">{item.quantity}</td>
                                                        <td className="border px-4 py-2">${Number(item.unit_price).toFixed(2)}</td>
                                                        <td className="border px-4 py-2">${Number(item.subtotal).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={columns.length} className="py-4 text-center">
                                                        No items found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
