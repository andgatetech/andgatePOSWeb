'use client';
import React from 'react';
import { Package } from 'lucide-react';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';

const Top_Selling_Products = ({ orders = [], isLoading = false, isError = false }) => {
    // const { data: ordersResponse, isLoading, isError } = useGetAllOrdersQuery();
    const { data: categoriesResponse, isLoading: isLoadingCategories, error: categoriesError } = useGetCategoryQuery();

    if (isError || categoriesError) return <p>Failed to load data.</p>;

    // const orders = Array.isArray(ordersResponse?.data) ? ordersResponse.data : [];
    const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];

    // Count sales for each product
    const productSalesMap: any = {};
    orders.forEach((order) => {
        order.items.forEach((item: any) => {
            const product = item.product;
            if (!product) return; // skip if product is null
            const productId = product.id;
            if (!productSalesMap[productId]) {
                productSalesMap[productId] = {
                    id: productId,
                    name: product.product_name,
                    category: product.category_id,
                    price: parseFloat(product.price),
                    discount: parseFloat(item.discount || 0),
                    sold: 0,
                };
            }
            productSalesMap[productId].sold += item.quantity;
        });
    });

    // Top 7 products by sold quantity
    const topProducts = Object.values(productSalesMap)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 7);

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
                <div className="h-4 w-12 animate-pulse rounded bg-gray-300"></div>
            </td>
            <td className="py-2">
                <div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
            </td>
        </tr>
    );

    return (
        <div className="panel h-full w-full">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Top Selling Products</h5>
            </div>
            <div className="table-responsive">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="px-4 py-2 ltr:rounded-l-md rtl:rounded-r-md">Product</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Discount</th>
                            <th className="px-4 py-2">Sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading || isLoadingCategories
                            ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                            : topProducts.map((product: any) => {
                                  const category = categories.find((cat: any) => cat.id === product.category);
                                  return (
                                      <tr key={product.id} className="group hover:bg-gray-50">
                                          <td className="min-w-[150px] px-4 py-2">
                                              <div className="flex items-center gap-2">
                                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200">
                                                      <Package className="h-5 w-5 text-gray-600" />
                                                  </div>
                                                  <div>
                                                      <p>{product.name}</p>
                                                      <span className="block text-xs text-primary">{category?.name || 'Uncategorized'}</span>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-4 py-2">৳{product.price.toFixed(2)}</td>
                                          <td className="px-4 py-2">৳{product.discount.toFixed(2)}</td>
                                          <td className="px-4 py-2">{product.sold}</td>
                                      </tr>
                                  );
                              })}
                        {!isLoading && !isLoadingCategories && topProducts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-4 text-center">
                                    No sales data found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Top_Selling_Products;
