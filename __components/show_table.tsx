'use client';
import IconPlus from '@/components/icon/icon-plus';
import { useCreateStoreMutation } from '@/store/features/store/storeApi';
import { ReactNode, useState } from 'react';
import StoreModal from './CreateStoreModal';

interface PanelCodeHighlightProps {
    children: ReactNode;
    title?: string;
    codeHighlight?: string;
    id?: string;
    className?: string;
    role?: string;
}

const ShowTable = ({ children, title, codeHighlight, id, className = '', role }: PanelCodeHighlightProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        store_name: '',
        store_location: '',
        store_contact: '',
    });
    const [createStore] = useCreateStoreMutation();

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await createStore(formData).unwrap();
            console.log('Store created successfully:', res);

            setIsModalOpen(false);
            setFormData({ store_name: '', store_location: '', store_contact: '' });
        } catch (error) {
            console.error('Store creation failed:', error);
        }
    };

    return (
        <div className={`panel ${className}`} id={id}>
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">{role !== 'platform_admin' ? 'Store Info' : 'Store List'}</h5>
                {role === 'platform_admin' && (
                    <button type="button" className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600" onClick={() => setIsModalOpen(true)}>
                        <span className="flex items-center">
                            <IconPlus className="me-2" />
                            Create Store
                        </span>
                    </button>
                )}
            </div>
            {children}
            <StoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Store">
                <form onSubmit={handleCreateStore}>
                    <div className="mb-4">
                        <label htmlFor="storeName" className="block text-sm font-medium">
                            Store Name
                        </label>
                        <input
                            type="text"
                            id="storeName"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            placeholder="Enter store name"
                            value={formData.store_name}
                            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="storeLocation" className="block text-sm font-medium">
                            Store Location
                        </label>
                        <input
                            type="text"
                            id="storeLocation"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            placeholder="Enter store location"
                            value={formData.store_location}
                            onChange={(e) => setFormData({ ...formData, store_location: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="storeContact" className="block text-sm font-medium">
                            Store Contact
                        </label>
                        <input
                            type="text"
                            id="storeContact"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            placeholder="Enter store contact"
                            value={formData.store_contact}
                            onChange={(e) => setFormData({ ...formData, store_contact: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mt-8 flex items-center justify-end">
                        <button type="button" className="btn btn-outline-danger" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                            {/* {isLoading ? 'Creating...' : 'Create'} */}
                            Create
                        </button>
                    </div>
                </form>
            </StoreModal>
        </div>
    );
};

export default ShowTable;
