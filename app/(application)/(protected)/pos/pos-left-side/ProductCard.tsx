import { useCurrency } from '@/hooks/useCurrency';
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
    mode?: 'pos' | 'stock' | 'label' | 'orderEdit' | 'orderReturn' | 'purchase';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, leftWidth = 50, isMobileView = false, onAddToCart, onImageShow, mode = 'pos' }) => {
    const { formatCurrency } = useCurrency();
    // Calculate total quantity from stocks
    const totalQuantity = product.stocks?.reduce((sum: number, stock: any) => sum + parseFloat(stock.quantity || '0'), 0) || 0;
    const isUnavailable = product.available === false || totalQuantity <= 0;

    const renderProductImage = () => {
        // Get first stock with images
        const stockWithImage = product.stocks?.find((s: any) => s.images && s.images.length > 0);

        if (stockWithImage && stockWithImage.images && stockWithImage.images.length > 0) {
            const img = stockWithImage.images[0];
            // Use the url property from the image object
            const imgPath = img.url || img.path || '';
            const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
            const imgSrc = `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${cleanPath}`;
            return <Image src={imgSrc} alt={product.product_name} fill className="object-cover" sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 200px" />;
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
                    {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
                </span>
            );
        }
        // Simple product - show regular price
        const primaryStock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;
        const price = parseFloat((primaryStock?.price || product.price || 0) as string);
        return <span className="text-xs font-semibold text-green-600 sm:text-sm">{formatCurrency(price)}</span>;
    };

    return (
        <div
            className={`relative rounded-lg border-2 border-gray-800 bg-white shadow-md transition-all duration-200 ${
                isUnavailable && mode === 'pos' ? 'cursor-not-allowed border-gray-400 opacity-60' : 'cursor-pointer hover:scale-[1.02] hover:border-blue-600 hover:shadow-xl'
            }`}
            onClick={() => !(isUnavailable && mode === 'pos') && onAddToCart(product)}
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
