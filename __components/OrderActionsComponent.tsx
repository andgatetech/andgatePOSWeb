import OrderItemsModal from '@/components/apps/mailbox/invoice/ordeo_items_modal';
import IconEye from '@/components/icon/icon-eye';
import { FileTextIcon, Printer, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import InvoiceModal from './InvoiceModal';

const OrderActionsComponent = ({ order }) => {
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleViewDetails = () => {
        setDetailsModalOpen(true);
        setDropdownOpen(false);
    };

    const handleViewInvoice = () => {
        setInvoiceModalOpen(true);
        setDropdownOpen(false);
    };

    const handleViewReceipt = () => {
        setReceiptModalOpen(true);
        setDropdownOpen(false);
    };

    return (
        <>
            <div className="relative mx-auto flex w-max items-center gap-2">
                {/* 3-dot Dropdown */}
                <button type="button" className="flex rounded-md p-1 hover:bg-gray-100 hover:text-primary" onClick={() => setDropdownOpen(!dropdownOpen)} title="Actions">
                    <MoreVertical className="h-4 w-4" />
                </button>

                {dropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                        <div className="absolute right-0 top-8 z-20 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <button
                                type="button"
                                onClick={handleViewDetails}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <IconEye className="h-4 w-4" />
                                View Details
                            </button>
                            <button
                                type="button"
                                onClick={handleViewInvoice}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <FileTextIcon className="h-4 w-4" />
                                View Invoice
                            </button>
                            <button
                                type="button"
                                onClick={handleViewReceipt}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Printer className="h-4 w-4" />
                                View Receipt
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <OrderItemsModal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} order={order} />

            <InvoiceModal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} order={order} />

            {/* <ReceiptModal open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} order={order} /> */}
        </>
    );
};

export default OrderActionsComponent;
