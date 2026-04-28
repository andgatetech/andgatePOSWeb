'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import {
    BarChart3,
    BookOpen,
    CreditCard,
    Download,
    ExternalLink,
    Lightbulb,
    Package,
    Play,
    Store,
    Users,
    X,
    Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function TrainingPage() {
    const { t } = getTranslation();
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    const trainingCategories = [
        {
            id: 'getting-started',
            title: t('training.category_getting_started'),
            description: t('training.category_getting_started_desc'),
            icon: <Zap className="h-6 w-6" />,
            color: 'from-[#046ca9] to-[#034d79]',
            bgColor: 'bg-[#046ca9]/5',
            textColor: 'text-[#046ca9]',
            borderColor: 'border-[#046ca9]/15',
            videos: [
                { title: t('training.video_complete_setup'), duration: '15:30', description: t('training.video_complete_setup_desc'), youtubeId: 'Vn0QWdiWLqk', difficulty: 'Beginner' },
                { title: t('training.video_dashboard_overview'), duration: '8:45', description: t('training.video_dashboard_overview_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
                { title: t('training.video_user_roles'), duration: '12:20', description: t('training.video_user_roles_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
            ],
        },
        {
            id: 'pos-operations',
            title: t('training.category_pos_operations'),
            description: t('training.category_pos_operations_desc'),
            icon: <CreditCard className="h-6 w-6" />,
            color: 'from-[#046ca9] to-[#0586cb]',
            bgColor: 'bg-[#046ca9]/5',
            textColor: 'text-[#046ca9]',
            borderColor: 'border-[#046ca9]/15',
            videos: [
                { title: t('training.video_processing_sales'), duration: '10:15', description: t('training.video_processing_sales_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
                { title: t('training.video_payment_methods'), duration: '7:30', description: t('training.video_payment_methods_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
                { title: t('training.video_refunds'), duration: '9:45', description: t('training.video_refunds_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
                { title: t('training.video_discounts'), duration: '11:20', description: t('training.video_discounts_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
            ],
        },
        {
            id: 'inventory',
            title: t('training.category_inventory'),
            description: t('training.category_inventory_desc'),
            icon: <Package className="h-6 w-6" />,
            color: 'from-[#046ca9] to-[#034d79]',
            bgColor: 'bg-[#046ca9]/5',
            textColor: 'text-[#046ca9]',
            borderColor: 'border-[#046ca9]/15',
            videos: [
                { title: t('training.video_add_products'), duration: '13:15', description: t('training.video_add_products_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
                { title: t('training.video_stock_management'), duration: '16:40', description: t('training.video_stock_management_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
                { title: t('training.video_bulk_import'), duration: '12:30', description: t('training.video_bulk_import_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
                { title: t('training.video_categories'), duration: '14:25', description: t('training.video_categories_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
            ],
        },
        {
            id: 'customers',
            title: t('training.category_customers'),
            description: t('training.category_customers_desc'),
            icon: <Users className="h-6 w-6" />,
            color: 'from-[#e79237] to-[#c47920]',
            bgColor: 'bg-[#e79237]/5',
            textColor: 'text-[#e79237]',
            borderColor: 'border-[#e79237]/15',
            videos: [
                { title: t('training.video_customer_profiles'), duration: '9:30', description: t('training.video_customer_profiles_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
                { title: t('training.video_loyalty'), duration: '15:45', description: t('training.video_loyalty_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
                { title: t('training.video_customer_analytics'), duration: '11:15', description: t('training.video_customer_analytics_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
            ],
        },
        {
            id: 'reports',
            title: t('training.category_reports'),
            description: t('training.category_reports_desc'),
            icon: <BarChart3 className="h-6 w-6" />,
            color: 'from-[#035887] to-[#046ca9]',
            bgColor: 'bg-[#046ca9]/5',
            textColor: 'text-[#046ca9]',
            borderColor: 'border-[#046ca9]/15',
            videos: [
                { title: t('training.video_sales_reports'), duration: '13:20', description: t('training.video_sales_reports_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
                { title: t('training.video_inventory_reports'), duration: '10:50', description: t('training.video_inventory_reports_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
                { title: t('training.video_financial_reports'), duration: '17:30', description: t('training.video_financial_reports_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
                { title: t('training.video_custom_reports'), duration: '14:15', description: t('training.video_custom_reports_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
            ],
        },
        {
            id: 'multi-store',
            title: t('training.category_multi_store'),
            description: t('training.category_multi_store_desc'),
            icon: <Store className="h-6 w-6" />,
            color: 'from-[#034d79] to-[#035887]',
            bgColor: 'bg-[#046ca9]/5',
            textColor: 'text-[#046ca9]',
            borderColor: 'border-[#046ca9]/15',
            videos: [
                { title: t('training.video_store_setup'), duration: '12:40', description: t('training.video_store_setup_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
                { title: t('training.video_inventory_sync'), duration: '16:20', description: t('training.video_inventory_sync_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
                { title: t('training.video_store_performance'), duration: '11:30', description: t('training.video_store_performance_desc'), youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
            ],
        },
    ];

    const difficultyConfig: Record<string, { bg: string; text: string }> = {
        Beginner: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
        Intermediate: { bg: 'bg-amber-100', text: 'text-amber-700' },
        Advanced: { bg: 'bg-rose-100', text: 'text-rose-700' },
    };

    const totalVideos = trainingCategories.reduce((sum, c) => sum + c.videos.length, 0);

    const resources = [
        {
            icon: <Download className="h-10 w-10" />,
            title: t('training.resource_manual'),
            description: t('training.resource_manual_desc'),
            action: t('training.resource_manual_action'),
            href: '/resources/andgatePOS-user-manual.pdf',
        },
        {
            icon: <Lightbulb className="h-10 w-10" />,
            title: t('training.resource_best_practices'),
            description: t('training.resource_best_practices_desc'),
            action: t('training.resource_best_practices_action'),
            href: '/resources/best-practices',
        },
        {
            icon: <Users className="h-10 w-10" />,
            title: t('training.resource_support'),
            description: t('training.resource_support_desc'),
            action: t('training.resource_support_action'),
            href: '/contact',
        },
    ];

    return (
        <MainLayout>
            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] pb-20 pt-32">
                <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-white/10 blur-[100px]" />
                <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-white/10 blur-[100px]" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/30 bg-[#046ca9]/15 px-4 py-2 text-sm font-medium text-[#5bb8e8] backdrop-blur-sm">
                        <BookOpen className="h-4 w-4" />
                        Learning Center
                    </div>
                    <h1 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
                        {t('training.page_title') || 'Master'}
                        <span className="block bg-gradient-to-r from-[#5bb8e8] to-[#e8f4fb] bg-clip-text text-transparent">
                            AndgatePOS
                        </span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
                        {t('training.page_subtitle') || 'Step-by-step video guides to get the most out of your POS system.'}
                    </p>

                    {/* Stats chips */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {[
                            { icon: <Play className="h-4 w-4" />, label: `${totalVideos} video tutorials` },
                            { icon: <BookOpen className="h-4 w-4" />, label: `${trainingCategories.length} topic categories` },
                            { icon: <Zap className="h-4 w-4" />, label: 'Beginner to Advanced' },
                        ].map((chip, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm"
                            >
                                <span className="text-[#5bb8e8]">{chip.icon}</span>
                                {chip.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 to-transparent" />
            </section>

            {/* ── Tutorial Categories ── */}
            <section className="bg-slate-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {trainingCategories.map((category) => (
                        <div key={category.id} className="mb-16 last:mb-0">
                            {/* Category Header */}
                            <div className={`mb-8 flex items-start gap-5 rounded-2xl border ${category.borderColor} ${category.bgColor} p-6`}>
                                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${category.color} text-white shadow-md`}>
                                    {category.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                                    <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                                    <span className={`mt-2 inline-block text-xs font-semibold ${category.textColor}`}>
                                        {category.videos.length} tutorials
                                    </span>
                                </div>
                            </div>

                            {/* Video Cards Grid */}
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {category.videos.map((video) => {
                                    const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                                    const diff = difficultyConfig[video.difficulty] ?? difficultyConfig.Beginner;
                                    return (
                                        <div
                                            key={`${video.youtubeId}-${video.title}`}
                                            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl"
                                        >
                                            <div className="relative overflow-hidden">
                                                {playingVideo === `${category.id}-${video.youtubeId}` ? (
                                                    <>
                                                        <ReactPlayer
                                                            url={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                                                            playing
                                                            controls
                                                            width="100%"
                                                            height="200px"
                                                        />
                                                        <button
                                                            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                                                            onClick={() => setPlayingVideo(null)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Image
                                                            src={thumbnailUrl}
                                                            alt={video.title}
                                                            width={400}
                                                            height={225}
                                                            className="h-44 w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105"
                                                            onClick={() => setPlayingVideo(`${category.id}-${video.youtubeId}`)}
                                                        />
                                                        <div
                                                            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                                            onClick={() => setPlayingVideo(`${category.id}-${video.youtubeId}`)}
                                                        >
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                                                                <Play className={`h-5 w-5 ${category.textColor}`} />
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/75 px-2 py-0.5 text-xs font-semibold text-white">
                                                            {video.duration}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <h4 className={`mb-2 text-sm font-bold text-gray-900 transition-colors group-hover:${category.textColor}`}>
                                                    {video.title}
                                                </h4>
                                                <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500">{video.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${diff.bg} ${diff.text}`}>
                                                        {video.difficulty}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{video.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Resources ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] py-24">
                <div className="absolute left-1/4 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-14 text-center">
                        <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">{t('training.resources_title') || 'Learning Resources'}</h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-400">{t('training.resources_subtitle') || 'Everything you need to succeed with AndgatePOS.'}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {resources.map((resource, index) => (
                            <div
                                key={index}
                                className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#046ca9]/30 hover:bg-white/10"
                            >
                                <div className="mb-5 text-[#5bb8e8] transition-transform duration-300 group-hover:scale-110">
                                    {resource.icon}
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-white">{resource.title}</h3>
                                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">{resource.description}</p>
                                <a
                                    href={resource.href}
                                    className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white hover:text-[#046ca9]"
                                >
                                    {resource.action}
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
