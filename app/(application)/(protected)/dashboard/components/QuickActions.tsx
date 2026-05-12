'use client';

import { getTranslation } from '@/i18n';
import { Package, Receipt, ShoppingCart, Zap } from 'lucide-react';
import Link from 'next/link';

const ACTIONS = [
    {
        labelKey: 'lbl_new_sale',
        href: '/pos',
        icon: Zap,
        gradient: 'from-[#046ca9] to-[#034d79]',
        shadow: 'shadow-[#046ca9]/30',
    },
    {
        labelKey: 'lbl_add_product',
        href: '/products/create',
        icon: Package,
        gradient: 'from-[#0f9f6e] to-[#047857]',
        shadow: 'shadow-[#047857]/30',
    },
    {
        labelKey: 'purchase_title',
        href: '/purchases/create',
        icon: ShoppingCart,
        gradient: 'from-[#6d5dfc] to-[#4338ca]',
        shadow: 'shadow-[#4338ca]/30',
    },
    {
        labelKey: 'lbl_add_expense',
        href: '/expenses/create',
        icon: Receipt,
        gradient: 'from-[#f43f5e] to-[#be123c]',
        shadow: 'shadow-[#be123c]/30',
    },
];

export default function QuickActions() {
    const { t } = getTranslation();

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ACTIONS.map(({ labelKey, href, icon: Icon, gradient, shadow }) => (
                <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-3 rounded-xl bg-gradient-to-r ${gradient} px-4 py-3.5 shadow-lg ${shadow} transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl`}
                >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 transition-transform duration-200 group-hover:scale-110">
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">{t(labelKey)}</span>
                </Link>
            ))}
        </div>
    );
}
