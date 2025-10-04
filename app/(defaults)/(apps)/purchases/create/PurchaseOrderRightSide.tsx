'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
import { useCreatePurchaseDraftMutation, useCreatePurchaseOrderMutation, useUpdatePurchaseDraftMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import {
    addItemRedux,
    clearItemsRedux,
    removeItemRedux,
    resetPurchaseOrderRedux,
    setNotesRedux,
    setPurchaseTypeRedux,
    setSupplierDetailsRedux,
    updateItemPurchasePriceRedux,
    updateItemQuantityRedux,
} from '@/store/features/PurchaseOrder/PurchaseOrderSlice';
import { useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { Plus, Save, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

interface PurchaseOrderRightSideProps {
    draftId?: number;
    isEditMode?: boolean;
}

const PurchaseOrderRightSide: React.FC<PurchaseOrderRightSideProps> = ({ draftId, isEditMode = false }) => {
    const dispatch = useDispatch();
    const { currentStoreId } = useCurrentStore();
    const userId = useSelector((state: RootState) => state.auth.user?.id);

    // Redux state
    const purchaseItems = useSelector((state: RootState) => state.purchaseOrder.items);
    const supplierId = useSelector((state: RootState) => state.purchaseOrder.supplierId);
    const notes = useSelector((state: RootState) => state.purchaseOrder.notes || '');
    const purchaseType = useSelector((state: RootState) => state.purchaseOrder.purchaseType);

    // Local state
    const [supplierSearch, setSupplierSearch] = useState('');
    const [showSupplierResults, setShowSupplierResults] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [newProductName, setNewProductName] = useState('');
    const [newProductQty, setNewProductQty] = useState(1);
    const [newProductUnit, setNewProductUnit] = useState('piece');
    const [showAddNewProduct, setShowAddNewProduct] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // API mutations
    const [createDraft, { isLoading: isSavingDraft }] = useCreatePurchaseDraftMutation();
    const [createPurchaseOrder, { isLoading: isCreatingPurchase }] = useCreatePurchaseOrderMutation();
    const [updateDraft, { isLoading: isUpdatingDraft }] = useUpdatePurchaseDraftMutation();

    // Fetch suppliers
    const { data: suppliersResponse } = useGetSuppliersQuery({
        search: supplierSearch,
        per_page: 10,
    });
    const suppliers = suppliersResponse?.data || [];

    const showMessage = (msg = '', type: 'success' | 'error' = 'success') => {
        const toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    // Supplier selection
    const handleSupplierSelect = (supplier: any) => {
        setSelectedSupplier(supplier);
        setSupplierSearch(supplier.name);
        setShowSupplierResults(false);
        dispatch(
            setSupplierDetailsRedux({
                id: supplier.id,
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                contact_person: supplier.contact_person,
            })
        );
    };

    const clearSupplierSelection = () => {
        setSelectedSupplier(null);
        setSupplierSearch('');
        setShowSupplierResults(false);
    };

    // Item management
    const handleRemoveItem = (itemId: number) => {
        dispatch(removeItemRedux(itemId));
    };

    const handleQuantityChange = (itemId: number, value: string) => {
        const quantity = parseFloat(value) || 0;
        if (quantity < 0) return;
        dispatch(updateItemQuantityRedux({ id: itemId, quantity }));
    };

    const handlePurchasePriceChange = (itemId: number, value: string) => {
        const price = parseFloat(value) || 0;
        if (price < 0) return;
        dispatch(updateItemPurchasePriceRedux({ id: itemId, purchasePrice: price }));
    };

    // Add new product (not in inventory)
    const handleAddNewProduct = () => {
        if (!newProductName.trim()) {
            showMessage('Please enter product name', 'error');
            return;
        }

        if (newProductQty <= 0) {
            showMessage('Please enter valid quantity', 'error');
            return;
        }

        const uniqueId = Date.now();
        const newItem = {
            id: uniqueId,
            productId: undefined, // No product_id because it doesn't exist yet
            itemType: 'new' as const,
            title: newProductName,
            description: '',
            purchasePrice: 0, // Will be set when receiving
            quantity: newProductQty,
            amount: 0,
            unit: newProductUnit,
            status: 'ordered',
        };

        // ✅ Fixed: Use the imported action
        dispatch(addItemRedux(newItem));
        setNewProductName('');
        setNewProductQty(1);
        setNewProductUnit('piece');
        setShowAddNewProduct(false);
        showMessage('New product added to draft');
    };

    // Calculate total
    const calculateTotal = () => {
        return purchaseItems.reduce((total, item) => total + item.purchasePrice * item.quantity, 0);
    };

    const grandTotal = calculateTotal();

    // Save draft (create or update based on edit mode)
    const handleSaveDraft = async () => {
        console.log('🔵 Save Draft button clicked!');
        console.log('Validation check:', {
            currentStoreId,
            purchaseType,
            supplierId,
            itemsCount: purchaseItems.length,
            items: purchaseItems,
        });

        // Validation
        if (!currentStoreId) {
            showMessage('Please select a store', 'error');
            return;
        }

        if (purchaseType === 'supplier' && !supplierId) {
            showMessage('Please select a supplier', 'error');
            return;
        }

        if (purchaseItems.length === 0) {
            showMessage('Please add at least one item', 'error');
            return;
        }

        // Prepare draft data
        const draftData = {
            store_id: currentStoreId,
            supplier_id: purchaseType === 'supplier' ? supplierId : null,
            purchase_type: purchaseType,
            notes: notes || '',
            items: purchaseItems.map((item) => {
                if (item.itemType === 'existing' && item.productId) {
                    return {
                        product_id: item.productId,
                        purchase_price: item.purchasePrice,
                        quantity_ordered: item.quantity,
                    };
                }

                return {
                    product_name: item.title,
                    product_description: item.description || '',
                    unit: item.unit || 'piece',
                    quantity_ordered: item.quantity,
                };
            }),
        };

        console.log('Saving draft with data:', draftData);

        try {
            let response;

            if (isEditMode && draftId) {
                // Update existing draft
                response = await updateDraft({ id: draftId, ...draftData }).unwrap();
            } else {
                // Create new draft
                response = await createDraft(draftData).unwrap();
            }

            console.log('✅ Draft saved successfully! Response:', response);

            Swal.fire({
                icon: 'success',
                title: isEditMode ? 'Draft Updated!' : 'Draft Saved!',
                html: `
                    <p>Draft Reference: <strong>${response.data.draft_reference || response.data.draft_id}</strong></p>
                    <p>Total Items: <strong>${response.data.items?.length || purchaseItems.length}</strong></p>
                    <p>Estimated Total: <strong>$${
                        typeof response.data.estimated_total === 'number' ? response.data.estimated_total.toFixed(2) : Number(response.data.estimated_total || 0).toFixed(2)
                    }</strong></p>
                `,
                confirmButtonText: 'View Drafts',
                showCancelButton: !isEditMode,
                cancelButtonText: 'Create Another',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/purchases/list';
                } else if (!isEditMode) {
                    dispatch(resetPurchaseOrderRedux());
                    clearSupplierSelection();
                }
            });
        } catch (error: any) {
            console.error('Error saving draft:', error);
            console.error('Error details:', {
                message: error?.data?.message,
                errors: error?.data?.errors,
                status: error?.status,
                data: error?.data,
            });

            const errorMessage = error?.data?.message || error?.message || 'Failed to save draft';
            const errorDetails = error?.data?.errors
                ? Object.entries(error.data.errors)
                      .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                      .join('<br>')
                : '';

            Swal.fire({
                icon: 'error',
                title: 'Error Saving Draft',
                html: `<p>${errorMessage}</p>${errorDetails ? `<div class="text-left mt-2"><small>${errorDetails}</small></div>` : ''}`,
            });
        }
    };

    // Create Purchase Order directly (without draft)
    const handleCreatePurchaseOrder = async () => {
        console.log('🟢 Create Purchase Order button clicked!');
        console.log('Validation check:', {
            currentStoreId,
            userId,
            purchaseType,
            supplierId,
            itemsCount: purchaseItems.length,
            items: purchaseItems,
        });

        // Validation
        if (!currentStoreId) {
            showMessage('Please select a store', 'error');
            return;
        }

        if (purchaseType === 'supplier' && !supplierId) {
            showMessage('Please select a supplier', 'error');
            return;
        }

        if (purchaseItems.length === 0) {
            showMessage('Please add at least one item', 'error');
            return;
        }

        // Prepare purchase order data
        const purchaseOrderData = {
            user_id: userId,
            store_id: currentStoreId,
            supplier_id: purchaseType === 'supplier' ? supplierId : null,
            purchase_type: purchaseType,
            notes: notes || '',
            items: purchaseItems.map((item) => {
                if (item.itemType === 'existing' && item.productId) {
                    return {
                        product_id: item.productId,
                        purchase_price: item.purchasePrice,
                        quantity_ordered: item.quantity,
                    };
                }

                return {
                    product_name: item.title,
                    product_description: item.description || '',
                    unit: item.unit || 'piece',
                    quantity_ordered: item.quantity,
                    purchase_price: 0, // Will be updated during receiving
                };
            }),
        };

        console.log('Creating purchase order with data:', purchaseOrderData);

        try {
            const response = await createPurchaseOrder(purchaseOrderData).unwrap();

            Swal.fire({
                icon: 'success',
                title: 'Purchase Order Created!',
                html: `
                    <p>PO Reference: <strong>${response.data.purchase_reference || response.data.id}</strong></p>
                    <p>Total Items: <strong>${response.data.items?.length || purchaseItems.length}</strong></p>
                    <p>Status: <strong>Pending Receipt</strong></p>
                `,
                confirmButtonText: 'View Purchase Orders',
                showCancelButton: true,
                cancelButtonText: 'Create Another',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/purchases/list';
                } else {
                    dispatch(resetPurchaseOrderRedux());
                    clearSupplierSelection();
                }
            });
        } catch (error: any) {
            console.error('Error creating purchase order:', error);
            console.error('Error details:', {
                message: error?.data?.message,
                errors: error?.data?.errors,
                status: error?.status,
                data: error?.data,
            });

            const errorMessage = error?.data?.message || error?.message || 'Failed to create purchase order';
            const errorDetails = error?.data?.errors
                ? Object.entries(error.data.errors)
                      .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                      .join('<br>')
                : '';

            Swal.fire({
                icon: 'error',
                title: 'Error Creating Purchase Order',
                html: `<p>${errorMessage}</p>${errorDetails ? `<div class="text-left mt-2"><small>${errorDetails}</small></div>` : ''}`,
            });
        }
    };

    const clearAllItems = () => {
        if (window.confirm('Are you sure you want to clear all items?')) {
            dispatch(clearItemsRedux());
        }
    };

    return (
        <div className="relative w-full">
            {(isSavingDraft || isUpdatingDraft || isCreatingPurchase) && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <p className="text-lg font-semibold text-gray-700">{isSavingDraft || isUpdatingDraft ? 'Saving Draft...' : 'Creating Purchase Order...'}</p>
                    </div>
                </div>
            )}

            <div className="panel">
                <h2 className="mb-5 text-xl font-bold">{isEditMode ? 'Edit Purchase Draft' : 'Purchase Order Draft'}</h2>

                {/* Debug Panel - Remove this after debugging */}
                <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 p-3 text-xs">
                    <strong>Debug Info:</strong>
                    <div>Store ID: {currentStoreId || '❌ Not selected'}</div>
                    <div>User ID: {userId || '❌ Not logged in'}</div>
                    <div>Purchase Type: {purchaseType}</div>
                    <div>Supplier ID: {supplierId || '❌ Not selected'}</div>
                    <div>Items Count: {purchaseItems.length}</div>
                    <div className="mt-1">
                        <strong>Buttons Status:</strong>
                        <div>• Items check: {purchaseItems.length === 0 ? '❌ No items' : '✅ Has items'}</div>
                        <div>• Supplier check: {purchaseType === 'supplier' && !supplierId ? '❌ Need supplier' : '✅ OK'}</div>
                        <div>• Store check: {currentStoreId ? '✅ OK' : '❌ Need store'}</div>
                    </div>
                </div>

                {/* Purchase Type Selection */}
                <div className="mb-6">
                    <label className="mb-2 block font-semibold">Purchase Type *</label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className={`flex-1 rounded-lg border-2 p-3 text-center font-semibold transition-all ${
                                purchaseType === 'supplier' ? 'border-primary bg-primary text-white' : 'border-gray-300 hover:border-primary'
                            }`}
                            onClick={() => {
                                dispatch(setPurchaseTypeRedux('supplier'));
                                if (purchaseType === 'walk_in') {
                                    clearSupplierSelection();
                                }
                            }}
                        >
                            From Supplier
                        </button>
                        <button
                            type="button"
                            className={`flex-1 rounded-lg border-2 p-3 text-center font-semibold transition-all ${
                                purchaseType === 'walk_in' ? 'border-primary bg-primary text-white' : 'border-gray-300 hover:border-primary'
                            }`}
                            onClick={() => {
                                dispatch(setPurchaseTypeRedux('walk_in'));
                                clearSupplierSelection();
                            }}
                        >
                            Walk-in / Own Buy
                        </button>
                    </div>
                </div>

                {/* Supplier Selection - Only show if purchase type is 'supplier' */}
                {purchaseType === 'supplier' && (
                    <div className="mb-6">
                        <label className="mb-2 block font-semibold">Supplier *</label>
                        {selectedSupplier ? (
                            <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                                <div>
                                    <p className="font-semibold">{selectedSupplier.name}</p>
                                    {selectedSupplier.contact_person && <p className="text-sm text-gray-600">Contact: {selectedSupplier.contact_person}</p>}
                                    {selectedSupplier.phone && <p className="text-sm text-gray-600">Phone: {selectedSupplier.phone}</p>}
                                </div>
                                <button onClick={clearSupplierSelection} className="rounded-full p-2 hover:bg-gray-200">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative" ref={searchInputRef}>
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search supplier by name..."
                                    className="form-input w-full pl-10"
                                    value={supplierSearch}
                                    onChange={(e) => {
                                        setSupplierSearch(e.target.value);
                                        setShowSupplierResults(true);
                                    }}
                                    onFocus={() => setShowSupplierResults(true)}
                                />
                                {showSupplierResults && suppliers.length > 0 && (
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
                                        {suppliers.map((supplier: any) => (
                                            <div key={supplier.id} className="cursor-pointer border-b p-3 hover:bg-gray-50" onClick={() => handleSupplierSelect(supplier)}>
                                                <p className="font-semibold">{supplier.name}</p>
                                                {supplier.contact_person && <p className="text-sm text-gray-600">{supplier.contact_person}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Items Table */}
                <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">Purchase Items</h3>
                        <button onClick={() => setShowAddNewProduct(!showAddNewProduct)} className="btn btn-sm btn-outline-primary">
                            <Plus className="mr-1 h-4 w-4" />
                            Add New Product
                        </button>
                    </div>

                    {/* Add New Product Form */}
                    {showAddNewProduct && (
                        <div className="mb-4 rounded-lg border bg-blue-50 p-4">
                            <h4 className="mb-3 font-semibold">Add Product Not in Inventory</h4>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="col-span-2">
                                    <label className="mb-1 block text-sm font-medium">Product Name *</label>
                                    <input type="text" placeholder="Product Name" className="form-input" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Unit *</label>
                                    <input type="text" placeholder="piece, kg, etc." className="form-input" value={newProductUnit} onChange={(e) => setNewProductUnit(e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Ordered Quantity *</label>
                                    <input type="number" min="1" placeholder="Qty" className="form-input" value={newProductQty} onChange={(e) => setNewProductQty(Number(e.target.value))} />
                                </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button onClick={handleAddNewProduct} className="btn btn-sm btn-primary">
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add to Order
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddNewProduct(false);
                                        setNewProductName('');
                                        setNewProductUnit('piece');
                                        setNewProductQty(1);
                                    }}
                                    className="btn btn-sm btn-outline-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Purchase Price</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-gray-500">
                                            No items added. Select products from the left or add new products.
                                        </td>
                                    </tr>
                                ) : (
                                    purchaseItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div>
                                                    <p className="font-semibold">{item.title}</p>
                                                    {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                                                    <p className="text-xs text-gray-400">Unit: {item.unit}</p>
                                                </div>
                                            </td>
                                            <td>{item.itemType === 'existing' ? <span className="badge bg-success">Existing</span> : <span className="badge bg-info">New</span>}</td>
                                            <td>
                                                <input type="number" className="form-input w-24" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, e.target.value)} />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-input w-28"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.purchasePrice}
                                                    onChange={(e) => handlePurchasePriceChange(item.id, e.target.value)}
                                                />
                                            </td>
                                            <td className="font-semibold">${(item.quantity * item.purchasePrice).toFixed(2)}</td>
                                            <td>
                                                <button onClick={() => handleRemoveItem(item.id)} className="rounded p-2 hover:bg-red-100">
                                                    <Trash2 className="h-5 w-5 text-red-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="mb-2 block font-semibold">Notes</label>
                    <textarea className="form-textarea" rows={3} placeholder="Add notes for this purchase order..." value={notes} onChange={(e) => dispatch(setNotesRedux(e.target.value))} />
                </div>

                {/* Total */}
                <div className="mb-6 rounded-lg border bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-2xl font-bold">
                        <span>Grand Total:</span>
                        <span className="text-primary">৳{grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={(e) => {
                            console.log('Save Draft button click event', e);
                            handleSaveDraft();
                        }}
                        className="btn btn-outline-primary flex-1"
                        disabled={isSavingDraft || isUpdatingDraft || isCreatingPurchase || purchaseItems.length === 0 || (purchaseType === 'supplier' && !supplierId)}
                        title={purchaseItems.length === 0 ? 'Add items first' : purchaseType === 'supplier' && !supplierId ? 'Select supplier first' : 'Save draft'}
                    >
                        <Save className="mr-2 h-5 w-5" />
                        {isSavingDraft || isUpdatingDraft ? 'Saving...' : isEditMode ? 'Update Draft' : 'Save as Draft'}
                    </button>
                    <button
                        onClick={(e) => {
                            console.log('Create Purchase Order button click event', e);
                            handleCreatePurchaseOrder();
                        }}
                        className="btn btn-primary flex-1"
                        disabled={isSavingDraft || isUpdatingDraft || isCreatingPurchase || purchaseItems.length === 0 || (purchaseType === 'supplier' && !supplierId)}
                        title={purchaseItems.length === 0 ? 'Add items first' : purchaseType === 'supplier' && !supplierId ? 'Select supplier first' : 'Create purchase order'}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {isCreatingPurchase ? 'Creating...' : 'Create Purchase Order'}
                    </button>
                    <button onClick={clearAllItems} className="btn btn-outline-danger" disabled={purchaseItems.length === 0}>
                        <Trash2 className="mr-2 h-5 w-5" />
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderRightSide;
