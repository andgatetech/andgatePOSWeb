'use client';
import { getTranslation } from '@/i18n';
import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from './types';

interface ProductGridProps {
    products: Product[];
    leftWidth: number;
    isMobileView: boolean;
    onAddToCart: (product: Product) => void;
    onImageShow: (product: Product) => void;
    mode?: 'pos' | 'stock' | 'label' | 'orderEdit' | 'orderReturn' | 'purchase';
}

const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    leftWidth,
    isMobileView,
    onAddToCart,
    onImageShow,
    mode = 'pos',
}) => {
    const { t } = getTranslation();

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 py-16">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                    <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <p className="text-sm font-semibold text-gray-500">{t('msg_no_data')}</p>
                <p className="mt-1 text-xs text-gray-400">{t('pos_search_product')}</p>
            </div>
        );
    }

    return (
        <div
            className="grid gap-2.5 sm:gap-3"
            style={{
                gridTemplateColumns: isMobileView
                    ? 'repeat(auto-fill, minmax(130px, 1fr))'
                    : leftWidth > 60
                    ? 'repeat(auto-fill, minmax(190px, 1fr))'
                    : leftWidth > 45
                    ? 'repeat(auto-fill, minmax(165px, 1fr))'
                    : 'repeat(auto-fill, minmax(145px, 1fr))',
            }}
        >
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    leftWidth={leftWidth}
                    isMobileView={isMobileView}
                    onAddToCart={onAddToCart}
                    onImageShow={onImageShow}
                    mode={mode}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
