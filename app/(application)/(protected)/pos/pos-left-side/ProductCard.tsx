'use client';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { resolveProductImageUrl } from '@/lib/image-url';
import { Eye, Package, Plus } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import type { Product } from './types';

interface ProductCardProps {
    product: Product;
    leftWidth?: number;
    isMobileView?: boolean;
    onAddToCart: (product: Product) => void;
    onImageShow: (product: Product) => void;
    mode?: 'pos' | 'stock' | 'label' | 'orderEdit' | 'orderReturn' | 'purchase';
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    isMobileView = false,
    onAddToCart,
    onImageShow,
    mode = 'pos',
}) => {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const [adding, setAdding] = useState(false);

    const totalQuantity =
        product.stocks?.reduce((sum: number, stock: any) => sum + parseFloat(stock.quantity || '0'), 0) || 0;
    const isUnavailable = product.available === false || (mode === 'pos' && totalQuantity <= 0);

    const renderImage = () => {
        const stockWithImage = product.stocks?.find((s: any) => s.images && s.images.length > 0);
        const imgSrc = resolveProductImageUrl(
            stockWithImage?.images?.[0] ||
                (product as any).images?.[0] ||
                (product as any).image ||
                (product as any).product_image
        );

        if (imgSrc) {
            return (
                <Image
                    src={imgSrc}
                    alt={product.product_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 140px, 200px"
                />
            );
        }

        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-300">
                <Package className="h-10 w-10" />
            </div>
        );
    };

    const renderPrice = () => {
        const hasVariants = product.stocks?.some((s: any) => s.is_variant);
        if (hasVariants) {
            const prices = product.stocks!.filter((s: any) => s.is_variant).map((s: any) => parseFloat(s.price as string));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            return (
                <span className="font-bold text-primary">
                    {formatCurrency(minPrice)}{minPrice !== maxPrice ? ` – ${formatCurrency(maxPrice)}` : ''}
                </span>
            );
        }
        const primaryStock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;
        const price = parseFloat((primaryStock?.price || product.price || 0) as string);
        return <span className="font-bold text-primary">{formatCurrency(price)}</span>;
    };

    const handleClick = () => {
        if (isUnavailable) return;
        setAdding(true);
        onAddToCart(product);
        setTimeout(() => setAdding(false), 600);
    };

    return (
        <div
            onClick={handleClick}
            className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 ${
                isUnavailable
                    ? 'cursor-not-allowed border-gray-200 opacity-55'
                    : adding
                    ? 'scale-[0.97] border-primary/60 shadow-md'
                    : 'cursor-pointer border-gray-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md'
            }`}
        >
            {/* Product image */}
            <div className="relative h-32 shrink-0 overflow-hidden bg-gray-100 sm:h-36">
                {renderImage()}

                {/* Out of stock overlay */}
                {isUnavailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                        <span className="rounded-full bg-gray-900/80 px-2 py-1 text-xs font-bold text-white">
                            {t('status_out_of_stock')}
                        </span>
                    </div>
                )}

                {/* Add to cart flash */}
                {adding && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
                            <Plus className="h-5 w-5 text-white" />
                        </div>
                    </div>
                )}

                {/* View image button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onImageShow(product); }}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-all hover:bg-black/70 group-hover:opacity-100"
                >
                    <Eye className="h-3 w-3" />
                </button>

                {/* Hover add indicator */}
                {!isUnavailable && !adding && (
                    <div className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                        <Plus className="h-4 w-4 text-white" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-2.5">
                <h3 className="mb-1 line-clamp-2 text-xs font-semibold leading-snug text-gray-800 sm:text-sm">
                    {product.product_name}
                </h3>

                {/* SKU */}
                {product.stocks?.[0]?.sku && (
                    <p className="mb-1 text-[10px] text-gray-400">{product.stocks[0].sku}</p>
                )}

                {/* Price + stock row */}
                <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="text-sm">{renderPrice()}</div>
                    <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            totalQuantity > 10
                                ? 'bg-green-50 text-green-600'
                                : totalQuantity > 0
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-red-50 text-red-500'
                        }`}
                    >
                        {formatNumber(totalQuantity)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
