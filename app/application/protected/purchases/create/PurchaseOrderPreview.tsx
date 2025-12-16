'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
import { useGetStoreQuery } from '@/store/features/store/storeApi';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { useSelector } from 'react-redux';

interface PurchaseOrderPreviewProps {
    isOpen: boolean;
    onClose: () => void;
}

const PurchaseOrderPreview: React.FC<PurchaseOrderPreviewProps> = ({ isOpen, onClose }) => {
    const previewRef = useRef(null);
    const { currentStoreId } = useCurrentStore();

    // Redux state
    const purchaseItems = useSelector((state: RootState) => state.purchaseOrder.items);
    const supplierId = useSelector((state: RootState) => state.purchaseOrder.supplierId);
    const supplierName = useSelector((state: RootState) => state.purchaseOrder.supplierName);
    const supplierEmail = useSelector((state: RootState) => state.purchaseOrder.supplierEmail);
    const supplierPhone = useSelector((state: RootState) => state.purchaseOrder.supplierPhone);
    const notes = useSelector((state: RootState) => state.purchaseOrder.notes || '');
    const purchaseType = useSelector((state: RootState) => state.purchaseOrder.purchaseType);

    // Fetch store details
    const { data: storeData } = useGetStoreQuery(currentStoreId ? { store_id: currentStoreId } : undefined);
    const currentStore = storeData?.data || {};

    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const currentTime = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    // Calculate totals
    const subtotal = purchaseItems.reduce((total, item) => total + item.purchasePrice * item.quantity, 0);
    const grandTotal = subtotal;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <h2 className="text-2xl font-bold text-gray-900">Purchase Order Preview</h2>
                    <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="panel" ref={previewRef}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-2xl font-semibold uppercase text-primary">Purchase Order</h2>
                            {currentStore?.logo_path ? (
                                <Image
                                    src={currentStore.logo_path.startsWith('/') ? currentStore.logo_path : `/assets/images/${currentStore.logo_path}`}
                                    alt="Store Logo"
                                    width={56}
                                    height={56}
                                    className="h-14 w-14 rounded object-contain"
                                    onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                                    priority={false}
                                />
                            ) : (
                                <Image src="/assets/images/Logo-PNG.png" alt="Default Logo" width={56} height={56} className="w-14" priority={false} />
                            )}
                        </div>

                        {/* Company Info */}
                        <div className="mt-6 space-y-1 px-4 text-right">
                            <div className="font-semibold text-black">{currentStore?.store_name || 'AndGate POS'}</div>
                            <div>{currentStore?.store_location || 'Dhaka, Bangladesh, 1212'}</div>
                            <div>{currentStore?.store_contact || '+8801600000'}</div>
                        </div>

                        <hr className="my-6 border-gray-300" />

                        {/* Supplier & PO Details */}
                        <div className="flex flex-col justify-between gap-6 px-4 lg:flex-row">
                            <div className="flex-1 space-y-1">
                                <div className="font-semibold text-gray-700">Purchase From:</div>
                                {purchaseType === 'supplier' && supplierId ? (
                                    <>
                                        <div className="font-semibold text-black">{supplierName || 'Supplier'}</div>
                                        <div>{supplierEmail || 'No Email'}</div>
                                        <div>{supplierPhone || 'No Phone'}</div>
                                    </>
                                ) : (
                                    <div className="font-semibold text-black">Walk-in / Own Purchase</div>
                                )}
                            </div>

                            <div className="flex flex-col gap-6 sm:flex-row lg:w-2/3">
                                <div className="sm:w-1/2 lg:w-2/5">
                                    <div className="mb-2 flex justify-between">
                                        <span>PO Reference:</span>
                                        <span className="font-medium">DRAFT-{Date.now()}</span>
                                    </div>
                                    <div className="mb-2 flex justify-between">
                                        <span>Date:</span>
                                        <span>{currentDate}</span>
                                    </div>
                                    <div className="mb-2 flex justify-between">
                                        <span>Time:</span>
                                        <span>{currentTime}</span>
                                    </div>
                                </div>

                                <div className="sm:w-1/2 lg:w-2/5">
                                    <div className="mb-2 flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="font-medium capitalize">{purchaseType === 'supplier' ? 'From Supplier' : 'Walk-in Purchase'}</span>
                                    </div>
                                    <div className="mb-2 flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-semibold uppercase text-yellow-600">DRAFT</span>
                                    </div>
                                    <div className="mb-2 flex justify-between">
                                        <span className="text-gray-600">Total Items:</span>
                                        <span className="font-medium">{purchaseItems.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="mt-6 overflow-auto px-4">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                                        <th className="px-3 py-3 text-left text-sm font-semibold uppercase tracking-wide text-gray-700">S.NO</th>
                                        <th className="px-3 py-3 text-left text-sm font-semibold uppercase tracking-wide text-gray-700">ITEMS</th>
                                        <th className="px-3 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-700">TYPE</th>
                                        <th className="px-3 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-700">UNIT</th>
                                        <th className="px-3 py-3 text-center text-sm font-semibold uppercase tracking-wide text-gray-700">QTY ORDERED</th>
                                        <th className="px-3 py-3 text-right text-sm font-semibold uppercase tracking-wide text-gray-700">EST. PRICE</th>
                                        <th className="px-3 py-3 text-right text-sm font-semibold uppercase tracking-wide text-gray-700">EST. TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {purchaseItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="border-b border-gray-300 p-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center py-4">
                                                    <div className="mb-2 text-3xl">📦</div>
                                                    <div className="font-medium">No items added yet</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        purchaseItems.map((item, index) => (
                                            <tr key={item.id} className={`transition-colors hover:bg-blue-50 ${index < purchaseItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                                <td className="border-gray-300 p-3 text-sm font-medium text-gray-600">{index + 1}</td>
                                                <td className="border-gray-300 p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="font-medium text-gray-900">{item.title}</div>
                                                        {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                                                        {item.variantName && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                                                                    Variant: {item.variantName}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="border-gray-300 p-3 text-center">
                                                    {item.itemType === 'existing' ? (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Existing</span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">New</span>
                                                    )}
                                                </td>
                                                <td className="border-gray-300 p-3 text-center">
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || 'piece'}</span>
                                                </td>
                                                <td className="border-gray-300 p-3 text-center text-sm font-medium">{item.quantity}</td>
                                                <td className="border-gray-300 p-3 text-right text-sm">৳{Number(item.purchasePrice).toFixed(2)}</td>
                                                <td className="border-gray-300 p-3 text-right text-sm font-bold">৳{(item.quantity * item.purchasePrice).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Notes */}
                        {notes && (
                            <div className="mt-6 px-4">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <h4 className="mb-2 font-semibold text-gray-700">Notes:</h4>
                                    <p className="text-sm text-gray-600">{notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="mt-6 flex flex-col justify-end gap-2 px-4 sm:flex-row sm:justify-end">
                            <div className="w-full space-y-1 text-right sm:w-[40%]">
                                <div className="flex justify-between">
                                    <span>Estimated Subtotal</span>
                                    <span>৳{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-semibold">
                                    <span>Est. Grand Total</span>
                                    <span className="text-primary">৳{grandTotal.toFixed(2)}</span>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">* Prices can be adjusted during receiving</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 border-t border-gray-200 px-4 pt-4 text-center">
                            <div className="text-sm text-gray-600">This is a draft purchase order preview</div>
                            <div className="mt-1 text-xs text-gray-500">
                                Generated on {currentDate} at {currentTime}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="btn btn-outline px-6 py-2.5">
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderPreview;
