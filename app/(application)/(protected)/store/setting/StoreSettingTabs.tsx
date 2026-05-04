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

interface StoreSettingTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const StoreSettingTabs: React.FC<StoreSettingTabsProps> = ({ activeTab, onTabChange }) => {
    const { t } = getTranslation();
    const tabs: Tab[] = [
        { id: 'basic', label: t('lbl_basic_info'), icon: Store, description: t('store_tab_desc_basic') },
        { id: 'hours', label: t('store_operating_hours'), icon: Clock, description: t('store_tab_desc_hours') },
        { id: 'units', label: t('lbl_units'), icon: Package, description: t('store_tab_desc_units') },
        { id: 'attributes', label: t('store_attributes_title'), icon: Tag, description: t('store_tab_desc_attributes') },
        { id: 'payment', label: t('store_payment_methods'), icon: CreditCard, description: t('store_tab_desc_payment') },
        { id: 'currency', label: t('store_currency_title'), icon: Coins, description: t('store_tab_desc_currency') },
        { id: 'paymentstatus', label: t('order_payment_status'), icon: Flag, description: t('store_tab_desc_payment_status') },
        { id: 'warranty', label: t('lbl_warranty_types'), icon: Shield, description: t('store_tab_desc_warranty') },
        { id: 'adjustment', label: t('lbl_adjustment_reasons'), icon: ListChecks, description: t('store_tab_desc_adjustment') },
        { id: 'returnreasons', label: t('lbl_return_reason'), icon: RotateCcw, description: t('store_tab_desc_return_reasons') },
        { id: 'loyalty', label: t('store_loyalty_title'), icon: Gift, description: t('store_tab_desc_loyalty') },
        { id: 'branding', label: t('store_branding'), icon: Camera, description: t('store_tab_desc_branding') },
        { id: 'status', label: t('lbl_status'), icon: SettingsIcon, description: t('store_tab_desc_status') },
    ];
    return (
        <>
            {/* Desktop & Tablet Tabs */}
            <div className="mb-8 hidden overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:block [&::-webkit-scrollbar]:hidden">
                <div className="m-1 grid grid-cols-2 gap-2 lg:grid-cols-4 xl:grid-cols-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onTabChange(tab.id)}
                                className={`
                                    group relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200
                                    ${isActive ? 'border-[#046ca9] bg-[#046ca9]/5 shadow-md' : 'border-gray-200 bg-white hover:border-[#046ca9]/30 hover:bg-[#046ca9]/5'}
                                `}
                            >
                                <div
                                    className={`rounded-lg p-1.5 transition-colors ${
                                        isActive ? 'bg-[#046ca9] text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-[#046ca9]/10 group-hover:text-[#046ca9]'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-semibold ${isActive ? 'text-[#034d79]' : 'text-gray-700'}`}>{tab.label}</p>
                                    <p className={`text-[10px] ${isActive ? 'text-[#046ca9]' : 'text-gray-500'}`}>{tab.description}</p>
                                </div>
                                {isActive && <div className="absolute -bottom-1 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-full bg-[#e79237]" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default StoreSettingTabs;
