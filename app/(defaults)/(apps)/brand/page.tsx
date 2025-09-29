'use client';
import Dropdown from '@/components/dropdown';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateBrandMutation, useDeleteBrandMutation, useGetBrandsQuery, useUpdateBrandMutation } from '@/store/features/brand/brandApi';
import { ChevronDown, ChevronUp, Edit, Eye, Image, MoreVertical, Plus, RotateCcw, Save, Search, Store, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

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
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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
                        <option value="all">All Stores</option>
                        <option value="">Select Store</option>
                        {userStores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Reset Button */}
                <div>
                    {/* <button
                        onClick={handleReset}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <X className="h-4 w-4" />
                        Reset Filters
                    </button> */}
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-600 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        title="Reset Filters"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="text-sm">Reset</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Brand Table Component
const BrandTable = ({ brands, isLoading, onEdit, onView, onDelete, sortField, sortDirection, onSort }) => {
    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading brands...</p>
                </div>
            </div>
        );
    }

    if (!brands || brands.length === 0) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
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
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th
                                className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                onClick={() => onSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    Brand
                                    {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Description</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Store</th>
                            <th
                                className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                onClick={() => onSort('created_at')}
                            >
                                <div className="flex items-center gap-2">
                                    Created
                                    {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </div>
                            </th>
                            <th
                                className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                onClick={() => onSort('updated_at')}
                            >
                                <div className="flex items-center gap-2">
                                    Updated
                                    {sortField === 'updated_at' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {brands.map((brand, index) => (
                            <tr key={brand.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-4 py-4">
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
                                            <div className="text-sm font-semibold text-gray-900">{brand.name}</div>
                                            <div className="text-xs text-gray-500">ID: {brand.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="max-w-xs truncate text-sm text-gray-600" title={brand.description}>
                                        {brand.description || 'No description'}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                    <div className="text-sm font-medium text-gray-900">{brand.store?.name || '-'}</div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{formatDate(brand.created_at)}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{brand.updated_at !== brand.created_at ? formatDate(brand.updated_at) : '-'}</td>
                                <td className="px-4 py-4">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement="bottom-end"
                                        btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        button={<MoreVertical className="h-5 w-5" />}
                                    >
                                        <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                                            <li>
                                                <button onClick={() => onView(brand)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </button>
                                            </li>
                                            <li>
                                                <button onClick={() => onEdit(brand)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Brand
                                                </button>
                                            </li>
                                            <li className="border-t">
                                                <button onClick={() => onDelete(brand.id)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Brand
                                                </button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Brand Modal Component (keep existing code)
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
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl">
                {/* Modal Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {modalType === 'create' && 'Create New Brand'}
                                {modalType === 'edit' && 'Edit Brand'}
                                {modalType === 'view' && 'Brand Details'}
                            </h2>
                            {currentStore && (
                                <div className="mt-1 flex items-center text-sm text-gray-600">
                                    <Store className="mr-1 h-4 w-4 text-gray-500" />
                                    <span>{currentStore.store_name}</span>
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
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
                                <p className="text-gray-900">{selectedBrand?.store?.name || '-'}</p>
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
                                <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-medium text-white transition-colors hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
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
    const { currentStoreId, currentStore } = useCurrentStore();
    const [apiParams, setApiParams] = useState({});
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Build query parameters
    let queryParams = {};
    if (Object.keys(apiParams).length > 0) {
        if (apiParams.store_ids === 'all') {
            queryParams = { ...apiParams, store_ids: 'all' };
        } else {
            queryParams = apiParams;
        }
    } else {
        queryParams = currentStoreId ? { store_id: currentStoreId } : {};
    }

    const { data: brandsResponse, error, isLoading } = useGetBrandsQuery(queryParams);
    const [createBrand] = useCreateBrandMutation();
    const [updateBrand] = useUpdateBrandMutation();
    const [deleteBrand] = useDeleteBrandMutation();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setApiParams({});
    }, [currentStoreId]);

    const handleFilterChange = useCallback((newApiParams) => {
        setApiParams(newApiParams);
    }, []);

    const brands = brandsResponse?.data || [];

    // Sort brands
    const sortedBrands = [...brands].sort((a, b) => {
        let aValue = a[sortField] || '';
        let bValue = b[sortField] || '';

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

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
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-800">Error loading brands. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 shadow-md">
                                    <Image className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
                                    <p className="text-sm text-gray-500">{currentStore ? `Manage brands for ${currentStore.store_name}` : 'Manage and view brands for your stores'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => openModal('create')}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Brand
                            </button>
                        </div>
                        {currentStore && (
                            <div className="rounded-lg bg-purple-50 p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                                        <Store className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-purple-900">Current Store: {currentStore.store_name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <BrandFilter onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />

                {/* Brand Table */}
                <BrandTable
                    brands={sortedBrands}
                    isLoading={isLoading}
                    onEdit={(brand) => openModal('edit', brand)}
                    onView={(brand) => openModal('view', brand)}
                    onDelete={handleDelete}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />

                {/* Brand Modal */}
                <BrandModal showModal={showModal} modalType={modalType} selectedBrand={selectedBrand} onClose={closeModal} onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default BrandManagement;
