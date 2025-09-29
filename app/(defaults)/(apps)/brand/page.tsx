'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateBrandMutation, useDeleteBrandMutation, useGetBrandsQuery, useUpdateBrandMutation } from '@/store/features/brand/brandApi';
import { ChevronLeft, ChevronRight, Edit, Eye, Image, MoreVertical, Plus, Save, Search, Store, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

// Action Dropdown Component
const ActionDropdown = ({ brand, onEdit, onView, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAction = (action) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <button onClick={() => handleAction(() => onView(brand))} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Eye className="mr-3 h-4 w-4" />
                        View Details
                    </button>
                    <button onClick={() => handleAction(() => onEdit(brand))} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Edit className="mr-3 h-4 w-4" />
                        Edit Brand
                    </button>
                    <button onClick={() => handleAction(() => onDelete(brand.id))} className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete Brand
                    </button>
                </div>
            )}
        </div>
    );
};

// Brand Filter Component
const BrandFilter = ({ onFilterChange, currentStoreId }) => {
    const { userStores } = useCurrentStore();
    const [filters, setFilters] = useState({
        search: '',
        store_selection: currentStoreId || '',
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Convert store_selection to appropriate API params
        const apiParams = { search: newFilters.search };

        if (newFilters.store_selection === 'all') {
            apiParams.store_ids = 'all';
        } else if (newFilters.store_selection) {
            apiParams.store_id = newFilters.store_selection;
        }

        onFilterChange(apiParams);
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            store_selection: currentStoreId || '',
        };
        setFilters(resetFilters);
        onFilterChange({ store_id: currentStoreId });
    };

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search brands..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Store Selection */}
                <div>
                    <select
                        value={filters.store_selection}
                        onChange={(e) => handleFilterChange('store_selection', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Store</option>
                        {userStores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                        <option value="all">All Stores</option>
                    </select>
                </div>

                {/* Reset Button */}
                <div>
                    <button
                        onClick={handleReset}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <X className="h-4 w-4" />
                        Reset Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

// Brand Table Component
const BrandTable = ({ brands, isLoading, onEdit, onView, onDelete }) => {
    if (isLoading) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading brands...</p>
                </div>
            </div>
        );
    }

    if (!brands || brands.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-8 text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No brands found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Brand</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Store</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Updated</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {brands.map((brand) => (
                            <tr key={brand.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 flex-shrink-0">
                                            {brand.image_url ? (
                                                <img className="h-12 w-12 rounded-lg object-cover" src={brand.image_url} alt={brand.name} />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                                    <Image className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                                            <div className="text-sm text-gray-500">ID: {brand.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-xs truncate text-sm text-gray-900" title={brand.description}>
                                        {brand.description || 'No description'}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{brand.store?.name}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(brand.created_at)}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{brand.updated_at !== brand.created_at ? formatDate(brand.updated_at) : '-'}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <ActionDropdown brand={brand} onEdit={onEdit} onView={onView} onDelete={onDelete} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Brand Modal Component
const BrandModal = ({ showModal, modalType, selectedBrand, onClose, onSubmit, loading }) => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
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
    }, [modalType, selectedBrand]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const formatDate = (dateString) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {modalType === 'create' && 'Create New Brand'}
                        {modalType === 'edit' && 'Edit Brand'}
                        {modalType === 'view' && 'Brand Details'}
                    </h2>
                    {/* Store info */}
                    {currentStore && (
                        <div className="mt-1 flex items-center text-sm text-gray-600">
                            <Store className="mr-1 h-4 w-4 text-gray-500" />
                            <span>{currentStore.store_name}</span>
                        </div>
                    )}
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    {modalType === 'view' ? (
                        <div className="space-y-4">
                            {selectedBrand?.image_url && (
                                <div className="h-48 w-full overflow-hidden rounded-lg bg-gray-100">
                                    <img src={selectedBrand.image_url} alt={selectedBrand.name} className="h-full w-full object-cover" />
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                                <p className="text-gray-900">{selectedBrand?.name}</p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                                <p className="text-gray-900">{selectedBrand?.description || 'No description'}</p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Store</label>
                                <p className="text-gray-900">{selectedBrand?.store?.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
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
                                <label className="mb-2 block text-sm font-medium text-gray-700">Brand Image</label>
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
                                    placeholder="Enter brand name"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter brand description"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50">
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
    );
};

// Main Brand Management Component
const BrandManagement = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState({});

    // Build query parameters based on filter state
    let queryParams = {};
    if (Object.keys(apiParams).length > 0) {
        if (apiParams.store_ids === 'all') {
            // "All Stores" selected - let backend handle all user's stores
            queryParams = { ...apiParams, store_ids: 'all' };
        } else {
            queryParams = apiParams;
        }
    } else {
        // No filter active - use current store from sidebar
        queryParams = currentStoreId ? { store_id: currentStoreId } : {};
    }

    const { data: brandsResponse, error, isLoading } = useGetBrandsQuery(queryParams);
    const [createBrand] = useCreateBrandMutation();
    const [updateBrand] = useUpdateBrandMutation();
    const [deleteBrand] = useDeleteBrandMutation();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        console.log('Brands - Current store changed, resetting filters');
        setApiParams({});
    }, [currentStoreId]);

    // Handle filter changes
    const handleFilterChange = useCallback((newApiParams) => {
        console.log('Brands - Filter changed:', newApiParams);
        setApiParams(newApiParams);
    }, []);

    const brands = brandsResponse?.data || [];

    const showMessage = (msg = '', type = 'success') => {
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

    const openModal = (type, brand = null) => {
        setModalType(type);
        setSelectedBrand(brand);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBrand(null);
    };

    const handleSubmit = async (formData) => {
        setLoading(true);

        try {
            const brandFormData = new FormData();
            brandFormData.append('name', formData.name);
            brandFormData.append('description', formData.description);
            if (formData.image) {
                brandFormData.append('image', formData.image);
            }

            if (modalType === 'create') {
                brandFormData.append('store_id', currentStoreId);
                await createBrand(brandFormData).unwrap();
                showMessage('Brand created successfully', 'success');
            } else if (modalType === 'edit' && selectedBrand) {
                await updateBrand({
                    id: selectedBrand.id,
                    formData: brandFormData,
                }).unwrap();
                showMessage('Brand updated successfully', 'success');
            }

            closeModal();
        } catch (err) {
            console.error('Error:', err);
            let errorMessage = 'Something went wrong';
            if (err?.data?.message) {
                errorMessage = err.data.message;
            } else if (err?.error) {
                errorMessage = err.error;
            }
            showMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            try {
                await deleteBrand(id).unwrap();
                showMessage('Brand deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting brand:', error);
                showMessage('Failed to delete brand', 'error');
            }
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-800">Error loading brands. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-2xl font-bold text-gray-900">
                            <Image className="mr-2 h-6 w-6" />
                            Brand Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">Manage and view brands for your stores</p>
                    </div>

                    {/* Create Brand Button */}
                    <button
                        onClick={() => openModal('create')}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Brand
                    </button>
                </div>

                {/* Filters */}
                <BrandFilter onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />

                {/* Brand Table */}
                <BrandTable brands={brands} isLoading={isLoading} onEdit={(brand) => openModal('edit', brand)} onView={(brand) => openModal('view', brand)} onDelete={handleDelete} />

                {/* Brand Modal */}
                <BrandModal showModal={showModal} modalType={modalType} selectedBrand={selectedBrand} onClose={closeModal} onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default BrandManagement;
