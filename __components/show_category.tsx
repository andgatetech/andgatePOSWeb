'use client';

import IconPlus from '@/components/icon/icon-plus';
import { ReactNode, useState } from 'react';
import StoreModal from './CreateStoreModal';
import { useCreateCategoryMutation } from '@/store/features/category/categoryApi';


interface PanelCodeHighlightProps {
    children: ReactNode;
    title?: string;
    codeHighlight?: string;
    id?: string;
    className?: string;
}

const ShowCategory: React.FC<PanelCodeHighlightProps> = ({ children, title, codeHighlight, id, className = '' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [categoryCreate, { isLoading }] = useCreateCategoryMutation();

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await categoryCreate(formData).unwrap();
            console.log('Category created successfully:', res);
            setIsModalOpen(false);
            setFormData({ name: '', description: '' });
            setErrorMessage(null);
        } catch (error: any) {
            console.error('Category creation failed:', error);
            setErrorMessage(error?.data?.message || 'Failed to create category. Please try again.');
        }
    };

    return (
        <div className={`panel ${className}`} id={id}>
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">{title}</h5>
                <button type="button" className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600" onClick={() => setIsModalOpen(true)}>
                    <span className="flex items-center">
                        <IconPlus className="me-2" />
                        Create Category
                    </span>
                </button>
            </div>
            {children}
            <StoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
                <form onSubmit={handleCreateCategory}>
                    {errorMessage && <div className="mb-4 text-sm text-red-500">{errorMessage}</div>}
                    <div className="mb-4">
                        <label htmlFor="categoryName" className="block text-sm font-medium">
                            Category Name
                        </label>
                        <input
                            type="text"
                            id="categoryName"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            placeholder="Enter category name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="categoryDescription" className="block text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            id="categoryDescription"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            placeholder="Enter category description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default ShowCategory;
