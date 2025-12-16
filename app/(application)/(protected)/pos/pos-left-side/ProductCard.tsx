import { Eye, Package } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import type { Product } from './types';

interface ProductCardProps {
    product: Product;
    leftWidth?: number;
    isMobileView?: boolean;
    onAddToCart: (product: Product) => void;
    onImageShow: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, leftWidth = 50, isMobileView = false, onAddToCart, onImageShow }) => {
    // Calculate total quantity from stocks
    const totalQuantity = product.stocks?.reduce((sum: number, stock: any) => sum + parseFloat(stock.quantity || '0'), 0) || 0;
    const isUnavailable = product.available === false || totalQuantity <= 0;

    const renderProductImage = () => {
        // Try product-level images first
        if (product.images && product.images.length > 0) {
            const imgSrc =
                typeof product.images[0] === 'string'
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${product.images[0]}`
                    : `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${product.images[0].image_path || product.images[0]}`;
            return <Image src={imgSrc} alt={product.product_name} fill className="object-cover" />;
        }

        // If no product images, try first variant's first image
        const firstVariant = product.stocks?.find((s: any) => s.is_variant && s.images && s.images.length > 0);
        if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
            const variantImg = firstVariant.images[0];
            let imgPath = '';
            if (typeof variantImg === 'string') {
                imgPath = variantImg;
            } else {
                imgPath = variantImg.path || variantImg.url || '';
            }
            const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
            const imgSrc = `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${cleanPath}`;
            return <Image src={imgSrc} alt={product.product_name} fill className="object-cover" />;
        }

        // No images - show placeholder
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
                <Package className="mb-1 h-8 w-8 sm:mb-2 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                <span className="text-xs font-medium sm:text-sm">No Image</span>
            </div>
        );
    };

    const renderPrice = () => {
        // Check if product has variants
        const hasVariants = product.stocks && product.stocks.some((s: any) => s.is_variant);
        if (hasVariants) {
            const prices = product.stocks!.filter((s: any) => s.is_variant).map((s: any) => parseFloat(s.price as string));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            return (
                <span className="text-xs font-semibold text-green-600 sm:text-sm">
                    ৳{minPrice.toFixed(2)} - ৳{maxPrice.toFixed(2)}
                </span>
            );
        }
        // Simple product - show regular price
        const primaryStock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;
        const price = parseFloat((primaryStock?.price || product.price || 0) as string);
        return <span className="text-xs font-semibold text-green-600 sm:text-sm">৳{price.toFixed(2)}</span>;
    };

    return (
        <div
            className={`relative cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${isUnavailable ? 'opacity-60' : 'hover:scale-[1.02]'}`}
            onClick={() => !isUnavailable && onAddToCart(product)}
        >
            {/* Product Image */}
            <div className="relative h-32 overflow-hidden rounded-t-lg bg-gray-100 sm:h-40 md:h-44">
                {renderProductImage()}

                {/* Open modal */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageShow(product);
                    }}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 sm:right-2 sm:top-2 sm:p-2"
                >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
            </div>

            {/* Info */}
            <div className="p-2 sm:p-3">
                <h3 className="mb-1 line-clamp-2 text-xs font-semibold text-gray-900 sm:text-sm">{product.product_name}</h3>

                {/* SKU - Now from first stock */}
                {product.stocks && product.stocks.length > 0 && product.stocks[0].sku && <div className="mb-0.5 text-[10px] text-gray-400 sm:mb-1 sm:text-xs">SKU: {product.stocks[0].sku}</div>}

                {/* Unit */}
                <div className="mb-1 text-[10px] font-medium text-blue-600 sm:text-xs">Unit: {product.unit || (product.stocks && product.stocks.length > 0 ? product.stocks[0].unit : 'N/A')}</div>

                <div className="mt-1.5 flex items-center justify-between sm:mt-2">
                    {renderPrice()}
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 sm:px-2 sm:text-xs">Stock: {totalQuantity}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
