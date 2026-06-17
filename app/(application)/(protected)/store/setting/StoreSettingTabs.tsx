'use client';

import { Camera, Clock, Coins, CreditCard, Flag, Gift, ListChecks, Package, RotateCcw, Settings as SettingsIcon, Shield, Store, Tag } from 'lucide-react';
import React from 'react';
import { getTranslation } from '@/i18n';

interface Tab {
    id: string;
    label: string;
    icon: any;
    description: string;
}

interface TabGroup {
    title: string;
    description: string;
    tabs: Tab[];
}

interface StoreSettingTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const StoreSettingTabs: React.FC<StoreSettingTabsProps> = ({ activeTab, onTabChange }) => {
    const { t } = getTranslation();
    const groups: TabGroup[] = [
        {
            title: t('store_settings_group_profile'),
            description: t('store_settings_group_profile_desc'),
            tabs: [
                { id: 'basic', label: t('lbl_basic_info'), icon: Store, description: t('store_tab_desc_basic') },
                { id: 'hours', label: t('store_operating_hours'), icon: Clock, description: t('store_tab_desc_hours') },
                { id: 'branding', label: t('store_branding'), icon: Camera, description: t('store_tab_desc_branding') },
                { id: 'status', label: t('lbl_status'), icon: SettingsIcon, description: t('store_tab_desc_status') },
            ],
        },
        {
            title: t('store_settings_group_inventory'),
            description: t('store_settings_group_inventory_desc'),
            tabs: [
                { id: 'units', label: t('lbl_units'), icon: Package, description: t('store_tab_desc_units') },
                { id: 'attributes', label: t('store_attributes_title'), icon: Tag, description: t('store_tab_desc_attributes') },
                { id: 'adjustment', label: t('lbl_adjustment_reasons'), icon: ListChecks, description: t('store_tab_desc_adjustment') },
            ],
        },
        {
            title: t('store_settings_group_checkout'),
            description: t('store_settings_group_checkout_desc'),
            tabs: [
                { id: 'payment', label: t('store_payment_methods'), icon: CreditCard, description: t('store_tab_desc_payment') },
                { id: 'currency', label: t('store_currency_title'), icon: Coins, description: t('store_tab_desc_currency') },
                { id: 'paymentstatus', label: t('order_payment_status'), icon: Flag, description: t('store_tab_desc_payment_status') },
            ],
        },
        {
            title: t('store_settings_group_after_sales'),
            description: t('store_settings_group_after_sales_desc'),
            tabs: [
                { id: 'warranty', label: t('lbl_warranty_types'), icon: Shield, description: t('store_tab_desc_warranty') },
                { id: 'returnreasons', label: t('lbl_return_reason'), icon: RotateCcw, description: t('store_tab_desc_return_reasons') },
                { id: 'loyalty', label: t('store_loyalty_title'), icon: Gift, description: t('store_tab_desc_loyalty') },
            ],
        },
    ];

    return (
        <>
            {/* Desktop & Tablet Tabs */}
            <div className="mb-8 hidden space-y-4 md:block">
                {groups.map((group) => (
                    <section key={group.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">{group.title}</h2>
                                <p className="text-xs text-slate-500">{group.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
                            {group.tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => onTabChange(tab.id)}
                                        className={`
                                            group relative flex min-h-[76px] items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200
                                            ${isActive ? 'border-[#046ca9] bg-[#046ca9]/5 shadow-sm' : 'border-gray-200 bg-slate-50 hover:border-[#046ca9]/30 hover:bg-[#046ca9]/5'}
                                        `}
                                    >
                                        <div
                                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                isActive ? 'bg-[#046ca9] text-white' : 'bg-white text-gray-600 group-hover:bg-[#046ca9]/10 group-hover:text-[#046ca9]'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`truncate text-sm font-semibold ${isActive ? 'text-[#034d79]' : 'text-gray-800'}`}>{tab.label}</p>
                                            <p className={`mt-0.5 line-clamp-2 text-xs leading-4 ${isActive ? 'text-[#046ca9]' : 'text-gray-500'}`}>{tab.description}</p>
                                        </div>
                                        {isActive && <div className="absolute inset-y-3 right-0 w-1 rounded-l-full bg-[#e79237]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
};

export default StoreSettingTabs;
