'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { getPrimaryProductImageUrl, resolveProductImageUrl } from '@/lib/image-url';
import { Dialog, Transition } from '@headlessui/react';
import { Check, Package, ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import { showMessage } from '@/lib/toast';
import { Fragment, useState } from 'react';

interface VariantSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onSelectVariant: (variant: any, quantity: number, useWholesale: boolean) => void;
    mode?: 'pos' | 'stock' | 'label' | 'orderEdit' | 'orderReturn' | 'purchase';
}

export default function VariantSelectionModal({ isOpen, onClose, product, onSelectVariant, mode = 'pos' }: VariantSelectionModalProps) {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
    const [useWholesale, setUseWholesale] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    if (!product) return null;

    const handleAddToCart = async () => {
        if (selectedVariantIndex === null) {
            showMessage(t('msg_select_variant'), 'error');
            return;
        }

        const selectedVariant = product.stocks[selectedVariantIndex];

        // Only validate stock quantity in POS mode
        if (mode === 'pos' && quantity > selectedVariant.quantity) {
            showMessage(`${t('msg_only')} ${formatNumber(selectedVariant.quantity)} ${t('msg_items_available')}`, 'error');
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
        } catch {
            showMessage(t('msg_failed_add_to_cart'), 'error');
        } finally {
            setIsAdding(false);
        }
    };

    const selectedVariant = selectedVariantIndex !== null ? product.stocks[selectedVariantIndex] : null;
    const selectedPrice = selectedVariant ? (useWholesale ? selectedVariant.wholesale_price : selectedVariant.price) : 0;
    const totalPrice = selectedPrice * quantity;
    const productImageSrc = getPrimaryProductImageUrl(product);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all sm:rounded-2xl">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-white p-4 sm:p-6">
                                    <div className="flex-1">
                                        <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-primary/70">{t('lbl_select_variant')}</p>
                                        <Dialog.Title className="text-xl font-bold text-gray-900">{product.product_name}</Dialog.Title>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="ml-4 rounded-full bg-white/80 p-2 text-gray-400 shadow-sm transition-all hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Variants List */}
                                <div className="max-h-[45vh] overflow-y-auto bg-gray-50 p-3 sm:p-6">
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {product.stocks?.map((stock: any, index: number) => {
                                            const price = useWholesale ? stock.wholesale_price : stock.price;
                                            const isSelected = selectedVariantIndex === index;
                                            // In POS mode, check both available and quantity. In other modes, allow all variants.
                                            const isAvailable = mode === 'pos' ? stock.available === 'yes' && stock.quantity > 0 : true;
                                            const imageSrc = resolveProductImageUrl(stock.images?.[0]) || productImageSrc;

                                            // Find warranty for this variant
                                            const variantWarranty = product.warranties?.find((w: any) => w.product_stock_id === stock.id);

                                            return (
                                                <button
                                                    key={stock.id}
                                                    onClick={() => setSelectedVariantIndex(index)}
                                                    disabled={mode === 'pos' ? !isAvailable : false}
                                                    className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                                                        isSelected
                                                            ? 'scale-[1.02] border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                                                            : mode !== 'pos' || isAvailable
                                                            ? 'border-gray-200 bg-white hover:border-primary/40 hover:shadow-md'
                                                            : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60'
                                                    }`}
                                                >
                                                    {/* Variant Image */}
                                                    <div className="mb-3 overflow-hidden rounded-lg bg-gray-100">
                                                        <div className="relative h-32 w-full sm:h-40">
                                                            {imageSrc ? (
                                                                <Image
                                                                    src={imageSrc}
                                                                    alt={stock.variant_name}
                                                                    fill
                                                                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                                                                    sizes="(max-width: 640px) 50vw, 240px"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center">
                                                                    <Package className="h-10 w-10 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Variant Name */}
                                                    <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">{stock.variant_name}</h4>

                                                    {/* Variant Attributes */}
                                                    {stock.variant_data && (
                                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                                            {Object.entries(stock.variant_data).map(([key, value]: [string, any]) => (
                                                                <span key={key} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Price */}
                                                    <div className="mb-3">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-base font-bold text-success">{formatCurrency(price)}</span>
                                                            {useWholesale && <span className="text-xs text-gray-400 line-through">{formatCurrency(stock.price)}</span>}
                                                        </div>
                                                    </div>

                                                    {/* Stock Quantity */}
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-gray-500" />
                                                        <span className={`text-sm font-medium ${stock.quantity <= stock.low_stock_quantity ? 'text-orange-600' : 'text-gray-700'}`}>
                                                            {t('lbl_stock')}: {formatNumber(stock.quantity)} {stock.unit}
                                                        </span>
                                                        {stock.quantity <= stock.low_stock_quantity && (
                                                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">{t('status_low_stock')}</span>
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
                                                            {variantWarranty.duration_months ? `${formatNumber(variantWarranty.duration_months)}mo` : `${formatNumber(variantWarranty.duration_days)}d`}{' '}
                                                            {t('lbl_warranty')}
                                                        </div>
                                                    )}

                                                    {/* Selected Indicator */}
                                                    {isSelected && (
                                                        <div className="absolute right-3 top-3 rounded-full bg-primary p-1.5 shadow-lg">
                                                            <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-primary/10 bg-gradient-to-r from-primary/5 to-white p-4 sm:p-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        {/* Quantity stepper */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-600">{t('lbl_qty')}:</span>
                                            <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                                <button
                                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                                    disabled={quantity <= 1}
                                                    className="px-3 py-2 text-gray-500 transition hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                                                >
                                                    −
                                                </button>
                                                <span className="min-w-[2rem] px-2 text-center text-sm font-bold text-gray-900">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity((q) => q + 1)}
                                                    disabled={mode === 'pos' && selectedVariantIndex !== null && quantity >= product.stocks[selectedVariantIndex]?.quantity}
                                                    className="px-3 py-2 text-gray-500 transition hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:justify-end">
                                            <button
                                                onClick={onClose}
                                                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 focus:outline-none"
                                            >
                                                {t('btn_cancel')}
                                            </button>
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={selectedVariantIndex === null || isAdding}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-7"
                                            >
                                                {isAdding ? (
                                                    <>
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        {t('msg_adding')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="h-4 w-4" />
                                                        {selectedVariantIndex !== null && totalPrice > 0 ? formatCurrency(totalPrice) : t('btn_add')}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
