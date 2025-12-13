'use client';
import ItemPreviewModal from '@/app/(application)/(protected)/pos/pos-right-side/ItemPreviewModal';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
import { useGetUnitsQuery } from '@/store/features/Product/productApi';
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
import { Eye, FileText, Plus, Save, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import LoadingOverlay from './LoadingOverlay';
import PurchaseOrderPreview from './PurchaseOrderPreview';

interface PurchaseOrderRightSideProps {
    draftId?: number;
    isEditMode?: boolean;
    isMobileView?: boolean;
    showMobileCart?: boolean;
}

const PurchaseOrderRightSide: React.FC<PurchaseOrderRightSideProps> = ({ draftId, isEditMode = false, isMobileView: propIsMobileView, showMobileCart: propShowMobileCart }) => {
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
    const [newProductDescription, setNewProductDescription] = useState('');
    const [newProductQty, setNewProductQty] = useState(1);
    const [newProductUnit, setNewProductUnit] = useState('');
    const [showAddNewProduct, setShowAddNewProduct] = useState(false);
    const [localIsMobileView, setLocalIsMobileView] = useState(false);
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Use props if provided, otherwise use local state
    const isMobileView = propIsMobileView !== undefined ? propIsMobileView : localIsMobileView;
    const showMobileCart = propShowMobileCart !== undefined ? propShowMobileCart : false;

    // API mutations
    const [createDraft, { isLoading: isSavingDraft }] = useCreatePurchaseDraftMutation();
    const [createPurchaseOrder, { isLoading: isCreatingPurchase }] = useCreatePurchaseOrderMutation();
    const [updateDraft, { isLoading: isUpdatingDraft }] = useUpdatePurchaseDraftMutation();

    // Fetch suppliers - always fetch 5 for dropdown
    const { data: suppliersResponse } = useGetSuppliersQuery(
        {
            search: supplierSearch,
            per_page: 5,
            store_id: currentStoreId,
        },
        {
            skip: !currentStoreId, // Only fetch when store is selected
        }
    );
    const suppliers = suppliersResponse?.data?.items || [];

    // Fetch units
    const { data: unitsResponse } = useGetUnitsQuery({
        store_id: currentStoreId,
    });
    const units = unitsResponse?.data || [];

    // Mobile view detection (only if not using props)
    useEffect(() => {
        if (propIsMobileView === undefined) {
            const checkMobileView = () => {
                setLocalIsMobileView(window.innerWidth < 1024);
            };

            checkMobileView();
            window.addEventListener('resize', checkMobileView);

            return () => window.removeEventListener('resize', checkMobileView);
        }
    }, [propIsMobileView]);

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

        if (!newProductUnit) {
            showMessage('Please select a unit', 'error');
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
            description: newProductDescription,
            purchasePrice: 0, // Will be set when receiving
            quantity: newProductQty,
            amount: 0,
            unit: newProductUnit,
            status: 'ordered',
        };

        // ✅ Fixed: Use the imported action
        dispatch(addItemRedux(newItem));
        setNewProductName('');
        setNewProductDescription('');
        setNewProductQty(1);
        setNewProductUnit('');
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
                    // Existing product with variant
                    const itemData: any = {
                        product_id: item.productId,
                        quantity_ordered: item.quantity,
                        purchase_price: item.purchasePrice,
                    };

                    // Include product_stock_id for variant products
                    if (item.productStockId) {
                        itemData.product_stock_id = item.productStockId;
                    }

                    return itemData;
                }

                // New product
                const newItemData: any = {
                    product_name: item.title,
                    product_description: item.description || '',
                    unit: item.unit || 'piece',
                    quantity_ordered: item.quantity,
                    purchase_price: item.purchasePrice,
                };

                // Include variant_info for new products with variants
                if (item.variantInfo && Object.keys(item.variantInfo).length > 0) {
                    newItemData.variant_info = item.variantInfo;
                }

                return newItemData;
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
                    <p>Estimated Total: <strong>৳${grandTotal.toFixed(2)}</strong></p>
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
            status: 'ordered', // Set status to ordered
            notes: notes || '',
            items: purchaseItems.map((item) => {
                if (item.itemType === 'existing' && item.productId) {
                    // Existing product with variant
                    const itemData: any = {
                        product_id: item.productId,
                        quantity_ordered: item.quantity,
                        purchase_price: item.purchasePrice,
                    };

                    // Include product_stock_id for variant products
                    if (item.productStockId) {
                        itemData.product_stock_id = item.productStockId;
                    }

                    return itemData;
                }

                // New product
                const newItemData: any = {
                    product_name: item.title,
                    product_description: item.description || '',
                    unit: item.unit || 'piece',
                    quantity_ordered: item.quantity,
                    purchase_price: item.purchasePrice || 0,
                };

                // Include variant_info for new products with variants
                if (item.variantInfo && Object.keys(item.variantInfo).length > 0) {
                    newItemData.variant_info = item.variantInfo;
                }

                return newItemData;
            }),
        };

       

        try {
            const response = await createPurchaseOrder(purchaseOrderData).unwrap();

            Swal.fire({
                icon: 'success',
                title: 'Purchase Order Created!',
                html: `
                    <p>Invoice Number: <strong>${response.data.invoice_number || 'N/A'}</strong></p>
                    <p>Order Reference: <strong>${response.data.order_reference || response.data.purchase_reference || response.data.id}</strong></p>
                    <p>Total Items: <strong>${response.data.items?.length || purchaseItems.length}</strong></p>
                    <p>Grand Total: <strong>৳${response.data.totals?.grand_total?.toFixed(2) || grandTotal.toFixed(2)}</strong></p>
                    <p>Status: <strong class="text-orange-600">${response.data.status?.toUpperCase() || 'ORDERED'}</strong></p>
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
        <div className={`relative w-full ${isMobileView && !showMobileCart ? 'hidden' : ''}`}>
            

            <div className="panel">
                <h2 className="mb-5 text-xl font-bold">{isEditMode ? 'Edit Purchase Draft' : 'Purchase Order Draft'}</h2>

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
                                {showSupplierResults && supplierSearch.trim() === '' && suppliers.length > 0 && (
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
                                        {suppliers.map((supplier: any) => (
                                            <div key={supplier.id} className="cursor-pointer border-b p-3 hover:bg-gray-50" onClick={() => handleSupplierSelect(supplier)}>
                                                <p className="font-semibold">{supplier.name}</p>
                                                {supplier.email && <p className="text-xs text-gray-500">{supplier.email}</p>}
                                                {supplier.phone && <p className="text-xs text-gray-500">{supplier.phone}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showSupplierResults && supplierSearch.trim() !== '' && suppliers.length > 0 && (
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
                                        {suppliers.map((supplier: any) => (
                                            <div key={supplier.id} className="cursor-pointer border-b p-3 hover:bg-gray-50" onClick={() => handleSupplierSelect(supplier)}>
                                                <p className="font-semibold">{supplier.name}</p>
                                                {supplier.email && <p className="text-xs text-gray-500">{supplier.email}</p>}
                                                {supplier.phone && <p className="text-xs text-gray-500">{supplier.phone}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showSupplierResults && supplierSearch.trim() !== '' && suppliers.length === 0 && (
                                    <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white p-4 text-center text-sm text-gray-500 shadow-lg">No suppliers found</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Items Table */}
                <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                        <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Purchase Items</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm">Items: {purchaseItems.length}</span>
                            {purchaseItems.length > 0 && (
                                <button onClick={clearAllItems} className="btn btn-sm btn-outline-danger" title="Clear all items">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                            <button onClick={() => setShowAddNewProduct(!showAddNewProduct)} className="btn btn-sm btn-outline-primary">
                                <Plus className="mr-1 h-4 w-4" />
                                Add New Product
                            </button>
                        </div>
                    </div>

                    {/* Add New Product Form */}
                    {showAddNewProduct && (
                        <div className="mb-4 rounded-lg border bg-blue-50 p-4">
                            <h4 className="mb-3 font-semibold">Add Product Not in Inventory</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="col-span-2">
                                        <label className="mb-1 block text-sm font-medium">Product Name *</label>
                                        <input type="text" placeholder="Product Name" className="form-input" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Unit *</label>
                                        <select className="form-select" value={newProductUnit} onChange={(e) => setNewProductUnit(e.target.value)}>
                                            <option value="">Select Unit</option>
                                            {units.map((unit: any) => (
                                                <option key={unit.id} value={unit.name}>
                                                    {unit.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Ordered Quantity *</label>
                                        <input type="number" min="1" placeholder="Qty" className="form-input" value={newProductQty} onChange={(e) => setNewProductQty(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Description</label>
                                    <textarea
                                        placeholder="Product description (optional)"
                                        className="form-textarea"
                                        rows={2}
                                        value={newProductDescription}
                                        onChange={(e) => setNewProductDescription(e.target.value)}
                                    />
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
                                        setNewProductDescription('');
                                        setNewProductUnit('');
                                        setNewProductQty(1);
                                    }}
                                    className="btn btn-sm btn-outline-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Desktop Table View */}
                    {!isMobileView ? (
                        <div className="overflow-x-auto rounded-lg border border-gray-300">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <th className="w-16 border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">S.No</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-left text-xs font-semibold text-gray-700">Product</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Type</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Unit</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Ordered Qty</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-right text-xs font-semibold text-gray-700">Est. Price</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-right text-xs font-semibold text-gray-700">Est. Total</th>
                                        <th className="border-b border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {purchaseItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="border-b border-gray-300 p-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center py-4">
                                                    <div className="mb-2 text-3xl">📦</div>
                                                    <div className="font-medium">No items added yet</div>
                                                    <div className="text-sm">Select products from the left or add new products</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        purchaseItems.map((item, index) => {
                                            return (
                                                <tr key={item.id} className={`transition-colors hover:bg-blue-50 ${index < purchaseItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                                    <td className="border-r border-gray-300 p-3 text-center text-sm font-medium text-gray-600">{index + 1}</td>
                                                    <td className="border-r border-gray-300 p-3">
                                                        <div className="flex items-center gap-2">
                                                            {item.itemType === 'existing' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedItem(item);
                                                                        setItemModalOpen(true);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                    title="View item details"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="border-r border-gray-300 p-3 text-center">
                                                        {item.itemType === 'existing' ? (
                                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Existing</span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">New</span>
                                                        )}
                                                    </td>
                                                    <td className="border-r border-gray-300 p-3 text-center text-sm">
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || 'piece'}</span>
                                                    </td>
                                                    <td className="border-r border-gray-300 p-3 text-center">
                                                        <input
                                                            type="number"
                                                            className="form-input w-20 text-center"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="border-r border-gray-300 p-3 text-right">
                                                        <input
                                                            type="number"
                                                            className="form-input w-28 text-right"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.purchasePrice}
                                                            onChange={(e) => handlePurchasePriceChange(item.id, e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="border-r border-gray-300 p-3 text-right text-sm font-bold">৳{(item.quantity * item.purchasePrice).toFixed(2)}</td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 hover:text-red-800"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Mobile Card View */
                        <div className="space-y-3">
                            {purchaseItems.length === 0 ? (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">No items added. Select products from the left or add new products.</div>
                            ) : (
                                purchaseItems.map((item, index) => (
                                    <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex flex-1 items-start gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{index + 1}</span>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{item.title}</p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="text-xs text-gray-400">Unit: {item.unit}</span>
                                                        {item.itemType === 'existing' ? <span className="badge bg-success text-xs">Existing</span> : <span className="badge bg-info text-xs">New</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveItem(item.id)} className="rounded p-2 hover:bg-red-100">
                                                <Trash2 className="h-5 w-5 text-red-600" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">Quantity</label>
                                                <input type="number" className="form-input w-full" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">Purchase Price</label>
                                                <input
                                                    type="number"
                                                    className="form-input w-full"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.purchasePrice}
                                                    onChange={(e) => handlePurchasePriceChange(item.id, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between border-t pt-3">
                                            <span className="text-sm font-medium text-gray-600">Amount</span>
                                            <span className="text-lg font-bold text-primary">৳{(item.quantity * item.purchasePrice).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="mb-2 block font-semibold">Notes</label>
                    <textarea className="form-textarea" rows={3} placeholder="Add notes for this purchase order..." value={notes} onChange={(e) => dispatch(setNotesRedux(e.target.value))} />
                </div>

                {/* Total */}
                <div className="mb-6 rounded-lg border bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-2xl font-bold">
                        <span>Est. Grand Total:</span>
                        <span className="text-primary">৳{grandTotal.toFixed(2)}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">* Prices can be adjusted during receiving</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
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
                        onClick={() => setShowPreview(true)}
                        className="btn btn-outline-secondary flex-1"
                        disabled={purchaseItems.length === 0}
                        title={purchaseItems.length === 0 ? 'Add items first' : 'Preview purchase order'}
                    >
                        <FileText className="mr-2 h-5 w-5" />
                        Preview
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
                </div>
            </div>

            {/* Item Preview Modal */}
            <ItemPreviewModal isOpen={itemModalOpen} onClose={() => setItemModalOpen(false)} item={selectedItem} />

            {/* Purchase Order Preview Modal */}
            <PurchaseOrderPreview isOpen={showPreview} onClose={() => setShowPreview(false)} />

            {/* Loading Overlay */}
            <LoadingOverlay isLoading={isSavingDraft || isUpdatingDraft || isCreatingPurchase} />
        </div>
    );
};

export default PurchaseOrderRightSide;
