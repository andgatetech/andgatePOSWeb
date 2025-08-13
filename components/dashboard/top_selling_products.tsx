import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { Package } from 'lucide-react';

const Top_Selling_Products = () => {
    const { data, isLoading, isError } = useGetAllOrdersQuery();

    // Skeleton row for loading
    const SkeletonRow = () => (
        <tr>
            <td className="py-2">
                <div className="flex items-center">
                    <div className="h-8 w-8 animate-pulse rounded-md bg-gray-300 ltr:mr-3 rtl:ml-3"></div>
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

    if (isError) return <p>Failed to load product data</p>;

    const orders = Array.isArray(data?.data) ? data.data : [];

    // Count sales for each product
    const productSalesMap: any = {};
    orders.forEach((order) => {
        order.items.forEach((item) => {
            const productId = item.product.id;
            if (!productSalesMap[productId]) {
                productSalesMap[productId] = {
                    id: productId,
                    name: item.product.product_name,
                    category: item.product.category_id,
                    price: parseFloat(item.product.price),
                    discount: item.discount || 0,
                    sold: 0,
                };
            }
            productSalesMap[productId].sold += item.quantity;
        });
    });

    const top7Products = Object.values(productSalesMap)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 7);

    return (
        <div>
            <div className="panel h-full w-full">
                <div className="mb-5 flex items-center justify-between">
                    <h5 className="text-lg font-semibold dark:text-white-light">Top Selling Products</h5>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr className="border-b-0">
                                <th className="ltr:rounded-l-md rtl:rounded-r-md">Product</th>
                                <th>Price</th>
                                <th>Discount</th>
                                <th>Sold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                                : top7Products.map((product) => (
                                      <tr key={product.id} className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                          <td className="min-w-[150px] text-black dark:text-white">
                                              <div className="flex items-center">
                                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700 ltr:mr-3 rtl:ml-3">
                                                      <Package className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                                  </div>
                                                  <p className="whitespace-nowrap">
                                                      {product.name}
                                                      <span className="block text-xs text-primary">Category {product.category}</span>
                                                  </p>
                                              </div>
                                          </td>
                                          <td>${product.price.toFixed(2)}</td>
                                          <td>${product.discount.toFixed(2)}</td>
                                          <td>{product.sold}</td>
                                      </tr>
                                  ))}
                            {!isLoading && top7Products.length === 0 && (
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
        </div>
    );
};

export default Top_Selling_Products;
