import { Award, Tag, X } from 'lucide-react';
import React from 'react';
import type { Brand, Category } from './types';

interface FilterButtonsProps {
    selectedCategory: Category | null;
    selectedBrand: Brand | null;
    onCategoryClick: () => void;
    onBrandClick: () => void;
    onClearFilters: () => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ selectedCategory, selectedBrand, onCategoryClick, onBrandClick, onClearFilters }) => {
    return (
        <>
            {/* Filter Buttons */}
            <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
                <button
                    onClick={onCategoryClick}
                    className="flex items-center space-x-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs transition-colors hover:bg-blue-100 sm:space-x-2 sm:px-4 sm:py-2 sm:text-sm"
                >
                    <Tag className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                    <span className="font-medium text-blue-700">{selectedCategory ? selectedCategory.name || selectedCategory.category_name : 'Category'}</span>
                </button>

                <button
                    onClick={onBrandClick}
                    className="flex items-center space-x-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs transition-colors hover:bg-green-100 sm:space-x-2 sm:px-4 sm:py-2 sm:text-sm"
                >
                    <Award className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
                    <span className="font-medium text-green-700">{selectedBrand ? selectedBrand.name || selectedBrand.brand_name : 'Brand'}</span>
                </button>

                {(selectedCategory || selectedBrand) && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center space-x-1.5 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs transition-colors hover:bg-red-100 sm:space-x-2 sm:px-3 sm:py-2 sm:text-sm"
                    >
                        <X className="h-3.5 w-3.5 text-red-600 sm:h-4 sm:w-4" />
                        <span className="font-medium text-red-700">Clear</span>
                    </button>
                )}
            </div>

            {/* Active Filters Display */}
            {(selectedCategory || selectedBrand) && (
                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                    <div className="flex flex-wrap gap-2">
                        {selectedCategory && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                <Tag className="mr-1 h-3 w-3" />
                                {selectedCategory.name || selectedCategory.category_name}
                            </span>
                        )}
                        {selectedBrand && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                <Award className="mr-1 h-3 w-3" />
                                {selectedBrand.name || selectedBrand.brand_name}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FilterButtons;
