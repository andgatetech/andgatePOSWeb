'use client';

import { useGetPurchaseItemsQuery } from '@/store/features/purchase/purchase';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface PurchaseItemsModalProps {
    open: boolean;
    onClose: () => void;
    id: any;
}

export default function PurchaseItemsModal({ open, onClose, id }: PurchaseItemsModalProps) {
    const { data: items } = useGetPurchaseItemsQuery(id);
    const columns = [
        { key: 'category_name', label: 'Category' },
        { key: 'product_name', label: 'Product Name' },
        { key: 'purchase_price', label: 'Purchase Price' },
        { key: 'unit_price', label: 'Unit Price' },
        { key: 'subtotal', label: 'Subtotal' },
    ];
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
                            <Dialog.Panel as="div" className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 dark:bg-[#121c2c]">
                                    <h5 className="text-lg font-bold">Purchase Items</h5>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <svg>...</svg>
                                    </button>
                                </div>
                                <div className="mb-3 overflow-x-auto px-2">
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
                                            {items?.data?.length > 0 ? (
                                                items.data.map((item: any, index: number) => (
                                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="border px-4 py-2">{item.category_name}</td>
                                                        <td className="border px-4 py-2">{item.product_name}</td>
                                                        <td className="border px-4 py-2">৳{Number(item.purchase_price).toFixed(2)}</td>
                                                        <td className="border px-4 py-2">৳{Number(item.unit_price).toFixed(2)}</td>
                                                        <td className="border px-4 py-2">৳{Number(item.subtotal).toFixed(2)}</td>
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
