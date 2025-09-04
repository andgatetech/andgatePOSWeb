import IconEye from '@/components/icon/icon-eye';
import IconFileText from '@/components/icon/icon-file-text';
import IconPrinter from '@/components/icon/icon-printer';
import { useState } from 'react';
import InvoiceModal from './invoice_modal';
import OrderDetailsModal from './order_details_modal';
import ReceiptModal from './receipt_modal';

const OrderActionsComponent = ({ order }) => {
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);

    const handleViewDetails = () => {
        setDetailsModalOpen(true);
    };

    const handleViewInvoice = () => {
        setInvoiceModalOpen(true);
    };

    const handleViewReceipt = () => {
        setReceiptModalOpen(true);
    };

    return (
        <>
            <div className="mx-auto flex w-max items-center gap-2">
                {/* Details Button */}
                <button type="button" className="flex hover:text-primary" onClick={handleViewDetails} title="View Details">
                    <IconEye />
                </button>

                {/* Invoice Button */}
                <button type="button" className="flex hover:text-info" onClick={handleViewInvoice} title="View Invoice">
                    <IconFileText />
                </button>

                {/* Receipt Button */}
                <button type="button" className="flex hover:text-success" onClick={handleViewReceipt} title="View Receipt">
                    <IconPrinter />
                </button>
            </div>

            {/* Modals */}
            <OrderDetailsModal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} order={order} />

            <InvoiceModal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} order={order} />

            <ReceiptModal open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} order={order} />
        </>
    );
};

// Updated column definition for your existing component
const actionColumn = {
    accessor: 'action',
    title: 'Actions',
    sortable: false,
    textAlignment: 'center',
    render: ({ id, ...order }) => <OrderActionsComponent order={{ id, ...order }} />,
};

// Alternative: If you prefer inline actions without separate component
const inlineActionColumn = {
    accessor: 'action',
    title: 'Actions',
    sortable: false,
    textAlignment: 'center',
    render: (order) => (
        <div className="mx-auto flex w-max items-center gap-2">
            <button type="button" className="flex hover:text-primary" onClick={() => handleViewDetails(order.id)} title="View Details">
                <IconEye />
            </button>

            <button type="button" className="flex hover:text-info" onClick={() => handleViewInvoice(order.id)} title="View Invoice">
                <IconFileText />
            </button>

            <button type="button" className="flex hover:text-success" onClick={() => handleViewReceipt(order.id)} title="View Receipt">
                <IconPrinter />
            </button>
        </div>
    ),
};

export default OrderActionsComponent;
