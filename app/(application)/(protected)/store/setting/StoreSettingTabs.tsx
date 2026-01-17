'use client';

import { Camera, Clock, Coins, CreditCard, Flag, Gift, ListChecks, Package, RotateCcw, Settings as SettingsIcon, Shield, Store, Tag } from 'lucide-react';
import React from 'react';

interface Tab {
    id: string;
    label: string;
    icon: any;
    description: string;
}

const tabs: Tab[] = [
    { id: 'basic', label: 'Basic Info', icon: Store, description: 'Store details' },
    { id: 'hours', label: 'Operating Hours', icon: Clock, description: 'Store timings' },
    { id: 'units', label: 'Units', icon: Package, description: 'Product units' },
    { id: 'attributes', label: 'Attributes', icon: Tag, description: 'Product attributes' },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard, description: 'Tender options' },
    { id: 'currency', label: 'Currency', icon: Coins, description: 'Currency settings' },
    { id: 'paymentstatus', label: 'Payment Status', icon: Flag, description: 'Status options' },
    { id: 'warranty', label: 'Warranty Types', icon: Shield, description: 'Warranty options' },
    { id: 'adjustment', label: 'Adjustment Reasons', icon: ListChecks, description: 'Stock adjustments' },
    { id: 'returnreasons', label: 'Return Reasons', icon: RotateCcw, description: 'Order returns' },
    { id: 'loyalty', label: 'Loyalty Program', icon: Gift, description: 'Rewards settings' },
    { id: 'branding', label: 'Branding', icon: Camera, description: 'Logo & visuals' },
    { id: 'status', label: 'Store Status', icon: SettingsIcon, description: 'Active/Inactive' },
];

interface StoreSettingTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const StoreSettingTabs: React.FC<StoreSettingTabsProps> = ({ activeTab, onTabChange }) => {
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
                                    ${isActive ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'}
                                `}
                            >
                                <div
                                    className={`rounded-lg p-1.5 transition-colors ${
                                        isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-semibold ${isActive ? 'text-emerald-900' : 'text-gray-700'}`}>{tab.label}</p>
                                    <p className={`text-[10px] ${isActive ? 'text-emerald-700' : 'text-gray-500'}`}>{tab.description}</p>
                                </div>
                                {isActive && <div className="absolute -bottom-1 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-full bg-emerald-500" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default StoreSettingTabs;
