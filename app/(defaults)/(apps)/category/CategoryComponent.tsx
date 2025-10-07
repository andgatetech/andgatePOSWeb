'use client';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import Dropdown from '@/components/dropdown';
import CategoryFilter from '@/components/filters/CategoryFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateCategoryMutation, useDeleteCategoryMutation, useGetCategoryQuery, useUpdateCategoryMutation } from '@/store/features/category/categoryApi';
import { Edit, Eye, ImageIcon, Layers, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const CategoryComponent = () => {
    const { currentStoreId, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});

    // Build query parameters based on filter state
    let queryParams: Record<string, any>;

    if (Object.keys(apiParams).length > 0) {
        // Filter is active - use filter parameters
        if (apiParams.store_ids === 'all') {
            // "All Stores" selected - send all user's store IDs
            const allStoreIds = userStores.map((store: any) => store.id);
            queryParams = { ...apiParams, store_ids: allStoreIds };
        } else if (apiParams.store_id) {
            // Specific store selected in filter
            queryParams = apiParams;
        } else {
            // Filter active but no store selected - use current store from sidebar
            queryParams = { ...apiParams, store_id: currentStoreId };
        }
    } else {
        // No filter active - use current store from sidebar (default behavior)
        queryParams = currentStoreId ? { store_id: currentStoreId } : {};
    }

    const { data: categoriesResponse, error, isLoading } = useGetCategoryQuery(queryParams);
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        console.log('Categories - Current store changed, resetting filters');
        setApiParams({});
    }, [currentStoreId]);

    // Handle filter changes from CategoryFilter - RTK Query will auto-refetch when queryParams change
    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
    }, []);

    const categories = useMemo(() => categoriesResponse?.data || [], [categoriesResponse?.data]);

    const showMessage = (msg = '', type: 'success' | 'error' = 'success') => {
        Swal.fire({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const openModal = (type: string, category: any = null) => {
        setModalType(type);
        setSelectedCategory(category);
        setShowModal(true);

        if (type === 'create') {
            setFormData({ name: '', description: '', image: null });
            setImagePreview(null);
        } else if (type === 'edit' && category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                image: null,
            });
            setImagePreview(category.image_url || null);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCategory(null);
        setFormData({ name: '', description: '', image: null });
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            setLoading(true);

            if (modalType === 'create') {
                const categoryData = {
                    ...formData,
                    store_id: currentStoreId,
                };
                await createCategory(categoryData).unwrap();
                showMessage('Category created successfully', 'success');
            } else if (modalType === 'edit' && selectedCategory) {
                await updateCategory({
                    id: selectedCategory.id,
                    updatedCategory: formData,
                }).unwrap();
                showMessage('Category updated successfully', 'success');
            }

            closeModal();
        } catch (err: any) {
            console.error('Error:', err);

            // Extract message from RTK Query error
            let errorMessage = 'Something went wrong';
            if (err?.data?.message) {
                errorMessage = err.data.message; // Custom backend message
            } else if (err?.error) {
                errorMessage = err.error; // Fallback
            }

            showMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = useCallback(
        async (id: number) => {
            if (window.confirm('Are you sure you want to delete this category?')) {
                try {
                    await deleteCategory(id).unwrap();
                    showMessage('Category deleted successfully', 'success');
                } catch (error) {
                    console.error('Error deleting category:', error);
                    showMessage('Failed to delete category', 'error');
                }
            }
        },
        [deleteCategory]
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Define table columns
    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'image_url',
                label: 'Image',
                render: (value, row) => (
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                        {value ? <img src={value} alt={row.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-400" />}
                    </div>
                ),
            },
            {
                key: 'name',
                label: 'Name',
                sortable: true,
                render: (value) => <span className="font-semibold text-gray-900">{value}</span>,
            },
            {
                key: 'description',
                label: 'Description',
                render: (value) => <span className="line-clamp-2 text-sm text-gray-600">{value}</span>,
                className: 'max-w-md',
            },
            {
                key: 'created_at',
                label: 'Created At',
                sortable: true,
                render: (value) => <span className="text-sm text-gray-500">{formatDate(value)}</span>,
            },
            {
                key: 'updated_at',
                label: 'Updated At',
                sortable: true,
                render: (value, row) => (value !== row.created_at ? <span className="text-sm text-gray-500">{formatDate(value)}</span> : <span className="text-sm text-gray-400">-</span>),
            },
        ],
        []
    );

    // Add actions dropdown to categories
    const categoriesWithActions = useMemo(
        () =>
            categories.map((category: any) => ({
                ...category,
                actions: (
                    <div className="flex justify-center">
                        <Dropdown
                            offset={[0, 5]}
                            placement="bottom-end"
                            btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            button={
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            }
                        >
                            <ul className="min-w-[160px] rounded-lg border bg-white shadow-lg">
                                <li>
                                    <button
                                        onClick={() => openModal('view', category)}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View
                                    </button>
                                </li>
                                <li className="border-t">
                                    <button
                                        onClick={() => openModal('edit', category)}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </button>
                                </li>
                                <li className="border-t">
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                ),
            })),
        [categories, handleDelete]
    );

    // Add Actions column
    const columnsWithActions: TableColumn[] = useMemo(
        () => [
            ...columns,
            {
                key: 'actions',
                label: 'Actions',
                render: (value: any) => value,
                className: 'w-20 text-center',
            },
        ],
        [columns]
    );

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">Error loading categories. Please try again later.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Category Page Header */}

            <section className="mb-8">
                <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                <Layers className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                                <p className="text-sm text-gray-500">Manage your store categories efficiently</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => openModal('create')}
                                className="group relative inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Plus className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                                Add Category
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <CategoryFilter key={`category-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />

            {/* Categories Table */}
            <div className="mt-6">
                <ReusableTable
                    data={categoriesWithActions}
                    columns={columnsWithActions}
                    isLoading={isLoading}
                    emptyState={{
                        icon: <ImageIcon className="h-16 w-16" />,
                        title: 'No categories yet',
                        description: 'Get started by creating your first category',
                        action: (
                            <button onClick={() => openModal('create')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                <Plus className="h-4 w-4" />
                                Add First Category
                            </button>
                        ),
                    }}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {modalType === 'create' && 'Create New Category'}
                                {modalType === 'edit' && 'Edit Category'}
                                {modalType === 'view' && 'Category Details'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {modalType === 'view' ? (
                                <div className="space-y-4">
                                    {selectedCategory?.image_url && (
                                        <div className="h-48 w-full overflow-hidden rounded-lg bg-gray-100">
                                            <img src={selectedCategory.image_url} alt={selectedCategory.name} className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                                        <p className="text-gray-900">{selectedCategory?.name}</p>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                                        <p className="text-gray-900">{selectedCategory?.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <label className="mb-1 block font-medium text-gray-700">Created</label>
                                            <p className="text-gray-600">{formatDate(selectedCategory?.created_at)}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block font-medium text-gray-700">Updated</label>
                                            <p className="text-gray-600">{formatDate(selectedCategory?.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Category Image</label>
                                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
                                            {imagePreview ? (
                                                <div className="relative">
                                                    <img src={imagePreview} alt="Preview" className="h-32 w-full rounded-lg object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImagePreview(null);
                                                            setFormData({ ...formData, image: null });
                                                        }}
                                                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-600">Click to upload image</p>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                                        onChange={handleImageChange}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter category name"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter category description"
                                            required
                                        />
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={closeModal} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50">
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    {modalType === 'create' ? 'Create' : 'Update'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryComponent;
