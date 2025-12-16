
import { getTranslation } from '@/i18n';
import { Star } from 'lucide-react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';

export default function Testimonials() {
    const { t, data } = getTranslation();

    // Get testimonials from translation data
    const testimonials = data.testimonials?.testimonials || [];
    const header = data.testimonials?.header || {};

    return (
        <section className="bg-gray-50 px-4 py-16 md:px-8">
            <div className="mx-auto mb-12 max-w-6xl text-center">
                <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{header.title || t('testimonials.header.title')}</h2>
                <p className="mt-4 text-gray-600">{header.subtitle || t('testimonials.header.subtitle')}</p>
            </div>

            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000 }}
                breakpoints={{
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
            >
                {testimonials.map((testimonial: any, index: number) => (
                    <SwiperSlide key={index}>
                        <div className="flex h-full flex-col items-center rounded-2xl bg-white p-6 text-center shadow-lg">
                            <img src={testimonial.image} alt={testimonial.business} className="mb-4 h-20 w-20 rounded-xl bg-gray-100 object-contain p-3" />
                            <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                            <p className="mb-3 text-sm text-blue-600">{testimonial.business}</p>
                            <div className="mb-3 flex justify-center">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm leading-relaxed text-gray-600">{testimonial.review}</p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
