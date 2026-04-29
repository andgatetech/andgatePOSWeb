'use client';

import { Camera, Clock, Coins, CreditCard, Flag, Gift, ListChecks, Package, RotateCcw, Settings, Shield, Store, Tag, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { getTranslation } from '@/i18n';

interface MobileStoreSettingFABProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}


const MobileStoreSettingFAB: React.FC<MobileStoreSettingFABProps> = ({ activeTab, onTabChange }) => {
    const { t } = getTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const tabs = [
        { id: 'basic', label: t('lbl_basic_info'), icon: Store },
        { id: 'hours', label: t('lbl_hours'), icon: Clock },
        { id: 'units', label: t('lbl_units'), icon: Package },
        { id: 'attributes', label: t('store_attributes_title'), icon: Tag },
        { id: 'payment', label: t('lbl_payment_method'), icon: CreditCard },
        { id: 'currency', label: t('store_currency_title'), icon: Coins },
        { id: 'paymentstatus', label: t('order_payment_status'), icon: Flag },
        { id: 'warranty', label: t('lbl_warranty'), icon: Shield },
        { id: 'adjustment', label: t('lbl_adjustments'), icon: ListChecks },
        { id: 'returnreasons', label: t('lbl_returns'), icon: RotateCcw },
        { id: 'loyalty', label: t('store_loyalty_title'), icon: Gift },
        { id: 'branding', label: t('store_branding'), icon: Camera },
        { id: 'status', label: t('lbl_status'), icon: Settings },
    ];

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleTabClick = (tabId: string) => {
        onTabChange(tabId);
        setIsOpen(false);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />}

            {/* Slide-up Menu */}
            <div className={`fixed inset-x-0 bottom-0 z-50 transform rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 md:hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">{t('store_settings_title')}</h3>
                        <button onClick={() => setIsOpen(false)} className="rounded-full bg-gray-100 p-1.5 text-gray-600 transition-colors hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                                        isActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-300'
                                    }`}
                                >
                                    <div className={`rounded-lg p-1.5 ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-xs font-medium ${isActive ? 'text-emerald-900' : 'text-gray-700'}`}>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FAB Button */}
            <button
                type="button"
                onClick={toggleMenu}
                className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 md:hidden ${
                    isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-white hover:shadow-xl'
                }`}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <div className="relative h-8 w-8">
                        <Image
                            src="/assets/images/settings-icon.png"
                            alt="Settings"
                            fill
                            className="object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    const icon = document.createElement('div');
                                    icon.innerHTML =
                                        '<svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
                                    parent.appendChild(icon);
                                }
                            }}
                        />
                    </div>
                )}
            </button>
        </>
    );
};

export default MobileStoreSettingFAB;
