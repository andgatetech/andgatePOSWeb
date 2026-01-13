'use client';

import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
import { useCreateOrderMutation } from '@/store/features/Order/Order';
import { clearItemsRedux, removeItemRedux, updateItemRedux } from '@/store/features/Order/OrderSlice';
import { useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import CashPaymentSection from './pos-right-side/CashPaymentSection';
import CustomerSection from './pos-right-side/CustomerSection';
import LoadingOverlay from './pos-right-side/LoadingOverlay';
import OrderDetailsSection from './pos-right-side/OrderDetailsSection';
import PaymentSummarySection from './pos-right-side/PaymentSummarySection';
import PreviewModal from './pos-right-side/PreviewModal';
import type { Customer, CustomerApiResponse, PosFormData } from './pos-right-side/types';
import { MEMBERSHIP_DISCOUNTS } from './pos-right-side/types';

const DEFAULT_PAYMENT_METHOD = {
    id: 0,
    payment_method_name: 'Cash',
};

const PosRightSide: React.FC = () => {
    const dispatch = useDispatch();
    const { currentStoreId, currentStore } = useCurrentStore();

    const invoiceItems = useSelector((state: RootState) => state.invoice.items);
    const userId = useSelector((state: RootState) => state.auth.user?.id);

    const searchInputRef = useRef<HTMLDivElement | null>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [customerSearch, setCustomerSearch] = useState('');
    const [searchParams, setSearchParams] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [orderResponse, setOrderResponse] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);

    const [formData, setFormData] = useState<PosFormData>({
        customerId: null,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        discount: 0,
        membershipDiscount: 0,
        paymentMethod: '',
        paymentStatus: '',
        usePoints: false,
        useBalance: false,
        pointsToUse: 0,
        balanceToUse: 0,
        useWholesale: false,
        amountPaid: 0,
        changeAmount: 0,
        partialPaymentAmount: 0,
        dueAmount: 0,
    });

    const [isManualCustomerEntry, setIsManualCustomerEntry] = useState(false);
    const showManualCustomerForm = isManualCustomerEntry || !!selectedCustomer;

    const [createOrder] = useCreateOrderMutation();
    const [loading, setLoading] = useState(false);

    const showMessage = (msg = '', type: 'success' | 'error' = 'success') => {
        if (type === 'success') {
            toast.success(msg, {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#10b981',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10b981',
                },
            });
        } else {
            toast.error(msg, {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
        }
    };

    const getMembershipBadgeClass = (membership?: string) => {
        switch ((membership || 'normal').toLowerCase()) {
            case 'platinum':
                return 'bg-purple-100 text-purple-800';
            case 'gold':
                return 'bg-yellow-100 text-yellow-800';
            case 'silver':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const getMembershipDiscount = (membership?: string) => {
        const key = (membership || 'normal').toLowerCase() as keyof typeof MEMBERSHIP_DISCOUNTS;
        return MEMBERSHIP_DISCOUNTS[key] ?? 0;
    };

    // Use payment methods from Redux (loaded during login) - no API call needed
    const paymentMethodOptions = useMemo<any[]>(() => {
        const methods = Array.isArray(currentStore?.payment_methods) ? currentStore.payment_methods : [];
        const activeMethods = methods.filter((method: any) => {
            if (!method) return false;
            const status = method.is_active;
            if (status === undefined || status === null) return true;
            if (typeof status === 'boolean') return status;
            if (typeof status === 'number') return status === 1;
            if (typeof status === 'string') {
                const normalized = status.toLowerCase();
                return normalized === '1' || normalized === 'true';
            }
            return true;
        });

        if (activeMethods.length === 0) {
            return [DEFAULT_PAYMENT_METHOD];
        }

        return activeMethods;
    }, [currentStore?.payment_methods]);

    // Payment statuses from Redux (can be used for payment status dropdown)
    const paymentStatusOptions = useMemo(() => {
        const statuses = Array.isArray(currentStore?.payment_statuses) ? currentStore.payment_statuses : [];
        return statuses.filter((status: any) => {
            if (!status) return false;
            const active = status.is_active;
            if (active === undefined || active === null) return true;
            if (typeof active === 'boolean') return active;
            if (typeof active === 'number') return active === 1;
            return true;
        });
    }, [currentStore?.payment_statuses]);

    const {
        data: customersResponse,
        isLoading: isSearching,
        error,
        refetch,
    } = useGetStoreCustomersListQuery(
        {
            store_id: currentStoreId || undefined,
            search: searchParams || '',
        },
        {
            skip: !currentStoreId,
        }
    );

    const customers: Customer[] = useMemo(() => {
        const response = customersResponse as CustomerApiResponse;
        return response?.data?.items || [];
    }, [customersResponse]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCustomerSearch(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (query.trim()) {
                setSearchParams(query.trim());
                setShowSearchResults(true);
            } else {
                setSearchParams('');
                setShowSearchResults(false);
            }
        }, 300);
    };

    useEffect(() => {
        if (searchParams) {
            setShowSearchResults(true);
        }
    }, [customers, searchParams]);

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsManualCustomerEntry(false);
        setCustomerSearch(customer.name);
        setShowSearchResults(false);
        setSearchParams('');

        setFormData((prev) => ({
            ...prev,
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            membershipDiscount: getMembershipDiscount(customer.membership),
            usePoints: false,
            useBalance: false,
            pointsToUse: 0,
            balanceToUse: 0,
        }));
    };

    const clearCustomerSelection = () => {
        setSelectedCustomer(null);
        setIsManualCustomerEntry(false);
        setCustomerSearch('');
        setShowSearchResults(false);
        setSearchParams('');
        setFormData((prev) => ({
            ...prev,
            customerId: null,
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            membershipDiscount: 0,
            usePoints: false,
            useBalance: false,
            pointsToUse: 0,
            balanceToUse: 0,
        }));
    };

    const handleWalkInCustomerSelect = () => {
        clearCustomerSelection();
        setFormData((prev) => ({
            ...prev,
            customerId: 'walk-in',
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            paymentStatus: 'paid', // Auto-set to paid for walk-in
        }));
    };

    const handleClearWalkInCustomer = () => {
        setFormData((prev) => ({
            ...prev,
            customerId: null,
        }));
    };

    const handleNewCustomerClick = () => {
        setIsManualCustomerEntry((prev) => {
            const next = !prev;

            if (next) {
                setSelectedCustomer(null);
                setCustomerSearch('');
                setShowSearchResults(false);
                setSearchParams('');
            }

            setFormData((prevForm) => ({
                ...prevForm,
                customerId: null,
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                membershipDiscount: 0,
                usePoints: false,
                useBalance: false,
                pointsToUse: 0,
                balanceToUse: 0,
            }));

            return next;
        });
    };

    const handleCustomerSearchFocus = () => {
        if (customers.length > 0) {
            setShowSearchResults(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRemoveItem = (itemId: number) => {
        dispatch(removeItemRedux(itemId));
    };

    const handleItemWholesaleToggle = (itemId: number) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        const newIsWholesale = !item.isWholesale;
        const newRate = newIsWholesale ? item.wholesalePrice || item.regularPrice || item.rate : item.regularPrice || item.rate;

        console.log('🔄 Toggle wholesale:', {
            itemId,
            title: item.title,
            currentMode: item.isWholesale ? 'Wholesale' : 'Retail',
            newMode: newIsWholesale ? 'Wholesale' : 'Retail',
            regularPrice: item.regularPrice,
            wholesalePrice: item.wholesalePrice,
            currentRate: item.rate,
            newRate: newRate,
        });

        dispatch(
            updateItemRedux({
                ...item,
                isWholesale: newIsWholesale,
                rate: newRate,
                amount: item.quantity * newRate,
            })
        );
    };

    const handleQuantityChange = (itemId: number, value: string) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (value === '') {
            dispatch(updateItemRedux({ ...item, quantity: 0, amount: 0 }));
            return;
        }

        const newQuantity = Number(value);

        if (Number.isNaN(newQuantity) || newQuantity < 0) return;

        if (item.PlaceholderQuantity && newQuantity > item.PlaceholderQuantity) {
            showMessage(`Maximum available quantity is ${item.PlaceholderQuantity}`, 'error');
            return;
        }

        dispatch(
            updateItemRedux({
                ...item,
                quantity: newQuantity,
                amount: item.rate * newQuantity,
            })
        );
    };

    const handleQuantityBlur = (itemId: number) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (item.quantity === 0) {
            dispatch(
                updateItemRedux({
                    ...item,
                    quantity: 1,
                    amount: item.rate * 1,
                })
            );
        }
    };

    const handleUnitPriceChange = (itemId: number, value: string) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (value === '') {
            dispatch(updateItemRedux({ ...item, rate: 0, amount: 0 }));
            return;
        }

        const newRate = Number(value);
        if (Number.isNaN(newRate) || newRate < 0) return;

        dispatch(
            updateItemRedux({
                ...item,
                rate: newRate,
                amount: item.quantity * newRate,
            })
        );
    };

    const handleUnitPriceBlur = (itemId: number) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (item.quantity === 0) {
            dispatch(
                updateItemRedux({
                    ...item,
                    quantity: 1,
                    amount: item.rate * 1,
                })
            );
        }
    };

    const calculateItemTax = (item: any) => {
        if (!item.tax_rate) return 0;

        const itemTotal = item.rate * item.quantity;
        const taxRate = item.tax_rate / 100;

        if (item.tax_included) {
            return itemTotal - itemTotal / (1 + taxRate);
        }

        return itemTotal * taxRate;
    };

    const calculateTax = () => {
        return invoiceItems.reduce((total, item) => total + calculateItemTax(item), 0);
    };

    const calculateSubtotalWithoutTax = () => {
        return invoiceItems.reduce((total, item) => {
            const itemTotal = item.rate * item.quantity;
            if (item.tax_included && item.tax_rate) {
                const taxRate = item.tax_rate / 100;
                return total + itemTotal / (1 + taxRate);
            }
            return total + itemTotal;
        }, 0);
    };

    const calculateDiscount = () => (calculateSubtotalWithoutTax() * formData.discount) / 100;

    const calculateMembershipDiscount = () => (calculateSubtotalWithoutTax() * formData.membershipDiscount) / 100;

    const calculateBaseTotal = () => calculateSubtotalWithoutTax() + calculateTax() - calculateDiscount() - calculateMembershipDiscount();

    const calculatePointsDiscount = () => {
        if (!formData.usePoints || !selectedCustomer) return 0;
        return Math.min(formData.pointsToUse * 0.01, calculateBaseTotal());
    };

    const calculateBalanceDiscount = () => {
        if (!formData.useBalance || !selectedCustomer) return 0;
        return Math.min(formData.balanceToUse, calculateBaseTotal() - calculatePointsDiscount());
    };

    const calculateTotal = () => {
        return Math.max(0, calculateBaseTotal() - calculatePointsDiscount() - calculateBalanceDiscount());
    };

    useEffect(() => {
        // Update due amount based on payment status and partial payment
        if (formData.paymentStatus === 'due') {
            setFormData((prev) => ({
                ...prev,
                dueAmount: calculateTotal(),
                partialPaymentAmount: 0,
            }));
        } else if (formData.paymentStatus === 'partial') {
            const total = calculateTotal();
            const paid = formData.partialPaymentAmount || 0;
            setFormData((prev) => ({
                ...prev,
                dueAmount: Math.max(0, total - paid),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                dueAmount: 0,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.paymentStatus, formData.partialPaymentAmount, invoiceItems, formData.discount, formData.usePoints, formData.pointsToUse, formData.useBalance, formData.balanceToUse]);

    useEffect(() => {
        const total = calculateTotal();
        const change = formData.amountPaid - total;
        setFormData((prev) => ({
            ...prev,
            changeAmount: change > 0 ? change : 0,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.amountPaid, invoiceItems, formData.discount, formData.usePoints, formData.pointsToUse, formData.useBalance, formData.balanceToUse]);

    const handleWholesaleToggle = (checked: boolean) => {
        // Global wholesale toggle removed - now using per-item control
        // This function kept for compatibility but does nothing
    };

    const clearAllItems = () => {
        if (window.confirm('Are you sure you want to clear all items?')) {
            dispatch(clearItemsRedux());
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
                ...(name === 'usePoints' && !checked ? { pointsToUse: 0 } : {}),
                ...(name === 'useBalance' && !checked ? { balanceToUse: 0 } : {}),
            }));
        } else {
            let processedValue: any = value;

            if (name === 'discount') {
                processedValue = Number(value);
            } else if (name === 'pointsToUse') {
                const maxPoints = Number(selectedCustomer?.points) || 0;
                processedValue = Math.min(Number(value), maxPoints);
            } else if (name === 'balanceToUse') {
                const maxBalance = parseFloat(String(selectedCustomer?.balance ?? '0'));
                processedValue = Math.min(Number(value), maxBalance);
            } else if (name === 'amountPaid') {
                processedValue = Number(value) || 0;
            } else if (name === 'partialPaymentAmount') {
                processedValue = Number(value) || 0;
            } else if (name === 'paymentStatus') {
                // Reset partial payment amount when changing status
                // Set payment method to "due" when due is selected
                setFormData((prev) => ({
                    ...prev,
                    paymentStatus: value,
                    partialPaymentAmount: 0,
                    dueAmount: value === 'due' ? calculateTotal() : 0,
                    paymentMethod: value === 'due' ? 'due' : prev.paymentMethod,
                }));
                return;
            }

            setFormData((prev) => ({
                ...prev,
                [name]: processedValue,
            }));
        }
    };

    const handleSubmit = async () => {
        if (formData.customerId !== 'walk-in' && (!formData.customerName.trim() || !formData.customerEmail.trim())) {
            showMessage('Name and email are required', 'error');
            return;
        }
        if (invoiceItems.length === 0) {
            showMessage('At least one item is required', 'error');
            return;
        }
        const invalidItems = invoiceItems.filter((item) => !item.productId || item.quantity <= 0);
        if (invalidItems.length > 0) {
            showMessage('Please select products and set quantities for all items', 'error');
            return;
        }

        // Validation for partial payment
        if (formData.paymentStatus === 'partial') {
            if (!formData.partialPaymentAmount || formData.partialPaymentAmount <= 0) {
                showMessage('Please enter partial payment amount', 'error');
                return;
            }
            if (formData.partialPaymentAmount >= calculateTotal()) {
                showMessage('Partial payment amount should be less than total. Use "Paid" status instead.', 'error');
                return;
            }
        }

        const grandTotal = calculateTotal();

        // Calculate amount paid based on payment status
        let actualAmountPaid = 0;
        let actualChangeAmount = 0;
        let dueAmount = 0;

        if (formData.paymentStatus === 'paid') {
            // For paid status, use amountPaid for cash or full amount for other methods
            actualAmountPaid = formData.paymentMethod.toLowerCase() === 'cash' ? formData.amountPaid : grandTotal;
            actualChangeAmount = formData.paymentMethod.toLowerCase() === 'cash' ? formData.changeAmount : 0;
            dueAmount = 0;
        } else if (formData.paymentStatus === 'partial') {
            // For partial, use the partial payment amount
            actualAmountPaid = formData.partialPaymentAmount;
            actualChangeAmount = 0;
            dueAmount = grandTotal - formData.partialPaymentAmount;
        } else if (formData.paymentStatus === 'due') {
            // For due, no amount paid
            actualAmountPaid = 0;
            actualChangeAmount = 0;
            dueAmount = grandTotal;
        }

        const orderData: any = {
            user_id: userId,
            store_id: currentStoreId,
            payment_method: formData.paymentMethod,
            payment_status: formData.paymentStatus,
            tax: calculateTax(),
            discount: Number(formData.discount || 0) + (formData.usePoints ? calculatePointsDiscount() : 0) + (formData.useBalance ? calculateBalanceDiscount() : 0),
            total: calculateSubtotalWithoutTax(),
            grand_total: grandTotal,
            amount_paid: actualAmountPaid,
            change_amount: actualChangeAmount,
            due_amount: dueAmount,
            items: invoiceItems.map((item) => {
                const itemBasePrice = item.rate * item.quantity;
                const itemTax = calculateItemTax(item);
                const itemSubtotal = item.tax_included && item.tax_rate ? itemBasePrice : itemBasePrice + itemTax;

                const orderItem: any = {
                    product_id: item.productId,
                    stock_id: item.stockId, // Include stock_id for variants
                    quantity: item.quantity,
                    unit_price: item.rate,
                    unit: item.unit || 'piece',
                    discount: 0,
                    tax: item.tax_rate || 0,
                    tax_included: item.tax_included || false,
                    subtotal: itemSubtotal,
                };

                // Include serial numbers if present
                if (item.has_serial && item.serials && item.serials.length > 0) {
                    orderItem.serial_ids = item.serials.map((s: any) => s.id);
                }

                // Include warranty if present
                if (item.has_warranty && item.warranty) {
                    orderItem.warranty_id = item.warranty.id;
                    orderItem.activate_warranty = true; // Flag to activate warranty on invoice creation
                }

                return orderItem;
            }),
        };

        if (formData.customerId === 'walk-in') {
            orderData.customer_id = null;
            orderData.is_walk_in = true;
        } else if (formData.customerId && formData.customerId !== 'walk-in') {
            orderData.customer_id = formData.customerId;
            orderData.is_walk_in = false;
        } else {
            orderData.customer_id = null;
            orderData.is_walk_in = false;
            orderData.customer_name = formData.customerName;
            orderData.customer_number = formData.customerPhone;
            orderData.customer_email = formData.customerEmail;
        }

        try {
            setLoading(true);
            const response = await createOrder(orderData).unwrap();
            setOrderResponse(response);
            setShowPreview(true);

            refetch();
            setLoading(false);
            showMessage('Order created successfully!', 'success');

            // Don't clear items yet - we need them for the preview to show variant/warranty data
            // They will be cleared when the preview is closed
            // dispatch(clearItemsRedux());
            // clearCustomerSelection();
            // setFormData({
            //     customerId: null,
            //     customerName: '',
            //     customerEmail: '',
            //     customerPhone: '',
            //     discount: 0,
            //     membershipDiscount: 0,
            //     paymentMethod: '',
            //     paymentStatus: '',
            //     usePoints: false,
            //     useBalance: false,
            //     pointsToUse: 0,
            //     balanceToUse: 0,
            //     useWholesale: false,
            //     amountPaid: 0,
            //     changeAmount: 0,
            //     partialPaymentAmount: 0,
            //     dueAmount: 0,
            // });
        } catch (err: any) {
            setLoading(false);

            let errorMessage = 'Failed to create order';

            if (err?.status === 422 && err?.data?.errors) {
                errorMessage = Object.values(err.data.errors).flat().join('\n');
            } else if (err?.data?.message) {
                errorMessage = err.data.message;
            } else if (err?.data?.error) {
                errorMessage = err.data.error;
            } else if (err?.error) {
                errorMessage = err.error;
            }

            console.error('Failed to create order:', errorMessage);
            showMessage(errorMessage, 'error');
        }
    };

    const handlePreview = () => {
        if (invoiceItems.length === 0) {
            showMessage('No items to preview', 'error');
            return;
        }
        setShowPreview(true);
    };

    const handleBackToEdit = () => {
        setShowPreview(false);

        // If order was created, clear the items and form
        if (orderResponse) {
            dispatch(clearItemsRedux());
            clearCustomerSelection();
            setFormData({
                customerId: null,
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                discount: 0,
                membershipDiscount: 0,
                paymentMethod: '',
                paymentStatus: '',
                usePoints: false,
                useBalance: false,
                pointsToUse: 0,
                balanceToUse: 0,
                useWholesale: false,
                amountPaid: 0,
                changeAmount: 0,
                partialPaymentAmount: 0,
                dueAmount: 0,
            });
        }

        setOrderResponse(null);
    };

    const getPreviewData = () => {
        if (orderResponse) {
            return {
                customer: {
                    name: orderResponse.data.customer.name,
                    email: orderResponse.data.customer.email,
                    phone: orderResponse.data.customer.phone,
                    membership: selectedCustomer?.membership || 'normal',
                    points: Number(selectedCustomer?.points) || 0,
                },
                invoice: orderResponse.data.invoice,
                order_id: orderResponse.data.order_id,
                items: (orderResponse.data.products || []).map((product: any, idx: number) => {
                    // Find matching item from invoiceItems to get variant/serial/warranty data
                    const originalItem = invoiceItems[idx];

                    return {
                        id: idx + 1,
                        title: product.name,
                        quantity: product.quantity,
                        price: product.unit_price,
                        amount: product.subtotal,
                        unit: product.unit || originalItem?.unit || 'piece',
                        tax_rate: product.tax || originalItem?.tax_rate,
                        tax_included: product.tax_included || originalItem?.tax_included,
                        // Include variant data
                        variantName: originalItem?.variantName,
                        variantData: originalItem?.variantData,
                        // Include serial data
                        has_serial: originalItem?.has_serial || false,
                        serials: originalItem?.serials || [],
                        // Include warranty data
                        has_warranty: originalItem?.has_warranty || false,
                        warranty: originalItem?.warranty || null,
                    };
                }),
                tax: parseFloat(orderResponse.data.totals.tax),
                discount: orderResponse.data.totals.discount,
                membershipDiscount: formData.membershipDiscount,
                paymentMethod: orderResponse.data.payment_method,
                payment_status: orderResponse.data.payment_status,
                amount_paid: orderResponse.data.amount_paid || 0,
                due_amount: orderResponse.data.due_amount || 0,
                totals: {
                    subtotal: parseFloat(orderResponse.data.totals.total),
                    tax: parseFloat(orderResponse.data.totals.tax),
                    discount: orderResponse.data.totals.discount,
                    membershipDiscount: calculateMembershipDiscount(),
                    pointsDiscount: calculatePointsDiscount(),
                    balanceDiscount: calculateBalanceDiscount(),
                    total: parseFloat(orderResponse.data.totals.grand_total),
                    grand_total: parseFloat(orderResponse.data.totals.grand_total),
                },
                isOrderCreated: true,
            };
        }

        return {
            customer: {
                name: formData.customerName,
                email: formData.customerEmail,
                phone: formData.customerPhone,
                membership: selectedCustomer?.membership || 'normal',
                points: Number(selectedCustomer?.points) || 0,
            },
            items: invoiceItems.map((item, idx) => ({
                id: idx + 1,
                title: item.title || 'Untitled',
                quantity: item.quantity,
                price: item.rate,
                amount: item.rate * item.quantity,
                tax_rate: item.tax_rate,
                tax_included: item.tax_included,
                unit: item.unit || 'piece',
                // Include variant data
                variantName: item.variantName,
                variantData: item.variantData,
                // Include serial data
                has_serial: item.has_serial || false,
                serials: item.serials || [],
                // Include warranty data
                has_warranty: item.has_warranty || false,
                warranty: item.warranty || null,
            })),
            tax: 0,
            discount: formData.discount,
            membershipDiscount: formData.membershipDiscount,
            paymentMethod: formData.paymentMethod,
            paymentStatus: formData.paymentStatus,
            partialPaymentAmount: formData.partialPaymentAmount || 0,
            dueAmount: formData.paymentStatus === 'due' ? calculateTotal() : formData.paymentStatus === 'partial' ? calculateTotal() - (formData.partialPaymentAmount || 0) : 0,
            totals: {
                subtotal: calculateSubtotalWithoutTax(),
                tax: calculateTax(),
                discount: calculateDiscount(),
                membershipDiscount: calculateMembershipDiscount(),
                pointsDiscount: calculatePointsDiscount(),
                balanceDiscount: calculateBalanceDiscount(),
                total: calculateTotal(),
                grand_total: calculateTotal(),
            },
            isOrderCreated: false,
        };
    };

    return (
        <div className="relative mt-6 w-full sm:mt-6 xl:mt-0 xl:w-full">
            <Toaster />
            <LoadingOverlay isLoading={loading} />
            <PreviewModal isOpen={showPreview} data={getPreviewData()} storeId={currentStoreId || undefined} onClose={handleBackToEdit} />
            <div className="panel ">
                <CustomerSection
                    formData={formData}
                    selectedCustomer={selectedCustomer}
                    isManualCustomerEntry={isManualCustomerEntry}
                    showManualCustomerForm={showManualCustomerForm}
                    customerSearch={customerSearch}
                    customers={customers}
                    isSearching={isSearching}
                    showSearchResults={showSearchResults}
                    searchParams={searchParams}
                    searchInputRef={searchInputRef}
                    error={error}
                    onSearchChange={handleSearchChange}
                    onFocusResults={handleCustomerSearchFocus}
                    onCustomerSelect={handleCustomerSelect}
                    onClearCustomer={clearCustomerSelection}
                    onToggleManualEntry={handleNewCustomerClick}
                    onInputChange={handleInputChange}
                    onSelectWalkInCustomer={handleWalkInCustomerSelect}
                    onClearWalkInCustomer={handleClearWalkInCustomer}
                    getBadgeClass={getMembershipBadgeClass}
                    getMembershipDiscount={getMembershipDiscount}
                />
            </div>

            <div className="panel">
                <OrderDetailsSection
                    invoiceItems={invoiceItems}
                    formData={formData}
                    onWholesaleToggle={handleWholesaleToggle}
                    onClearItems={clearAllItems}
                    onQuantityChange={handleQuantityChange}
                    onQuantityBlur={handleQuantityBlur}
                    onUnitPriceChange={handleUnitPriceChange}
                    onUnitPriceBlur={handleUnitPriceBlur}
                    onRemoveItem={handleRemoveItem}
                    onItemWholesaleToggle={handleItemWholesaleToggle}
                />

                <PaymentSummarySection
                    formData={formData}
                    selectedCustomer={selectedCustomer}
                    paymentMethodOptions={paymentMethodOptions}
                    paymentStatusOptions={paymentStatusOptions}
                    onInputChange={handleInputChange}
                    subtotalWithoutTax={calculateSubtotalWithoutTax()}
                    taxAmount={calculateTax()}
                    discountAmount={calculateDiscount()}
                    membershipDiscountAmount={calculateMembershipDiscount()}
                    pointsDiscount={calculatePointsDiscount()}
                    balanceDiscount={calculateBalanceDiscount()}
                    totalPayable={calculateTotal()}
                    isWalkInCustomer={formData.customerId === 'walk-in'}
                />

                <CashPaymentSection formData={formData} onInputChange={handleInputChange} totalPayable={calculateTotal()} isWalkInCustomer={formData.customerId === 'walk-in'} />

                <div className="mt-4 flex flex-col gap-2 pb-16 sm:mt-6 sm:flex-row sm:gap-4 sm:pb-0 lg:pb-0">
                    <button type="button" className="btn btn-primary flex-1 text-sm sm:text-base" onClick={handleSubmit} disabled={loading}>
                        Confirm Order <IconSave />
                    </button>
                    <button type="button" className="btn btn-secondary flex-1 text-sm sm:text-base" onClick={handlePreview}>
                        Preview <IconEye />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PosRightSide;
