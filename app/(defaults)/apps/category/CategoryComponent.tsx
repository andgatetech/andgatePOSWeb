'use client';
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Image, X, Save, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import { useGetCategoryQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '@/store/features/category/categoryApi';

const CategoryComponent = () => {
    const { data: categoriesResponse, error, isLoading } = useGetCategoryQuery();
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const categories = categoriesResponse?.data || [];

    const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const openModal = (type, category = null) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            setLoading(true);

            if (modalType === 'create') {
                await createCategory(formData).unwrap();
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id).unwrap();
                showMessage('Category deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting category:', error);
                showMessage('Failed to delete category', 'error');
            }
        }
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
        <div className="mx-auto max-w-7xl p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Category Management</h1>
                <p className="text-gray-600">Manage your store categories efficiently</p>
            </div>

            {/* Action Bar */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    {/* Search */}
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Add Category Button */}
                    <button onClick={() => openModal('create')} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        Add Category
                    </button>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category) => (
                    <div key={category.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                        {/* Category Image */}
                        <div className="flex h-48 items-center justify-center bg-gray-100">
                            {category.image_url ? <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" /> : <Image className="h-16 w-16 text-gray-400" />}
                        </div>

                        {/* Category Content */}
                        <div className="p-4">
                            <div className="mb-2 flex items-start justify-between">
                                <h3 className="truncate text-lg font-semibold text-gray-900">{category.name}</h3>
                                <div className="ml-2 flex gap-1">
                                    <button onClick={() => openModal('view', category)} className="p-1 text-gray-500 transition-colors hover:text-blue-600" title="View Details">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => openModal('edit', category)} className="p-1 text-gray-500 transition-colors hover:text-green-600" title="Edit Category">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(category.id)} className="p-1 text-gray-500 transition-colors hover:text-red-600" title="Delete Category">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="mb-3 line-clamp-2 text-sm text-gray-600">{category.description}</p>

                            <div className="text-xs text-gray-500">
                                <p>Created: {formatDate(category.created_at)}</p>
                                {category.updated_at !== category.created_at && <p>Updated: {formatDate(category.updated_at)}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredCategories.length === 0 && (
                <div className="py-12 text-center">
                    <Image className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">{searchTerm ? 'No categories found' : 'No categories yet'}</h3>
                    <p className="mb-4 text-gray-500">{searchTerm ? `No categories match "${searchTerm}"` : 'Get started by creating your first category'}</p>
                    {!searchTerm && (
                        <button onClick={() => openModal('create')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            Add First Category
                        </button>
                    )}
                </div>
            )}

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
