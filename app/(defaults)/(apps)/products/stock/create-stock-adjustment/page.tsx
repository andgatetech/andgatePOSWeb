'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetSingleAdjustmentTypesQuery } from '@/store/features/AdjustmentType/adjustmentTypeApi';
import { useGetAllProductsWithStockQuery } from '@/store/features/Product/productApi';
import { useCreateStockAdjustmentMutation } from '@/store/features/StockAdjustment/stockAdjustmentApi';
import { Minus, Package, Plus, Save, Search, Store, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// Product Search Component
const ProductSearch = ({ onAddProduct, selectedStore, products, selectedProductIds, searchTerm, setSearchTerm }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // const filteredProducts =
    //     products
    //         ?.filter((product) => product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    //         .filter((product) => !selectedProductIds.includes(product.id)) || [];

    const filteredProducts = products?.filter((product) => !selectedProductIds.includes(product.id)) || [];

    const handleProductSelect = (product) => {
        onAddProduct(product);
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Add Products</h3>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        disabled={!selectedStore}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                </div>

                {isDropdownOpen && searchTerm && selectedStore && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => handleProductSelect(product)}
                                    className="cursor-pointer border-b border-gray-100 p-3 transition-colors duration-150 last:border-b-0 hover:bg-blue-50"
                                >
                                    <div className="font-medium text-gray-900">{product.product_name}</div>
                                    <div className="text-sm text-gray-600">
                                        SKU: {product.sku} | Stock: {product.quantity}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-center text-gray-500">No products found</div>
                        )}
                    </div>
                )}
            </div>

            {!selectedStore && <p className="mt-2 text-sm text-gray-500">Please select a store first</p>}
        </div>
    );
};

// Quantity Control Component
const QuantityControl = ({ quantity, onQuantityChange, min = 1 }) => (
    <div className="flex items-center space-x-2">
        <button
            onClick={() => onQuantityChange(Math.max(min, quantity - 1))}
            disabled={quantity <= min}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
            <Minus className="h-4 w-4" />
        </button>
        <input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(min, parseInt(e.target.value) || min))}
            className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            min={min}
        />
        <button onClick={() => onQuantityChange(quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600">
            <Plus className="h-4 w-4" />
        </button>
    </div>
);

// Selected Products Table Component
const SelectedProductsTable = ({ selectedProducts, onUpdateProduct, onRemoveProduct }) => {
    const { currentStoreId } = useCurrentStore();
    const { data: ads_type } = useGetSingleAdjustmentTypesQuery(currentStoreId);
    const adjustmentTypes = ads_type?.data || [];

    if (selectedProducts.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Selected Products</h3>
                <div className="py-8 text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="text-gray-500">No products selected. Search and add products above.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Selected Products</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">#</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Code</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Name</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Current Stock</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Adjustment Type</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Direction</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Quantity</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedProducts.map((product, index) => (
                            <tr key={product.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                                <td className="px-4 py-4">
                                    <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{product.sku}</span>
                                </td>
                                <td className="px-4 py-4 font-medium text-gray-900">{product.product_name}</td>
                                <td className="px-4 py-4">
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">{Number(product.in_stock?.quantity || 0)}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <select
                                        value={product.product_stock_type_id || ''}
                                        onChange={(e) => onUpdateProduct(product.id, 'product_stock_type_id', parseInt(e.target.value))}
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled>
                                            Select Type
                                        </option>
                                        {adjustmentTypes?.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.type}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-4">
                                    <select
                                        value={product.direction || 'increase'}
                                        onChange={(e) => onUpdateProduct(product.id, 'direction', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="increase">Increment</option>
                                        <option value="decrease">Decrement</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4">
                                    <QuantityControl quantity={product.adjustedQuantity || 1} onQuantityChange={(qty) => onUpdateProduct(product.id, 'adjustedQuantity', qty)} />
                                </td>
                                <td className="px-4 py-4">
                                    <button
                                        onClick={() => onRemoveProduct(product.id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
                                        title="Remove product"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Adjustment Form Component
const AdjustmentForm = ({ formData, onFormChange, onSubmit, onCancel, isSubmitting }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Adjustment Details</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Adjustment Reason <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => onFormChange('reason', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter adjustment reason"
                />
            </div>
            <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Note</label>
                <textarea
                    value={formData.note}
                    onChange={(e) => onFormChange('note', e.target.value)}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional notes..."
                    maxLength={500}
                />
                <p className="mt-1 text-sm text-gray-500">{formData.note.length}/500 characters</p>
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 border-t border-gray-200 pt-6">
            <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50">
                Cancel
            </button>
            <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="h-4 w-4" />
                        Save Adjustment
                    </>
                )}
            </button>
        </div>
    </div>
);

// Main Stock Adjustment Page Component
const StockAdjustmentPage = () => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [formData, setFormData] = useState({
        reason: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        status: 'active',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const { data: pd, isFetching } = useGetAllProductsWithStockQuery(
        { store_id: currentStoreId, search: searchTerm },
        {
            skip: !currentStoreId || searchTerm.length < 1, // skip if no store or search too short
        }
    );

    // RTK Query hooks
    // const { data: pd } = useGetAllProductsWithStockQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createStockAdjustment, { isLoading: isSubmitting }] = useCreateStockAdjustmentMutation();
    const products = pd?.data || [];
    const selectedProductIds = selectedProducts.map((p) => p.id);

    const handleAddProduct = (product) => {
        setSelectedProducts((prev) => [
            ...prev,
            {
                ...product,
                direction: 'increase',
                adjustedQuantity: 1,
                product_stock_type_id: '',
            },
        ]);
    };

    const handleUpdateProduct = (productId, field, value) => {
        setSelectedProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, [field]: value } : product)));
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts((prev) => prev.filter((product) => product.id !== productId));
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!currentStoreId) {
            toast.error('Please select a store first!');
            return;
        }

        if (selectedProducts.length === 0) {
            toast.error('Please select at least one product!');
            return;
        }

        if (!formData.reason.trim()) {
            toast.error('Please enter adjustment reason!');
            return;
        }

        // Check if all products have adjustment type selected
        const missingType = selectedProducts.find((p) => !p.product_stock_type_id);
        if (missingType) {
            toast.error('Please select adjustment type for all products!');
            return;
        }

        const payload = {
            store_id: parseInt(currentStoreId),
            product_adjustments: selectedProducts.map((product) => ({
                product_id: product.id,
                adjusted_stock: product.adjustedQuantity,
                direction: product.direction,
                product_stock_type_id: product.product_stock_type_id,
            })),
            reference_no: `ADJ-${Date.now()}`,
            reason: formData.reason,
        };

        try {
            await createStockAdjustment(payload).unwrap();

            // Reset form
            setSelectedProducts([]);
            setFormData({
                reason: '',
                date: new Date().toISOString().split('T')[0],
                note: '',
                status: 'active',
            });

            // Success modal
            await Swal.fire({
                title: 'Success!',
                text: 'Stock adjustment has been created successfully',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#10b981',
                background: '#ffffff',
                color: '#374151',
                customClass: {
                    popup: 'rounded-xl shadow-2xl',
                    title: 'text-xl font-semibold',
                    confirmButton: 'rounded-lg px-4 py-2 font-medium',
                },
            });
        } catch (error: any) {
            console.error('Create adjustment failed', error);
            const errorMessage = error?.data?.message || 'Something went wrong while creating the adjustment';

            await Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#ef4444',
                background: '#ffffff',
                color: '#374151',
                customClass: {
                    popup: 'rounded-xl shadow-2xl',
                    title: 'text-xl font-semibold',
                    confirmButton: 'rounded-lg px-4 py-2 font-medium',
                },
            });
        }
    };

    const handleCancel = () => {
        setSelectedProducts([]);
        setFormData({
            reason: '',
            date: new Date().toISOString().split('T')[0],
            note: '',
            status: 'active',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 shadow-md">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Stock Adjustment</h1>
                                <p className="text-sm text-gray-500">{currentStore ? `Manage inventory adjustments for ${currentStore.store_name}` : 'Manage inventory adjustments'}</p>
                            </div>
                        </div>
                    </div>
                    {currentStore && (
                        <div className="rounded-lg bg-orange-50 p-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                                    <Store className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-orange-900">Current Store: {currentStore.store_name}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Product Search */}
                    <ProductSearch
                        onAddProduct={handleAddProduct}
                        selectedStore={currentStoreId}
                        products={products}
                        selectedProductIds={selectedProductIds}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />

                    {/* Selected Products Table */}
                    <SelectedProductsTable selectedProducts={selectedProducts} onUpdateProduct={handleUpdateProduct} onRemoveProduct={handleRemoveProduct} />

                    {/* Adjustment Form */}
                    {selectedProducts.length > 0 && <AdjustmentForm formData={formData} onFormChange={handleFormChange} onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />}
                </div>

                {/* Tips Card */}
                <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-orange-800">
                            <p className="mb-1 font-medium">Stock Adjustment Tips:</p>
                            <ul className="space-y-1 text-orange-700">
                                <li>• Select the appropriate adjustment type for accurate inventory tracking</li>
                                <li>• Use "Increment" to add stock and "Decrement" to reduce stock</li>
                                <li>• Provide clear reasons for adjustments to maintain audit trails</li>
                                <li>• Double-check quantities before saving to avoid errors</li>
                                <li>• Review current stock levels before making adjustments</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAdjustmentPage;
