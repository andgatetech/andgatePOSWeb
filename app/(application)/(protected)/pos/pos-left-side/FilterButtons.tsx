'use client';
import { getTranslation } from '@/i18n';
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

const FilterButtons: React.FC<FilterButtonsProps> = ({
    selectedCategory,
    selectedBrand,
    onCategoryClick,
    onBrandClick,
    onClearFilters,
}) => {
    const { t } = getTranslation();
    const categoryLabel = selectedCategory
        ? (selectedCategory.name || selectedCategory.category_name)
        : t('lbl_category');
    const brandLabel = selectedBrand
        ? (selectedBrand.name || selectedBrand.brand_name)
        : t('lbl_brand');

    const hasFilter = !!(selectedCategory || selectedBrand);

    return (
        <div className="mb-3 flex flex-wrap gap-1.5">
            {/* Category filter pill */}
            <button
                onClick={onCategoryClick}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary'
                }`}
            >
                <Tag className="h-3 w-3" />
                <span className="max-w-[100px] truncate">{categoryLabel}</span>
            </button>

            {/* Brand filter pill */}
            <button
                onClick={onBrandClick}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedBrand
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary'
                }`}
            >
                <Award className="h-3 w-3" />
                <span className="max-w-[100px] truncate">{brandLabel}</span>
            </button>

            {/* Clear — only when filter active */}
            {hasFilter && (
                <button
                    onClick={onClearFilters}
                    className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                    <X className="h-3 w-3" />
                    {t('btn_clear')}
                </button>
            )}
        </div>
    );
};

export default FilterButtons;
