'use client';

import { trackEvent } from '@/lib/analytics';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import PromoButton from './promo-button';

const DEMO_VIDEO_ID = 'gELTWs7hFtc';

type YTPlayer = {
    getCurrentTime: () => number;
    getDuration: () => number;
};

declare global {
    interface Window {
        YT?: {
            Player: new (
                element: HTMLElement,
                options: { events: { onStateChange: (event: { data: number }) => void } },
            ) => YTPlayer;
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}

export default function DemoHero() {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        trackEvent('demo_page_view', 'ViewContent', {
            content_name: 'Demo Page',
            content_category: 'Demo Request Follow-up',
            section: 'demo_hero',
        });
    }, []);

    // YouTube IFrame API — same milestone tracking as the ad-landing hero, tagged separately for attribution.
    useEffect(() => {
        const firedMilestones = new Set<string>();
        const fireOnce = (key: string, gtmName: string, pixelEvent: string) => {
            if (firedMilestones.has(key)) return;
            firedMilestones.add(key);
            trackEvent(gtmName, pixelEvent, { section: 'demo_hero', video_id: DEMO_VIDEO_ID });
        };

        let player: YTPlayer | undefined;
        let progressInterval: ReturnType<typeof setInterval> | undefined;

        const stopProgressPolling = () => {
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = undefined;
            }
        };

        const startProgressPolling = () => {
            if (progressInterval) return;
            progressInterval = setInterval(() => {
                if (!player) return;
                const duration = player.getDuration();
                if (!duration) return;
                const percent = (player.getCurrentTime() / duration) * 100;
                if (percent >= 25) fireOnce('progress_25', 'demo_video_progress_25', 'VideoProgress25');
                if (percent >= 50) fireOnce('progress_50', 'demo_video_progress_50', 'VideoProgress50');
                if (percent >= 75) fireOnce('progress_75', 'demo_video_progress_75', 'VideoProgress75');
                if (percent >= 95) fireOnce('video_watched_complete', 'demo_video_watched_complete', 'VideoWatched');
            }, 1000);
        };

        const onPlayerStateChange = (event: { data: number }) => {
            if (event.data === 1) {
                fireOnce('start', 'demo_video_start', 'VideoStart');
                startProgressPolling();
            } else if (event.data === 2 || event.data === 0) {
                stopProgressPolling();
            }
        };

        const initPlayer = () => {
            if (!iframeRef.current || !window.YT?.Player) return;
            player = new window.YT.Player(iframeRef.current, {
                events: { onStateChange: onPlayerStateChange },
            });
        };

        if (window.YT?.Player) {
            initPlayer();
        } else {
            if (!document.getElementById('youtube-iframe-api')) {
                const script = document.createElement('script');
                script.id = 'youtube-iframe-api';
                script.src = 'https://www.youtube.com/iframe_api';
                document.body.appendChild(script);
            }
            const previousCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                previousCallback?.();
                initPlayer();
            };
        }

        return () => {
            stopProgressPolling();
        };
    }, []);

    return (
        <section className="bg-gradient-to-b from-blue-50/60 to-white pb-14 pt-24 sm:pb-16 sm:pt-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                    <span className="text-sm font-bold text-orange-600">এখনই শুরু করলে সেটআপ ফি লাগবে না</span>
                </div>

                <h1 className="mb-3 text-3xl font-extrabold leading-[1.15] tracking-tight text-gray-900 sm:text-4xl lg:text-[2.6rem]">
                    আপনি যে ডেমো দেখতে চেয়েছিলেন, <span className="text-primary">এই যে সেটা।</span>
                </h1>
                <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
                    ৩ মিনিটে পুরো AndgatePOS দেখে নিন — বিলিং, স্টক, রিপোর্ট সব লাইভ। দেখা শেষে ফর্ম পূরণ করলেই নিজের অ্যাকাউন্টে ঢুকে হাতে-কলমে চালিয়ে দেখতে পারবেন।
                </p>

                <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-black shadow-2xl">
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                            ref={iframeRef}
                            className="absolute inset-0 h-full w-full"
                            src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?rel=0&modestbranding=1&enablejsapi=1&controls=1&playsinline=1`}
                            title="AndgatePOS Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-3">
                    <PromoButton
                        href="#register-section"
                        className="px-10 py-4 text-base"
                        onClick={() => trackEvent('demo_hero_cta_click', 'Lead', { section: 'demo_hero' })}
                    >
                        <span className="flex items-center gap-2">
                            দেখা শেষ? এখনই ফ্রি শুরু করুন
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </PromoButton>
                    <p className="text-xs text-gray-400">ফ্রিতে শুরু করা যায় · কোনো কার্ড লাগবে না · ১ মিনিটেই অ্যাকাউন্ট তৈরি</p>
                </div>
            </div>
        </section>
    );
}
