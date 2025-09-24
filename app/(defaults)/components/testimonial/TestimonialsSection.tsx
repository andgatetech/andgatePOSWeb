'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
  {
    name: 'Md. Rahman',
    business: 'Dhaka Mart Super Shop',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    review:
      'AndgatePOS made our checkout process smooth and error-free. Sales reporting is simple, and we saved hours in manual calculations every week.',
    rating: 5,
  },
  {
    name: 'Nasrin Akter',
    business: 'Chattogram Fashion House',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    review:
      'Inventory tracking was always a headache. Now I can manage products and suppliers easily. Our stock losses dropped significantly.',
    rating: 5,
  },
  {
    name: 'Sajidul Islam',
    business: 'Sylhet Electronics & Home Appliances',
    image: 'https://randomuser.me/api/portraits/men/47.jpg',
    review:
      'The POS dashboard helps me see daily sales at a glance. Even when I travel, I can check everything online — no tension anymore.',
    rating: 5,
  },
  {
    name: 'Farzana Hossain',
    business: 'Rajshahi Bakery & Café',
    image: 'https://randomuser.me/api/portraits/women/12.jpg',
    review:
      'AndgatePOS transformed our business. Customers love the faster checkout, and managing expenses became super easy for us.',
    rating: 5,
  },
  {
    name: 'Tanvir Alam',
    business: 'Khulna Mobile Center',
    image: 'https://randomuser.me/api/portraits/men/85.jpg',
    review:
      'I run multiple outlets, and multi-store management is a game changer. I can now track sales and stock for all shops in one place.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
            Loved by Business Owners
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of successful businesses already using AndgatePOS
          </p>
        </div>

        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={24}
          breakpoints={{
            0: { slidesPerView: 1 }, // Mobile: 1 card
            768: { slidesPerView: 2 }, // Tablet: 2 cards
            1024: { slidesPerView: 3 }, // Desktop: 3 cards
          }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 p-8 shadow-sm transition-all hover:shadow-xl">
                {/* Stars */}
                <div className="mb-6 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-current text-yellow-400"
                    />
                  ))}
                </div>
                {/* Review */}
                <blockquote className="mb-6 text-lg italic leading-relaxed text-gray-700">
                  &ldquo;{testimonial.review}&rdquo;
                </blockquote>
                {/* Author */}
                <div className="flex items-center">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="mr-4 h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.business}
                    </div>
                  </div>
                </div>
                <div className="absolute right-6 top-6 text-6xl text-blue-200 opacity-50">
                  ❝
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
