'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Calendar, Package, Shield, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';

interface Serial {
    id: number;
    serial_number: string;
    status: string;
    notes?: string;
}

interface Warranty {
    id: number;
    warranty_type_id: number;
    warranty_type_name: string;
    duration_months: number | null;
    duration_days: number | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    remaining_days: number | null;
}

interface Stock {
    id: number;
    unit: string;
    price: number;
    purchase_price: number;
    wholesale_price: number;
    quantity: number;
    variant_name?: string;
    variant_data?: any;
    is_variant: boolean;
    serials?: Serial[]; // Optional: stock-level serials
}

interface Product {
    id: number;
    product_name: string;
    description: string;
    sku: string;
    has_serial: boolean;
    has_warranty: boolean;
    stocks: Stock[];
    serials?: Serial[];
    warranties?: Warranty[];
    available_serial_count?: number;
}

interface SerialSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    selectedStock?: Stock | null; // For variant products
    onConfirm: (selectedSerials: Serial[], warranty: Warranty | null) => void;
}

const SerialSelectionModal = ({ isOpen, onClose, product, selectedStock, onConfirm }: SerialSelectionModalProps) => {
    const { t } = getTranslation();
    const { formatNumber } = useCurrency();
    const [selectedSerialIds, setSelectedSerialIds] = useState<number[]>([]);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setSelectedSerialIds([]);
            setQuantity(1);
        }
    }, [isOpen, product, selectedStock]);

    if (!product) return null;

    // Get serials filtered by selected stock's ID (for variant products)
    let availableSerials: Serial[] = [];

    if (selectedStock && product.serials && Array.isArray(product.serials) && product.serials.length > 0) {
        // Filter serials by product_stock_id matching the selected variant
        availableSerials = product.serials.filter((s: any) => s.status === 'in_stock' && s.product_stock_id === selectedStock.id);
    } else if (selectedStock && selectedStock.serials && Array.isArray(selectedStock.serials)) {
        // Fallback: Use serials directly from the selected stock object
        availableSerials = selectedStock.serials.filter((s: Serial) => s.status === 'in_stock');
    } else if (product.serials && Array.isArray(product.serials)) {
        // For non-variant products, use all available serials
        availableSerials = product.serials.filter((s: Serial) => s.status === 'in_stock');
    }

    // Get warranty for the selected stock/variant
    let warranty: any = null;
    if (product.has_warranty && product.warranties && Array.isArray(product.warranties)) {
        if (selectedStock) {
            // Find warranty matching the selected stock's ID
            warranty = product.warranties.find((w: any) => w.product_stock_id === selectedStock.id);
        } else {
            // For non-variant products, use first warranty
            warranty = product.warranties[0];
        }
    }

    const currentStock = selectedStock || (product.stocks && product.stocks.length > 0 ? product.stocks[0] : null);

    const handleSerialToggle = (serialId: number) => {
        setSelectedSerialIds((prev) => {
            if (prev.includes(serialId)) {
                return prev.filter((id) => id !== serialId);
            } else {
                // Limit selection to quantity
                if (prev.length < quantity) {
                    return [...prev, serialId];
                }
                return prev;
            }
        });
    };

    const handleQuantityChange = (newQty: number) => {
        const maxQty = Math.min(availableSerials.length, currentStock?.quantity || 0);
        const validQty = Math.max(1, Math.min(newQty, maxQty));
        setQuantity(validQty);

        // Auto-adjust selected serials if quantity decreased
        if (selectedSerialIds.length > validQty) {
            setSelectedSerialIds(selectedSerialIds.slice(0, validQty));
        }
    };

    const handleConfirm = () => {
        if (selectedSerialIds.length !== quantity) {
            alert(`${t('msg_select_exactly')} ${formatNumber(quantity)} ${t('lbl_serial_numbers')}`);
            return;
        }

        const selectedSerials = availableSerials.filter((s) => selectedSerialIds.includes(s.id));
        onConfirm(selectedSerials, warranty);
        onClose();
    };

    const getWarrantyDuration = () => {
        if (!warranty) return null;
        if (warranty.duration_months) return `${formatNumber(warranty.duration_months)} ${t('lbl_months')}`;
        if (warranty.duration_days) return `${formatNumber(warranty.duration_days)} ${t('lbl_days')}`;
        return t('lbl_lifetime');
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-2 text-center sm:p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-2xl transition-all sm:rounded-2xl">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-white p-4 sm:p-6">
                                    <div className="flex-1">
                                        <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-primary/70">{t('lbl_serial_number_selection')}</p>
                                        <Dialog.Title as="h3" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                            <Package className="h-5 w-5 text-primary" />
                                            {product.product_name}
                                        </Dialog.Title>
                                        {selectedStock && selectedStock.variant_name && (
                                            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t('lbl_variant')}: {selectedStock.variant_name}</span>
                                                {selectedStock.serials ? ` — ${t('lbl_variant_specific_serials')}` : ''}
                                            </p>
                                        )}
                                    </div>
                                    <button onClick={onClose} className="ml-3 rounded-full bg-white/80 p-2 text-gray-400 shadow-sm transition-all hover:bg-primary/10 hover:text-primary">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-4 sm:p-6">

                                {/* Warranty Info Banner */}
                                {warranty && (
                                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <Shield className="mt-0.5 h-5 w-5 text-green-600" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-green-900">{t('lbl_warranty_included')}</h4>
                                                <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-green-700">
                                                    {warranty.warranty_type_name && (
                                                        <div>
                                                            <span className="font-medium">{t('lbl_type')}:</span> {warranty.warranty_type_name}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="font-medium">{t('lbl_duration')}:</span> {getWarrantyDuration()}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-xs text-green-600">
                                                    <Calendar className="mr-1 inline h-3 w-3" />
                                                    {t('msg_warranty_activation')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Selector */}
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_quantity_to_sell')}</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                            <button
                                                onClick={() => handleQuantityChange(quantity - 1)}
                                                className="px-3 py-2 text-gray-500 transition hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                                                disabled={quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                                className="w-16 border-x border-gray-200 px-2 py-2 text-center text-sm font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
                                                min={1}
                                                max={Math.min(availableSerials.length, currentStock?.quantity || 0)}
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(quantity + 1)}
                                                className="px-3 py-2 text-gray-500 transition hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                                                disabled={quantity >= Math.min(availableSerials.length, currentStock?.quantity || 0)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-sm text-gray-500">{t('lbl_available')}: <span className="font-semibold text-gray-700">{formatNumber(availableSerials.length)}</span> {t('lbl_serials')}</span>
                                    </div>
                                </div>

                                {/* Serial Selection Instructions */}
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs font-medium text-gray-500">
                                        {t('lbl_select')} {formatNumber(quantity)} {quantity > 1 ? t('lbl_serial_numbers') : t('lbl_serial_number')}
                                    </p>
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                        {formatNumber(selectedSerialIds.length)}/{formatNumber(quantity)} {t('lbl_selected')}
                                    </span>
                                </div>

                                {/* Serial Numbers Grid */}
                                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 sm:max-h-80">
                                    {availableSerials.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <Package className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                            <p>{t('msg_no_serials_in_stock')}</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {availableSerials.map((serial) => {
                                                const isSelected = selectedSerialIds.includes(serial.id);
                                                const isDisabled = !isSelected && selectedSerialIds.length >= quantity;

                                                return (
                                                    <div
                                                        key={serial.id}
                                                        onClick={() => !isDisabled && handleSerialToggle(serial.id)}
                                                        className={`cursor-pointer p-4 transition-colors ${
                                                            isSelected ? 'border-l-4 border-primary bg-primary/5' : isDisabled ? 'cursor-not-allowed bg-gray-50 opacity-50' : 'hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {}}
                                                                    disabled={isDisabled}
                                                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                                <div>
                                                                    <p className="font-mono text-sm font-semibold tracking-wide text-gray-900">{serial.serial_number}</p>
                                                                    {serial.notes && <p className="text-[11px] text-gray-400">{serial.notes}</p>}
                                                                </div>
                                                            </div>
                                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">{t('status_in_stock')}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                </div>{/* end p-6 body */}

                                {/* Footer Actions */}
                                <div className="flex gap-3 border-t border-primary/10 bg-gradient-to-r from-primary/5 to-white px-4 py-4 sm:justify-end sm:px-6">
                                    <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 focus:outline-none">
                                        {t('btn_cancel')}
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={selectedSerialIds.length !== quantity}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                                    >
                                        {t('btn_add_to_cart')} ({formatNumber(selectedSerialIds.length)}/{formatNumber(quantity)})
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SerialSelectionModal;
