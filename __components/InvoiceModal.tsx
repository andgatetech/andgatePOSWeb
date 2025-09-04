import { useGetOrderItemsQuery } from '@/store/features/Order/Order';
import { Dialog, Transition } from '@headlessui/react';
import jsPDF from 'jspdf';
import { Download, Printer, X } from 'lucide-react';
import { Fragment } from 'react';

const InvoiceModal = ({ open, onClose, order }) => {
    const { data: orderItems, isLoading } = useGetOrderItemsQuery(order?.id, {
        skip: !order?.id,
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateSubtotal = (items) => {
        if (!items) return 0;
        return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    };

    const formatNumber = (value) => {
        const num = Number(value); // Convert string or number to number
        return num % 1 === 0 ? num.toString() : num.toFixed(2); // Remove .00 for whole numbers
    };

    const generateInvoicePDF = (order, items) => {
        const doc = new jsPDF();

        // Set monospaced font for better alignment
        doc.setFontSize(12);
        doc.setFont('courier', 'normal');

        // Add Invoice Header
        doc.text(`INVOICE: ${items.invoice || `INV-${items.id}`}`, 10, 10);
        doc.text(`Date: ${formatDate(order.created_at)}`, 10, 20);
        doc.text(`Customer: ${items.customer.name || 'N/A'}`, 10, 30);
        doc.text(`Email: ${items.customer.email || 'N/A'}`, 10, 40);

        // Add Items Header with fixed column positions
        doc.text('ITEMS:', 10, 50);
        doc.text('Product', 10, 60);
        doc.text('Qty', 70, 60);
        doc.text('Price', 90, 60);
        doc.text('Total', 120, 60);
        doc.text('-'.repeat(50), 10, 65);

        // Add Items with fixed column positions
        let yPosition = 70;
        items?.items.forEach((item) => {
            const productName = item.product?.product_name || 'Unknown Product';
            const truncatedName = productName.length > 20 ? productName.substring(0, 17) + '...' : productName;
            doc.text(truncatedName, 10, yPosition);
            doc.text(item.quantity.toString(), 70, yPosition);
            doc.text(`৳${formatNumber(item.unit_price)}`, 90, yPosition);
            doc.text(`৳${formatNumber(item.subtotal)}`, 120, yPosition);
            yPosition += 10;
        });

        // Add Totals, aligned with the 'Total' column
        doc.text(`Subtotal:`, 90, yPosition + 10);
        doc.text(`৳${formatNumber(items?.grand_total)}`, 120, yPosition + 10);
        doc.text(`Discount:`, 90, yPosition + 20);
        doc.text(`৳${formatNumber(order.discount || 0)}`, 120, yPosition + 20);
        doc.text(`Grand Total:`, 90, yPosition + 30);
        doc.text(`৳${formatNumber(order.grand_total)}`, 120, yPosition + 30);

        return doc;
    };

    const handleDownload = () => {
        if (!order || !orderItems) return;

        const doc = generateInvoicePDF(order, orderItems.order);
        doc.save(`${order.invoice || `INV-${order.id}`}.pdf`);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('invoice-print-content');
        if (!printContent) return;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
        <html>
            <head>
                <title>Invoice ${order.invoice || `INV-${order.id}`}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .invoice-details { margin-bottom: 20px; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                    .detail-box { background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    .items-table th { background-color: #f2f2f2; font-weight: bold; }
                    .total-section { text-align: right; font-weight: bold; margin-top: 20px; }
                    .grand-total { font-size: 18px; color: #28a745; }
                    @media print { 
                        body { margin: 0; } 
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
        </html>
    `);
        doc.close();

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {/* Modal Header */}
                                <div className="mb-6 flex items-center justify-between border-b pb-4">
                                    <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900">
                                        Invoice Details
                                    </Dialog.Title>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleDownload}
                                            className="hover:bg-success-dark inline-flex items-center rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-4 focus:ring-success-light"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="hover:bg-info-dark inline-flex items-center rounded-lg bg-info px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-4 focus:ring-info-light"
                                        >
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="focus:ring-gray-light inline-flex items-center rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:ring-4"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Invoice Content */}
                                <div id="invoice-print-content">
                                    {/* Invoice Header */}
                                    <div className="mb-8 text-center">
                                        <h1 className="mb-2 text-4xl font-bold text-gray-800">INVOICE</h1>
                                        <p className="text-xl text-gray-600">{order?.invoice || `INV-${order?.id}`}</p>
                                    </div>

                                    {/* Invoice Details Grid */}
                                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <h3 className="mb-3 text-lg font-semibold text-gray-800">Invoice Information</h3>
                                            <div className="space-y-2">
                                                <p>
                                                    <span className="font-medium">Invoice Number:</span> {order?.invoice || `INV-${order?.id}`}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Order ID:</span> #{order?.id}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Date:</span> {order?.created_at ? formatDate(order.created_at) : 'N/A'}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Payment Status:</span>
                                                    <span
                                                        className={`ml-2 rounded px-2 py-1 text-xs ${
                                                            order?.payment_status === 'paid' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                                                        }`}
                                                    >
                                                        {order?.payment_status || 'pending'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <h3 className="mb-3 text-lg font-semibold text-gray-800">Customer Information</h3>
                                            <div className="space-y-2">
                                                <p>
                                                    <span className="font-medium">Customer ID:</span> {orderItems?.order?.customer?.id}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Customer Name:</span> {orderItems?.order?.customer?.name || 'N/A'}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Customer Email:</span> {orderItems?.order?.customer?.email || 'N/A'}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Items Count:</span> {orderItems?.items?.length || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Loading State */}
                                    {isLoading && (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                            <span className="ml-2">Loading items...</span>
                                        </div>
                                    )}

                                    {/* Items Table */}
                                    {!isLoading && orderItems?.items && (
                                        <div className="mb-6">
                                            <h3 className="mb-4 text-lg font-semibold text-gray-800">Order Items</h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse border border-gray-300">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">SKU</th>
                                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                                                            <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">Qty</th>
                                                            <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                                                            <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-700">Tax</th>
                                                            <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orderItems?.items?.map((item, index) => (
                                                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="border border-gray-300 px-4 py-3">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{item.product?.product_name || 'Unknown Product'}</p>
                                                                        <p className="text-sm text-gray-500">{item.product?.description || ''}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{item.product?.sku || 'N/A'}</td>
                                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{item.product?.category?.name || 'N/A'}</td>
                                                                <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                                                                <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">৳{Number(item.unit_price || 0).toFixed(2)}</td>
                                                                <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">৳{Number(item.tax || 0).toFixed(2)}</td>
                                                                <td className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                                    ৳{Number(item.subtotal || 0).toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Totals Section */}
                                    <div className="flex justify-end">
                                        <div className="w-full md:w-1/3">
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Subtotal:</span>
                                                        <span className="font-medium">৳{orderItems?.order?.total}</span>
                                                        {/* <span className="font-medium">৳{calculateSubtotal(orderItems?.data).toFixed(2)}</span> */}
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Discount:</span>
                                                        <span className="font-medium text-danger">-৳{order?.discount || '0.00'}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                                        <span>Grand Total:</span>
                                                        <span className="text-success">৳{order?.grand_total || '0.00'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice Footer */}
                                    <div className="mt-8 border-t pt-6 text-center text-sm text-gray-500">
                                        <p>Thank you for your business!</p>
                                        <p>Generated on {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default InvoiceModal;
