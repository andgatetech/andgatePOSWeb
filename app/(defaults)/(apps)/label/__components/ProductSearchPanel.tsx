'use client';

import { useGetAllProductsQuery } from '@/store/features/Product/productApi';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { Award, Package, Search, Tag, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ProductSearchPanelProps {
    onProductSelect: (product: { product_name: string; product_code: string }) => void;
    selectedProducts: { product_code: string }[];
}

const ProductSearchPanel = ({ onProductSelect, selectedProducts }: ProductSearchPanelProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedBrand, setSelectedBrand] = useState<any>(null);

    const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
    const [brandPanelOpen, setBrandPanelOpen] = useState(false);

    // 🔹 Fetch data from APIs
    const { data: productsData, isLoading: productLoading } = useGetAllProductsQuery({
        search: searchTerm,
        category_id: selectedCategory?.id,
        brand_id: selectedBrand?.id,
    });

    const { data: brandsData, isLoading: brandLoading } = useGetBrandsQuery({});
    const { data: categoriesData, isLoading: catLoading } = useGetCategoryQuery({});

    const products = productsData?.data || [];

    const handleCategorySelect = (cat: any) => {
        setSelectedCategory(cat);
        setCategoryPanelOpen(false);
    };

    const handleBrandSelect = (brand: any) => {
        setSelectedBrand(brand);
        setBrandPanelOpen(false);
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedBrand(null);
        setSearchTerm('');
    };

    const isSelected = (code: string) => selectedProducts.some((p) => p.product_code === code);

    const handleProductClick = (product: any) => {
        const code = product.product_code || product.sku;
        onProductSelect({
            id: product.id,
            product_name: product.product_name,
            product_code: code,
            user_name: product.user_name || 'Guest',
        });
    };

    return (
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md">
            {/* Header */}
            <div className="border-b bg-gray-50 p-4">
                <h2 className="text-lg font-bold text-gray-900">Select Products</h2>
                <p className="text-sm text-gray-600">Search or filter to add products</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 border-b p-4">
                <button onClick={() => setCategoryPanelOpen(true)} className="flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm hover:bg-blue-100">
                    <Tag className="h-4 w-4 text-blue-600" />
                    {selectedCategory ? selectedCategory.name || selectedCategory.category_name : 'Category'}
                </button>

                <button onClick={() => setBrandPanelOpen(true)} className="flex items-center gap-1 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-sm hover:bg-green-100">
                    <Award className="h-4 w-4 text-green-600" />
                    {selectedBrand ? selectedBrand.name || selectedBrand.brand_name : 'Brand'}
                </button>

                {(selectedBrand || selectedCategory) && (
                    <button onClick={clearFilters} className="flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm hover:bg-red-100">
                        <X className="h-4 w-4 text-red-600" />
                        Clear
                    </button>
                )}
            </div>

            {/* Search Input */}
            <div className="border-b p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {productLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">
                        <Package className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p>No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                        {products.map((product: any) => {
                            const code = product.product_code || product.sku;
                            const selected = isSelected(code);
                            return (
                                <div
                                    key={code}
                                    onClick={() => handleProductClick(product)}
                                    className={`cursor-pointer overflow-hidden rounded-lg border transition-all duration-200 ${
                                        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:shadow'
                                    }`}
                                >
                                    {/* Image */}
                                    <div className="relative h-32 bg-gray-100">
                                        {product.images?.length > 0 ? (
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${product.images[0]?.image_path || product.images[0]}`}
                                                alt={product.product_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                <Package className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="p-2">
                                        <h3 className="truncate text-xs font-semibold text-gray-900">{product.product_name}</h3>
                                        <p className="text-[10px] text-gray-500">Code: {code}</p>
                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-sm font-bold text-blue-600">৳{product.price}</span>
                                            {selected && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">Selected</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Category Panel - Enhanced Design */}
            {categoryPanelOpen && (
                <div className="absolute inset-0 z-50 flex flex-col rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-xl">
                    <div className="flex items-center justify-between rounded-t-xl border-b border-blue-200 bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                        <h3 className="flex items-center gap-2 font-bold text-white">
                            <Tag className="h-5 w-5" /> Select Category
                        </h3>
                        <button onClick={() => setCategoryPanelOpen(false)} className="rounded-full bg-white/20 p-1.5 transition-all duration-300 hover:rotate-90 hover:bg-white/30">
                            <X className="h-5 w-5 text-white" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {catLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
                                    <p className="mt-3 text-sm text-gray-600">Loading categories...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                {categoriesData?.data?.map((cat: any) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat)}
                                        className="group cursor-pointer rounded-xl border-2 border-blue-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg"
                                    >
                                        <div className="mb-2 flex items-center justify-center">
                                            <div className="rounded-full bg-blue-100 p-2 transition-colors group-hover:bg-blue-200">
                                                <Tag className="h-4 w-4 text-blue-600" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 transition-colors group-hover:text-blue-600">{cat.name || cat.category_name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Brand Panel - Enhanced Design */}
            {brandPanelOpen && (
                <div className="absolute inset-0 z-50 flex flex-col rounded-xl bg-gradient-to-br from-green-50 to-white shadow-xl">
                    <div className="flex items-center justify-between rounded-t-xl border-b border-green-200 bg-gradient-to-r from-green-500 to-green-600 p-4">
                        <h3 className="flex items-center gap-2 font-bold text-white">
                            <Award className="h-5 w-5" /> Select Brand
                        </h3>
                        <button onClick={() => setBrandPanelOpen(false)} className="rounded-full bg-white/20 p-1.5 transition-all duration-300 hover:rotate-90 hover:bg-white/30">
                            <X className="h-5 w-5 text-white" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {brandLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-green-600"></div>
                                    <p className="mt-3 text-sm text-gray-600">Loading brands...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                {brandsData?.data?.map((brand: any) => (
                                    <div
                                        key={brand.id}
                                        onClick={() => handleBrandSelect(brand)}
                                        className="group cursor-pointer rounded-xl border-2 border-green-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-green-400 hover:shadow-lg"
                                    >
                                        <div className="mb-2 flex items-center justify-center">
                                            <div className="rounded-full bg-green-100 p-2 transition-colors group-hover:bg-green-200">
                                                <Award className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 transition-colors group-hover:text-green-600">{brand.name || brand.brand_name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSearchPanel;
