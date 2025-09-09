'use client';

import IconFacebookCircle from '@/components/icon/icon-facebook-circle';
import IconGoogle from '@/components/icon/icon-google';
import IconInstagram from '@/components/icon/icon-instagram';
import IconTwitter from '@/components/icon/icon-twitter';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const ComponentsPagesComingSoonForm = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const router = useRouter();

    useEffect(() => {
        const targetDate = new Date();
        targetDate.setFullYear(targetDate.getFullYear() + 1);

        const countdown = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance <= 0) {
                clearInterval(countdown);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, []);

    const renderBox = (value: number | string, label: string, size = 'md') => (
        <div className="flex flex-col items-center">
            <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light p-2 sm:h-16 sm:w-16 md:h-24 md:w-24">
                <div className="absolute inset-1 flex flex-col gap-1">
                    <span className="h-full w-full rounded-md bg-primary/10"></span>
                    <span className="h-full w-full rounded-md bg-white dark:bg-gray-900"></span>
                </div>
                <span className="relative text-lg font-bold sm:text-xl md:text-3xl">{value}</span>
            </div>
            <span className="mt-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{label}</span>
        </div>
    );

    return (
        <div className="flex flex-col items-center text-center">
            {/* Title */}
            <h1 className="mb-6 text-3xl font-extrabold text-primary sm:text-4xl md:text-5xl">🚀 Coming Soon</h1>
            <p className="mb-12 max-w-lg text-gray-600 dark:text-gray-300">We are working hard to bring you something amazing. Stay tuned!</p>

            {/* Countdown */}
            <div className="mb-16 flex items-center justify-center gap-4 text-xl font-bold leading-none text-primary sm:text-2xl md:gap-6">
                {renderBox(timeLeft.days, 'Days')}
                <span className="text-2xl font-bold">:</span>
                {renderBox(timeLeft.hours, 'Hours')}
                <span className="text-2xl font-bold">:</span>
                {renderBox(timeLeft.minutes, 'Minutes')}
                <span className="text-2xl font-bold">:</span>
                {renderBox(timeLeft.seconds, 'Seconds')}
            </div>

            {/* Subscribe Form */}
            <div className="mb-20 w-full max-w-md md:mb-32">
                <h2 className="text-lg font-bold uppercase dark:text-white sm:text-xl">Subscribe to get notified!</h2>
                <div className="relative mb-10 mt-8">
                    <input
                        type="email"
                        placeholder="mail@gmail.com"
                        className="form-input mb-5 w-full rounded-lg border px-4 py-3.5 placeholder:text-gray-400 dark:bg-gray-800 dark:text-white sm:mb-0 sm:pe-32"
                    />
                    <button
                        type="button"
                        className="btn btn-gradient absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 rounded-lg border-0 px-5 py-2 text-base shadow-md"
                        onClick={() => router.push('/')}
                    >
                        Subscribe
                    </button>
                </div>

                {/* Social Links */}
                <ul className="flex justify-center gap-4 text-white">
                    <li>
                        <Link
                            href="#"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110"
                            style={{ background: 'linear-gradient(135deg, #EF1262 0%, #4361EE 100%)' }}
                        >
                            <IconInstagram />
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110"
                            style={{ background: 'linear-gradient(135deg, #1877F2 0%, #4361EE 100%)' }}
                        >
                            <IconFacebookCircle />
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110"
                            style={{ background: 'linear-gradient(135deg, #1DA1F2 0%, #4361EE 100%)' }}
                        >
                            <IconTwitter fill={true} />
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110"
                            style={{ background: 'linear-gradient(135deg, #DB4437 0%, #FF6B6B 100%)' }}
                        >
                            <IconGoogle />
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ComponentsPagesComingSoonForm;
