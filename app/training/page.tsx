'use client';
import MainLayout from '@/components/layouts/MainLayout';
import { getTranslation } from '@/i18n';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    Calculator,
    CheckCircle,
    CreditCard,
    Download,
    ExternalLink,
    Globe,
    Lightbulb,
    Package,
    Play,
    RotateCcw,
    Settings,
    ShoppingBag,
    Store,
    Truck,
    Users,
    X,
    Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const ReactPlayer = dynamic(() => import('react-player').then((mod) => mod.default), { ssr: false });

const PLACEHOLDER_VID = 'EwQRFTYUXn0';
const vid = (_i: number) => PLACEHOLDER_VID;

export default function TrainingPage() {
    const { t } = getTranslation();
    const [playing, setPlaying] = useState<string | null>(null);
    const [activeModuleId, setActiveModuleId] = useState('getting-started');

    // ── Curriculum data — full business journey ──────────────────────
    const modules = [
        // ── 01: Getting Started ──────────────────────────────────────
        {
            num: '01',
            id: 'getting-started',
            title: t('training.category_getting_started'),
            desc: t('training.category_getting_started_desc'),
            icon: <Zap className="h-5 w-5" />,
            gradient: 'from-[#046ca9] to-[#034d79]',
            accent: '#046ca9',
            accentLight: 'bg-[#046ca9]/8',
            accentBorder: 'border-[#046ca9]/15',
            accentText: 'text-[#046ca9]',
            isStartHere: true,
            lessons: [
                {
                    title: t('training.video_dashboard_overview'),
                    duration: '4:45',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_dashboard_overview_desc'),
                    points: [t('training.kp_dashboard_1'), t('training.kp_dashboard_2'), t('training.kp_dashboard_3')],
                },
                {
                    title: t('training.video_store_profile'),
                    duration: '4:30',
                    youtubeId: vid(1),
                    difficulty: 'Beginner',
                    desc: t('training.video_store_profile_desc'),
                    points: [t('training.kp_storeprofile_1'), t('training.kp_storeprofile_2'), t('training.kp_storeprofile_3')],
                },
                {
                    title: t('training.video_user_roles'),
                    duration: '6:20',
                    youtubeId: vid(2),
                    difficulty: 'Beginner',
                    desc: t('training.video_user_roles_desc'),
                    points: [t('training.kp_roles_1'), t('training.kp_roles_2'), t('training.kp_roles_3')],
                },
            ],
        },
        // ── 02: Store Configuration ──────────────────────────────────
        {
            num: '02',
            id: 'business-os',
            title: t('training.category_business_os'),
            desc: t('training.category_business_os_desc'),
            icon: <ShoppingBag className="h-5 w-5" />,
            gradient: 'from-[#e79237] to-[#c47920]',
            accent: '#e79237',
            accentLight: 'bg-amber-50',
            accentBorder: 'border-amber-200',
            accentText: 'text-amber-700',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_business_os_overview'),
                    duration: '4:30',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_business_os_overview_desc'),
                    points: [t('training.kp_bos_1'), t('training.kp_bos_2'), t('training.kp_bos_3')],
                },
                {
                    title: t('training.video_cash_closing'),
                    duration: '5:00',
                    youtubeId: vid(1),
                    difficulty: 'Beginner',
                    desc: t('training.video_cash_closing_desc'),
                    points: [t('training.kp_cashclosing_1'), t('training.kp_cashclosing_2'), t('training.kp_cashclosing_3')],
                },
                {
                    title: t('training.video_petty_cash'),
                    duration: '4:15',
                    youtubeId: vid(2),
                    difficulty: 'Beginner',
                    desc: t('training.video_petty_cash_desc'),
                    points: [t('training.kp_pettycash_1'), t('training.kp_pettycash_2'), t('training.kp_pettycash_3')],
                },
                {
                    title: t('training.video_staff_attendance'),
                    duration: '3:45',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_staff_attendance_desc'),
                    points: [t('training.kp_attendance_1'), t('training.kp_attendance_2'), t('training.kp_attendance_3')],
                },
                {
                    title: t('training.video_service_jobs'),
                    duration: '4:45',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_service_jobs_desc'),
                    points: [t('training.kp_servicejobs_1'), t('training.kp_servicejobs_2'), t('training.kp_servicejobs_3')],
                },
            ],
        },
        {
            num: '03',
            id: 'store-config',
            title: t('training.category_store_config'),
            desc: t('training.category_store_config_desc'),
            icon: <Settings className="h-5 w-5" />,
            gradient: 'from-slate-500 to-slate-700',
            accent: '#475569',
            accentLight: 'bg-slate-50',
            accentBorder: 'border-slate-200',
            accentText: 'text-slate-700',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_payment_settings'),
                    duration: '5:00',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_payment_settings_desc'),
                    points: [t('training.kp_paymentsettings_1'), t('training.kp_paymentsettings_2'), t('training.kp_paymentsettings_3')],
                },
                {
                    title: t('training.video_store_defaults'),
                    duration: '3:30',
                    youtubeId: vid(1),
                    difficulty: 'Beginner',
                    desc: t('training.video_store_defaults_desc'),
                    points: [t('training.kp_storedefaults_1'), t('training.kp_storedefaults_2'), t('training.kp_storedefaults_3')],
                },
                {
                    title: t('training.video_return_policies'),
                    duration: '3:45',
                    youtubeId: vid(2),
                    difficulty: 'Beginner',
                    desc: t('training.video_return_policies_desc'),
                    points: [t('training.kp_returnpolicies_1'), t('training.kp_returnpolicies_2'), t('training.kp_returnpolicies_3')],
                },
                {
                    title: t('training.video_invoice_customize'),
                    duration: '4:15',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_invoice_customize_desc'),
                    points: [t('training.kp_invoicecustom_1'), t('training.kp_invoicecustom_2'), t('training.kp_invoicecustom_3')],
                },
            ],
        },
        // ── 03: Product Catalogue ────────────────────────────────────
        {
            num: '04',
            id: 'inventory',
            title: t('training.category_inventory'),
            desc: t('training.category_inventory_desc'),
            icon: <Package className="h-5 w-5" />,
            gradient: 'from-emerald-600 to-emerald-700',
            accent: '#059669',
            accentLight: 'bg-emerald-50',
            accentBorder: 'border-emerald-200',
            accentText: 'text-emerald-700',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_categories'),
                    duration: '3:45',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_categories_desc'),
                    points: [t('training.kp_cat_1'), t('training.kp_cat_2'), t('training.kp_cat_3')],
                },
                {
                    title: t('training.video_brands'),
                    duration: '3:00',
                    youtubeId: vid(1),
                    difficulty: 'Beginner',
                    desc: t('training.video_brands_desc'),
                    points: [t('training.kp_brand_1'), t('training.kp_brand_2'), t('training.kp_brand_3')],
                },
                {
                    title: t('training.video_add_products'),
                    duration: '5:15',
                    youtubeId: vid(2),
                    difficulty: 'Beginner',
                    desc: t('training.video_add_products_desc'),
                    points: [t('training.kp_products_1'), t('training.kp_products_2'), t('training.kp_products_3')],
                },
                {
                    title: t('training.video_product_variants'),
                    duration: '4:45',
                    youtubeId: vid(0),
                    difficulty: 'Intermediate',
                    desc: t('training.video_product_variants_desc'),
                    points: [t('training.kp_variants_1'), t('training.kp_variants_2'), t('training.kp_variants_3')],
                },
                {
                    title: t('training.video_label_print'),
                    duration: '3:30',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_label_print_desc'),
                    points: [t('training.kp_labelprint_1'), t('training.kp_labelprint_2'), t('training.kp_labelprint_3')],
                },
                {
                    title: t('training.video_stock_management'),
                    duration: '5:40',
                    youtubeId: vid(0),
                    difficulty: 'Intermediate',
                    desc: t('training.video_stock_management_desc'),
                    points: [t('training.kp_stock_1'), t('training.kp_stock_2'), t('training.kp_stock_3')],
                },
                {
                    title: t('training.video_stock_adjustment'),
                    duration: '4:00',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_stock_adjustment_desc'),
                    points: [t('training.kp_stockadj_1'), t('training.kp_stockadj_2'), t('training.kp_stockadj_3')],
                },
                {
                    title: t('training.video_low_stock_alerts'),
                    duration: '3:30',
                    youtubeId: vid(2),
                    difficulty: 'Beginner',
                    desc: t('training.video_low_stock_alerts_desc'),
                    points: [t('training.kp_lowstock_1'), t('training.kp_lowstock_2'), t('training.kp_lowstock_3')],
                },
                {
                    title: t('training.video_bulk_import'),
                    duration: '6:30',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_bulk_import_desc'),
                    points: [t('training.kp_bulk_1'), t('training.kp_bulk_2'), t('training.kp_bulk_3')],
                },
            ],
        },
        // ── 04: Suppliers & Purchasing ───────────────────────────────
        {
            num: '05',
            id: 'purchases',
            title: t('training.category_purchases'),
            desc: t('training.category_purchases_desc'),
            icon: <Truck className="h-5 w-5" />,
            gradient: 'from-purple-600 to-purple-800',
            accent: '#7c3aed',
            accentLight: 'bg-purple-50',
            accentBorder: 'border-purple-200',
            accentText: 'text-purple-700',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_add_supplier'),
                    duration: '4:00',
                    youtubeId: vid(2),
                    difficulty: 'Beginner',
                    desc: t('training.video_add_supplier_desc'),
                    points: [t('training.kp_supplier_1'), t('training.kp_supplier_2'), t('training.kp_supplier_3')],
                },
                {
                    title: t('training.video_supplier_360'),
                    duration: '4:30',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_supplier_360_desc'),
                    points: [t('training.kp_supplier360_1'), t('training.kp_supplier360_2'), t('training.kp_supplier360_3')],
                },
                {
                    title: t('training.video_purchase_order'),
                    duration: '7:00',
                    youtubeId: vid(0),
                    difficulty: 'Intermediate',
                    desc: t('training.video_purchase_order_desc'),
                    points: [t('training.kp_purchase_1'), t('training.kp_purchase_2'), t('training.kp_purchase_3')],
                },
                {
                    title: t('training.video_receive_goods'),
                    duration: '4:15',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_receive_goods_desc'),
                    points: [t('training.kp_grn_1'), t('training.kp_grn_2'), t('training.kp_grn_3')],
                },
                {
                    title: t('training.video_supplier_dues'),
                    duration: '4:30',
                    youtubeId: vid(2),
                    difficulty: 'Intermediate',
                    desc: t('training.video_supplier_dues_desc'),
                    points: [t('training.kp_supplierdues_1'), t('training.kp_supplierdues_2'), t('training.kp_supplierdues_3')],
                },
            ],
        },
        // ── 05: Daily POS Operations ─────────────────────────────────
        {
            num: '06',
            id: 'pos-operations',
            title: t('training.category_pos_operations'),
            desc: t('training.category_pos_operations_desc'),
            icon: <CreditCard className="h-5 w-5" />,
            gradient: 'from-[#046ca9] to-[#0586cb]',
            accent: '#046ca9',
            accentLight: 'bg-[#046ca9]/8',
            accentBorder: 'border-[#046ca9]/15',
            accentText: 'text-[#046ca9]',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_barcode_scanner'),
                    duration: '3:00',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_barcode_scanner_desc'),
                    points: [t('training.kp_scanner_1'), t('training.kp_scanner_2'), t('training.kp_scanner_3')],
                },
                {
                    title: t('training.video_processing_sales'),
                    duration: '4:15',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_processing_sales_desc'),
                    points: [t('training.kp_sale_1'), t('training.kp_sale_2'), t('training.kp_sale_3')],
                },
                {
                    title: t('training.video_payment_methods'),
                    duration: '5:30',
                    youtubeId: vid(1),
                    difficulty: 'Beginner',
                    desc: t('training.video_payment_methods_desc'),
                    points: [t('training.kp_payment_1'), t('training.kp_payment_2'), t('training.kp_payment_3')],
                },
                {
                    title: t('training.video_discounts'),
                    duration: '3:20',
                    youtubeId: vid(2),
                    difficulty: 'Intermediate',
                    desc: t('training.video_discounts_desc'),
                    points: [t('training.kp_discount_1'), t('training.kp_discount_2'), t('training.kp_discount_3')],
                },
                {
                    title: t('training.video_refunds'),
                    duration: '4:45',
                    youtubeId: vid(0),
                    difficulty: 'Intermediate',
                    desc: t('training.video_refunds_desc'),
                    points: [t('training.kp_refund_1'), t('training.kp_refund_2'), t('training.kp_refund_3')],
                },
                {
                    title: t('training.video_end_of_day'),
                    duration: '4:30',
                    youtubeId: vid(1),
                    difficulty: 'Beginner',
                    desc: t('training.video_end_of_day_desc'),
                    points: [t('training.kp_eod_1'), t('training.kp_eod_2'), t('training.kp_eod_3')],
                },
            ],
        },
        // ── 06: Customer Management ──────────────────────────────────
        {
            num: '07',
            id: 'customers',
            title: t('training.category_customers'),
            desc: t('training.category_customers_desc'),
            icon: <Users className="h-5 w-5" />,
            gradient: 'from-[#e79237] to-[#c47920]',
            accent: '#e79237',
            accentLight: 'bg-amber-50',
            accentBorder: 'border-amber-200',
            accentText: 'text-amber-700',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_customer_profiles'),
                    duration: '4:30',
                    youtubeId: vid(1),
                    difficulty: 'Beginner',
                    desc: t('training.video_customer_profiles_desc'),
                    points: [t('training.kp_custprofile_1'), t('training.kp_custprofile_2'), t('training.kp_custprofile_3')],
                },
                {
                    title: t('training.video_crm_dashboard'),
                    duration: '4:45',
                    youtubeId: vid(0),
                    difficulty: 'Intermediate',
                    desc: t('training.video_crm_dashboard_desc'),
                    points: [t('training.kp_crm_1'), t('training.kp_crm_2'), t('training.kp_crm_3')],
                },
                {
                    title: t('training.video_customer_dues'),
                    duration: '5:00',
                    youtubeId: vid(2),
                    difficulty: 'Intermediate',
                    desc: t('training.video_customer_dues_desc'),
                    points: [t('training.kp_custdues_1'), t('training.kp_custdues_2'), t('training.kp_custdues_3')],
                },
                {
                    title: t('training.video_loyalty'),
                    duration: '5:45',
                    youtubeId: vid(0),
                    difficulty: 'Intermediate',
                    desc: t('training.video_loyalty_desc'),
                    points: [t('training.kp_loyalty_1'), t('training.kp_loyalty_2'), t('training.kp_loyalty_3')],
                },
                {
                    title: t('training.video_customer_analytics'),
                    duration: '4:15',
                    youtubeId: vid(1),
                    difficulty: 'Advanced',
                    desc: t('training.video_customer_analytics_desc'),
                    points: [t('training.kp_custanalytics_1'), t('training.kp_custanalytics_2'), t('training.kp_custanalytics_3')],
                },
            ],
        },
        // ── 07: Expenses & Accounting ────────────────────────────────
        {
            num: '08',
            id: 'expenses-accounting',
            title: t('training.category_expenses_accounting'),
            desc: t('training.category_expenses_accounting_desc'),
            icon: <Calculator className="h-5 w-5" />,
            gradient: 'from-rose-500 to-rose-700',
            accent: '#e11d48',
            accentLight: 'bg-rose-50',
            accentBorder: 'border-rose-200',
            accentText: 'text-rose-700',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_expenses'),
                    duration: '4:00',
                    youtubeId: vid(2),
                    difficulty: 'Beginner',
                    desc: t('training.video_expenses_desc'),
                    points: [t('training.kp_expenses_1'), t('training.kp_expenses_2'), t('training.kp_expenses_3')],
                },
                {
                    title: t('training.video_accounting'),
                    duration: '6:00',
                    youtubeId: vid(0),
                    difficulty: 'Intermediate',
                    desc: t('training.video_accounting_desc'),
                    points: [t('training.kp_accounting_1'), t('training.kp_accounting_2'), t('training.kp_accounting_3')],
                },
                {
                    title: t('training.video_profit_loss'),
                    duration: '5:15',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_profit_loss_desc'),
                    points: [t('training.kp_pnl_1'), t('training.kp_pnl_2'), t('training.kp_pnl_3')],
                },
                {
                    title: t('training.video_ledger'),
                    duration: '4:30',
                    youtubeId: vid(2),
                    difficulty: 'Advanced',
                    desc: t('training.video_ledger_desc'),
                    points: [t('training.kp_ledger_1'), t('training.kp_ledger_2'), t('training.kp_ledger_3')],
                },
            ],
        },
        // ── 08: Reports & Analytics ──────────────────────────────────
        {
            num: '09',
            id: 'reports',
            title: t('training.category_reports'),
            desc: t('training.category_reports_desc'),
            icon: <BarChart3 className="h-5 w-5" />,
            gradient: 'from-[#035887] to-[#046ca9]',
            accent: '#046ca9',
            accentLight: 'bg-[#046ca9]/8',
            accentBorder: 'border-[#046ca9]/15',
            accentText: 'text-[#046ca9]',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_sales_reports'),
                    duration: '4:20',
                    youtubeId: vid(0),
                    difficulty: 'Beginner',
                    desc: t('training.video_sales_reports_desc'),
                    points: [t('training.kp_salesreport_1'), t('training.kp_salesreport_2'), t('training.kp_salesreport_3')],
                },
                {
                    title: t('training.video_inventory_reports'),
                    duration: '4:50',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_inventory_reports_desc'),
                    points: [t('training.kp_stockreport_1'), t('training.kp_stockreport_2'), t('training.kp_stockreport_3')],
                },
                {
                    title: t('training.video_financial_reports'),
                    duration: '5:30',
                    youtubeId: vid(2),
                    difficulty: 'Intermediate',
                    desc: t('training.video_financial_reports_desc'),
                    points: [t('training.kp_financialreport_1'), t('training.kp_financialreport_2'), t('training.kp_financialreport_3')],
                },
                {
                    title: t('training.video_custom_reports'),
                    duration: '4:15',
                    youtubeId: vid(0),
                    difficulty: 'Advanced',
                    desc: t('training.video_custom_reports_desc'),
                    points: [t('training.kp_customreport_1'), t('training.kp_customreport_2'), t('training.kp_customreport_3')],
                },
                {
                    title: t('training.video_vat_report'),
                    duration: '3:45',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_vat_report_desc'),
                    points: [t('training.kp_vatreport_1'), t('training.kp_vatreport_2'), t('training.kp_vatreport_3')],
                },
            ],
        },
        // ── 09: Multi-Store Management ───────────────────────────────
        {
            num: '10',
            id: 'multi-store',
            title: t('training.category_multi_store'),
            desc: t('training.category_multi_store_desc'),
            icon: <Store className="h-5 w-5" />,
            gradient: 'from-slate-600 to-slate-800',
            accent: '#475569',
            accentLight: 'bg-slate-50',
            accentBorder: 'border-slate-200',
            accentText: 'text-slate-700',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_store_setup'),
                    duration: '3:40',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_store_setup_desc'),
                    points: [t('training.kp_storeadd_1'), t('training.kp_storeadd_2'), t('training.kp_storeadd_3')],
                },
                {
                    title: t('training.video_inventory_sync'),
                    duration: '5:20',
                    youtubeId: vid(2),
                    difficulty: 'Advanced',
                    desc: t('training.video_inventory_sync_desc'),
                    points: [t('training.kp_stocksync_1'), t('training.kp_stocksync_2'), t('training.kp_stocksync_3')],
                },
                {
                    title: t('training.video_store_performance'),
                    duration: '4:30',
                    youtubeId: vid(0),
                    difficulty: 'Intermediate',
                    desc: t('training.video_store_performance_desc'),
                    points: [t('training.kp_storeperf_1'), t('training.kp_storeperf_2'), t('training.kp_storeperf_3')],
                },
            ],
        },
        // ── 10: Online Store ─────────────────────────────────────────
        {
            num: '11',
            id: 'online-store',
            title: t('training.category_online_store'),
            desc: t('training.category_online_store_desc'),
            icon: <Globe className="h-5 w-5" />,
            gradient: 'from-emerald-500 to-teal-600',
            accent: '#0d9488',
            accentLight: 'bg-teal-50',
            accentBorder: 'border-teal-200',
            accentText: 'text-teal-700',
            isStartHere: false,
            lessons: [
                {
                    title: t('training.video_online_overview'),
                    duration: '3:00',
                    youtubeId: vid(1),
                    difficulty: 'Beginner',
                    desc: t('training.video_online_overview_desc'),
                    points: [t('training.kp_online_1'), t('training.kp_online_2'), t('training.kp_online_3')],
                },
                {
                    title: t('training.video_online_branding'),
                    duration: '4:00',
                    youtubeId: vid(2),
                    difficulty: 'Beginner',
                    desc: t('training.video_online_branding_desc'),
                    points: [t('training.kp_onlinebranding_1'), t('training.kp_onlinebranding_2'), t('training.kp_onlinebranding_3')],
                },
                {
                    title: t('training.video_online_sync'),
                    duration: '4:00',
                    youtubeId: vid(2),
                    difficulty: 'Beginner',
                    desc: t('training.video_online_sync_desc'),
                    points: [t('training.kp_onlinesync_1'), t('training.kp_onlinesync_2'), t('training.kp_onlinesync_3')],
                },
                {
                    title: t('training.video_courier_setup'),
                    duration: '4:30',
                    youtubeId: vid(1),
                    difficulty: 'Intermediate',
                    desc: t('training.video_courier_setup_desc'),
                    points: [t('training.kp_courier_1'), t('training.kp_courier_2'), t('training.kp_courier_3')],
                },
                {
                    title: t('training.video_online_orders'),
                    duration: '4:30',
                    youtubeId: vid(0),
                    difficulty: 'Intermediate',
                    desc: t('training.video_online_orders_desc'),
                    points: [t('training.kp_onlineorders_1'), t('training.kp_onlineorders_2'), t('training.kp_onlineorders_3')],
                },
            ],
        },
    ];

    const activeModule = modules.find((mod) => mod.id === activeModuleId) ?? modules[0];
    const activeModuleIndex = modules.findIndex((mod) => mod.id === activeModule.id);
    const activeModuleTotalMins = activeModule.lessons.reduce((s, l) => {
        const [m, sec] = l.duration.split(':').map(Number);
        return s + m + Math.ceil(sec / 60);
    }, 0);

    const diffConfig: Record<string, { bg: string; text: string; label: string }> = {
        Beginner:     { bg: 'bg-emerald-100', text: 'text-emerald-700', label: t('training.difficulty.beginner') },
        Intermediate: { bg: 'bg-amber-100',   text: 'text-amber-700',   label: t('training.difficulty.intermediate') },
        Advanced:     { bg: 'bg-rose-100',    text: 'text-rose-700',    label: t('training.difficulty.advanced') },
    };

    const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

    const resources = [
        {
            icon: <Download className="h-9 w-9" />,
            title: t('training.resource_manual'),
            desc: t('training.resource_manual_desc'),
            action: t('training.resource_manual_action'),
            href: '/resources/andgatepos-user-guide-en.pdf',
        },
        {
            icon: <BookOpen className="h-9 w-9" />,
            title: t('training.resource_manual_bn'),
            desc: t('training.resource_manual_bn_desc'),
            action: t('training.resource_manual_bn_action'),
            href: '/resources/andgatepos-user-guide-bn.pdf',
        },
        {
            icon: <Lightbulb className="h-9 w-9" />,
            title: t('training.resource_best_practices'),
            desc: t('training.resource_best_practices_desc'),
            action: t('training.resource_best_practices_action'),
            href: '/resources/best-practices',
        },
        {
            icon: <Users className="h-9 w-9" />,
            title: t('training.resource_support'),
            desc: t('training.resource_support_desc'),
            action: t('training.resource_support_action'),
            href: '/contact',
        },
    ];

    const modulePreviews: Record<string, string> = {
        'getting-started': '/assets/LandingImage/updated/dashboard.webp',
        'business-os': '/assets/LandingImage/updated/dashboard.webp',
        'store-config': '/assets/LandingImage/updated/store-list.webp',
        inventory: '/assets/LandingImage/updated/products.webp',
        purchases: '/assets/LandingImage/updated/purchase-create.webp',
        'pos-operations': '/assets/LandingImage/updated/pos.webp',
        customers: '/assets/LandingImage/updated/customer-due.webp',
        'expenses-accounting': '/assets/LandingImage/updated/profit-loss.webp',
        reports: '/assets/LandingImage/updated/sales-report.webp',
        'multi-store': '/assets/LandingImage/updated/store-list.webp',
        'online-store': '/assets/LandingImage/updated/mobile-dashboard.webp',
    };

    return (
        <MainLayout>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] pb-24 pt-32">
                <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-white/10 blur-[100px]" />
                <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-white/10 blur-[100px]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#046ca9]/30 bg-[#046ca9]/15 px-4 py-2 text-sm font-medium text-[#5bb8e8] backdrop-blur-sm">
                        <BookOpen className="h-4 w-4" />
                        {t('training.hero_badge')}
                    </div>
                    <h1 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
                        {t('training.page_title')}
                        <span className="block bg-gradient-to-r from-[#5bb8e8] to-[#e8f4fb] bg-clip-text text-transparent">
                            AndgatePOS
                        </span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
                        {t('training.page_subtitle')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {[
                            { icon: <Play className="h-4 w-4" />, label: `${totalLessons} ${t('training.stat_video_tutorials')}` },
                            { icon: <BookOpen className="h-4 w-4" />, label: `${modules.length} ${t('training.stat_topic_categories')}` },
                            { icon: <Zap className="h-4 w-4" />, label: t('training.stat_levels') },
                        ].map((chip, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm">
                                <span className="text-[#5bb8e8]">{chip.icon}</span>
                                {chip.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
            </section>

            {/* ── Curriculum Overview ── */}
            <section className="bg-gray-50 py-14 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('training.curriculum_title')}</h2>
                        <p className="mx-auto max-w-2xl text-base text-gray-500">{t('training.curriculum_subtitle')}</p>
                    </div>

                    <div className="mb-6 overflow-x-auto pb-2">
                        <div className="flex min-w-max gap-2">
                            {modules.map((mod) => (
                                <button
                                    key={mod.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveModuleId(mod.id);
                                        setPlaying(null);
                                    }}
                                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeModule.id === mod.id ? `${mod.accentBorder} ${mod.accentLight} ${mod.accentText}` : 'border-gray-200 bg-white text-gray-500 hover:border-[#046ca9]/20 hover:text-[#046ca9]'}`}
                                >
                                    {mod.num}. {mod.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {modules.map((mod) => (
                            <button
                                key={mod.id}
                                type="button"
                                onClick={() => {
                                    setActiveModuleId(mod.id);
                                    setPlaying(null);
                                }}
                                className={`group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${activeModule.id === mod.id ? `${mod.accentBorder} ring-2 ring-[#046ca9]/10` : 'border-gray-100'}`}
                            >
                                <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                    <Image
                                        src={modulePreviews[mod.id]}
                                        alt={mod.title}
                                        fill
                                        sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 100vw"
                                        className={`${mod.id === 'online-store' ? 'object-contain p-2' : 'object-cover object-top'} transition-transform duration-500 group-hover:scale-105`}
                                    />
                                </div>
                                {mod.isStartHere && (
                                    <div className="absolute right-3 top-3 rounded-full bg-[#e79237] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                                        {t('training.start_here')}
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mod.gradient} text-white shadow-sm`}>
                                        {mod.icon}
                                    </div>
                                    <div>
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className={`text-xs font-black uppercase tracking-wide ${mod.accentText}`}>{t('training.module_label')} {mod.num}</span>
                                            {activeModule.id === mod.id && <span className="rounded-full bg-[#046ca9] px-2 py-0.5 text-[10px] font-black text-white">{t('training.selected_module')}</span>}
                                        </div>
                                        <h3 className="text-sm font-bold leading-tight text-gray-900">{mod.title}</h3>
                                        <p className="mt-1 text-xs leading-5 text-gray-500">{mod.lessons.length} {t('training.stat_video_tutorials')}</p>
                                    </div>
                                </div>
                                <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${mod.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Selected Module ── */}
            <section className="border-t border-gray-100 bg-white py-14 sm:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                                <div className="text-5xl font-black leading-none text-white">{activeModule.num}</div>
                                <div className={`absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${activeModule.gradient} text-white shadow-md`}>
                                    {activeModule.icon}
                                </div>
                            </div>
                            <div>
                                {activeModule.isStartHere && (
                                    <span className="mb-1.5 inline-block rounded-full bg-[#e79237] px-3 py-0.5 text-[11px] font-black uppercase tracking-wide text-white">
                                        {t('training.start_here')}
                                    </span>
                                )}
                                <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">{activeModule.title}</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-500">{activeModule.desc}</p>
                            </div>
                        </div>
                        <div className={`flex flex-shrink-0 items-center gap-3 rounded-2xl border ${activeModule.accentBorder} ${activeModule.accentLight} px-5 py-3`}>
                            <div className="text-center">
                                <div className={`text-2xl font-black ${activeModule.accentText}`}>{activeModule.lessons.length}</div>
                                <div className="text-xs text-gray-500">{t('training.stat_video_tutorials')}</div>
                            </div>
                            <div className="h-8 w-px bg-gray-200" />
                            <div className="text-center">
                                <div className={`text-2xl font-black ${activeModule.accentText}`}>{activeModuleTotalMins}</div>
                                <div className="text-xs text-gray-500">{t('training.min_total')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        {activeModule.lessons.map((lesson, li) => {
                            const key = `${activeModule.id}-${li}`;
                            const isPlaying = playing === key;
                            const diff = diffConfig[lesson.difficulty] ?? diffConfig.Beginner;
                            const thumbnail = `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`;

                            return (
                                <article key={key} className={`group overflow-hidden rounded-2xl border ${isPlaying ? activeModule.accentBorder : 'border-gray-100'} bg-white shadow-sm transition-all hover:shadow-md`}>
                                    <div className="relative">
                                        {isPlaying ? (
                                            <>
                                                <ReactPlayer
                                                    url={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
                                                    playing
                                                    controls
                                                    width="100%"
                                                    height="220px"
                                                />
                                                <button
                                                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                                                    onClick={() => setPlaying(null)}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </>
                                        ) : (
                                            <button type="button" className="relative block w-full text-left" onClick={() => setPlaying(key)}>
                                                <Image src={thumbnail} alt={lesson.title} width={640} height={360} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${activeModule.gradient} shadow-xl`}>
                                                        <Play className="h-5 w-5 fill-white text-white" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/75 px-2 py-0.5 text-xs font-semibold text-white">
                                                    {lesson.duration}
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${activeModule.gradient} text-xs font-black text-white shadow-sm`}>
                                                    {li + 1}
                                                </div>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${activeModule.accentText}`}>
                                                    {t('training.lesson_label')} {li + 1}
                                                </span>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${diff.bg} ${diff.text}`}>
                                                {diff.label}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{lesson.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-gray-500">{lesson.desc}</p>
                                        <ul className="mt-4 space-y-2">
                                            {lesson.points.map((pt, pi) => (
                                                <li key={pi} className="flex items-start gap-2">
                                                    <CheckCircle className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${activeModule.accentText}`} />
                                                    <span className="text-sm leading-6 text-gray-600">{pt}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            type="button"
                                            onClick={() => setPlaying(isPlaying ? null : key)}
                                            className={`mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${activeModule.gradient} px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-105 active:scale-95`}
                                        >
                                            <Play className="h-3.5 w-3.5 fill-white" />
                                            {t('training.watch_lesson')}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <RotateCcw className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-600">
                                {activeModule.num} / {modules.length} — {activeModule.title}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {activeModuleIndex > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveModuleId(modules[activeModuleIndex - 1].id);
                                        setPlaying(null);
                                    }}
                                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition hover:text-[#046ca9]"
                                >
                                    {t('training.previous_module')}
                                </button>
                            )}
                            {activeModuleIndex < modules.length - 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveModuleId(modules[activeModuleIndex + 1].id);
                                        setPlaying(null);
                                    }}
                                    className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${activeModule.gradient} px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-105`}
                                >
                                    {t('training.next_module')}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Resources ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#046ca9] via-[#035887] to-[#034d79] py-24">
                <div className="absolute left-1/4 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-14 text-center">
                        <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">{t('training.resources_title')}</h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-400">{t('training.resources_subtitle')}</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {resources.map((res, i) => (
                            <div key={i} className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-[#046ca9]/30 hover:bg-white/10">
                                <div className="mb-5 text-[#5bb8e8] transition-transform group-hover:scale-110">{res.icon}</div>
                                <h3 className="mb-3 text-lg font-bold text-white">{res.title}</h3>
                                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">{res.desc}</p>
                                <a
                                    href={res.href}
                                    className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white hover:text-[#046ca9]"
                                >
                                    {res.action}
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
