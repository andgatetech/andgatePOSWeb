import { Award, Search, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import type { Brand } from './types';

interface BrandPanelProps {
    isOpen: boolean;
    brands: Brand[];
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSelect: (brand: Brand) => void;
    onClose: () => void;
}

const BrandPanel: React.FC<BrandPanelProps> = ({ isOpen, brands, isLoading, searchTerm, onSearchChange, onSelect, onClose }) => {
    if (!isOpen) return null;

    const filteredBrands = brands.filter((brand: any) => (brand.name || brand.brand_name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="absolute inset-0 z-50 flex">
            <div className="flex w-full flex-col overflow-hidden border-r bg-white shadow-2xl sm:w-96 md:w-[28rem]">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-gray-50 p-3 sm:p-4">
                    <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Select Brand</h2>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1.5 transition-colors hover:bg-gray-200 sm:p-2">
                        <X className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="border-b p-3 sm:p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search brands..."
                            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Brands List */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {isLoading ? (
                            <div className="col-span-2 py-8 text-center">
                                <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-green-600"></div>
                            </div>
                        ) : filteredBrands.length > 0 ? (
                            filteredBrands.map((brand: any) => (
                                <div
                                    key={brand.id}
                                    onClick={() => onSelect(brand)}
                                    className="cursor-pointer rounded-lg border border-gray-200 p-3 text-center transition-all duration-200 hover:border-green-300 hover:bg-green-50"
                                >
                                    {brand.image ? (
                                        <div className="mx-auto mb-2 h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${brand.image}`}
                                                alt={brand.name || brand.brand_name}
                                                width={48}
                                                height={48}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                            <Award className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                    <p className="truncate text-xs font-medium text-gray-900">{brand.name || brand.brand_name}</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-8 text-center text-gray-500">No brands found</div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-black bg-opacity-25" onClick={onClose}></div>
        </div>
    );
};

export default BrandPanel;
