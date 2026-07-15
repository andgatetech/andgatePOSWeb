'use client';

import { Camera, Clock, Coins, CreditCard, Flag, Gift, ListChecks, Package, RotateCcw, Settings as SettingsIcon, Shield, Smartphone, Store, Tag } from 'lucide-react';
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
                { id: 'mfs', label: t('store_mfs_accounts'), icon: Smartphone, description: t('store_tab_desc_mfs') },
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
    const activeGroup = groups.find((group) => group.tabs.some((tab) => tab.id === activeTab)) || groups[0];

    return (
        <>
            {/* Desktop & Tablet Tabs */}
            <div className="sticky top-[68px] z-20 mb-5 hidden rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur md:block">
                <div className="mb-3 flex flex-wrap gap-2">
                    {groups.map((group) => {
                        const isActive = group === activeGroup;
                        return (
                            <button
                                key={group.title}
                                type="button"
                                onClick={() => onTabChange(group.tabs[0].id)}
                                className={`rounded-md px-3 py-2 text-left text-xs font-semibold transition ${
                                    isActive ? 'bg-[#046ca9] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-[#046ca9]/10 hover:text-[#034d79]'
                                }`}
                            >
                                {group.title}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-slate-900">{activeGroup.title}</h2>
                        <p className="text-xs text-slate-500">{activeGroup.description}</p>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-wrap gap-2 lg:justify-end">
                        {activeGroup.tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => onTabChange(tab.id)}
                                    title={tab.description}
                                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                                        isActive ? 'border-[#046ca9] bg-[#046ca9]/5 text-[#034d79]' : 'border-slate-200 bg-white text-slate-700 hover:border-[#046ca9]/30 hover:bg-[#046ca9]/5'
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#046ca9]' : 'text-slate-500'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StoreSettingTabs;
