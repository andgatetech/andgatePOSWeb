'use client';

import { trackEvent } from '@/lib/analytics';
import { getExperimentVariant } from '@/lib/visitor';
import { ArrowRight, Maximize2, Minimize2, Pause, Play, ShieldCheck, Star, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import PromoButton from './promo-button';

const HERO_VIDEO_ID = 'gELTWs7hFtc';

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

export default function PromoHero() {
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [heroVariant, setHeroVariant] = useState('control');

    useEffect(() => {
        setHeroVariant(getExperimentVariant('promotion_pos_hero_v1'));
    }, []);

    const isOutcomeHero = heroVariant === 'outcome_hero';

    const loadVideo = useCallback(() => {
        if (videoLoaded) return;
        setVideoLoaded(true);
        setIsPlaying(true);
        trackEvent('hero_video_preview_click', 'VideoStart', {
            section: 'hero',
            video_id: HERO_VIDEO_ID,
            experiment_key: 'promotion_pos_hero_v1',
            experiment_variant: heroVariant,
        });
    }, [heroVariant, videoLoaded]);

    const handlePlayPause = useCallback(() => {
        if (!videoLoaded) {
            loadVideo();
            return;
        }
        const iframe = iframeRef.current;
        if (!iframe) return;
        const fn = isPlaying ? 'pauseVideo' : 'playVideo';
        iframe.contentWindow?.postMessage(`{"event":"command","func":"${fn}","args":""}`, '*');
        setIsPlaying((prev) => !prev);
        trackEvent(isPlaying ? 'video_pause_click' : 'video_play_click', isPlaying ? 'VideoPaused' : 'VideoResumed', {
            section: 'hero',
            video_id: HERO_VIDEO_ID,
        });
    }, [isPlaying, loadVideo, videoLoaded]);

    const handleFullscreen = useCallback(() => {
        const el = videoContainerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    const handleMute = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const fn = isMuted ? 'unMute' : 'mute';
        iframe.contentWindow?.postMessage(`{"event":"command","func":"${fn}","args":""}`, '*');
        setIsMuted((prev) => !prev);
        trackEvent(isMuted ? 'video_unmute_click' : 'video_mute_click', isMuted ? 'VideoUnmuted' : 'VideoMuted', {
            section: 'hero',
            video_id: HERO_VIDEO_ID,
        });
    }, [isMuted]);

    useEffect(() => {
        const onChange = () => {
            const fullscreen = !!document.fullscreenElement;
            setIsFullscreen(fullscreen);
            if (fullscreen) {
                trackEvent('video_fullscreen_click', 'VideoFullscreen', { section: 'hero', video_id: HERO_VIDEO_ID });
            }
        };
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    // YouTube IFrame API — video start/progress/complete milestones as full Pixel + CAPI events.
    useEffect(() => {
        if (!videoLoaded) return;

        const firedMilestones = new Set<string>();
        const fireOnce = (key: string, gtmName: string, pixelEvent: string) => {
            if (firedMilestones.has(key)) return;
            firedMilestones.add(key);
            trackEvent(gtmName, pixelEvent, { section: 'hero', video_id: HERO_VIDEO_ID });
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
                if (percent >= 25) fireOnce('progress_25', 'video_progress_25', 'VideoProgress25');
                if (percent >= 50) fireOnce('progress_50', 'video_progress_50', 'VideoProgress50');
                if (percent >= 75) fireOnce('progress_75', 'video_progress_75', 'VideoProgress75');
                if (percent >= 95) fireOnce('video_watched_complete', 'video_watched_complete', 'VideoWatched');
            }, 1000);
        };

        const onPlayerStateChange = (event: { data: number }) => {
            if (event.data === 1) {
                fireOnce('start', 'video_start', 'VideoStart');
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
    }, [videoLoaded]);

    return (
        <section className="relative overflow-hidden bg-white pb-12 pt-24 sm:pb-16 sm:pt-28">
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-blue-50/60 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
                    {/* Video */}
                    <div id="demo-section" className="relative order-last mx-auto w-full max-w-sm scroll-mt-20 lg:max-w-[500px]">
                        <div className="relative rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
                            <div ref={videoContainerRef} className="relative overflow-hidden rounded-xl bg-slate-950">
                                {videoLoaded ? (
                                    <iframe
                                        ref={iframeRef}
                                        className="block h-[320px] w-full rounded-xl sm:h-[640px]"
                                        src={`https://www.youtube.com/embed/${HERO_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${HERO_VIDEO_ID}&controls=0&modestbranding=1&enablejsapi=1`}
                                        title="AndgateBOS Demo"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={loadVideo}
                                        className="group relative block h-[320px] w-full overflow-hidden rounded-xl text-left sm:h-[640px]"
                                        aria-label="Play AndgateBOS demo video"
                                    >
                                        <span
                                            className="absolute inset-0 bg-cover bg-center opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-95"
                                            style={{ backgroundImage: `url(https://i.ytimg.com/vi/${HERO_VIDEO_ID}/hqdefault.jpg)` }}
                                        />
                                        <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                        <span className="absolute left-4 right-4 bottom-4 rounded-xl bg-white/95 p-4 shadow-xl">
                                            <span className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                                                <Play className="h-5 w-5 fill-current" />
                                            </span>
                                            <span className="block text-base font-black text-slate-900">ডেমো ভিডিও দেখুন</span>
                                            <span className="mt-1 block text-sm leading-5 text-slate-600">ভিডিও না দেখলেও নিচে ফর্ম পূরণ করে সরাসরি ড্যাশবোর্ড দেখতে পারবেন।</span>
                                        </span>
                                    </button>
                                )}
                            </div>
                            {/* Control bar — below iframe in normal flow, never covered */}
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 pb-1">
                                <button
                                    onClick={handlePlayPause}
                                    className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-gray-700 active:scale-95"
                                >
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    {isPlaying ? 'থামান' : 'চালু করুন'}
                                </button>
                                <button
                                    onClick={handleMute}
                                    className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-gray-700 active:scale-95"
                                >
                                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    {isMuted ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
                                </button>
                                <button
                                    onClick={handleFullscreen}
                                    className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-primary/80 active:scale-95"
                                >
                                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                    {isFullscreen ? 'বন্ধ করুন' : 'বড় করে দেখুন'}
                                </button>
                            </div>
                        </div>

                        {/* Floating social proof chip */}
                        <div className="absolute -top-4 -left-4 z-10 flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-xl">
                            <div className="flex -space-x-1.5">
                                {['র', 'স', 'আ'].map((l, i) => (
                                    <div
                                        key={i}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white"
                                    >
                                        {l}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-xs font-semibold text-gray-700">বাংলাদেশি দোকানের জন্য তৈরি</p>
                            </div>
                        </div>
                    </div>

                    {/* Copy — second on mobile, first on desktop */}
                    <div className="order-first text-center lg:text-left">
                        {/* Urgency badge */}
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
                            <span className="flex h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                            <span className="text-sm font-bold text-orange-600">এখনই শুরু করলে সেটআপ ফি লাগবে না</span>
                        </div>

                        {/* Headline — pain-led hook, recognizable within 3 seconds */}
                        <h1 className="mb-4 text-3xl font-extrabold leading-[1.12] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.2rem]">
                            {isOutcomeHero ? (
                                <>
                                    বিক্রি, স্টক আর বাকি <span className="text-primary">এক জায়গায় দেখুন</span>
                                </>
                            ) : (
                                <>
                                    খাতার হিসাব <span className="text-primary">রাতে মেলে না?</span>
                                </>
                            )}
                        </h1>

                        <p className="mb-6 text-base leading-relaxed text-gray-600 sm:text-lg">
                            {isOutcomeHero
                                ? 'দোকানের বিলিং, পণ্যের স্টক, কাস্টমারের বাকি, ক্যাশ আর দৈনিক রিপোর্ট মোবাইল বা কম্পিউটার থেকে পরিষ্কারভাবে চালান।'
                                : 'মোবাইলেই এখন ১ মিনিটে মিলবে — ফর্ম পূরণ করলেই অ্যাকাউন্ট তৈরি হবে, সরাসরি ড্যাশবোর্ডে ঢুকে সফটওয়্যার দেখে নিতে পারবেন।'}
                        </p>

                        {/* Trust points */}
                        <div className="mb-8 flex flex-col gap-2.5 text-sm font-medium text-gray-700 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                            {['কোনো কার্ড লাগবে না', 'মোবাইল দিয়েই বিল করা যায়', 'বাংলায় সেটআপ সাপোর্ট', 'স্টক ও লাভ-লস রিপোর্ট'].map((t, i) => (
                                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-green-800">
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start">
                            <PromoButton
                                href="#register-section"
                                className="w-full px-8 py-4 text-base sm:w-auto"
                                onClick={() => trackEvent('hero_cta_click', 'Lead', { button_label: 'ফ্রিতে শুরু করুন', section: 'hero', experiment_key: 'promotion_pos_hero_v1', experiment_variant: heroVariant })}
                            >
                                <span className="flex items-center gap-2">
                                    ১ মিনিটে ফ্রি ট্রায়াল শুরু করুন
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </PromoButton>
                            <a
                                href="#demo-section"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:w-auto"
                                onClick={() => trackEvent('hero_demo_click', 'ViewContent', { button_label: 'সমস্যাগুলো দেখুন', section: 'hero', experiment_key: 'promotion_pos_hero_v1', experiment_variant: heroVariant })}
                            >
                                ডেমো ভিডিও দেখুন ↓
                            </a>
                        </div>

                        {/* Security note */}
                        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400 lg:justify-start">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                            SSL সুরক্ষিত · ব্যাংক-মানের নিরাপত্তা · তথ্য সম্পূর্ণ গোপনীয়
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
