'use client';

import { Dialog, Transition } from '@headlessui/react';
import { AlertCircle, Archive, Package, Tag, X } from 'lucide-react';
import Image from 'next/image';
import { Fragment, useState } from 'react';
// Swiper v8 imports
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';

interface ImageShowModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
}

export default function ImageShowModal({ isOpen, onClose, product }: ImageShowModalProps) {
    // State for selected variant (must be before early return)
    const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);

    if (!product) return null;

    const totalStock = product.stocks?.reduce((sum: number, stock: any) => sum + (stock.quantity || 0), 0) || 0;
    const hasVariants = product.stocks && product.stocks.length > 0 && product.stocks.some((s: any) => s.is_variant);

    // Get primary stock for display
    const primaryStock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;
    const displayLowStock = primaryStock?.low_stock_quantity || product.low_stock_quantity || 10;
    const isLowStock = totalStock <= displayLowStock;

    // Calculate available status - check if any stock is available
    const isAvailable = product.stocks && product.stocks.length > 0 ? product.stocks.some((stock: any) => stock.available === 'yes') : product.available === true || product.available === 'yes';

    // Get images based on selected variant or all images
    const displayImages =
        selectedVariantIndex !== null && product.stocks && product.stocks[selectedVariantIndex]
            ? product.stocks[selectedVariantIndex].images || []
            : [...(product.images || []), ...(product.stocks?.flatMap((stock: any) => stock.images || []) || [])];

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
                            <Dialog.Panel className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl">
                                {/* Header with Close Button and Status */}
                                <div className="flex items-start justify-between gap-4 p-6 pb-0">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {isAvailable ? 'Available' : 'Unavailable'}
                                    </span>
                                    <button onClick={onClose} className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200">
                                        <X className="h-5 w-5 text-gray-600" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6 p-6 pt-4 lg:grid-cols-2">
                                    {/* Left Column - Images */}
                                    <div className="space-y-4">
                                        {/* Variant Selector - Show if product has variants */}
                                        {hasVariants && product.stocks && product.stocks.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Select Variant:</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => setSelectedVariantIndex(null)}
                                                        className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                                                            selectedVariantIndex === null
                                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                                : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                                                        }`}
                                                    >
                                                        All Images
                                                    </button>
                                                    {product.stocks.map((stock: any, index: number) => (
                                                        <button
                                                            key={stock.id}
                                                            onClick={() => setSelectedVariantIndex(index)}
                                                            className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                                                                selectedVariantIndex === index
                                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                                                            }`}
                                                        >
                                                            {stock.variant_name || `Variant ${index + 1}`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {displayImages && displayImages.length > 0 ? (
                                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                                <Swiper navigation pagination={{ clickable: true }} slidesPerView={1} loop className="h-96 w-full bg-gray-50">
                                                    {displayImages.map((img: any, index: number) => {
                                                        const imagePath = img?.url || img?.path || img?.image_path || '';
                                                        if (!imagePath) return null;

                                                        return (
                                                            <SwiperSlide key={index} className="flex h-full items-center justify-center">
                                                                <div className="relative h-full w-full">
                                                                    <Image
                                                                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${imagePath}`}
                                                                        alt={product.product_name}
                                                                        fill
                                                                        className="object-contain p-4"
                                                                    />
                                                                </div>
                                                            </SwiperSlide>
                                                        );
                                                    })}
                                                </Swiper>
                                            </div>
                                        ) : (
                                            <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                                                <div className="text-center">
                                                    <Package className="mx-auto mb-2 h-16 w-16 text-gray-400" />
                                                    <p className="text-gray-500">No images available</p>
                                                </div>
                                            </div>
                                        )}

                                        {isLowStock && (
                                            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                                                <span className="text-sm font-medium text-amber-800">Low stock alert</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column - Details */}
                                    <div className="space-y-6">
                                        {/* Header */}
                                        <div>
                                            <h2 className="mb-2 text-2xl font-bold text-gray-900">{product.product_name}</h2>
                                            <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
                                        </div>

                                        {/* Pricing Section */}
                                        <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                                            {hasVariants ? (
                                                <div className="space-y-3">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-purple-600">{product.stocks.length} Variants Available</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="mb-1 text-xs text-gray-600">Price Range</p>
                                                            <p className="text-lg font-bold text-gray-900">
                                                                ৳{Math.min(...product.stocks.map((s: any) => Number(s.price))).toFixed(0)} - ৳
                                                                {Math.max(...product.stocks.map((s: any) => Number(s.price))).toFixed(0)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-xs text-gray-600">Total Stock</p>
                                                            <p className="text-lg font-semibold text-gray-700">{totalStock} units</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="mb-1 text-xs text-gray-600">Retail Price</p>
                                                        <p className="text-xl font-bold text-gray-900">৳{parseFloat(primaryStock?.price || 0).toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="mb-1 text-xs text-gray-600">Wholesale</p>
                                                        <p className="text-lg font-semibold text-gray-700">৳{parseFloat(primaryStock?.wholesale_price || 0).toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="mb-1 text-xs text-gray-600">Purchase</p>
                                                        <p className="text-lg font-semibold text-gray-700">৳{parseFloat(primaryStock?.purchase_price || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {primaryStock?.tax_rate && Number(primaryStock.tax_rate) > 0 && (
                                                <div className="mt-3 border-t border-blue-200 pt-3">
                                                    <p className="text-xs text-gray-600">
                                                        Tax: {primaryStock.tax_rate}% {primaryStock.tax_included ? '(included)' : '(excluded)'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Information */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Product Information</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">SKU</p>
                                                    {hasVariants ? (
                                                        <p className="font-mono text-sm font-medium text-purple-700">{product.stocks.filter((s: any) => s.sku).length} SKUs</p>
                                                    ) : (
                                                        <p className="font-mono text-sm font-medium text-gray-900">{primaryStock?.sku || (product.stocks && product.stocks[0]?.sku) || 'N/A'}</p>
                                                    )}
                                                </div>
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">Unit</p>
                                                    <p className="text-sm font-medium capitalize text-gray-900">{primaryStock?.unit || product.unit || 'N/A'}</p>
                                                </div>
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">Total Stock</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {totalStock} {primaryStock?.unit || product.unit || 'unit'}(s)
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">Low Stock Alert</p>
                                                    <p className="text-sm font-medium text-gray-900">{displayLowStock}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attributes */}
                                        {product.attributes && product.attributes.length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Attributes</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {product.attributes.map((attr: any, index: number) => (
                                                        <div key={index} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                                                            <Tag className="h-3.5 w-3.5 text-gray-500" />
                                                            <span className="text-xs font-medium capitalize text-gray-600">{attr.attribute_name}:</span>
                                                            <span className="text-xs font-semibold capitalize text-gray-900">{attr.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Stock Details Table - Show Variants */}
                                        {product.stocks && product.stocks.length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{hasVariants ? 'Variant Details' : 'Stock Details'}</h3>
                                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {hasVariants && <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Variant</th>}
                                                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">SKU</th>
                                                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Price</th>
                                                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Quantity</th>
                                                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Unit</th>
                                                                {hasVariants && <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Images</th>}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {product.stocks.map((stock: any) => (
                                                                <tr key={stock.id} className="hover:bg-gray-50">
                                                                    {hasVariants && (
                                                                        <td className="px-4 py-3 text-sm">
                                                                            <div className="font-medium text-gray-900">{stock.variant_name || 'Default'}</div>
                                                                            {stock.variant_data && (
                                                                                <div className="mt-1 flex flex-wrap gap-1">
                                                                                    {Object.entries(stock.variant_data).map(([key, value]: [string, any]) => (
                                                                                        <span key={key} className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                                                                                            {key}: {value}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    )}
                                                                    <td className="px-4 py-3 text-sm">
                                                                        <span className="font-mono text-xs text-gray-700">{stock.sku || 'N/A'}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">৳{Number(stock.price).toFixed(2)}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700">{stock.quantity}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700">{stock.unit}</td>
                                                                    {hasVariants && (
                                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                                            {stock.images && stock.images.length > 0 ? (
                                                                                <span className="text-xs text-blue-600">{stock.images.length} image(s)</span>
                                                                            ) : (
                                                                                <span className="text-xs text-gray-400">No images</span>
                                                                            )}
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Info */}
                                        <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4">
                                            <div className="flex items-center gap-2">
                                                <Archive className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs text-gray-600">Serial Tracking: {product.has_serial ? 'Enabled' : 'Disabled'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs text-gray-600">Warranty: {product.has_warranty ? 'Available' : 'Not Available'}</span>
                                            </div>
                                            {product.has_serial && product.available_serial_count !== undefined && (
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-indigo-500" />
                                                    <span className="text-xs font-medium text-indigo-600">{product.available_serial_count} serial(s) available</span>
                                                </div>
                                            )}
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
