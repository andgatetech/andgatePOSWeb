'use client';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { resolveProductImageUrl } from '@/lib/image-url';
import { Check, Eye, Package, Plus } from 'lucide-react';
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

    const stockStatus =
        totalQuantity > 10 ? 'high' : totalQuantity > 0 ? 'low' : 'out';

    const stockDotClass =
        stockStatus === 'high' ? 'bg-green-500' :
        stockStatus === 'low'  ? 'bg-amber-400' :
                                 'bg-red-400';

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
                    className="object-cover transition-transform duration-300 sm:group-hover:scale-105"
                    sizes="(max-width: 640px) 160px, 220px"
                />
            );
        }

        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                <Package className="h-8 w-8 text-gray-300" />
            </div>
        );
    };

    const renderPrice = () => {
        const hasVariants = product.stocks?.some((s: any) => s.is_variant);
        if (hasVariants) {
            const prices = product.stocks!
                .filter((s: any) => s.is_variant)
                .map((s: any) => parseFloat(s.price as string));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            return (
                <span className="text-[13px] font-bold text-primary sm:text-sm">
                    {formatCurrency(minPrice)}
                    {minPrice !== maxPrice ? <span className="text-[11px] text-primary/60"> +</span> : ''}
                </span>
            );
        }
        const primaryStock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;
        const price = parseFloat((primaryStock?.price || product.price || 0) as string);
        return <span className="text-[13px] font-bold text-primary sm:text-sm">{formatCurrency(price)}</span>;
    };

    const handleClick = () => {
        if (isUnavailable) return;
        setAdding(true);
        onAddToCart(product);
        setTimeout(() => setAdding(false), 700);
    };

    return (
        <div
            data-testid="pos-product-card"
            onClick={handleClick}
            className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-150 select-none ${
                isUnavailable
                    ? 'cursor-not-allowed border-gray-100 opacity-50'
                    : adding
                    ? 'scale-[0.95] border-primary/40 shadow-lg shadow-primary/10'
                    : 'cursor-pointer border-gray-100 shadow-sm active:scale-[0.95] active:shadow-md sm:hover:border-primary/30 sm:hover:shadow-md sm:hover:-translate-y-0.5'
            }`}
        >
            {/* Image area — 3:2 aspect ratio scales with card width */}
            <div className="relative w-full shrink-0 overflow-hidden bg-gray-50" style={{ aspectRatio: '3/2' }}>
                {renderImage()}

                {/* Stock status dot — top-left, always visible */}
                <span
                    className={`absolute left-2 top-2 h-2 w-2 rounded-full ring-2 ring-white shadow ${stockDotClass}`}
                    title={t('lbl_in_stock')}
                />

                {/* Out-of-stock overlay */}
                {isUnavailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <span className="rounded-md bg-red-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
                            {t('status_out_of_stock')}
                        </span>
                    </div>
                )}

                {/* Add confirmation flash */}
                {adding && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg ring-4 ring-primary/20">
                            <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                )}

                {/* View image button — always visible on mobile, hover on desktop */}
                <button
                    onClick={(e) => { e.stopPropagation(); onImageShow(product); }}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all active:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
                >
                    <Eye className="h-3 w-3" />
                </button>

                {/* + add button — always visible on mobile, hover on desktop */}
                {!isUnavailable && !adding && (
                    <div className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-md transition-all sm:scale-90 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100">
                        <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                )}
            </div>

            {/* Info section */}
            <div className="flex flex-1 flex-col px-2.5 py-2">
                <p className="line-clamp-2 text-[11.5px] font-semibold leading-snug text-gray-800 sm:text-[13px]">
                    {product.product_name}
                </p>

                <div className="mt-auto flex items-center justify-between pt-1.5">
                    {renderPrice()}

                    {/* Stock quantity pill */}
                    <span
                        className={`rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums ${
                            stockStatus === 'high'
                                ? 'bg-green-50 text-green-600'
                                : stockStatus === 'low'
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
