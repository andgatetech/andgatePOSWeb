'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { AlertTriangle, Package } from 'lucide-react';
import React from 'react';

interface InStock {
    id: number;
    product_id: number;
    quantity: string;
    unit: string;
}

interface Category {
    id: number;
    name: string;
    image_url: string | null;
}

interface Brand {
    id: number;
    name: string;
}

interface Store {
    id: number;
    store_name: string;
}

interface LowStockProduct {
    id: number;
    category_id: number;
    brand_id: number | null;
    store_id: number;
    product_name: string;
    description: string;
    price: string;
    purchase_price: string;
    available: string;
    sku: string;
    tax_rate: string;
    low_stock_quantity: string;
    tax_included: number;
    created_at: string;
    updated_at: string;
    in_stock: InStock;
    brand: Brand | null;
    category: Category;
    store: Store;
}

interface LowStockProductsProps {
    lowStockProducts?: {
        success: boolean;
        count: number;
        data: LowStockProduct[];
    };
    isLoading?: boolean;
}

const Low_Stock_Products: React.FC<LowStockProductsProps> = () => {
    const { currentStoreId } = useCurrentStore();

    // TODO: Fix backend API - temporarily commented
    // const { data: lowStockProducts, isLoading, isError } = useGetAllLowStockProductsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const lowStockProducts = { data: [] };
    const isLoading = false;
    const isError = false;

    const products = Array.isArray(lowStockProducts?.data) ? lowStockProducts.data : [];

    // ✅ Sort by lowest stock first and take top 7
    const topLowStockProducts = [...products].sort((a, b) => parseFloat(a.in_stock.quantity) - parseFloat(b.in_stock.quantity)).slice(0, 7);
    // Skeleton row for loading state
    const SkeletonRow = () => (
        <tr>
            <td className="py-2">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 animate-pulse rounded-md bg-gray-300"></div>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                </div>
            </td>
            <td className="py-2">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
            </td>
            <td className="py-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
            </td>
            <td className="py-2">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
            </td>
        </tr>
    );

    // Calculate stock status color
    const getStockStatusColor = (currentStock: number, lowStockThreshold: number) => {
        const percentage = (currentStock / lowStockThreshold) * 100;
        if (percentage <= 30) return 'text-red-600';
        if (percentage <= 60) return 'text-orange-600';
        return 'text-yellow-600';
    };

    return (
        <div className="panel h-full w-full">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Low Stock Products</h5>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="table-responsive">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="px-4 py-2 ltr:rounded-l-md rtl:rounded-r-md">Product</th>
                            {/* <th className="px-4 py-2">Price</th> */}
                            <th className="px-4 py-2">Sku</th>
                            <th className="px-4 py-2">Current Stock</th>
                            <th className="px-4 py-2">Threshold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading
                            ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                            : topLowStockProducts.map((product) => {
                                  const currentStock = parseFloat(product.in_stock.quantity);
                                  const threshold = parseFloat(product.low_stock_quantity);
                                  const stockStatusColor = getStockStatusColor(currentStock, threshold);

                                  return (
                                      <tr key={product.id} className="group hover:bg-gray-50">
                                          <td className="min-w-[150px] px-4 py-2">
                                              <div className="flex items-center gap-2">
                                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-100">
                                                      <Package className="h-5 w-5 text-orange-600" />
                                                  </div>
                                                  <div>
                                                      <p className="font-medium">{product.product_name}</p>
                                                      <span className="block text-xs text-primary">{product.category?.name || 'Uncategorized'}</span>
                                                  </div>
                                              </div>
                                          </td>
                                          {/* <td className="px-4 py-2">৳{parseFloat(product.price).toFixed(2)}</td> */}
                                          <td className="px-4 py-2">{product.sku}</td>
                                          <td className="px-4 py-2">
                                              <span className={`font-semibold ${stockStatusColor}`}>
                                                  {currentStock} {product.in_stock.unit}
                                              </span>
                                          </td>
                                          <td className="px-4 py-2 text-gray-600">
                                              {threshold} {product.in_stock.unit}
                                          </td>
                                      </tr>
                                  );
                              })}
                        {!isLoading && topLowStockProducts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-4 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Package className="h-8 w-8 text-gray-400" />
                                        <p>No low stock products found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Low_Stock_Products;
