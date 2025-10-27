// 'use client';
// import MainLayout from '@/components/layout/MainLayout';
// import { BarChart3, CreditCard, Download, ExternalLink, Lightbulb, Package, Play, Store, Users, Zap, X } from 'lucide-react';
// import Image from 'next/image';
// import React, { useState } from 'react';
// import dynamic from 'next/dynamic';

// // Lazy-load ReactPlayer to avoid SSR issues
// const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

// export default function TrainingPage() {
//     const trainingCategories = [
//         {
//             id: 'getting-started',
//             title: 'Getting Started',
//             description: 'Essential basics to set up and start using your POS system',
//             icon: <Zap className="h-8 w-8" />,
//             color: 'from-blue-500 to-blue-600',
//             bgColor: 'bg-blue-50',
//             textColor: 'text-blue-600',
//             videos: [
//                 { title: 'Complete Setup Guide', duration: '15:30', description: 'Step-by-step setup from account creation to first sale', youtubeId: 'Vn0QWdiWLqk', difficulty: 'Beginner' },
//                 { title: 'Dashboard Overview', duration: '8:45', description: 'Navigate your dashboard and understand key metrics', youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
//                 { title: 'User Management & Roles', duration: '12:20', description: 'Add staff, assign roles, and manage permissions', youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
//             ],
//         },
//         {
//             id: 'pos-operations',
//             title: 'POS Operations',
//             description: 'Master daily point-of-sale operations and transactions',
//             icon: <CreditCard className="h-8 w-8" />,
//             color: 'from-green-500 to-green-600',
//             bgColor: 'bg-green-50',
//             textColor: 'text-green-600',
//             videos: [
//                 { title: 'Processing Sales', duration: '10:15', description: 'Handle customer transactions efficiently', youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
//                 { title: 'Payment Methods', duration: '7:30', description: 'Accept cash, card, and digital payments', youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
//                 { title: 'Refunds & Returns', duration: '9:45', description: 'Process refunds and handle return transactions', youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
//                 { title: 'Discounts & Promotions', duration: '11:20', description: 'Apply discounts and manage promotional codes', youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
//             ],
//         },
//         {
//             id: 'inventory',
//             title: 'Inventory Management',
//             description: 'Efficiently manage products, stock levels, and suppliers',
//             icon: <Package className="h-8 w-8" />,
//             color: 'from-purple-500 to-purple-600',
//             bgColor: 'bg-purple-50',
//             textColor: 'text-purple-600',
//             videos: [
//                 { title: 'Adding Products', duration: '13:15', description: 'Add new products with variants, pricing, and images', youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
//                 { title: 'Stock Management', duration: '16:40', description: 'Track inventory levels and set up reorder alerts', youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
//                 { title: 'Bulk Import/Export', duration: '12:30', description: 'Import products in bulk using CSV files', youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
//                 { title: 'Categories & Variants', duration: '14:25', description: 'Organize products with categories and manage variants', youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
//             ],
//         },
//         {
//             id: 'customers',
//             title: 'Customer Management',
//             description: 'Build customer relationships and loyalty programs',
//             icon: <Users className="h-8 w-8" />,
//             color: 'from-orange-500 to-orange-600',
//             bgColor: 'bg-orange-50',
//             textColor: 'text-orange-600',
//             videos: [
//                 { title: 'Customer Profiles', duration: '9:30', description: 'Create and manage customer information', youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
//                 { title: 'Loyalty Programs', duration: '15:45', description: 'Set up and manage customer loyalty rewards', youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
//                 { title: 'Customer Analytics', duration: '11:15', description: 'Analyze customer behavior and purchase patterns', youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
//             ],
//         },
//         {
//             id: 'reports',
//             title: 'Reports & Analytics',
//             description: 'Generate insights with powerful reporting tools',
//             icon: <BarChart3 className="h-8 w-8" />,
//             color: 'from-indigo-500 to-indigo-600',
//             bgColor: 'bg-indigo-50',
//             textColor: 'text-indigo-600',
//             videos: [
//                 { title: 'Sales Reports', duration: '13:20', description: 'Generate and understand daily, weekly, and monthly sales reports', youtubeId: 'EngW7tLk6R8', difficulty: 'Beginner' },
//                 { title: 'Inventory Reports', duration: '10:50', description: 'Track stock movements and inventory valuation', youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
//                 { title: 'Financial Reports', duration: '17:30', description: 'Understand profit margins, tax reports, and financial insights', youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
//                 { title: 'Custom Reports', duration: '14:15', description: 'Create custom reports for specific business needs', youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
//             ],
//         },
//         {
//             id: 'multi-store',
//             title: 'Multi-Store Operations',
//             description: 'Manage multiple locations from one central system',
//             icon: <Store className="h-8 w-8" />,
//             color: 'from-teal-500 to-teal-600',
//             bgColor: 'bg-teal-50',
//             textColor: 'text-teal-600',
//             videos: [
//                 { title: 'Store Setup', duration: '12:40', description: 'Add and configure multiple store locations', youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
//                 { title: 'Inventory Sync', duration: '16:20', description: 'Synchronize inventory across multiple stores', youtubeId: 'EngW7tLk6R8', difficulty: 'Advanced' },
//                 { title: 'Store Performance', duration: '11:30', description: 'Compare and analyze performance across locations', youtubeId: 'EngW7tLk6R8', difficulty: 'Intermediate' },
//             ],
//         },
//     ];

//     const difficultyColors: { [key: string]: string } = {
//         Beginner: 'bg-green-100 text-green-800',
//         Intermediate: 'bg-yellow-100 text-yellow-800',
//         Advanced: 'bg-red-100 text-red-800',
//     };

//     const [playingVideo, setPlayingVideo] = useState<string | null>(null);

//     return (
//         <MainLayout>
//             <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//                 <section id="all-tutorials" className="bg-white py-24">
//                     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                         <div className="mb-20 text-center">
//                             <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">How Our POS Runs</h2>
//                             <p className="mx-auto max-w-3xl text-xl text-gray-600">
//                                 Our POS system operates seamlessly across all devices. From quick product selection to instant checkout, real-time inventory tracking, and multiple payment options,
//                                 it’s designed to make your business run smoother and faster.
//                             </p>
//                         </div>

//                         {trainingCategories.map((category) => (
//                             <div key={category.id} className="mb-20">
//                                 <div className={`mb-8 rounded-2xl ${category.bgColor} p-8`}>
//                                     <div className="flex items-center gap-4">
//                                         <div className={`rounded-2xl bg-gradient-to-r ${category.color} p-4 text-white shadow-lg`}>{category.icon}</div>
//                                         <div>
//                                             <h3 className="text-3xl font-bold text-gray-900">{category.title}</h3>
//                                             <p className="text-lg text-gray-600">{category.description}</p>
//                                             <div className="mt-2 text-sm text-gray-500">{category.videos.length} tutorials available</div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                                     {category.videos.map((video) => {
//                                         const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
//                                         return (
//                                             <div key={video.youtubeId} className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
//                                                 <div className="relative overflow-hidden">
//                                                     {playingVideo === video.youtubeId ? (
//                                                         <>
//                                                             <ReactPlayer
//                                                                 url={`https://www.youtube.com/watch?v=${video.youtubeId}`}
//                                                                 playing
//                                                                 controls
//                                                                 width="100%"
//                                                                 height="225px"
//                                                             />
//                                                             <button
//                                                                 className="absolute top-2 right-2 rounded-full bg-black bg-opacity-60 p-2 text-white"
//                                                                 onClick={() => setPlayingVideo(null)}
//                                                             >
//                                                                 <X className="h-5 w-5" />
//                                                             </button>
//                                                         </>
//                                                     ) : (
//                                                         <>
//                                                             <Image
//                                                                 src={thumbnailUrl}
//                                                                 alt={video.title}
//                                                                 width={400}
//                                                                 height={225}
//                                                                 className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
//                                                                 onClick={() => setPlayingVideo(video.youtubeId)}
//                                                             />
//                                                             <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer" onClick={() => setPlayingVideo(video.youtubeId)}>
//                                                                 <Play className={`h-12 w-12 ${category.textColor}`} />
//                                                             </div>
//                                                             <div className="absolute bottom-3 right-3 rounded bg-black bg-opacity-80 px-2 py-1 text-xs font-medium text-white">{video.duration}</div>
//                                                         </>
//                                                     )}
//                                                 </div>
//                                                 <div className="p-6">
//                                                     <h4 className="mb-3 text-lg font-bold text-gray-900 group-hover:text-blue-600">{video.title}</h4>
//                                                     <p className="mb-4 text-gray-600">{video.description}</p>
//                                                     <div className="flex items-center justify-between">
//                                                         <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyColors[video.difficulty]}`}>{video.difficulty}</span>
//                                                         <div className="text-sm text-gray-500">{video.duration}</div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* Learning Resources */}
//                 <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-24">
//                     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                         <div className="text-center">
//                             <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Additional Learning Resources</h2>
//                             <p className="mb-12 text-xl text-blue-100">Expand your knowledge with our comprehensive learning materials and support resources.</p>

//                             <div className="grid gap-8 md:grid-cols-3">
//                                 {[
//                                     { icon: <Download className="h-12 w-12" />, title: 'User Manual (PDF)', description: 'Complete written guide covering all features and functionalities', action: 'Download PDF', href: '/resources/andgatePOS-user-manual.pdf' },
//                                     { icon: <Lightbulb className="h-12 w-12" />, title: 'Best Practices Guide', description: 'Expert tips and industry best practices for maximizing efficiency', action: 'Read Guide', href: '/resources/best-practices' },
//                                     { icon: <Users className="h-12 w-12" />, title: '24/7 Support', description: 'Get help from our expert support team whenever you need it', action: 'Contact Support', href: '/contact' },
//                                 ].map((resource, index) => (
//                                     <div key={index} className="rounded-2xl bg-white bg-opacity-10 p-8 backdrop-blur-lg transition-all hover:bg-opacity-20">
//                                         <div className="mb-6 flex justify-center text-white">{resource.icon}</div>
//                                         <h3 className="mb-4 text-xl font-bold text-white">{resource.title}</h3>
//                                         <p className="mb-6 text-blue-100">{resource.description}</p>
//                                         <a href={resource.href} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-gray-100">
//                                             {resource.action}
//                                             <ExternalLink className="h-4 w-4" />
//                                         </a>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         </MainLayout>
//     );
// }
'use client';
import MainLayout from '@/components/layout/MainLayout';
import { getTranslation } from '@/i18n';
import { BarChart3, CreditCard, Download, ExternalLink, Lightbulb, Package, Play, Store, Users, X, Zap } from 'lucide-react';
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
            icon: <Zap className="h-8 w-8" />,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            videos: [
                {
                    title: t('training.video_complete_setup'),
                    duration: '15:30',
                    description: t('training.video_complete_setup_desc'),
                    youtubeId: 'Vn0QWdiWLqk',
                    difficulty: 'Beginner',
                },
                {
                    title: t('training.video_dashboard_overview'),
                    duration: '8:45',
                    description: t('training.video_dashboard_overview_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Beginner',
                },
                {
                    title: t('training.video_user_roles'),
                    duration: '12:20',
                    description: t('training.video_user_roles_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Beginner',
                },
            ],
        },
        {
            id: 'pos-operations',
            title: t('training.category_pos_operations'),
            description: t('training.category_pos_operations_desc'),
            icon: <CreditCard className="h-8 w-8" />,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            videos: [
                {
                    title: t('training.video_processing_sales'),
                    duration: '10:15',
                    description: t('training.video_processing_sales_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Beginner',
                },
                {
                    title: t('training.video_payment_methods'),
                    duration: '7:30',
                    description: t('training.video_payment_methods_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Beginner',
                },
                {
                    title: t('training.video_refunds'),
                    duration: '9:45',
                    description: t('training.video_refunds_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Intermediate',
                },
                {
                    title: t('training.video_discounts'),
                    duration: '11:20',
                    description: t('training.video_discounts_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Intermediate',
                },
            ],
        },
        {
            id: 'inventory',
            title: t('training.category_inventory'),
            description: t('training.category_inventory_desc'),
            icon: <Package className="h-8 w-8" />,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            videos: [
                {
                    title: t('training.video_add_products'),
                    duration: '13:15',
                    description: t('training.video_add_products_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Beginner',
                },
                {
                    title: t('training.video_stock_management'),
                    duration: '16:40',
                    description: t('training.video_stock_management_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Intermediate',
                },
                {
                    title: t('training.video_bulk_import'),
                    duration: '12:30',
                    description: t('training.video_bulk_import_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Advanced',
                },
                {
                    title: t('training.video_categories'),
                    duration: '14:25',
                    description: t('training.video_categories_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Intermediate',
                },
            ],
        },
        {
            id: 'customers',
            title: t('training.category_customers'),
            description: t('training.category_customers_desc'),
            icon: <Users className="h-8 w-8" />,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            videos: [
                {
                    title: t('training.video_customer_profiles'),
                    duration: '9:30',
                    description: t('training.video_customer_profiles_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Beginner',
                },
                {
                    title: t('training.video_loyalty'),
                    duration: '15:45',
                    description: t('training.video_loyalty_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Intermediate',
                },
                {
                    title: t('training.video_customer_analytics'),
                    duration: '11:15',
                    description: t('training.video_customer_analytics_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Advanced',
                },
            ],
        },
        {
            id: 'reports',
            title: t('training.category_reports'),
            description: t('training.category_reports_desc'),
            icon: <BarChart3 className="h-8 w-8" />,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            videos: [
                {
                    title: t('training.video_sales_reports'),
                    duration: '13:20',
                    description: t('training.video_sales_reports_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Beginner',
                },
                {
                    title: t('training.video_inventory_reports'),
                    duration: '10:50',
                    description: t('training.video_inventory_reports_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Intermediate',
                },
                {
                    title: t('training.video_financial_reports'),
                    duration: '17:30',
                    description: t('training.video_financial_reports_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Advanced',
                },
                {
                    title: t('training.video_custom_reports'),
                    duration: '14:15',
                    description: t('training.video_custom_reports_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Advanced',
                },
            ],
        },
        {
            id: 'multi-store',
            title: t('training.category_multi_store'),
            description: t('training.category_multi_store_desc'),
            icon: <Store className="h-8 w-8" />,
            color: 'from-teal-500 to-teal-600',
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-600',
            videos: [
                {
                    title: t('training.video_store_setup'),
                    duration: '12:40',
                    description: t('training.video_store_setup_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Intermediate',
                },
                {
                    title: t('training.video_inventory_sync'),
                    duration: '16:20',
                    description: t('training.video_inventory_sync_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Advanced',
                },
                {
                    title: t('training.video_store_performance'),
                    duration: '11:30',
                    description: t('training.video_store_performance_desc'),
                    youtubeId: 'EngW7tLk6R8',
                    difficulty: 'Intermediate',
                },
            ],
        },
    ];

    const difficultyColors: { [key: string]: string } = {
        Beginner: 'bg-green-100 text-green-800',
        Intermediate: 'bg-yellow-100 text-yellow-800',
        Advanced: 'bg-red-100 text-red-800',
    };

    const resources = [
        {
            icon: <Download className="h-12 w-12" />,
            title: t('training.resource_manual'),
            description: t('training.resource_manual_desc'),
            action: t('training.resource_manual_action'),
            href: '/resources/andgatePOS-user-manual.pdf',
        },
        {
            icon: <Lightbulb className="h-12 w-12" />,
            title: t('training.resource_best_practices'),
            description: t('training.resource_best_practices_desc'),
            action: t('training.resource_best_practices_action'),
            href: '/resources/best-practices',
        },
        {
            icon: <Users className="h-12 w-12" />,
            title: t('training.resource_support'),
            description: t('training.resource_support_desc'),
            action: t('training.resource_support_action'),
            href: '/contact',
        },
    ];

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <section id="all-tutorials" className="bg-white py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-20 text-center">
                            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">{t('training.page_title')}</h2>
                            <p className="mx-auto max-w-3xl text-xl text-gray-600">{t('training.page_subtitle')}</p>
                        </div>

                        {trainingCategories.map((category) => (
                            <div key={category.id} className="mb-20">
                                <div className={`mb-8 rounded-2xl ${category.bgColor} p-8`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`rounded-2xl bg-gradient-to-r ${category.color} p-4 text-white shadow-lg`}>{category.icon}</div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-gray-900">{category.title}</h3>
                                            <p className="text-lg text-gray-600">{category.description}</p>
                                            <div className="mt-2 text-sm text-gray-500">{category.videos.length} tutorials available</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {category.videos.map((video) => {
                                        const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                                        return (
                                            <div key={video.youtubeId} className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                                <div className="relative overflow-hidden">
                                                    {playingVideo === video.youtubeId ? (
                                                        <>
                                                            <ReactPlayer url={`https://www.youtube.com/watch?v=${video.youtubeId}`} playing controls width="100%" height="225px" />
                                                            <button className="absolute right-2 top-2 rounded-full bg-black bg-opacity-60 p-2 text-white" onClick={() => setPlayingVideo(null)}>
                                                                <X className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Image
                                                                src={thumbnailUrl}
                                                                alt={video.title}
                                                                width={400}
                                                                height={225}
                                                                className="h-48 w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-110"
                                                                onClick={() => setPlayingVideo(video.youtubeId)}
                                                            />
                                                            <div
                                                                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-40"
                                                                onClick={() => setPlayingVideo(video.youtubeId)}
                                                            >
                                                                <Play className={`h-12 w-12 ${category.textColor}`} />
                                                            </div>
                                                            <div className="absolute bottom-3 right-3 rounded bg-black bg-opacity-80 px-2 py-1 text-xs font-medium text-white">{video.duration}</div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="p-6">
                                                    <h4 className="mb-3 text-lg font-bold text-gray-900 group-hover:text-blue-600">{video.title}</h4>
                                                    <p className="mb-4 text-gray-600">{video.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyColors[video.difficulty]}`}>{video.difficulty}</span>
                                                        <div className="text-sm text-gray-500">{video.duration}</div>
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

                {/* Learning Resources */}
                <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">{t('training.resources_title')}</h2>
                            <p className="mb-12 text-xl text-blue-100">{t('training.resources_subtitle')}</p>

                            <div className="grid gap-8 md:grid-cols-3">
                                {resources.map((resource, index) => (
                                    <div key={index} className="rounded-2xl bg-white bg-opacity-10 p-8 backdrop-blur-lg transition-all hover:bg-opacity-20">
                                        <div className="mb-6 flex justify-center text-white">{resource.icon}</div>
                                        <h3 className="mb-4 text-xl font-bold text-white">{resource.title}</h3>
                                        <p className="mb-6 text-blue-100">{resource.description}</p>
                                        <a href={resource.href} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-gray-100">
                                            {resource.action}
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
