import PosInvoicePreview from '../PosInvoicePreview';

interface PreviewModalProps {
    isOpen: boolean;
    data: any;
    storeId?: number;
    onClose: () => void;
    autoPrint?: 'invoice' | 'receipt' | null;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, data, storeId, onClose, autoPrint }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-auto bg-black bg-opacity-50">
            <div className="relative min-h-screen w-full max-w-6xl bg-white shadow-2xl">
                <PosInvoicePreview data={data} storeId={storeId} onClose={onClose} autoPrint={autoPrint} />
            </div>
        </div>
    );
};

export default PreviewModal;
