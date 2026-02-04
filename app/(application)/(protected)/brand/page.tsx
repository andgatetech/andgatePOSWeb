'use client';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import BrandFilter from '@/components/filters/BrandFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useCreateBrandMutation, useDeleteBrandMutation, useGetBrandsQuery, useUpdateBrandMutation } from '@/store/features/brand/brandApi';
import { Edit, Eye, Image as ImageIcon, Plus, Save, Store, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Brand Modal Component
const BrandModal = ({ showModal, modalType, selectedBrand, onClose, onSubmit, loading }: any) => {
    const { currentStore } = useCurrentStore();
    const [formData, setFormData] = useState<{ name: string; description: string; image: File | null }>({
        name: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (showModal) {
            if (modalType === 'create') {
                setFormData({ name: '', description: '', image: null });
                setImagePreview(null);
            } else if ((modalType === 'edit' || modalType === 'view') && selectedBrand) {
                setFormData({
                    name: selectedBrand.name || '',
                    description: selectedBrand.description || '',
                    image: null,
                });
                setImagePreview(selectedBrand.image_url || null);
            }
        }
    }, [showModal, modalType, selectedBrand]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl">
                {/* Modal Header */}
                <div className="border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-4">
                            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                                {modalType === 'create' && 'Create New Brand'}
                                {modalType === 'edit' && 'Edit Brand'}
                                {modalType === 'view' && 'Brand Details'}
                            </h2>
                            {currentStore && (
                                <div className="mt-1 flex items-center text-xs text-gray-600 sm:text-sm">
                                    <Store className="mr-1 h-3 w-3 flex-shrink-0 text-gray-500 sm:h-4 sm:w-4" />
                                    <span className="truncate">{currentStore.store_name}</span>
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-4 sm:p-6">
                    {modalType === 'view' ? (
                        <div className="space-y-4">
                            {selectedBrand?.image_url && (
                                <div className="h-40 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-48">
                                    <img src={selectedBrand.image_url} alt={selectedBrand.name} className="h-full w-full object-cover" />
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                                <p className="text-sm text-gray-900 sm:text-base">{selectedBrand?.name}</p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                                <p className="text-sm text-gray-900 sm:text-base">{selectedBrand?.description || 'No description'}</p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Store</label>
                                <p className="text-sm text-gray-900 sm:text-base">{selectedBrand?.store?.name || '-'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">Created</label>
                                    <p className="text-gray-600">{formatDate(selectedBrand?.created_at)}</p>
                                </div>
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">Updated</label>
                                    <p className="text-gray-600">{formatDate(selectedBrand?.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Brand Image (Optional)</label>
                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-3 sm:p-4">
                                    {imagePreview ? (
                                        <div className="relative mx-auto h-24 w-24">
                                            <img src={imagePreview} alt="Preview" className="h-full w-full rounded-lg object-cover" />
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
                                            <Upload className="mx-auto mb-2 h-7 w-7 text-gray-400 sm:h-8 sm:w-8" />
                                            <p className="mb-2 text-xs text-gray-600 sm:text-sm">Click to upload image</p>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handleImageChange}
                                                className="block w-full text-xs text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100 sm:text-sm sm:file:px-4 sm:file:py-2 sm:file:text-sm"
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
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:text-base"
                                    placeholder="Enter brand name"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:text-base"
                                    placeholder="Enter brand description"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 sm:flex-1"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            {modalType === 'create' ? 'Creating...' : 'Updating...'}
                                        </>
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
    );
};

// Main Brand Management Component
const BrandManagement = () => {
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedBrand, setSelectedBrand] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Build query parameters based on filter state
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        // Merge apiParams into params
        Object.assign(params, apiParams);

        // Default to current store if not explicitly provided
        if (!params.store_id && !params.store_ids && currentStoreId) {
            params.store_id = currentStoreId;
        }
        return params;
    }, [apiParams, currentPage, itemsPerPage, sortField, sortDirection, currentStoreId]);

    const { data: brandsResponse, error, isLoading } = useGetBrandsQuery(queryParams, { refetchOnMountOrArgChange: true });
    const [createBrand] = useCreateBrandMutation();
    const [updateBrand] = useUpdateBrandMutation();
    const [deleteBrand] = useDeleteBrandMutation();

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        console.log('Brands - Current store changed, resetting filters');
        setApiParams({});
        setCurrentPage(1);
    }, [currentStoreId]);

    // Handle filter changes from BrandFilter - RTK Query will auto-refetch when queryParams change
    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
        setCurrentPage(1);
    }, []);

    const brands = useMemo(() => brandsResponse?.data?.items || [], [brandsResponse]);
    const paginationMeta = useMemo(() => brandsResponse?.data?.pagination, [brandsResponse]);

    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
                setSortField(field);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField]
    );

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    }, []);

    const openModal = useCallback((type: string, brand: any = null) => {
        setModalType(type);
        setSelectedBrand(brand);
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setSelectedBrand(null);
    }, []);

    const handleSubmit = useCallback(
        async (formData: any) => {
            setLoading(true);

            try {
                const brandFormData = new FormData();
                brandFormData.append('name', formData.name);
                brandFormData.append('description', formData.description);
                if (formData.image) {
                    brandFormData.append('image', formData.image);
                }

                if (modalType === 'create') {
                    if (currentStoreId) brandFormData.append('store_id', currentStoreId.toString());
                    await createBrand(brandFormData).unwrap();
                    setSelectedBrand(null);
                    showSuccessDialog('Success!', 'Brand created successfully');
                } else if (modalType === 'edit' && selectedBrand) {
                    await updateBrand({
                        id: selectedBrand.id,
                        formData: brandFormData,
                    }).unwrap();
                    showSuccessDialog('Success!', 'Brand updated successfully');
                }

                closeModal();
            } catch (err: any) {
                console.error('Error:', err);
                let errorMessage = 'Something went wrong';
                if (err?.data?.message) {
                    errorMessage = err.data.message;
                } else if (err?.error) {
                    errorMessage = err.error;
                }
                showErrorDialog('Error', errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [modalType, currentStoreId, createBrand, updateBrand, selectedBrand, closeModal]
    );

    const handleDelete = useCallback(
        async (id: number) => {
            const confirmed = await showConfirmDialog('Are you sure?', "You won't be able to revert this!", 'Yes, delete it!', 'Cancel', false);

            if (confirmed) {
                try {
                    await deleteBrand(id).unwrap();
                    showSuccessDialog('Success', 'Brand deleted successfully');
                } catch (error) {
                    console.error('Error deleting brand:', error);
                    showErrorDialog('Error', 'Failed to delete brand');
                }
            }
        },
        [deleteBrand]
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'name',
                label: 'Brand',
                sortable: true,
                render: (value, row) => (
                    <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                            {row.image_url ? (
                                <img className="h-12 w-12 rounded-lg object-cover" src={row.image_url} alt={value} />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{value}</div>
                        </div>
                    </div>
                ),
            },
            {
                key: 'description',
                label: 'Description',
                render: (value) => (
                    <div className="max-w-xs truncate text-sm text-gray-600" title={value}>
                        {value || 'No description'}
                    </div>
                ),
            },
            {
                key: 'store_name',
                label: 'Store',
                render: (value, row) => <div className="text-sm font-medium text-gray-900">{row.store_name || row.store?.store_name || '-'}</div>,
            },
            {
                key: 'created_at',
                label: 'Created',
                sortable: true,
                render: (value) => <span className="text-sm text-gray-500">{formatDate(value)}</span>,
            },
            {
                key: 'updated_at',
                label: 'Updated',
                sortable: true,
                render: (value) => <span className="text-sm text-gray-500">{formatDate(value)}</span>,
            },
        ],
        []
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: 'View Details',
                onClick: (brand) => openModal('view', brand),
                icon: <Eye className="h-4 w-4" />,
                className: 'text-gray-700 hover:bg-gray-50',
            },
            {
                label: 'Edit Brand',
                onClick: (brand) => openModal('edit', brand),
                icon: <Edit className="h-4 w-4" />,
                className: 'text-blue-600 hover:bg-blue-50',
            },
            {
                label: 'Delete Brand',
                onClick: (brand) => handleDelete(brand.id),
                icon: <Trash2 className="h-4 w-4" />,
                className: 'text-red-600 hover:bg-red-50',
            },
        ],
        [openModal, handleDelete]
    );

    if (isLoading) {
        return <Loader message="Loading brands..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
                <div className="mx-auto">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-800 sm:text-base">Error loading brands. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="mb-8">
                <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 shadow-md sm:h-12 sm:w-12">
                                <ImageIcon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Brand Management</h1>
                                <p className="text-xs text-gray-500 sm:text-sm">Manage your store brands efficiently</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-start sm:justify-end">
                            <button
                                onClick={() => openModal('create')}
                                className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto sm:px-6 sm:py-3"
                            >
                                <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
                                <span className="whitespace-nowrap">Add Brand</span>
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <BrandFilter key={`brand-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />

            {/* Brand Table */}
            <div className="mt-6">
                <ReusableTable
                    data={brands}
                    columns={columns}
                    actions={actions}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages: paginationMeta?.last_page || 1,
                        itemsPerPage,
                        totalItems: paginationMeta?.total || 0,
                        onPageChange: handlePageChange,
                        onItemsPerPageChange: handleItemsPerPageChange,
                    }}
                    sorting={{
                        field: sortField,
                        direction: sortDirection,
                        onSort: handleSort,
                    }}
                    emptyState={{
                        icon: (
                            <div className="flex justify-center">
                                <ImageIcon className="h-16 w-16 text-gray-400" />
                            </div>
                        ),
                        title: 'No brands yet',
                        description: 'Get started by creating your first brand',
                        action: (
                            <button onClick={() => openModal('create')} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                                <Plus className="h-4 w-4" />
                                Create First Brand
                            </button>
                        ),
                    }}
                />
            </div>

            {/* Brand Modal */}
            <BrandModal showModal={showModal} modalType={modalType} selectedBrand={selectedBrand} onClose={closeModal} onSubmit={handleSubmit} loading={loading} />
        </div>
    );
};

export default BrandManagement;
