'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetAdjustmentTypesQuery, useGetSingleAdjustmentTypesQuery } from '@/store/features/AdjustmentType/adjustmentTypeApi';
import { useCreateStockAdjustmentMutation } from '@/store/features/StockAdjustment/stockAdjustmentApi';
import { useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import { useGetAllProductsWithStockQuery } from '@/store/Product/productApi';
import { Minus, Plus, Save, Search, Store, X } from 'lucide-react';
import { useState } from 'react';

// Store Selection Component
// const StoreSelector = ({ selectedStore, onStoreChange, stores, isLoading }) => (
//     <div className="rounded-lg border bg-white p-6 shadow-sm">
//         <h3 className="mb-4 text-lg font-semibold text-gray-800">Select Store</h3>
//         <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">
//                 Store <span className="text-red-500">*</span>
//             </label>
//             <select
//                 value={selectedStore}
//                 onChange={(e) => onStoreChange(e.target.value)}
//                 className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
//                 disabled={isLoading}
//             >
//                 <option value="">Select a store</option>
//                 {stores?.map((store) => (
//                     <option key={store.id} value={store.id}>
//                         {store.store_name}
//                     </option>
//                 ))}
//             </select>
//         </div>
//     </div>
// );

// Product Search Component
const ProductSearch = ({ onAddProduct, selectedStore, products, selectedProductIds }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredProducts =
        products
            ?.filter((product) => product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter((product) => !selectedProductIds.includes(product.id)) || [];

    const handleProductSelect = (product) => {
        onAddProduct(product);
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    return (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Add Products</h3>
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
                        className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                </div>

                {isDropdownOpen && searchTerm && selectedStore && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} onClick={() => handleProductSelect(product)} className="cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50">
                                    <div className="font-medium text-gray-900">{product.product_name}</div>
                                    <div className="text-sm text-gray-600">
                                        SKU: {product.sku} | Stock: {product.quantity}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-gray-500">No products found</div>
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
            <Minus className="h-4 w-4" />
        </button>
        <input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(min, parseInt(e.target.value) || min))}
            className="w-16 rounded border border-gray-300 px-2 py-1 text-center"
            min={min}
        />
        <button onClick={() => onQuantityChange(quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600">
            <Plus className="h-4 w-4" />
        </button>
    </div>
);

// Selected Products Table Component
const SelectedProductsTable = ({ selectedProducts, onUpdateProduct, onRemoveProduct }) => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const { data: ads_type } = useGetSingleAdjustmentTypesQuery(currentStoreId);
    const adjustmentTypes = ads_type?.data || [];
    // console.log(adjustmentTypes);
    if (selectedProducts.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Selected Products</h3>
                <p className="text-gray-500">No products selected</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Selected Products</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3 text-left font-medium text-gray-700">#</th>
                            <th className="p-3 text-left font-medium text-gray-700">Code</th>
                            <th className="p-3 text-left font-medium text-gray-700">Name</th>
                            <th className="p-3 text-left font-medium text-gray-700">Stock</th>
                            <th className="p-3 text-left font-medium text-gray-700">Adjustment Type</th>
                            <th className="p-3 text-left font-medium text-gray-700">Adjustment Direction</th>
                            <th className="p-3 text-left font-medium text-gray-700">Quantity</th>
                            <th className="p-3 text-left font-medium text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProducts.map((product, index) => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3 font-mono text-sm">{product.sku}</td>
                                <td className="p-3">{product.product_name}</td>
                                <td className="p-3">
                                    <span className="rounded bg-yellow-100 px-2 py-1 text-sm text-yellow-800">{Number(product.in_stock.quantity)}</span>
                                </td>
                                <td className="p-3">
                                    <select
                                        value={product.product_stock_type_id || ''}
                                        onChange={(e) => onUpdateProduct(product.id, 'product_stock_type_id', parseInt(e.target.value))}
                                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                                    >
                                        <option value="" disabled>
                                            Select Adjustment Type
                                        </option>
                                        {adjustmentTypes?.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.type}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-3">
                                    <select
                                        value={product.direction || 'increase'}
                                        onChange={(e) => onUpdateProduct(product.id, 'direction', e.target.value)}
                                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                                    >
                                        <option value="increase">Increment</option>
                                        <option value="decrease">Decrement</option>
                                    </select>
                                </td>
                                <td className="p-3">
                                    <QuantityControl quantity={product.adjustedQuantity || 1} onQuantityChange={(qty) => onUpdateProduct(product.id, 'adjustedQuantity', qty)} />
                                </td>
                                <td className="p-3">
                                    <button onClick={() => onRemoveProduct(product.id)} className="flex h-8 w-8 items-center justify-center rounded bg-red-500 text-white hover:bg-red-600">
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
    <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Adjustment Details</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Adjustment Reason <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => onFormChange('reason', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter adjustment reason"
                />
            </div>
            <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Note</label>
                <textarea
                    value={formData.note}
                    onChange={(e) => onFormChange('note', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional notes..."
                />
            </div>
        </div>

        <div className="mt-6 flex justify-between">
            {/* <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                <select value={formData.status} onChange={(e) => onFormChange('status', e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div> */}
            <div className="flex space-x-3">
                <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
                </button>
            </div>
        </div>
    </div>
);

// Main Stock Adjustment Page Component
const StockAdjustmentPage = () => {
    const { currentStore, currentStoreId } = useCurrentStore();
    const [selectedStore, setSelectedStore] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    // console.log(selectedProducts);
    const [formData, setFormData] = useState({
        reason: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        status: 'active',
    });

    // RTK Query hooks
    // const { data: st, isLoading: storesLoading } = useAllStoresQuery();
    const { data: st, isLoading: storesLoading } = useFullStoreListWithFilterQuery();
    // const { data: pd } = useGetAllProductsQuery({ store_id: selectedStore });
    const { data: pd } = useGetAllProductsWithStockQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    // const { data: pd_in_stock } = useGetAllProductsWithStockQuery();
    const [createStockAdjustment, { isLoading: isSubmitting }] = useCreateStockAdjustmentMutation();
    const stores = st?.data || [];
    const products = pd?.data || [];
    // console.log(products);
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
        if (!currentStoreId || selectedProducts.length === 0 || !formData.reason.trim()) {
            alert('Please fill in all required fields and select at least one product');
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
            await createStockAdjustment(payload);
            alert('Stock adjustment created successfully!');
            // Reset form
            setSelectedProducts([]);
            setFormData({
                reason: '',
                date: new Date().toISOString().split('T')[0],
                note: '',
                status: 'active',
            });
        } catch (error) {
            alert('Failed to create stock adjustment');
            console.error(error);
        }
    };

    const handleCancel = () => {
        setSelectedProducts([]);
        setSelectedStore('');
        setFormData({
            reason: '',
            date: new Date().toISOString().split('T')[0],
            note: '',
            status: 'active',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Stock Adjustment</h1>
                    <p className="text-gray-600">
                        Manage inventory adjustments for your store: <span className="font-semibold">{currentStore?.store_name}</span>
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Store Selection */}
                    {/* <StoreSelector selectedStore={selectedStore} onStoreChange={setSelectedStore} stores={stores} isLoading={storesLoading} /> */}

                    {/* Current Store Info */}
                    <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                        <Store className="h-6 w-6 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-500">Current Store</p>
                            <p className="text-lg font-semibold text-gray-800">{currentStore?.store_name || 'No store selected'}</p>
                        </div>
                    </div>

                    {/* Product Search */}
                    <ProductSearch onAddProduct={handleAddProduct} selectedStore={currentStoreId} products={products} selectedProductIds={selectedProductIds} />

                    {/* Selected Products Table */}
                    <SelectedProductsTable selectedProducts={selectedProducts} onUpdateProduct={handleUpdateProduct} onRemoveProduct={handleRemoveProduct} />

                    {/* Adjustment Form */}
                    <AdjustmentForm formData={formData} onFormChange={handleFormChange} onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
                </div>
            </div>
        </div>
    );
};

export default StockAdjustmentPage;
