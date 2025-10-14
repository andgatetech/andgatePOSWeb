import Link from 'next/link';

const Recent_Orders = ({ orders = [], isLoading = false, isError = false }) => {
    // const { data, isLoading, isError } = useGetAllOrdersQuery();

    // Skeleton loader component
    const SkeletonRow = () => (
        <tr>
            <td className="h-6 py-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-8 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
            <td className="h-6 py-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </td>
        </tr>
    );

    if (isError) return <p>Failed to load orders</p>;

    // Ensure we have an array
    // const ordersArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    const ordersArray = Array.isArray(orders) ? orders : [];

    // Sort descending by date
    const sortedOrders = ordersArray.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Get recent 7
    const recent7 = sortedOrders.slice(0, 7);

    return (
        <div>
            <div className="panel h-full w-full">
                <div className="mb-5 flex items-center justify-between">
                    <h5 className="text-lg font-semibold dark:text-white-light">Recent Orders</h5>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Order ID</th>
                                <th>Grand Total</th>
                                <th>Items</th>
                                <th>Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                                : recent7.map((order) => (
                                      <tr key={order.id} className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                          <td className="min-w-[150px] text-black dark:text-white">{order.customer_name || 'Unknown'}</td>
                                          <td>
                                              <Link href={`/orders/${order.id}`}>{order.id}</Link>
                                          </td>
                                          <td>৳{Number(order.grand_total || 0).toFixed(2)}</td>
                                          <td>{order.items?.length || 0}</td>
                                          <td>
                                              <span className={`badge shadow-md ${order.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}`}>{order.payment_status}</span>
                                          </td>
                                      </tr>
                                  ))}
                            {!isLoading && recent7.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center">
                                        No orders found.
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

export default Recent_Orders;
