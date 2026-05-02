'use client';
import ItemPreviewModal from '@/app/(application)/(protected)/pos/pos-right-side/ItemPreviewModal';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showMessage } from '@/lib/toast';
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
import { useRouter } from 'next/navigation';
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
    const { t } = getTranslation();
    const dispatch = useDispatch();
    const { formatCurrency } = useCurrency();
    const { currentStoreId } = useCurrentStore();
    const userId = useSelector((state: RootState) => state.auth.user?.id);

    // Redux state - per-store
    const storeOrder = useSelector((state: RootState) => (currentStoreId && state.purchaseOrder.ordersByStore ? state.purchaseOrder.ordersByStore[currentStoreId] : null));
    const purchaseItems = storeOrder?.items || [];
    const supplierId = storeOrder?.supplierId;
    const notes = storeOrder?.notes || '';
    const purchaseType = storeOrder?.purchaseType || 'supplier';

    // Local state
    const [supplierSearch, setSupplierSearch] = useState('');
    const router = useRouter();
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

    // Supplier selection
    const handleSupplierSelect = (supplier: any) => {
        setSelectedSupplier(supplier);
        setSupplierSearch(supplier.name);
        setShowSupplierResults(false);
        if (!currentStoreId) return;
        dispatch(
            setSupplierDetailsRedux({
                storeId: currentStoreId,
                supplier: {
                    id: supplier.id,
                    name: supplier.name,
                    email: supplier.email,
                    phone: supplier.phone,
                    contact_person: supplier.contact_person,
                },
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
        if (!currentStoreId) return;
        dispatch(removeItemRedux({ storeId: currentStoreId, id: itemId }));
    };

    const handleQuantityChange = (itemId: number, value: string) => {
        const quantity = parseFloat(value) || 0;
        if (quantity < 0 || !currentStoreId) return;
        dispatch(updateItemQuantityRedux({ storeId: currentStoreId, id: itemId, quantity }));
    };

    const handlePurchasePriceChange = (itemId: number, value: string) => {
        const price = parseFloat(value) || 0;
        if (price < 0 || !currentStoreId) return;
        dispatch(updateItemPurchasePriceRedux({ storeId: currentStoreId, id: itemId, purchasePrice: price }));
    };

    // Add new product (not in inventory)
    const handleAddNewProduct = () => {
        if (!newProductName.trim()) {
            showMessage(t('msg_please_enter_product_name'), 'error');
            return;
        }

        if (!newProductUnit) {
            showMessage(t('msg_please_select_unit'), 'error');
            return;
        }

        if (newProductQty <= 0) {
            showMessage(t('msg_please_enter_valid_quantity'), 'error');
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

        // ✅ Fixed: Use the imported action with storeId
        if (!currentStoreId) {
            showMessage(t('msg_please_select_store'), 'error');
            return;
        }
        dispatch(addItemRedux({ storeId: currentStoreId, item: newItem }));
        setNewProductName('');
        setNewProductDescription('');
        setNewProductQty(1);
        setNewProductUnit('');
        setShowAddNewProduct(false);
        showMessage(t('msg_new_product_added_to_draft'));
    };

    // Calculate total
    const calculateTotal = () => {
        return purchaseItems.reduce((total, item) => total + item.purchasePrice * item.quantity, 0);
    };

    const grandTotal = calculateTotal();

    // Save draft (create or update based on edit mode)
    const handleSaveDraft = async () => {
        // Validation
        if (!currentStoreId) {
            showMessage(t('msg_please_select_store'), 'error');
            return;
        }

        if (purchaseType === 'supplier' && !supplierId) {
            showMessage(t('msg_please_select_supplier'), 'error');
            return;
        }

        if (purchaseItems.length === 0) {
            showMessage(t('msg_please_add_one_item'), 'error');
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

        try {
            let response;

            if (isEditMode && draftId) {
                // Update existing draft
                response = await updateDraft({ id: draftId, ...draftData }).unwrap();
            } else {
                // Create new draft
                response = await createDraft(draftData).unwrap();
            }

            Swal.fire({
                icon: 'success',
                title: isEditMode ? t('msg_draft_updated') : t('msg_draft_saved'),
                html: `
                    <p>${t('purchase_draft_ref')}: <strong>${response.data.draft_reference || response.data.draft_id}</strong></p>
                    <p>${t('order_items')}: <strong>${response.data.items?.length || purchaseItems.length}</strong></p>
                    <p>${t('lbl_estimated_total')}: <strong>${formatCurrency(grandTotal)}</strong></p>
                `,
                confirmButtonText: t('btn_view_drafts'),
                showCancelButton: !isEditMode,
                cancelButtonText: t('btn_create_another'),
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/purchases/list');
                } else if (!isEditMode && currentStoreId) {
                    dispatch(resetPurchaseOrderRedux(currentStoreId));
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

            const errorMessage = error?.data?.message || error?.message || t('msg_failed_to_save_draft');
            const errorDetails = error?.data?.errors
                ? Object.entries(error.data.errors)
                      .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                      .join('<br>')
                : '';

            Swal.fire({
                icon: 'error',
                title: t('msg_error_saving_draft'),
                html: `<p>${errorMessage}</p>${errorDetails ? `<div class="text-left mt-2"><small>${errorDetails}</small></div>` : ''}`,
            });
        }
    };

    // Create Purchase Order directly (without draft)
    const handleCreatePurchaseOrder = async () => {

        // Validation
        if (!currentStoreId) {
            showMessage(t('msg_please_select_store'), 'error');
            return;
        }

        if (purchaseType === 'supplier' && !supplierId) {
            showMessage(t('msg_please_select_supplier'), 'error');
            return;
        }

        if (purchaseItems.length === 0) {
            showMessage(t('msg_please_add_one_item'), 'error');
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
                title: t('msg_purchase_order_created'),
                html: `
                    <p>${t('lbl_invoice')}: <strong>${response.data.invoice_number || 'N/A'}</strong></p>
                    <p>${t('lbl_reference')}: <strong>${response.data.order_reference || response.data.purchase_reference || response.data.id}</strong></p>
                    <p>${t('order_items')}: <strong>${response.data.items?.length || purchaseItems.length}</strong></p>
                    <p>${t('lbl_grand_total')}: <strong>${formatCurrency(response.data.totals?.grand_total || grandTotal)}</strong></p>
                    <p>${t('lbl_status')}: <strong class="text-orange-600">${response.data.status?.toUpperCase() || 'ORDERED'}</strong></p>
                `,
                confirmButtonText: t('btn_view_purchase_orders'),
                showCancelButton: true,
                cancelButtonText: t('btn_create_another'),
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/purchases/list');
                } else if (currentStoreId) {
                    dispatch(resetPurchaseOrderRedux(currentStoreId));
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

            const errorMessage = error?.data?.message || error?.message || t('msg_failed_to_create_purchase_order');
            const errorDetails = error?.data?.errors
                ? Object.entries(error.data.errors)
                      .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                      .join('<br>')
                : '';

            Swal.fire({
                icon: 'error',
                title: t('msg_error_creating_purchase_order'),
                html: `<p>${errorMessage}</p>${errorDetails ? `<div class="text-left mt-2"><small>${errorDetails}</small></div>` : ''}`,
            });
        }
    };

    const clearAllItems = async () => {
        const confirmed = await showConfirmDialog(t('msg_clear_all_items'), t('msg_remove_all_purchase_items'), t('btn_yes_clear_all'), t('btn_cancel'), true, t('msg_all_items_cleared'));

        if (confirmed && currentStoreId) {
            dispatch(clearItemsRedux(currentStoreId));
        }
    };

    return (
        <div className={`relative w-full ${isMobileView && !showMobileCart ? 'hidden' : ''}`}>
            <div className="panel">
                <h2 className="mb-5 text-xl font-bold">{isEditMode ? t('lbl_edit_purchase_draft') : t('lbl_purchase_order_draft')}</h2>

                {/* Purchase Type Selection */}
                <div className="mb-6">
                    <label className="mb-2 block font-semibold">{t('lbl_purchase_type')} *</label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className={`flex-1 rounded-lg border-2 p-3 text-center font-semibold transition-all ${
                                purchaseType === 'supplier' ? 'border-primary bg-primary text-white' : 'border-gray-300 hover:border-primary'
                            }`}
                            onClick={() => {
                                if (!currentStoreId) return;
                                dispatch(setPurchaseTypeRedux({ storeId: currentStoreId, purchaseType: 'supplier' }));
                                if (purchaseType === 'walk_in') {
                                    clearSupplierSelection();
                                }
                            }}
                        >
                            {t('lbl_from_supplier')}
                        </button>
                        <button
                            type="button"
                            className={`flex-1 rounded-lg border-2 p-3 text-center font-semibold transition-all ${
                                purchaseType === 'walk_in' ? 'border-primary bg-primary text-white' : 'border-gray-300 hover:border-primary'
                            }`}
                            onClick={() => {
                                if (!currentStoreId) return;
                                dispatch(setPurchaseTypeRedux({ storeId: currentStoreId, purchaseType: 'walk_in' }));
                                clearSupplierSelection();
                            }}
                        >
                            {t('lbl_walk_in_own_buy')}
                        </button>
                    </div>
                </div>

                {/* Supplier Selection - Only show if purchase type is 'supplier' */}
                {purchaseType === 'supplier' && (
                    <div className="mb-6">
                        <label className="mb-2 block font-semibold">{t('lbl_supplier')} *</label>
                        {selectedSupplier ? (
                            <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                                <div>
                                    <p className="font-semibold">{selectedSupplier.name}</p>
                                    {selectedSupplier.contact_person && <p className="text-sm text-gray-600">{t('lbl_contact')}: {selectedSupplier.contact_person}</p>}
                                    {selectedSupplier.phone && <p className="text-sm text-gray-600">{t('lbl_phone')}: {selectedSupplier.phone}</p>}
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
                                    placeholder={t('placeholder_search_supplier')}
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
                                    <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white p-4 text-center text-sm text-gray-500 shadow-lg">{t('msg_no_suppliers_found')}</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Items Table */}
                <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                        <h3 className="text-base font-semibold text-gray-800 sm:text-lg">{t('lbl_purchase_items')}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm">{t('lbl_items')}: {purchaseItems.length}</span>
                            {purchaseItems.length > 0 && (
                                <button onClick={clearAllItems} className="btn btn-sm btn-outline-danger" title="Clear all items">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                            <button onClick={() => setShowAddNewProduct(!showAddNewProduct)} className="btn btn-sm btn-outline-primary">
                                <Plus className="mr-1 h-4 w-4" />
                                {t('lbl_add_new_product')}
                            </button>
                        </div>
                    </div>

                    {/* Add New Product Form */}
                    {showAddNewProduct && (
                        <div className="mb-4 rounded-lg border bg-blue-50 p-4">
                            <h4 className="mb-3 font-semibold">{t('lbl_add_product_not_in_inventory')}</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="col-span-2">
                                        <label className="mb-1 block text-sm font-medium">{t('lbl_product_name')} *</label>
                                        <input type="text" placeholder={t('placeholder_product_name')} className="form-input" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">{t('lbl_unit')} *</label>
                                        <select className="form-select" value={newProductUnit} onChange={(e) => setNewProductUnit(e.target.value)}>
                                            <option value="">{t('placeholder_select_unit')}</option>
                                            {units.map((unit: any) => (
                                                <option key={unit.id} value={unit.name}>
                                                    {unit.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">{t('lbl_ordered_quantity')} *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder={t('lbl_qty')}
                                            className="form-input"
                                            value={newProductQty === 0 ? '' : newProductQty}
                                            onChange={(e) => setNewProductQty(e.target.value === '' ? 0 : Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">{t('lbl_description')}</label>
                                    <textarea
                                        placeholder={t('placeholder_product_desc')}
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
                                    {t('btn_add_to_order')}
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
                                    {t('btn_cancel')}
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
                                        <th className="w-16 border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">{t('lbl_sno')}</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-left text-xs font-semibold text-gray-700">{t('lbl_product')}</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">{t('lbl_type')}</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">{t('lbl_unit')}</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">{t('lbl_ordered_qty')}</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-right text-xs font-semibold text-gray-700">{t('lbl_est_price')}</th>
                                        <th className="border-b border-r border-gray-300 p-3 text-right text-xs font-semibold text-gray-700">{t('lbl_est_total')}</th>
                                        <th className="border-b border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">{t('lbl_action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {purchaseItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="border-b border-gray-300 p-8">
                                                <div className="flex flex-col items-center justify-center py-8">
                                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                                        <ShoppingCart className="h-8 w-8 text-gray-600" />
                                                    </div>
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{t('msg_no_items_added')}</h3>
                                                    <p className="text-sm text-gray-600">{t('msg_select_products_or_add_new')}</p>
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
                                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">{t('lbl_existing')}</span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">{t('lbl_new')}</span>
                                                        )}
                                                    </td>
                                                    <td className="border-r border-gray-300 p-3 text-center text-sm">
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || t('lbl_piece')}</span>
                                                    </td>
                                                    <td className="border-r border-gray-300 p-3 text-center">
                                                        <input
                                                            type="number"
                                                            className="form-input w-20 text-center"
                                                            min="1"
                                                            value={item.quantity === 0 ? '' : item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="border-r border-gray-300 p-3 text-right">
                                                        <input
                                                            type="number"
                                                            className="form-input w-28 text-right"
                                                            min="0"
                                                            step="any"
                                                            value={item.purchasePrice === 0 ? '' : item.purchasePrice}
                                                            onChange={(e) => handlePurchasePriceChange(item.id, e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="border-r border-gray-300 p-3 text-right text-sm font-bold">{formatCurrency(item.quantity * item.purchasePrice)}</td>
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
                                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                        <ShoppingCart className="h-8 w-8 text-gray-600" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">No Items Added</h3>
                                    <p className="text-sm text-gray-600">Select products from the left or add new items</p>
                                </div>
                            ) : (
                                purchaseItems.map((item, index) => (
                                    <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex flex-1 items-start gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{index + 1}</span>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{item.title}</p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="text-xs text-gray-400">{t('lbl_unit')}: {item.unit}</span>
                                                        {item.itemType === 'existing' ? <span className="badge bg-success text-xs">{t('lbl_existing')}</span> : <span className="badge bg-info text-xs">{t('lbl_new')}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveItem(item.id)} className="rounded p-2 hover:bg-red-100">
                                                <Trash2 className="h-5 w-5 text-red-600" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">{t('lbl_quantity')}</label>
                                                <input
                                                    type="number"
                                                    className="form-input w-full"
                                                    min="1"
                                                    value={item.quantity === 0 ? '' : item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">{t('lbl_purchase_price')}</label>
                                                <input
                                                    type="number"
                                                    className="form-input w-full"
                                                    min="0"
                                                    step="any"
                                                    value={item.purchasePrice === 0 ? '' : item.purchasePrice}
                                                    onChange={(e) => handlePurchasePriceChange(item.id, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between border-t pt-3">
                                            <span className="text-sm font-medium text-gray-600">{t('lbl_amount')}</span>
                                            <span className="text-lg font-bold text-primary">{formatCurrency(item.quantity * item.purchasePrice)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="mb-2 block font-semibold">{t('lbl_notes')}</label>
                    <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder={t('placeholder_purchase_notes')}
                        value={notes}
                        onChange={(e) => currentStoreId && dispatch(setNotesRedux({ storeId: currentStoreId, notes: e.target.value }))}
                    />
                </div>

                {/* Total */}
                <div className="mb-6 rounded-lg border bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-2xl font-bold">
                        <span>{t('lbl_est_grand_total')}:</span>
                        <span className="text-primary">{formatCurrency(grandTotal)}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">* {t('msg_prices_adjusted_during_receiving')}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={handleSaveDraft}
                        className="btn btn-outline-primary flex-1"
                        disabled={isSavingDraft || isUpdatingDraft || isCreatingPurchase || purchaseItems.length === 0 || (purchaseType === 'supplier' && !supplierId)}
                        title={purchaseItems.length === 0 ? 'Add items first' : purchaseType === 'supplier' && !supplierId ? 'Select supplier first' : 'Save draft'}
                    >
                        <Save className="mr-2 h-5 w-5" />
                        {isSavingDraft || isUpdatingDraft ? t('lbl_saving') : isEditMode ? t('btn_update_draft') : t('btn_save_as_draft')}
                    </button>
                    <button
                        onClick={() => setShowPreview(true)}
                        className="btn btn-outline-secondary flex-1"
                        disabled={purchaseItems.length === 0}
                        title={purchaseItems.length === 0 ? 'Add items first' : 'Preview purchase order'}
                    >
                        <FileText className="mr-2 h-5 w-5" />
                        {t('btn_preview')}
                    </button>
                    <button
                        onClick={handleCreatePurchaseOrder}
                        className="btn btn-primary flex-1"
                        disabled={isSavingDraft || isUpdatingDraft || isCreatingPurchase || purchaseItems.length === 0 || (purchaseType === 'supplier' && !supplierId)}
                        title={purchaseItems.length === 0 ? 'Add items first' : purchaseType === 'supplier' && !supplierId ? 'Select supplier first' : 'Create purchase order'}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {isCreatingPurchase ? t('lbl_creating') : t('btn_create_purchase_order')}
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
