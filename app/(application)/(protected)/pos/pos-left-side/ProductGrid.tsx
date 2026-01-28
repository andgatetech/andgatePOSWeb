import { Package } from 'lucide-react';
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

const ProductGrid: React.FC<ProductGridProps> = ({ products, leftWidth, isMobileView, onAddToCart, onImageShow, mode = 'pos' }) => {
    if (products.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 sm:py-16">
                <Package className="mb-4 h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
                <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">No Products Found</h3>
                <p className="mb-4 max-w-md text-center text-sm text-gray-600 sm:text-base">
                    No products match your current filters or search.
                    <br />
                    Try adjusting your filters or search terms.
                </p>
            </div>
        );
    }

    return (
        <div
            className="grid gap-3 sm:gap-4"
            style={{
                gridTemplateColumns: isMobileView
                    ? 'repeat(auto-fill, minmax(140px, 1fr))'
                    : leftWidth > 60
                    ? 'repeat(auto-fill, minmax(200px, 1fr))'
                    : leftWidth > 45
                    ? 'repeat(auto-fill, minmax(180px, 1fr))'
                    : 'repeat(auto-fill, minmax(160px, 1fr))',
            }}
        >
            {products.map((product) => (
                <ProductCard key={product.id} product={product} leftWidth={leftWidth} isMobileView={isMobileView} onAddToCart={onAddToCart} onImageShow={onImageShow} mode={mode} />
            ))}
        </div>
    );
};

export default ProductGrid;
