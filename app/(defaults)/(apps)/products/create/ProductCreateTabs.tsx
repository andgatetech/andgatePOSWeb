'use client';
import { Barcode, DollarSign, Hash, Image as ImageIcon, Info, Package, Receipt, Shield, Tag } from 'lucide-react';

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
    { id: 'warranty', label: 'Warranty', icon: Shield, description: 'Warranty terms & period' },
    { id: 'serial', label: 'Serial', icon: Hash, description: 'Serial number tracking' },
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
            <div className="mb-8 hidden overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:block [&::-webkit-scrollbar]:hidden">
                <div className="m-1 grid grid-cols-2 gap-2 lg:grid-cols-4 xl:grid-cols-8">
                    {displayTabs.map((tab) => {
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

export default ProductCreateTabs;
