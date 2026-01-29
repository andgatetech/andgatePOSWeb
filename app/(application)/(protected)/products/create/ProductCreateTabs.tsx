'use client';
import { Barcode, DollarSign, Hash, Image as ImageIcon, Info, Package, Receipt, Shield, Sliders, Tag } from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon: any;
    description: string;
}

const tabs: Tab[] = [
    { id: 'basic', label: 'Basic Info', icon: Info, description: 'Name, description, category' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Purchase, selling, wholesale price' },
    { id: 'stock', label: 'Stock', icon: Package, description: 'Quantity, unit, availability' },
    { id: 'attributes', label: 'Attributes', icon: Tag, description: 'Color, size, variants' },
    { id: 'variants', label: 'Variants', icon: Sliders, description: 'Configure variant details' },
    { id: 'warranty', label: 'Warranty', icon: Shield, description: 'Warranty terms & period' },
    { id: 'serial', label: 'Serial/IMEI', icon: Hash, description: 'Serial number tracking' },
    { id: 'tax', label: 'Tax', icon: Receipt, description: 'Tax rate & inclusion' },
    { id: 'sku', label: 'SKU', icon: Barcode, description: 'Stock keeping unit' },
    { id: 'images', label: 'Images', icon: ImageIcon, description: 'Product photos' },
];

interface ProductCreateTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    visibleTabs: string[];
}

const ProductCreateTabs = ({ activeTab, onTabChange, visibleTabs }: ProductCreateTabsProps) => {
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
