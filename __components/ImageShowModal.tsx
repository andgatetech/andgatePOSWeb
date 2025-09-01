'use client';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { Navigation, Pagination, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';

export default function ImageShowModal({ isOpen, onClose, product }) {
    console.log(product);
    const themeConfig = useSelector((state: any) => state.themeConfig);

    if (!product) return null;

    const handleButtonClick = (e) => {
        e.stopPropagation();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose}>
                {/* Overlay */}
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 z-[999] " />
                </Transition.Child>

                {/* Modal Body */}
                <div className="fixed inset-0 z-[1000] flex items-center justify-center">
                    <Dialog.Panel className="relative w-full max-w-lg overflow-hidden rounded-lg border-0 bg-white text-black dark:bg-[#121c2c] dark:text-white-dark">
                        <div className="relative">
                            <Swiper
                                className="mx-auto mb-5 max-w-3xl"
                                id="slider4"
                                modules={[Navigation, Pagination, Autoplay]}
                                slidesPerView={1}
                                spaceBetween={30}
                                loop={true}
                                touchRatio={1}
                                grabCursor={true}
                                pagination={{
                                    clickable: true,
                                    type: 'fraction',
                                }}
                                navigation={{
                                    nextEl: '.swiper-button-next-ex4',
                                    prevEl: '.swiper-button-prev-ex4',
                                }}
                                autoplay={{
                                    delay: 2000,
                                    disableOnInteraction: false,
                                }}
                                dir={themeConfig.rtlClass}
                                key={themeConfig.rtlClass === 'rtl' ? 'true' : 'false'}
                            >
                                {product.images.map((img, i) => (
                                    <SwiperSlide key={i}>
                                        <Image src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${img.image_path}`} alt={`Product image ${i + 1}`} width={800} height={600} objectFit="contain" />
                                    </SwiperSlide>
                                ))}
                                <button
                                    type="button"
                                    className="swiper-button-prev-ex4 absolute top-1/2 z-[999] grid -translate-y-1/2 place-content-center rounded-full border border-primary p-1 text-primary transition hover:border-primary hover:bg-primary hover:text-white ltr:left-2 rtl:right-2"
                                    onClick={handleButtonClick}
                                >
                                    <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                                </button>
                                <button
                                    type="button"
                                    className="swiper-button-next-ex4 absolute top-1/2 z-[999] grid -translate-y-1/2 place-content-center rounded-full border border-primary p-1 text-primary transition hover:border-primary hover:bg-primary hover:text-white ltr:right-2 rtl:left-2"
                                    onClick={handleButtonClick}
                                >
                                    <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
                                </button>
                            </Swiper>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </Transition>
    );
}
