'use client';

import { Barcode, DollarSign, Hash, Image as ImageIcon, Info, Package, Receipt, Shield, Sliders, Tag, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

interface Tab {
    id: string;
    label: string;
    icon: any;
}

const tabs: Tab[] = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'attributes', label: 'Attributes', icon: Tag },
    { id: 'variants', label: 'Variants', icon: Sliders },
    { id: 'warranty', label: 'Warranty', icon: Shield },
    { id: 'serial', label: 'Serial/IMEI', icon: Hash },
    { id: 'tax', label: 'Tax', icon: Receipt },
    { id: 'sku', label: 'SKU', icon: Barcode },
    { id: 'images', label: 'Images', icon: ImageIcon },
];

interface MobileTabFABProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    visibleTabs: string[];
}

const MobileTabFAB: React.FC<MobileTabFABProps> = ({ activeTab, onTabChange, visibleTabs }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Filter tabs to only show visible ones
    const displayTabs = tabs.filter((tab) => visibleTabs.includes(tab.id));

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
                        <h3 className="text-base font-bold text-gray-900">Product Sections</h3>
                        <button onClick={() => setIsOpen(false)} className="rounded-full bg-gray-100 p-1.5 text-gray-600 transition-colors hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {displayTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-all ${
                                        isActive ? 'border-gray-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
                                    }`}
                                >
                                    <div className={`rounded-lg p-1.5 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-xs font-medium ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>{tab.label}</span>
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
                            src="/assets/images/shopping-bag.png"
                            alt="Add Product"
                            fill
                            className="object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    const icon = document.createElement('div');
                                    icon.innerHTML =
                                        '<svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>';
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

export default MobileTabFAB;


