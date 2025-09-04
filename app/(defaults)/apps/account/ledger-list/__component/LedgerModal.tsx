'use client';

import { FileText } from 'lucide-react';
import ModalWrapper from './ModalRapper';
import CreateLedgerForm from './LedgerForm';

const CreateLedgerModal = ({ isOpen, onClose, stores = [] }) => {
    const handleSuccess = (result) => {
        console.log('Ledger created successfully:', result);
        // You can add additional success logic here like showing toast notification
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Create New Ledger" subtitle="Add a new ledger to your accounting system" icon={FileText} size="md">
            <CreateLedgerForm onSuccess={handleSuccess} onCancel={handleCancel} stores={stores} />
        </ModalWrapper>
    );
};

export default CreateLedgerModal;
