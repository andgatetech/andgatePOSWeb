'use client';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import IconSearch from '@/components/icon/icon-search';
import IconShoppingCart from '@/components/icon/icon-shopping-cart';
import IconUser from '@/components/icon/icon-user';
import IconX from '@/components/icon/icon-x';
import { clearItemsRedux, removeItemRedux, updateItemRedux } from '@/store/features/Order/OrderSlice';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
import { useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import { useCreateOrderMutation } from '@/store/features/Order/Order';
import Swal from 'sweetalert2';
import PosInvoicePreview from './PosInvoicePreview';

// Membership discount rates
const MEMBERSHIP_DISCOUNTS = {
    normal: 0,
    silver: 5,
    gold: 7,
    platinum: 10,
};

// Customer type interface
interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    points: number;
    balance: string;
    membership: 'normal' | 'silver' | 'gold' | 'platinum';
    is_active: number;
    details?: string;
    store_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

// Customer API response interface
interface CustomerApiResponse {
    data: Customer[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

// Order response interface
interface OrderResponse {
    success: boolean;
    message: string;
    data: {
        order_id: number;
        invoice: string;
        customer: {
            id: number;
            name: string;
            email: string;
            phone: string;
        };
        products: Array<{
            name: string;
            product_id: number;
            quantity: number;
            unit_price: number;
            tax: number;
            discount: number;
            subtotal: number;
        }>;
        totals: {
            total: string;
            tax: string;
            discount: number;
            grand_total: string;
        };
    };
}

const PosRightSide: React.FC = () => {
    const [showPreview, setShowPreview] = useState(false);
    const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchParams, setSearchParams] = useState<string>('');
    // Get current store from hook
    const { currentStoreId } = useCurrentStore();

    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            available: 'yes', // Only show available products in POS
        };

        // Always use current store from sidebar for POS
        if (currentStoreId) {
            params.store_id = currentStoreId;
        }

        return params;
    }, [currentStoreId]);
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
            skip: !currentStoreId, // Only run query when we have a valid store ID
        }
    );

    const dispatch = useDispatch();
    const invoiceItems = useSelector((state: RootState) => state.invoice.items);
    const userId = useSelector((state: RootState) => state.auth.user?.id);

    const [formData, setFormData] = useState({
        customerId: null as number | string | null, // Allow number, string ('walk-in'), or null
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        discount: 0,
        membershipDiscount: 0,
        paymentMethod: '',
        paymentStatus: '',
        // New payment fields
        usePoints: false,
        useBalance: false,
        pointsToUse: 0,
        balanceToUse: 0,
    });

    const [createOrder] = useCreateOrderMutation();
    const [loading, setLoading] = useState(false);

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

    // Get customers from RTK Query response with useMemo to prevent dependency issues
    const customers: Customer[] = useMemo(() => {
        return (customersResponse as CustomerApiResponse)?.data || [];
    }, [customersResponse]);

    // Handle search input change with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCustomerSearch(query);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search
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

    // Show search results when customers data changes
    useEffect(() => {
        if (searchParams && customers.length >= 0) {
            setShowSearchResults(true);
        }
    }, [customers, searchParams]);

    // Handle customer selection
    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(customer.name);
        setShowSearchResults(false);
        setSearchParams(''); // Clear search to stop the query

        // Auto-fill form data
        setFormData((prev) => ({
            ...prev,
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            membershipDiscount: MEMBERSHIP_DISCOUNTS[customer.membership] || 0,
            // Reset payment options when selecting new customer
            usePoints: false,
            useBalance: false,
            pointsToUse: 0,
            balanceToUse: 0,
        }));
    };

    // Clear customer selection
    const clearCustomerSelection = () => {
        setSelectedCustomer(null);
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
            // Reset payment options
            usePoints: false,
            useBalance: false,
            pointsToUse: 0,
            balanceToUse: 0,
        }));
    };

    // Close search results when clicking outside
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

    useEffect(() => {}, [invoiceItems]);

    const handleRemoveItem = (itemId: number) => {
        if (invoiceItems.length <= 1) {
            showMessage('At least one item is required', 'error');
            return;
        }
        dispatch(removeItemRedux(itemId));
    };

    const handleQuantityChange = (itemId: number, value: string) => {
        const item = invoiceItems.find((item) => item.id === itemId);
        if (!item) return;

        // If input is empty, temporarily set quantity to 0
        if (value === '') {
            dispatch(updateItemRedux({ ...item, quantity: 0, amount: 0 }));
            return;
        }

        const newQuantity = Number(value);

        if (newQuantity < 0) return; // prevent negatives

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

    const calculateSubtotal = () => invoiceItems.reduce((total, item) => total + item.rate * item.quantity, 0);

    // Calculate tax for each item individually based on tax_included flag
    const calculateItemTax = (item: any) => {
        if (!item.tax_rate) return 0;

        const itemTotal = item.rate * item.quantity;
        const taxRate = item.tax_rate / 100;

        if (item.tax_included) {
            // Tax is included in price - extract tax amount
            const taxAmount = itemTotal - itemTotal / (1 + taxRate);
            return taxAmount;
        } else {
            // Tax is excluded - add tax to price
            const taxAmount = itemTotal * taxRate;
            return taxAmount;
        }
    };

    // Calculate total tax for all items
    const calculateTax = () => {
        const totalTax = invoiceItems.reduce((total, item) => total + calculateItemTax(item), 0);
        // Debug log to verify tax calculations
        console.log('Tax Calculation Debug:', {
            items: invoiceItems.map((item) => ({
                name: item.title,
                rate: item.rate,
                quantity: item.quantity,
                tax_rate: item.tax_rate,
                tax_included: item.tax_included,
                itemTax: calculateItemTax(item),
            })),
            totalTax,
        });
        return totalTax;
    };

    // Calculate subtotal without tax (for tax-included items, this extracts the base price)
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

    // New calculation functions for payment
    const calculatePointsDiscount = () => {
        if (!formData.usePoints || !selectedCustomer) return 0;
        // Assuming 1 point = $0.01 (adjust this conversion rate as needed)
        return Math.min(formData.pointsToUse * 0.01, calculateBaseTotal());
    };

    const calculateBalanceDiscount = () => {
        if (!formData.useBalance || !selectedCustomer) return 0;
        return Math.min(formData.balanceToUse, calculateBaseTotal() - calculatePointsDiscount());
    };

    const calculateTotal = () => {
        return Math.max(0, calculateBaseTotal() - calculatePointsDiscount() - calculateBalanceDiscount());
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
                // Reset the amount when toggling
                ...(name === 'usePoints' && !checked ? { pointsToUse: 0 } : {}),
                ...(name === 'useBalance' && !checked ? { balanceToUse: 0 } : {}),
            }));
        } else {
            let processedValue: any = value;

            if (name === 'discount') {
                processedValue = Number(value);
            } else if (name === 'pointsToUse') {
                const maxPoints = selectedCustomer?.points || 0;
                processedValue = Math.min(Number(value), maxPoints);
            } else if (name === 'balanceToUse') {
                const maxBalance = parseFloat(selectedCustomer?.balance || '0');
                processedValue = Math.min(Number(value), maxBalance);
            }

            setFormData((prev) => ({
                ...prev,
                [name]: processedValue,
            }));
        }
    };

    const handleSubmit = async () => {
        // Skip customer validation for walk-in customers
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

        const grandTotal = calculateTotal();

        let orderData: any = {
            user_id: userId,
            store_id: currentStoreId, // Add current store ID
            payment_method: formData.paymentMethod,
            payment_status: formData.paymentStatus,
            tax: calculateTax(), // Calculate total tax from all items
            // ✅ discount field now includes manual + points + balance
            discount: Number(formData.discount || 0) + (formData.usePoints ? calculatePointsDiscount() : 0) + (formData.useBalance ? calculateBalanceDiscount() : 0),
            total: calculateSubtotalWithoutTax(), // Subtotal without tax
            grand_total: grandTotal, //  already excludes membership, points, and balance
            items: invoiceItems.map((item) => {
                const itemBasePrice = item.rate * item.quantity;
                const itemTax = calculateItemTax(item);

                // For tax-included items, the subtotal should be the base price without tax
                // For tax-excluded items, the subtotal is the item price, and tax is added separately
                const itemSubtotal =
                    item.tax_included && item.tax_rate
                        ? itemBasePrice // Tax is already included in the price
                        : itemBasePrice + itemTax; // Add tax to the base price

                return {
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.rate,
                    unit: item.unit || 'piece',
                    discount: 0,
                    tax: item.tax_rate || 0,
                    tax_included: item.tax_included || false,
                    subtotal: itemSubtotal,
                };
            }),
        };

        // ✅ Handle customer data based on selection
        if (formData.customerId === 'walk-in') {
            // Walk-in customer - send null customer_id and walk-in flag
            orderData.customer_id = null;
            orderData.is_walk_in = true; // Add walk-in flag for backend
            // Don't send customer details for walk-in customers
        } else if (formData.customerId && formData.customerId !== 'walk-in') {
            // Existing customer from database
            orderData.customer_id = formData.customerId;
            orderData.is_walk_in = false;
        } else {
            // New customer (not in database) - send customer details
            orderData.customer_id = null;
            orderData.is_walk_in = false;
            orderData.customer_name = formData.customerName;
            orderData.customer_number = formData.customerPhone;
            orderData.customer_email = formData.customerEmail;
        }

        try {
            setLoading(true);
            console.log('Creating order with data:', orderData);
            const response = await createOrder(orderData).unwrap();
            console.log('Order API response:', response);

            // Store the order response and automatically show preview
            setOrderResponse(response);
            setShowPreview(true);

            refetch();
            setLoading(false);
            showMessage('Order created successfully!', 'success');

            // Clear form data but keep the response for preview
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
            });
        } catch (err: any) {
            setLoading(false);

            let errorMessage = 'Failed to create order';

            // 🔎 Laravel validation errors (422)
            if (err?.status === 422 && err?.data?.errors) {
                errorMessage = Object.values(err.data.errors).flat().join('\n');
            }
            // 🔎 Backend business logic errors (403, 404, 400…)
            else if (err?.data?.message) {
                errorMessage = err.data.message;
            }
            // 🔎 Server exception (500)
            else if (err?.data?.error) {
                errorMessage = err.data.error;
            }
            // 🔎 Network error fallback
            else if (err?.error) {
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
        setOrderResponse(null); // Clear order response when going back to edit
    };

    // Create preview data based on whether we have order response or not
    const getPreviewData = () => {
        if (orderResponse) {
            // Use actual order response data
            return {
                customer: {
                    name: orderResponse.data.customer.name,
                    email: orderResponse.data.customer.email,
                    phone: orderResponse.data.customer.phone,
                    membership: selectedCustomer?.membership || 'normal',
                    points: selectedCustomer?.points || 0,
                },
                invoice: orderResponse.data.invoice,
                order_id: orderResponse.data.order_id,
                items: orderResponse.data.products.map((product, idx) => ({
                    id: idx + 1,
                    title: product.name,
                    quantity: product.quantity,
                    price: product.unit_price,
                    amount: product.subtotal,
                })),
                tax: parseFloat(orderResponse.data.totals.tax),
                discount: orderResponse.data.totals.discount,
                membershipDiscount: formData.membershipDiscount,
                paymentMethod: orderResponse.data.payment_method,
                payment_status: orderResponse.data.payment_status,
                totals: {
                    subtotal: parseFloat(orderResponse.data.totals.total),
                    tax: parseFloat(orderResponse.data.totals.tax),
                    discount: orderResponse.data.totals.discount,
                    membershipDiscount: calculateMembershipDiscount(),
                    pointsDiscount: calculatePointsDiscount(),
                    balanceDiscount: calculateBalanceDiscount(),
                    total: parseFloat(orderResponse.data.totals.grand_total),
                },
                isOrderCreated: true, // Flag to indicate this is a created order
            };
        } else {
            // Use form data for manual preview (before order creation)
            return {
                customer: {
                    name: formData.customerName,
                    email: formData.customerEmail,
                    phone: formData.customerPhone,
                    membership: selectedCustomer?.membership || 'normal',
                    points: selectedCustomer?.points || 0,
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
                })),
                tax: 0, // Will be calculated from individual items
                discount: formData.discount,
                membershipDiscount: formData.membershipDiscount,
                paymentMethod: formData.paymentMethod,
                paymentStatus: formData.paymentStatus,
                totals: {
                    subtotal: calculateSubtotalWithoutTax(),
                    tax: calculateTax(),
                    discount: calculateDiscount(),
                    membershipDiscount: calculateMembershipDiscount(),
                    pointsDiscount: calculatePointsDiscount(),
                    balanceDiscount: calculateBalanceDiscount(),
                    total: calculateTotal(),
                },
                isOrderCreated: false,
            };
        }
    };

    if (showPreview) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-2">
                <div className="relative max-h-[95vh] w-full max-w-[90vw] overflow-auto rounded-lg bg-white p-6 shadow-2xl">
                    {/* Close Button */}
                    <button onClick={handleBackToEdit} className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"></button>

                    {/* Invoice Preview */}
                    <div className="mb-4">
                        <PosInvoicePreview data={getPreviewData()} storeId={currentStoreId || undefined} onClose={handleBackToEdit} paymentMethod={formData.paymentMethod} />
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-6 flex justify-end">
                        <button
                            className="btn btn-secondary px-5 py-2 text-sm hover:bg-gray-200"
                            onClick={handleBackToEdit} // Make sure handleClose closes your modal
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative mt-4 w-full sm:mt-6 xl:mt-0 xl:w-full">
            {loading && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-50">
                    {/* Spinner */}
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent sm:h-16 sm:w-16"></div>
                    {/* Loading Text */}
                    <span className="animate-pulse text-base font-semibold text-white sm:text-lg">Processing Order...</span>
                </div>
            )}
            <div className="panel mb-5">
                <div className="mt-4 px-3 sm:mt-8 sm:px-4">
                    <div className="flex flex-col justify-between lg:flex-row">
                        <div className="mb-4 w-full sm:mb-6 lg:w-full">
                            <div className="mb-3 flex items-center justify-between sm:mb-4">
                                <div className="text-base font-semibold text-gray-800 sm:text-lg">Bill To :-</div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearCustomerSelection();
                                        setFormData((prev) => ({
                                            ...prev,
                                            customerId: 'walk-in', // Special flag for walk-in customer
                                            customerName: '',
                                            customerEmail: '',
                                            customerPhone: '',
                                        }));
                                    }}
                                    className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 sm:px-4 sm:py-2 sm:text-sm"
                                >
                                    Walk-in Customer
                                </button>
                            </div>

                            {/* Walk-in Customer Indicator */}
                            {formData.customerId === 'walk-in' && (
                                <div className="mb-4 rounded-lg border border-orange-200 bg-orange-100 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                                                <IconUser className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-orange-900">Walk-in Customer</p>
                                                <p className="text-sm text-orange-700">No customer details required</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setFormData((prev) => ({ ...prev, customerId: null }))} className="text-orange-600 hover:text-orange-800">
                                            <IconX className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Customer Search Section */}
                            <div className="relative mb-6" ref={searchInputRef} style={{ display: formData.customerId === 'walk-in' ? 'none' : 'block' }}>
                                <label className="mb-2 block text-sm font-medium">Customer Search</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <IconSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="form-input pl-10 pr-10"
                                        placeholder="Search by name, email, or phone..."
                                        value={customerSearch}
                                        onChange={handleSearchChange}
                                        onFocus={() => {
                                            if (customers.length > 0) {
                                                setShowSearchResults(true);
                                            }
                                        }}
                                    />
                                    {selectedCustomer && (
                                        <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={clearCustomerSelection}>
                                            <IconX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                    {isSearching && searchParams && (
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Search Results Dropdown */}
                                {showSearchResults && searchParams && (
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                                        {error ? (
                                            <div className="px-4 py-3 text-center text-red-500">
                                                <div className="text-sm">Error loading customers</div>
                                            </div>
                                        ) : customers.length > 0 ? (
                                            customers.map((customer) => (
                                                <div
                                                    key={customer.id}
                                                    className="cursor-pointer border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
                                                    onClick={() => handleCustomerSelect(customer)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0">
                                                                <IconUser className="h-8 w-8 rounded-full bg-gray-100 p-1 text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                                <div className="text-sm text-gray-500">{customer.email}</div>
                                                                <div className="text-xs text-gray-400">{customer.phone}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div
                                                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                                    customer.membership === 'platinum'
                                                                        ? 'bg-purple-100 text-purple-800'
                                                                        : customer.membership === 'gold'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : customer.membership === 'silver'
                                                                        ? 'bg-gray-100 text-gray-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                }`}
                                                            >
                                                                {customer.membership.toUpperCase()}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-500">Points: {customer.points}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : !isSearching ? (
                                            <div className="px-4 py-3 text-center text-gray-500">
                                                <IconUser className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                                <div className="text-sm">No customers found</div>
                                                <div className="text-xs">Try searching with a different term</div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {/* Customer Details Display */}
                            {selectedCustomer && (
                                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-blue-900">Selected Customer</h4>
                                        <div
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                selectedCustomer.membership === 'platinum'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : selectedCustomer.membership === 'gold'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : selectedCustomer.membership === 'silver'
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {selectedCustomer.membership.toUpperCase()} - {MEMBERSHIP_DISCOUNTS[selectedCustomer.membership]}% OFF
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                        <div>
                                            <span className="font-medium text-blue-700">Loyalty Points:</span>
                                            <div className="font-semibold text-blue-900">{selectedCustomer.points}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-blue-700">Balance:</span>
                                            <div className="font-semibold text-blue-900">৳{selectedCustomer.balance}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-blue-700">Status:</span>
                                            <div className={`font-semibold ${selectedCustomer.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Manual Customer Input */}
                            <div className="space-y-3 sm:space-y-4" style={{ display: formData.customerId === 'walk-in' ? 'none' : 'block' }}>
                                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-0">
                                    <label className="text-sm font-medium sm:w-1/3">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        className="form-input w-full flex-1"
                                        placeholder="Enter Name"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        disabled={!!selectedCustomer}
                                    />
                                </div>
                                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-0">
                                    <label className="text-sm font-medium sm:w-1/3">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="customerEmail"
                                        className="form-input w-full flex-1"
                                        placeholder="Enter Email"
                                        value={formData.customerEmail}
                                        onChange={handleInputChange}
                                        disabled={!!selectedCustomer}
                                    />
                                </div>
                                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-0">
                                    <label className="text-sm font-medium sm:w-1/3">Phone Number</label>
                                    <input
                                        type="text"
                                        name="customerPhone"
                                        className="form-input w-full flex-1"
                                        placeholder="Enter Phone number"
                                        value={formData.customerPhone}
                                        onChange={handleInputChange}
                                        disabled={!!selectedCustomer}
                                        required={!selectedCustomer}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="panel mb-5">
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                        <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Order Details</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm">Items: {invoiceItems.length}</span>
                            <button type="button" onClick={clearAllItems} className="text-xs text-red-600 hover:text-red-800 sm:text-sm">
                                Clear all
                            </button>
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden overflow-x-auto rounded-lg border border-gray-300 md:block">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <th className="border-b border-r border-gray-300 p-3 text-left text-xs font-semibold text-gray-700">Items</th>
                                    <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Qty</th>
                                    <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Unit</th>
                                    <th className="border-b border-r border-gray-300 p-3 text-right text-xs font-semibold text-gray-700">Rate</th>
                                    <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Tax</th>
                                    <th className="border-b border-r border-gray-300 p-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                                    <th className="border-b border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {invoiceItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="border-b border-gray-300 p-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <div className="mb-2 text-3xl">🛒</div>
                                                <div className="font-medium">No items added yet</div>
                                                <div className="text-sm">Add products from the left panel</div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    invoiceItems.map((item, index) => (
                                        <tr key={item.id} className={`transition-colors hover:bg-blue-50 ${index < invoiceItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                            <td className="border-r border-gray-300 p-3 text-sm font-medium">{item.title}</td>
                                            <td className="border-r border-gray-300 p-3 text-center">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className={`form-input w-16 text-center ${item.quantity === 0 ? 'border-yellow-400' : 'border-gray-300'}`}
                                                        min={0}
                                                        max={item.PlaceholderQuantity || 9999}
                                                        value={item.quantity === 0 ? '' : item.quantity}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            handleQuantityChange(item.id, value);
                                                        }}
                                                        onBlur={() => {
                                                            // Set minimum quantity to 1 if empty on blur
                                                            if (item.quantity === 0) {
                                                                const updatedItem = invoiceItems.find((invItem) => invItem.id === item.id);
                                                                if (updatedItem) {
                                                                    dispatch(
                                                                        updateItemRedux({
                                                                            ...updatedItem,
                                                                            quantity: 1,
                                                                            amount: updatedItem.rate * 1,
                                                                        })
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                    />

                                                    {/* Soft message for empty/0 quantity */}
                                                    {item.quantity === 0 && (
                                                        <div className="absolute left-0 top-full z-10 mt-1 whitespace-nowrap text-xs text-yellow-600">Quantity must be at least 1</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border-r border-gray-300 p-3 text-center text-sm">
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || 'piece'}</span>
                                            </td>
                                            <td className="border-r border-gray-300 p-3 text-right text-sm font-medium">৳{item.rate.toFixed(2)}</td>
                                            <td className="border-r border-gray-300 p-3 text-center text-sm">
                                                {item.tax_rate ? (
                                                    <div className="text-xs">
                                                        <div className="font-medium">{item.tax_rate}%</div>
                                                        <div
                                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                                                item.tax_included ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                            }`}
                                                        >
                                                            {item.tax_included ? 'Incl.' : 'Excl.'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No tax</span>
                                                )}
                                            </td>
                                            <td className="border-r border-gray-300 p-3 text-right text-sm font-bold">
                                                ৳
                                                {(() => {
                                                    const basePrice = item.rate * item.quantity;
                                                    if (item.tax_rate && !item.tax_included) {
                                                        // Tax excluded: show base price + tax
                                                        const taxAmount = basePrice * (item.tax_rate / 100);
                                                        return (basePrice + taxAmount).toFixed(2);
                                                    }
                                                    // Tax included or no tax: show base price
                                                    return basePrice.toFixed(2);
                                                })()}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 hover:text-red-800"
                                                    title="Remove item"
                                                >
                                                    <IconX className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="space-y-3 md:hidden">
                        {invoiceItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12">
                                <IconShoppingCart className="mb-2 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500">No items added yet</p>
                                <p className="text-xs text-gray-400">Add products to start your order</p>
                            </div>
                        ) : (
                            invoiceItems.map((item) => (
                                <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                                            {item.description && <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{item.description}</p>}
                                        </div>
                                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="ml-2 flex-shrink-0 rounded-full bg-red-50 p-1.5 text-red-600 hover:bg-red-100">
                                            <IconX className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Qty:</span>
                                            <input
                                                type="number"
                                                className="form-input ml-2 w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs"
                                                placeholder="Quantity"
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                min="0"
                                            />
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Unit:</span>
                                            <span className="font-medium">{item.unit || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Rate:</span>
                                            <span className="font-medium">৳{item.rate.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax:</span>
                                            {item.tax_rate ? (
                                                <span className="font-medium">
                                                    {item.tax_rate}% <span className={item.tax_included ? 'text-green-600' : 'text-blue-600'}>({item.tax_included ? 'Incl' : 'Excl'})</span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">No tax</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                                        <span className="text-xs font-medium text-gray-600">Amount:</span>
                                        <span className="text-base font-bold text-primary">৳{(item.rate * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:gap-3">
                        {selectedCustomer && formData.membershipDiscount > 0 && (
                            <div className="flex justify-between rounded bg-green-50 p-2">
                                <label className="text-sm font-semibold text-green-700 sm:text-base">Membership Discount ({selectedCustomer.membership})</label>
                                <span className="text-sm font-semibold text-green-700 sm:text-base">{formData.membershipDiscount}%</span>
                            </div>
                        )}

                        {/* Loyalty Points Payment Section */}
                        {selectedCustomer && selectedCustomer.points > 0 && (
                            <div className="rounded border border-orange-200 bg-orange-50 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" name="usePoints" className="mr-2" checked={formData.usePoints} onChange={handleInputChange} />
                                        <span className="font-semibold text-orange-700">Use Loyalty Points</span>
                                    </label>
                                    <span className="text-sm text-orange-600">Available: {selectedCustomer.points} points</span>
                                </div>
                                {formData.usePoints && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-orange-600">Points to use:</span>
                                        <input
                                            type="number"
                                            name="pointsToUse"
                                            className="form-input w-24"
                                            min={0}
                                            max={selectedCustomer.points}
                                            value={formData.pointsToUse}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                )}
                                {formData.usePoints && formData.pointsToUse > 0 && <div className="mt-2 text-sm text-orange-600">Points discount: -৳{calculatePointsDiscount().toFixed(2)}</div>}
                            </div>
                        )}

                        {/* Balance Payment Section */}
                        {selectedCustomer && parseFloat(selectedCustomer.balance) > 0 && (
                            <div className="rounded border border-teal-200 bg-teal-50 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" name="useBalance" className="mr-2" checked={formData.useBalance} onChange={handleInputChange} />
                                        <span className="font-semibold text-teal-700">Use Account Balance</span>
                                    </label>
                                    <span className="text-sm text-teal-600">Available:৳{selectedCustomer.balance}</span>
                                </div>
                                {formData.useBalance && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-teal-600">Balance to use:</span>
                                        <input
                                            type="number"
                                            name="balanceToUse"
                                            className="form-input w-24"
                                            min={0}
                                            max={parseFloat(selectedCustomer.balance)}
                                            step={0.01}
                                            value={formData.balanceToUse}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                )}
                                {formData.useBalance && formData.balanceToUse > 0 && <div className="mt-2 text-sm text-teal-600">Balance discount: -৳{calculateBalanceDiscount().toFixed(2)}</div>}
                            </div>
                        )}

                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                            <label className="text-sm font-semibold sm:text-base">
                                Payment Method <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="paymentMethod"
                                className="form-select w-full sm:w-40"
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                                required // ✅ HTML5 required
                            >
                                <option value="">Select</option>
                                <option value="cash">Cash</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>

                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                            <label className="text-sm font-semibold sm:text-base">
                                Payment Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="paymentStatus"
                                className="form-select w-full sm:w-40"
                                value={formData.paymentStatus}
                                onChange={handleInputChange}
                                required // ✅ HTML5 required
                            >
                                <option value="">Select</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>

                        <div className="flex justify-between border-t border-gray-300 pt-3 text-sm font-semibold sm:pt-4 sm:text-lg">
                            <span>Subtotal (without tax)</span>
                            <span>৳{calculateSubtotalWithoutTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                            <span>Tax (from items)</span>
                            <span>৳{calculateTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                            <span>Discount</span>
                            <span>৳-{calculateDiscount().toFixed(2)}</span>
                        </div>
                        {selectedCustomer && formData.membershipDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 sm:text-base">
                                <span>Membership Discount</span>
                                <span>৳-{calculateMembershipDiscount().toFixed(2)}</span>
                            </div>
                        )}
                        {selectedCustomer && formData.usePoints && formData.pointsToUse > 0 && (
                            <div className="flex justify-between text-sm text-orange-600 sm:text-base">
                                <span>Points Payment ({formData.pointsToUse} pts)</span>
                                <span>৳ -{calculatePointsDiscount().toFixed(2)}</span>
                            </div>
                        )}
                        {selectedCustomer && formData.useBalance && formData.balanceToUse > 0 && (
                            <div className="flex justify-between text-sm text-teal-600 sm:text-base">
                                <span>Balance Payment</span>
                                <span>৳-{calculateBalanceDiscount().toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-gray-300 pt-3 text-lg font-bold sm:pt-4 sm:text-xl">
                            <span>Total Payable</span>
                            <span>৳{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

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
        </div>
    );
};

export default PosRightSide;
