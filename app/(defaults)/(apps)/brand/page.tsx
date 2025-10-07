'use client';
import Dropdown from '@/components/dropdown';
import BrandFilter from '@/components/filters/BrandFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateBrandMutation, useDeleteBrandMutation, useGetBrandsQuery, useUpdateBrandMutation } from '@/store/features/brand/brandApi';
import { ChevronDown, ChevronUp, Edit, Eye, Image, MoreVertical, Plus, Save, Store, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// Brand Table Component
const BrandTable = ({ brands, isLoading, onEdit, onView, onDelete, sortField, sortDirection, onSort }) => {
    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600 sm:text-base">Loading brands...</p>
                </div>
            </div>
        );
    }

    if (!brands || brands.length === 0) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-6 text-center sm:p-8">
                    <Image className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No brands found</h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">Try adjusting your search or filter criteria.</p>
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
        <>
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm lg:block">
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
                                        <div className="text-sm font-medium text-gray-900">{brand.store?.store_name || '-'}</div>
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

            {/* Mobile/Tablet Card View */}
            <div className="space-y-4 lg:hidden">
                {brands.map((brand) => (
                    <div key={brand.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="p-4">
                            {/* Brand Header */}
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-14 w-14 flex-shrink-0 sm:h-16 sm:w-16">
                                        {brand.image_url ? (
                                            <img className="h-14 w-14 rounded-lg object-cover sm:h-16 sm:w-16" src={brand.image_url} alt={brand.name} />
                                        ) : (
                                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 sm:h-16 sm:w-16">
                                                <Image className="h-7 w-7 text-gray-400 sm:h-8 sm:w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{brand.name}</h3>
                                        <p className="text-xs text-gray-500 sm:text-sm">ID: {brand.id}</p>
                                    </div>
                                </div>
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
                            </div>

                            {/* Brand Details */}
                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 sm:text-sm">Description</p>
                                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-700 sm:text-sm">{brand.description || 'No description'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-500">Store</p>
                                        <p className="mt-0.5 truncate text-gray-700">{brand.store?.name || '-'}</p>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-500">Created</p>
                                        <p className="mt-0.5 text-gray-700">{formatDate(brand.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

// Brand Modal Component
const BrandModal = ({ showModal, modalType, selectedBrand, onClose, onSubmit, loading }) => {
    const { currentStore } = useCurrentStore();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);

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
                                <label className="mb-2 block text-sm font-medium text-gray-700">Brand Image</label>
                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-3 sm:p-4">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="h-28 w-full rounded-lg object-cover sm:h-32" />
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
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
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
    const [apiParams, setApiParams] = useState({});
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Build query parameters based on filter state
    let queryParams;

    if (Object.keys(apiParams).length > 0) {
        // Filter is active - use filter parameters
        if (apiParams.store_ids === 'all') {
            // "All Stores" selected - send all user's store IDs
            const allStoreIds = userStores.map((store) => store.id);
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

    const { data: brandsResponse, error, isLoading } = useGetBrandsQuery(queryParams);
    const [createBrand] = useCreateBrandMutation();
    const [updateBrand] = useUpdateBrandMutation();
    const [deleteBrand] = useDeleteBrandMutation();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        console.log('Brands - Current store changed, resetting filters');
        setApiParams({});
    }, [currentStoreId]);

    // Handle filter changes from BrandFilter - RTK Query will auto-refetch when queryParams change
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
                setSelectedBrand(null);
                toast.dismiss();
                toast.success('Brand created successfully', { toastId: 'create-brand' });
            } else if (modalType === 'edit' && selectedBrand) {
                await updateBrand({
                    id: selectedBrand.id,
                    formData: brandFormData,
                }).unwrap();
                toast.dismiss();
                toast.success('Brand updated successfully', { toastId: 'update-brand' });
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
            toast.dismiss();
            toast.error(errorMessage, { toastId: 'brand-error' });
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
                toast.dismiss();
                toast.success('Brand deleted successfully', { toastId: 'delete-brand' });
            } catch (error) {
                console.error('Error deleting brand:', error);
                toast.dismiss();
                toast.error('Failed to delete brand', { toastId: 'delete-brand-error' });
            }
        }
    };

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:p-6">
                        {/* Header Top Section */}
                        <div className="mb-4 sm:mb-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                {/* Left Side - Title and Icon */}
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 shadow-md sm:h-12 sm:w-12">
                                        <Image className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">Brand Management</h1>
                                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                            {currentStore ? (
                                                <span className="hidden sm:inline">Manage brands for {currentStore.store_name}</span>
                                            ) : (
                                                <span className="hidden sm:inline">Manage and view brands for your stores</span>
                                            )}
                                            <span className="sm:hidden">Manage your brands</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side - Add Button */}
                                <button
                                    onClick={() => openModal('create')}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:px-5 sm:py-2.5"
                                >
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">Add Brand</span>
                                    <span className="sm:hidden">Add New</span>
                                </button>
                            </div>
                        </div>

                        {/* Current Store Badge */}
                        {currentStore && (
                            <div className="rounded-lg bg-purple-50 p-3 sm:p-4">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 sm:h-8 sm:w-8">
                                        <Store className="h-3.5 w-3.5 text-purple-600 sm:h-4 sm:w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-purple-900 sm:text-sm">
                                            <span className="hidden sm:inline">Current Store: </span>
                                            {currentStore.store_name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-4 sm:mb-6">
                    <BrandFilter key={`brand-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
                </div>

                {/* Brand Table/Cards */}
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
