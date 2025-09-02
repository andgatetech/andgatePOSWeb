'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Image from 'next/image';
import { Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { X } from 'lucide-react';

interface ImageShowModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
}

export default function ImageShowModal({ isOpen, onClose, product }: ImageShowModalProps) {
    if (!product) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Overlay */}
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                {/* Modal Body */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="relative w-full max-w-3xl rounded bg-white p-4">
                        <button onClick={onClose} className="absolute right-2 top-2 z-50 rounded-full bg-gray-200 p-2 hover:bg-gray-300">
                            <X className="h-5 w-5" />
                        </button>

                        {product.images && product.images.length > 0 && (
                            <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} slidesPerView={1} loop className="h-96 w-full">
                                {product.images.map((img: any, index: number) => (
                                    <SwiperSlide key={index} className="flex items-center justify-center">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${img.image_path}`}
                                            alt={product.product_name}
                                            width={800}
                                            height={600}
                                            className="object-contain"
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-gray-900">{product.product_name}</h3>
                            <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-base font-bold text-primary">৳{parseFloat(product.price).toFixed(2)}</span>
                                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Stock: {product.quantity}</span>
                            </div>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </Transition>
    );
}
