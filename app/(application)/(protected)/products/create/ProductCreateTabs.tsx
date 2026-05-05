'use client';
import { Barcode, DollarSign, Hash, Image as ImageIcon, Info, Package, Receipt, Shield, Sliders, Tag } from 'lucide-react';
import { getTranslation } from '@/i18n';

interface Tab {
    id: string;
    label: string;
    icon: any;
    description: string;
}


interface ProductCreateTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    visibleTabs: string[];
}

const ProductCreateTabs = ({ activeTab, onTabChange, visibleTabs }: ProductCreateTabsProps) => {
    const { t } = getTranslation();
    const tabs: Tab[] = [
        { id: 'basic', label: t('lbl_basic_info'), icon: Info, description: t('tab_desc_basic') },
        { id: 'pricing', label: t('lbl_pricing'), icon: DollarSign, description: t('tab_desc_pricing') },
        { id: 'stock', label: t('lbl_stock'), icon: Package, description: t('tab_desc_stock') },
        { id: 'attributes', label: t('store_attributes_title'), icon: Tag, description: t('tab_desc_attributes') },
        { id: 'variants', label: t('lbl_variant'), icon: Sliders, description: t('tab_desc_variants') },
        { id: 'warranty', label: t('lbl_warranty'), icon: Shield, description: t('tab_desc_warranty') },
        { id: 'serial', label: t('lbl_serial'), icon: Hash, description: t('tab_desc_serial') },
        { id: 'tax', label: t('lbl_tax'), icon: Receipt, description: t('tab_desc_tax') },
        { id: 'images', label: t('lbl_images'), icon: ImageIcon, description: t('tab_desc_images') },
        { id: 'sku', label: t('lbl_sku'), icon: Barcode, description: t('tab_desc_sku') },
    ];
    // Filter tabs to only show visible ones
    const displayTabs = tabs.filter((tab) => visibleTabs.includes(tab.id));

    return (
        <>
            {/* Desktop & Tablet Tabs */}
            <div className="sticky top-0 z-10 mb-4 hidden overflow-x-auto border-b border-gray-200 bg-white [-ms-overflow-style:none] [scrollbar-width:none] md:block [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-2 p-3">
                    {displayTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onTabChange(tab.id)}
                                className={`
                                    group relative flex flex-col items-center gap-1.5 rounded-lg border px-4 py-2.5 transition-all duration-200
                                    ${isActive ? 'border-gray-300 bg-gray-100 shadow-sm' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'}
                                `}
                            >
                                <div
                                    className={`rounded-lg p-1.5 transition-colors ${isActive ? 'bg-gray-700 text-white' : 'bg-white text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-800'}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{tab.label}</p>
                                    <p className={`text-[10px] leading-tight ${isActive ? 'text-gray-600' : 'text-gray-500'}`}>{tab.description}</p>
                                </div>
                                {isActive && <div className="absolute -bottom-[1px] left-0 h-[2px] w-full bg-gray-700" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default ProductCreateTabs;
