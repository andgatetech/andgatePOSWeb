// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination, Autoplay } from "swiper";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import { Star } from "lucide-react";

// const testimonials = [
//   {
//     name: "Md. Rakib Hossain",
//     business: "Dhaka Mart",
//     image: "https://img.icons8.com/color/96/shop.png", // Shop style logo
//     review:
//       "AndGatePOS made our shop management so simple. Stock, sales, and accounts all in one place. Our efficiency improved a lot.",
//     rating: 5,
//   },
//   {
//     name: "Shamima Akter",
//     business: "Chattogram Fashion House",
//     image: "https://img.icons8.com/color/96/clothes.png", // Fashion shop
//     review:
//       "Before AndGatePOS, I was struggling with manual calculation. Now everything is digital and customers are happier.",
//     rating: 5,
//   },
//   {
//     name: "Jahidul Islam",
//     business: "Sylhet Electronics",
//     image: "https://img.icons8.com/color/96/electronics.png", // Electronics
//     review:
//       "The reporting dashboard is very helpful. I can track profit and expenses daily without hiring an accountant.",
//     rating: 5,
//   },
//   {
//     name: "Farhana Rahman",
//     business: "Rajshahi Grocery",
//     image: "https://img.icons8.com/color/96/grocery-store.png", // Grocery
//     review:
//       "AndGatePOS is easy to use for everyone in my shop. Our sales increased after using the system because checkout is much faster.",
//     rating: 5,
//   },
// ];

// export default function Testimonials() {
//   return (
//     <section className="bg-gray-50 py-16 px-4 md:px-8">
//       <div className="max-w-6xl mx-auto text-center mb-12">
//         <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
//           Loved by Business Owners in Bangladesh
//         </h2>
//         <p className="text-gray-600 mt-4">
//           See how entrepreneurs across Bangladesh are growing with AndGatePOS.
//         </p>
//       </div>

//       <Swiper
//         modules={[Navigation, Pagination, Autoplay]}
//         spaceBetween={30}
//         slidesPerView={1}
//         navigation
//         pagination={{ clickable: true }}
//         autoplay={{ delay: 4000 }}
//         breakpoints={{
//           768: { slidesPerView: 2 },
//           1024: { slidesPerView: 3 },
//         }}
//       >
//         {testimonials.map((t, index) => (
//           <SwiperSlide key={index}>
//             <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center h-full">
//               <img
//                 src={t.image}
//                 alt={t.business}
//                 className="w-20 h-20 object-contain bg-gray-100 rounded-xl mb-4 p-3"
//               />
//               <h3 className="text-lg font-semibold text-gray-900">{t.name}</h3>
//               <p className="text-sm text-blue-600 mb-3">{t.business}</p>
//               <div className="flex justify-center mb-3">
//                 {Array.from({ length: t.rating }).map((_, i) => (
//                   <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
//                 ))}
//               </div>
//               <p className="text-gray-600 text-sm leading-relaxed">{t.review}</p>
//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </section>
//   );
// }
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
