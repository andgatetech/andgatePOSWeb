'use client';
import ItemPreviewModal from '@/app/(application)/(protected)/pos/pos-right-side/ItemPreviewModal';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showErrorDialog, showMessage, showSuccessDialog } from '@/lib/toast';
import type { RootState } from '@/store';
import { useGetUnitsQuery } from '@/store/features/Product/productApi';
import { useCreatePurchaseDraftMutation, useCreatePurchaseOrderMutation, useUpdatePurchaseDraftMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import {
    addItemRedux, clearItemsRedux, removeItemRedux, resetPurchaseOrderRedux,
    setNotesRedux, setPurchaseTypeRedux, setSupplierDetailsRedux,
    updateItemPurchasePriceRedux, updateItemQuantityRedux,
} from '@/store/features/PurchaseOrder/PurchaseOrderSlice';
import { useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { Eye, FileText, Plus, Save, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
    const router = useRouter();

    const storeOrder = useSelector((state: RootState) => (currentStoreId && state.purchaseOrder.ordersByStore ? state.purchaseOrder.ordersByStore[currentStoreId] : null));
    const purchaseItems = storeOrder?.items || [];
    const supplierId = storeOrder?.supplierId;
    const notes = storeOrder?.notes || '';
    const purchaseType = storeOrder?.purchaseType || 'supplier';

    const [supplierSearch, setSupplierSearch] = useState('');
    const [showSupplierResults, setShowSupplierResults] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [newProductName, setNewProductName] = useState('');
    const [newProductQty, setNewProductQty] = useState(1);
    const [newProductUnit, setNewProductUnit] = useState('');
    const [newProductPrice, setNewProductPrice] = useState(0);
    const [newProductDesc, setNewProductDesc] = useState('');
    const [showNewProductForm, setShowNewProductForm] = useState(false);
    const [showNewProductExtra, setShowNewProductExtra] = useState(false);
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const isMobileView = propIsMobileView !== undefined ? propIsMobileView : false;
    const showMobileCart = propShowMobileCart !== undefined ? propShowMobileCart : false;

    const [createDraft, { isLoading: isSavingDraft }] = useCreatePurchaseDraftMutation();
    const [createPurchaseOrder, { isLoading: isCreatingPurchase }] = useCreatePurchaseOrderMutation();
    const [updateDraft, { isLoading: isUpdatingDraft }] = useUpdatePurchaseDraftMutation();

    const { data: suppliersResponse } = useGetSuppliersQuery(
        { store_id: currentStoreId, search: supplierSearch || undefined, per_page: 10 },
        { skip: !currentStoreId }
    );
    const suppliers: any[] = useMemo(() => suppliersResponse?.data?.data || suppliersResponse?.data || [], [suppliersResponse]);

    const { data: unitsResponse } = useGetUnitsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const units: any[] = unitsResponse?.data || [];
    const defaultUnit = units?.[0]?.name || t('lbl_piece');

    useEffect(() => {
        if (supplierId && suppliers.length > 0) {
            const found = suppliers.find((s: any) => s.id === supplierId);
            if (found) setSelectedSupplier(found);
        }
    }, [supplierId, suppliers]);

    const handleSupplierSelect = (supplier: any) => {
        if (!currentStoreId) return;
        setSelectedSupplier(supplier);
        setSupplierSearch('');
        setShowSupplierResults(false);
        dispatch(setSupplierDetailsRedux({ storeId: currentStoreId, supplierId: supplier.id, supplier }));
    };

    const clearSupplierSelection = () => {
        if (!currentStoreId) return;
        setSelectedSupplier(null);
        setSupplierSearch('');
        dispatch(setSupplierDetailsRedux({ storeId: currentStoreId, supplierId: null, supplier: null }));
    };

    const handleAddNewProduct = () => {
        if (!currentStoreId || !newProductName.trim() || newProductQty < 1) return;
        dispatch(addItemRedux({
            storeId: currentStoreId,
            item: {
                id: Date.now(),
                title: newProductName.trim(),
                description: newProductDesc,
                unit: newProductUnit || defaultUnit,
                quantity: newProductQty,
                purchasePrice: newProductPrice,
                itemType: 'new',
            },
        }));
        setNewProductName('');
        setNewProductDesc('');
        setNewProductQty(1);
        setNewProductPrice(0);
        setNewProductUnit('');
        setShowNewProductExtra(false);
        showMessage(t('msg_new_product_added_to_draft'));
    };

    const handleQuantityChange = (itemId: number, value: string) => {
        if (!currentStoreId) return;
        const qty = parseFloat(value) || 1;
        dispatch(updateItemQuantityRedux({ storeId: currentStoreId, itemId, quantity: Math.max(1, qty) }));
    };

    const handlePurchasePriceChange = (itemId: number, value: string) => {
        if (!currentStoreId) return;
        dispatch(updateItemPurchasePriceRedux({ storeId: currentStoreId, itemId, purchasePrice: parseFloat(value) || 0 }));
    };

    const handleRemoveItem = (itemId: number) => {
        if (!currentStoreId) return;
        dispatch(removeItemRedux({ storeId: currentStoreId, itemId }));
    };

    const grandTotal = purchaseItems.reduce((total, item) => total + item.purchasePrice * item.quantity, 0);

    const clearAllItems = async () => {
        if (!currentStoreId) return;
        const confirmed = await showConfirmDialog(t('msg_confirm_clear_all'), t('msg_confirm_clear_all_desc'), t('btn_yes_clear'), t('btn_cancel'));
        if (confirmed) dispatch(clearItemsRedux(currentStoreId));
    };

    const handleSaveDraft = async () => {
        if (!currentStoreId) { showMessage(t('msg_please_select_store'), 'error'); return; }
        if (purchaseType === 'supplier' && !supplierId) { showMessage(t('msg_please_select_supplier'), 'error'); return; }
        if (purchaseItems.length === 0) { showMessage(t('msg_please_add_one_item'), 'error'); return; }

        const draftData: any = {
            store_id: currentStoreId,
            supplier_id: purchaseType === 'supplier' ? supplierId : null,
            purchase_type: purchaseType,
            notes: notes || '',
            items: purchaseItems.map((item: any) => {
                if (item.itemType === 'existing' && item.productId) {
                    const d: any = { product_id: item.productId, quantity_ordered: item.quantity, purchase_price: item.purchasePrice };
                    if (item.productStockId) d.product_stock_id = item.productStockId;
                    return d;
                }
                const d: any = { product_name: item.title, product_description: item.description || '', unit: item.unit || defaultUnit, quantity_ordered: item.quantity, purchase_price: item.purchasePrice };
                if (item.variantInfo && Object.keys(item.variantInfo).length > 0) d.variant_info = item.variantInfo;
                return d;
            }),
        };

        try {
            const response = await (isEditMode && draftId ? updateDraft({ id: draftId, ...draftData }) : createDraft(draftData)).unwrap();
            showSuccessDialog(isEditMode ? t('msg_draft_updated') : t('msg_draft_saved'), `${t('purchase_draft_ref')}: ${response.data.draft_reference || response.data.draft_id}`);
        } catch (error: any) {
            showErrorDialog(error?.data?.message || t('msg_failed_to_save_draft'));
        }
    };

    const handleCreatePurchaseOrder = async () => {
        if (!currentStoreId) { showMessage(t('msg_please_select_store'), 'error'); return; }
        if (purchaseType === 'supplier' && !supplierId) { showMessage(t('msg_please_select_supplier'), 'error'); return; }
        if (purchaseItems.length === 0) { showMessage(t('msg_please_add_one_item'), 'error'); return; }

        const purchaseOrderData: any = {
            user_id: userId, store_id: currentStoreId,
            supplier_id: purchaseType === 'supplier' ? supplierId : null,
            purchase_type: purchaseType, status: 'ordered', notes: notes || '',
            items: purchaseItems.map((item: any) => {
                if (item.itemType === 'existing' && item.productId) {
                    const d: any = { product_id: item.productId, quantity_ordered: item.quantity, purchase_price: item.purchasePrice };
                    if (item.productStockId) d.product_stock_id = item.productStockId;
                    return d;
                }
                const d: any = { product_name: item.title, product_description: item.description || '', unit: item.unit || defaultUnit, quantity_ordered: item.quantity, purchase_price: item.purchasePrice || 0 };
                if (item.variantInfo && Object.keys(item.variantInfo).length > 0) d.variant_info = item.variantInfo;
                return d;
            }),
        };

        try {
            const response = await createPurchaseOrder(purchaseOrderData).unwrap();
            const po = response.data || response;
            const invoice = po.invoice_number || po.id;
            showSuccessDialog(t('msg_purchase_order_created'), `${t('lbl_invoice')}: ${invoice} · ${t('lbl_total')}: ${formatCurrency(po.totals?.grand_total || grandTotal)}`);
            dispatch(resetPurchaseOrderRedux(currentStoreId));
            clearSupplierSelection();
            router.push('/purchases/list');
        } catch (error: any) {
            showErrorDialog(error?.data?.message || t('msg_failed_to_create_po'));
        }
    };

    const handleClearForm = async () => {
        if (!currentStoreId) return;
        const confirmed = await showConfirmDialog(t('msg_confirm_clear_form'), t('msg_confirm_clear_form_desc'), t('btn_yes_clear'), t('btn_cancel'));
        if (confirmed) { dispatch(clearItemsRedux(currentStoreId)); clearSupplierSelection(); }
    };

    const clearSupplier = clearSupplierSelection;
    const setNotes = (val: string) => { if (currentStoreId) dispatch(setNotesRedux({ storeId: currentStoreId, notes: val })); };

    return (
        <div className={`relative w-full ${isMobileView && !showMobileCart ? 'hidden' : ''}`}>
            <div className="panel space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{isEditMode ? t('lbl_edit_purchase_draft') : t('lbl_purchase_order_draft')}</h2>
                        <p className="text-xs text-gray-500">{t('purchase_page_desc')}</p>
                    </div>
                </div>

                {/* Purchase Type + Supplier Row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('lbl_purchase_type')}</label>
                        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                            <button
                                type="button"
                                onClick={() => { if (currentStoreId) { dispatch(setPurchaseTypeRedux({ storeId: currentStoreId, purchaseType: 'supplier' })); clearSupplier(); } }}
                                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                                    purchaseType === 'supplier' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t('lbl_from_supplier')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { if (currentStoreId) { dispatch(setPurchaseTypeRedux({ storeId: currentStoreId, purchaseType: 'walk_in' })); clearSupplier(); } }}
                                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                                    purchaseType === 'walk_in' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t('lbl_walk_in_own_buy')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Supplier Selector */}
                {purchaseType === 'supplier' && (
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('lbl_supplier')} *</label>
                        {selectedSupplier ? (
                            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                                <div>
                                    <p className="font-semibold text-gray-900">{selectedSupplier.name}</p>
                                    <p className="text-xs text-gray-500">{selectedSupplier.phone || selectedSupplier.email || ''}</p>
                                </div>
                                <button onClick={clearSupplierSelection} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative" ref={searchInputRef}>
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('placeholder_search_supplier')}
                                    className="form-input w-full pl-9"
                                    value={supplierSearch}
                                    onChange={(e) => { setSupplierSearch(e.target.value); setShowSupplierResults(true); }}
                                    onFocus={() => setShowSupplierResults(true)}
                                />
                                {showSupplierResults && suppliers.length > 0 && (
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                        {suppliers.map((supplier: any) => (
                                            <div key={supplier.id} className="cursor-pointer border-b border-gray-100 px-4 py-3 hover:bg-gray-50 last:border-b-0" onClick={() => handleSupplierSelect(supplier)}>
                                                <p className="text-sm font-semibold text-gray-900">{supplier.name}</p>
                                                {(supplier.phone || supplier.email) && <p className="text-xs text-gray-500">{supplier.phone || supplier.email}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showSupplierResults && supplierSearch.trim() !== '' && suppliers.length === 0 && (
                                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-lg">{t('msg_no_suppliers_found')}</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Add New Product */}
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_100px_120px_auto] sm:items-end">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">{t('lbl_product_name')} *</label>
                            <input
                                type="text"
                                placeholder={t('placeholder_product_name')}
                                className="form-input w-full"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewProduct(); } }}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">{t('lbl_qty')}</label>
                            <input
                                type="number" min="1"
                                className="form-input w-full"
                                value={newProductQty === 0 ? '' : newProductQty}
                                onChange={(e) => setNewProductQty(e.target.value === '' ? 0 : Number(e.target.value))}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewProduct(); } }}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">{t('lbl_purchase_price')}</label>
                            <input
                                type="number" min="0" step="any"
                                className="form-input w-full"
                                value={newProductPrice === 0 ? '' : newProductPrice}
                                onChange={(e) => setNewProductPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewProduct(); } }}
                            />
                        </div>
                        <button onClick={handleAddNewProduct} disabled={!newProductName.trim()} className="btn btn-primary h-10">
                            <Plus className="mr-1 h-4 w-4" />
                            {t('btn_add_to_order')}
                        </button>
                    </div>
                    <button type="button" onClick={() => setShowNewProductExtra(!showNewProductExtra)} className="mt-2 text-xs font-medium text-primary hover:underline">
                        {showNewProductExtra ? t('lbl_hide_details') : t('lbl_show_details')} ({t('lbl_unit')}, {t('lbl_description')})
                    </button>
                    {showNewProductExtra && (
                        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-gray-200 pt-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">{t('lbl_unit')}</label>
                                <select className="form-select w-full" value={newProductUnit || defaultUnit} onChange={(e) => setNewProductUnit(e.target.value)}>
                                    {units.map((unit: any) => <option key={unit.id} value={unit.name}>{unit.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">{t('lbl_description')}</label>
                                <input type="text" placeholder={t('placeholder_product_desc')} className="form-input w-full" value={newProductDesc} onChange={(e) => setNewProductDesc(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-700">{t('lbl_purchase_items')}</h3>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{purchaseItems.length}</span>
                        </div>
                        {purchaseItems.length > 0 && (
                            <button onClick={clearAllItems} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                                <Trash2 className="h-3.5 w-3.5" /> {t('lbl_clear_all')}
                            </button>
                        )}
                    </div>

                    {purchaseItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
                            <ShoppingCart className="mb-3 h-10 w-10 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">{t('msg_no_items_added')}</p>
                            <p className="mt-1 text-xs text-gray-400">{t('msg_select_products_or_add_new')}</p>
                        </div>
                    ) : !isMobileView ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-4 py-3 text-left">#</th>
                                        <th className="px-4 py-3 text-left">{t('lbl_product')}</th>
                                        <th className="px-4 py-3 text-center w-20">{t('lbl_qty')}</th>
                                        <th className="px-4 py-3 text-right w-28">{t('lbl_price')}</th>
                                        <th className="px-4 py-3 text-right w-28">{t('lbl_total')}</th>
                                        <th className="px-4 py-3 text-center w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {purchaseItems.map((item: any, idx: number) => (
                                        <tr key={item.id} className="transition-colors hover:bg-blue-50/50">
                                            <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {item.itemType === 'existing' && (
                                                        <button onClick={() => { setSelectedItem(item); setItemModalOpen(true); }} className="flex-shrink-0 rounded p-0.5 text-blue-500 hover:bg-blue-50" title={t('msg_view_item_details')}>
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className={`inline-block rounded-full px-1.5 py-0 text-[10px] font-semibold ${item.itemType === 'existing' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {item.itemType === 'existing' ? t('lbl_existing') : t('lbl_new')}
                                                            </span>
                                                            {item.unit && <span className="text-[10px] text-gray-400">{item.unit}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="number" min="1" className="w-16 rounded-md border border-gray-200 px-2 py-1.5 text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                                    value={item.quantity === 0 ? '' : item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input type="number" min="0" step="any" className="w-24 rounded-md border border-gray-200 px-2 py-1.5 text-right text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                                    value={item.purchasePrice === 0 ? '' : item.purchasePrice}
                                                    onChange={(e) => handlePurchasePriceChange(item.id, e.target.value)} />
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(item.quantity * item.purchasePrice)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleRemoveItem(item.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {purchaseItems.map((item: any, idx: number) => (
                                <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 min-w-0">
                                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{idx + 1}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className={`inline-block rounded-full px-1.5 py-0 text-[10px] font-semibold ${item.itemType === 'existing' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{item.itemType === 'existing' ? t('lbl_existing') : t('lbl_new')}</span>
                                                    {item.unit && <span className="text-[10px] text-gray-400">{item.unit}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.id)} className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="mb-0.5 block text-[10px] text-gray-400">{t('lbl_qty')}</label>
                                            <input type="number" min="1" className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-primary" value={item.quantity || ''} onChange={(e) => handleQuantityChange(item.id, e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="mb-0.5 block text-[10px] text-gray-400">{t('lbl_price')}</label>
                                            <input type="number" min="0" step="any" className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-primary" value={item.purchasePrice || ''} onChange={(e) => handlePurchasePriceChange(item.id, e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-between border-t pt-2 text-sm">
                                        <span className="text-gray-500">{t('lbl_amount')}</span>
                                        <span className="font-bold text-primary">{formatCurrency(item.quantity * item.purchasePrice)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('lbl_notes')}</label>
                    <textarea className="form-textarea w-full" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('placeholder_notes')} />
                </div>

                {/* Total & Actions */}
                <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02] p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">{t('lbl_grand_total')}</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSavingDraft || isUpdatingDraft || purchaseItems.length === 0}
                            className="btn btn-outline-primary flex-1"
                            title={purchaseItems.length === 0 ? t('msg_add_items_first') : t('msg_save_draft')}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isSavingDraft || isUpdatingDraft ? t('lbl_saving') : isEditMode ? t('btn_update_draft') : t('btn_save_as_draft')}
                        </button>
                        <button
                            onClick={() => setShowPreview(true)}
                            disabled={purchaseItems.length === 0}
                            className="btn btn-outline-secondary flex-1"
                            title={purchaseItems.length === 0 ? t('msg_add_items_first') : t('msg_preview_purchase_order')}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            {t('btn_preview')}
                        </button>
                        <button
                            onClick={handleCreatePurchaseOrder}
                            disabled={isCreatingPurchase || purchaseItems.length === 0 || (purchaseType === 'supplier' && !supplierId)}
                            className="btn btn-primary flex-1 shadow-lg shadow-primary/20"
                            title={purchaseItems.length === 0 ? t('msg_add_items_first') : t('msg_create_purchase_order')}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {isCreatingPurchase ? t('lbl_creating') : t('btn_create_purchase_order')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showPreview && <PurchaseOrderPreview isOpen={showPreview} onClose={() => setShowPreview(false)} />}
            {itemModalOpen && selectedItem && <ItemPreviewModal isOpen={itemModalOpen} onClose={() => { setItemModalOpen(false); setSelectedItem(null); }} item={selectedItem} />}
            {(isSavingDraft || isUpdatingDraft || isCreatingPurchase) && <LoadingOverlay />}
        </div>
    );
};

export default PurchaseOrderRightSide;
