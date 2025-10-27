'use client';

import { Dialog, Transition } from '@headlessui/react';
import { X, Package, Tag, Archive, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Fragment } from 'react';
import { Navigation, Pagination } from 'swiper';
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
    if (!product) return null;

    const totalStock = product.stocks?.reduce((sum: number, stock: any) => sum + (stock.quantity || 0), 0) || 0;
    const isLowStock = totalStock <= product.low_stock_quantity;

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
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.available ? 'Available' : 'Unavailable'}
                                    </span>
                                    <button onClick={onClose} className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200">
                                        <X className="h-5 w-5 text-gray-600" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6 p-6 pt-4 lg:grid-cols-2">
                                    {/* Left Column - Images */}
                                    <div className="space-y-4">
                                        {product.images && product.images.length > 0 ? (
                                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                                <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} slidesPerView={1} loop className="h-96 w-full bg-gray-50">
                                                    {product.images.map((img: any, index: number) => {
                                                        const imagePath = typeof img === 'string' ? img : img?.image_path || img?.url || '';
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
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-600">Retail Price</p>
                                                    <p className="text-xl font-bold text-gray-900">৳{parseFloat(product.price).toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-600">Wholesale</p>
                                                    <p className="text-lg font-semibold text-gray-700">৳{parseFloat(product.wholesale_price).toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-600">Purchase</p>
                                                    <p className="text-lg font-semibold text-gray-700">৳{parseFloat(product.purchase_price).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            {product.tax?.rate > 0 && (
                                                <div className="mt-3 border-t border-blue-200 pt-3">
                                                    <p className="text-xs text-gray-600">
                                                        Tax: {product.tax.rate}% {product.tax.included ? '(included)' : '(excluded)'}
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
                                                    <p className="font-mono text-sm font-medium text-gray-900">{product.sku}</p>
                                                </div>
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">Unit</p>
                                                    <p className="text-sm font-medium capitalize text-gray-900">{product.unit}</p>
                                                </div>
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">Total Stock</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {totalStock} {product.unit}(s)
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">Low Stock Alert</p>
                                                    <p className="text-sm font-medium text-gray-900">{product.low_stock_quantity}</p>
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

                                        {/* Stock Details Table */}
                                        {product.stocks && product.stocks.length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Stock Details</h3>
                                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Type</th>
                                                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Quantity</th>
                                                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Unit</th>
                                                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Expiry</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {product.stocks.map((stock: any) => (
                                                                <tr key={stock.id} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-3 text-sm font-medium capitalize text-gray-900">{stock.type}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700">{stock.quantity}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700">{stock.unit}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700">{stock.expiry_date || 'N/A'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Info */}
                                        <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
                                            <div className="flex items-center gap-2">
                                                <Archive className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs text-gray-600">Serial Tracking: {product.has_serial_tracking ? 'Enabled' : 'Disabled'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs text-gray-600">Warranty: {product.has_warranty ? 'Available' : 'Not Available'}</span>
                                            </div>
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
