import { Package, X } from 'lucide-react';
import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from './types';

interface ProductGridProps {
    products: Product[];
    searchTerm: string;
    selectedCategory: any;
    selectedBrand: any;
    leftWidth: number;
    isMobileView: boolean;
    onAddToCart: (product: Product) => void;
    onImageShow: (product: Product) => void;
    onClearFilters: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, searchTerm, selectedCategory, selectedBrand, leftWidth, isMobileView, onAddToCart, onImageShow, onClearFilters }) => {
    if (products.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 sm:py-16">
                <Package className="mb-4 h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
                <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">No Products Found</h3>
                <p className="mb-4 max-w-md text-center text-sm text-gray-600 sm:text-base">
                    {selectedCategory || selectedBrand ? (
                        <>
                            No products match your selected filters.
                            <br />
                            Try selecting different filters or clear them to see all products.
                        </>
                    ) : searchTerm ? (
                        <>
                            No products match your search &quot;{searchTerm}&quot;.
                            <br />
                            Try different keywords or check the spelling.
                        </>
                    ) : (
                        <>
                            No products available in this store.
                            <br />
                            Please add products to get started.
                        </>
                    )}
                </p>
                {(selectedCategory || selectedBrand || searchTerm) && (
                    <button onClick={onClearFilters} className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                        <X className="h-4 w-4" />
                        <span>Clear All Filters</span>
                    </button>
                )}
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
                <ProductCard key={product.id} product={product} leftWidth={leftWidth} isMobileView={isMobileView} onAddToCart={onAddToCart} onImageShow={onImageShow} />
            ))}
        </div>
    );
};

export default ProductGrid;
