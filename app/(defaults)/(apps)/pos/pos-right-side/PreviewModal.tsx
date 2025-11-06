import PosInvoicePreview from '../PosInvoicePreview';

interface PreviewModalProps {
    isOpen: boolean;
    data: any;
    storeId?: number;
    onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, data, storeId, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-2">
            <div className="relative max-h-[95vh] w-full max-w-[90vw] overflow-auto rounded-lg bg-white p-6 shadow-2xl">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"></button>
                <div className="mb-4">
                    <PosInvoicePreview data={data} storeId={storeId} onClose={onClose} />
                </div>
                <div className="mt-6 flex justify-end">
                    <button className="btn btn-secondary px-5 py-2 text-sm hover:bg-gray-200" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
