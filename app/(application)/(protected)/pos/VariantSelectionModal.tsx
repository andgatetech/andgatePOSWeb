'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { Dialog, Transition } from '@headlessui/react';
import { Check, Package, ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import { Fragment, useState } from 'react';

interface VariantSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onSelectVariant: (variant: any, quantity: number, useWholesale: boolean) => void;
}

export default function VariantSelectionModal({ isOpen, onClose, product, onSelectVariant }: VariantSelectionModalProps) {
    const { formatCurrency } = useCurrency();
    const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
    const [useWholesale, setUseWholesale] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    if (!product) return null;

    const handleAddToCart = async () => {
        if (selectedVariantIndex === null) {
            alert('Please select a variant');
            return;
        }

        const selectedVariant = product.stocks[selectedVariantIndex];

        if (quantity > selectedVariant.quantity) {
            alert(`Only ${selectedVariant.quantity} items available in stock`);
            return;
        }

        setIsAdding(true);

        try {
            // Call the parent function to add to cart
            await onSelectVariant(selectedVariant, quantity, useWholesale);

            // Reset and close
            setSelectedVariantIndex(null);
            setUseWholesale(false);
            setQuantity(1);
            onClose();
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const selectedVariant = selectedVariantIndex !== null ? product.stocks[selectedVariantIndex] : null;
    const selectedPrice = selectedVariant ? (useWholesale ? selectedVariant.wholesale_price : selectedVariant.price) : 0;
    const totalPrice = selectedPrice * quantity;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                                    <div className="flex-1">
                                        <Dialog.Title className="text-2xl font-bold text-gray-900">{product.product_name}</Dialog.Title>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="ml-4 rounded-full bg-white p-2 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Variants List */}
                                <div className="max-h-[50vh] overflow-y-auto bg-gray-50 p-6">
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {product.stocks?.map((stock: any, index: number) => {
                                            const price = useWholesale ? stock.wholesale_price : stock.price;
                                            const isSelected = selectedVariantIndex === index;
                                            const isAvailable = stock.available === 'yes' && stock.quantity > 0;

                                            // Find warranty for this variant
                                            const variantWarranty = product.warranties?.find((w: any) => w.product_stock_id === stock.id);

                                            return (
                                                <button
                                                    key={stock.id}
                                                    onClick={() => isAvailable && setSelectedVariantIndex(index)}
                                                    disabled={!isAvailable}
                                                    className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                                                        isSelected
                                                            ? 'scale-[1.02] border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                                                            : isAvailable
                                                            ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                                                            : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60'
                                                    }`}
                                                >
                                                    {/* Variant Image */}
                                                    {stock.images && stock.images.length > 0 && (
                                                        <div className="mb-3 overflow-hidden rounded-lg bg-gray-100">
                                                            <div className="relative h-40 w-full">
                                                                <Image
                                                                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${stock.images[0].url}`}
                                                                    alt={stock.variant_name}
                                                                    fill
                                                                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Variant Name */}
                                                    <h4 className="mb-2 line-clamp-2 font-semibold text-gray-900">{stock.variant_name}</h4>

                                                    {/* Variant Attributes */}
                                                    {stock.variant_data && (
                                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                                            {Object.entries(stock.variant_data).map(([key, value]: [string, any]) => (
                                                                <span key={key} className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Price */}
                                                    <div className="mb-3">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-xl font-bold text-green-600">{formatCurrency(price)}</span>
                                                            {useWholesale && <span className="text-sm text-gray-500 line-through">{formatCurrency(stock.price)}</span>}
                                                        </div>
                                                    </div>

                                                    {/* Stock Quantity */}
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-gray-500" />
                                                        <span className={`text-sm font-medium ${stock.quantity <= stock.low_stock_quantity ? 'text-orange-600' : 'text-gray-700'}`}>
                                                            Stock: {stock.quantity} {stock.unit}
                                                        </span>
                                                        {stock.quantity <= stock.low_stock_quantity && (
                                                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Low</span>
                                                        )}
                                                    </div>

                                                    {/* Warranty Badge */}
                                                    {variantWarranty && (
                                                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                                />
                                                            </svg>
                                                            {variantWarranty.duration_months ? `${variantWarranty.duration_months}mo` : `${variantWarranty.duration_days}d`} Warranty
                                                        </div>
                                                    )}

                                                    {/* Selected Indicator */}
                                                    {isSelected && (
                                                        <div className="absolute right-3 top-3 rounded-full bg-blue-600 p-1.5 shadow-lg">
                                                            <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between gap-4 bg-gray-50 p-6">
                                    <button
                                        onClick={onClose}
                                        className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={selectedVariantIndex === null || isAdding}
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 disabled:opacity-50"
                                    >
                                        {isAdding ? (
                                            <>
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="h-5 w-5" />
                                                Add
                                            </>
                                        )}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
