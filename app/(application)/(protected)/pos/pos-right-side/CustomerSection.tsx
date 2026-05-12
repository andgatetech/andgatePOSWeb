'use client';
import IconSearch from '@/components/icon/icon-search';
import IconUser from '@/components/icon/icon-user';
import IconX from '@/components/icon/icon-x';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import type { Customer, PosFormData } from './types';

interface CustomerSectionProps {
    formData: PosFormData;
    selectedCustomer: Customer | null;
    isManualCustomerEntry: boolean;
    showManualCustomerForm: boolean;
    customerSearch: string;
    customers: Customer[];
    isSearching: boolean;
    showSearchResults: boolean;
    searchParams: string;
    searchInputRef: React.RefObject<HTMLDivElement | null>;
    error: unknown;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocusResults: () => void;
    onCustomerSelect: (customer: Customer) => void;
    onClearCustomer: () => void;
    onToggleManualEntry: () => void;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSelectWalkInCustomer: () => void;
    onClearWalkInCustomer: () => void;
    getBadgeClass: (membership?: string) => string;
    getMembershipDiscount: (membership?: string) => number;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
    formData,
    selectedCustomer,
    isManualCustomerEntry,
    customerSearch,
    customers,
    isSearching,
    showSearchResults,
    searchParams,
    searchInputRef,
    error,
    onSearchChange,
    onFocusResults,
    onCustomerSelect,
    onClearCustomer,
    onToggleManualEntry,
    onInputChange,
    onSelectWalkInCustomer,
    onClearWalkInCustomer,
    getBadgeClass,
    getMembershipDiscount,
}) => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();

    const isWalkIn = formData.customerId === 'walk-in';
    const hasCustomer = !!selectedCustomer;
    const isSearchMode = !isWalkIn && !isManualCustomerEntry;

    return (
        <div>
            {/* Section header */}
            <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">{t('pos_bill_to')}</h3>
            </div>

            {/* ── Walk-in selected state ── */}
            {isWalkIn && (
                <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 shadow-sm">
                        <IconUser className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-orange-900">{t('pos_walk_in_customer')}</p>
                        <p className="text-xs text-orange-600">{t('pos_walk_in_no_details')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClearWalkInCustomer}
                        className="shrink-0 rounded-lg p-1.5 text-orange-400 transition-colors hover:bg-orange-100 hover:text-orange-700"
                    >
                        <IconX className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* ── Search + selection area ── */}
            {!isWalkIn && (
                <div className="space-y-3">
                    {/* Walk-in prominent option (only when no customer chosen yet) */}
                    {!hasCustomer && !isManualCustomerEntry && (
                        <>
                            <button
                                type="button"
                                onClick={onSelectWalkInCustomer}
                                className="flex w-full items-center gap-3 rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3 text-left transition-all hover:border-orange-300 hover:bg-orange-100 active:scale-[0.99]"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 shadow-sm">
                                    <IconUser className="h-5 w-5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-orange-900">{t('pos_walk_in_customer')}</p>
                                    <p className="text-xs text-orange-600">{t('pos_walk_in_no_details')}</p>
                                </div>
                                <svg className="h-4 w-4 shrink-0 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-gray-200" />
                                <span className="text-xs font-medium text-gray-400">or</span>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>
                        </>
                    )}

                    {/* Selected customer card */}
                    {hasCustomer && (
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-sm">
                                    {selectedCustomer.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-bold text-gray-800">{selectedCustomer.name}</p>
                                    <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getBadgeClass(selectedCustomer.membership)}`}>
                                        {String(selectedCustomer.membership || 'normal').toUpperCase()}
                                    </span>
                                    <p className="mt-1 text-xs text-gray-400">{Number(selectedCustomer.points) || 0} pts</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClearCustomer}
                                    className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                >
                                    <IconX className="h-4 w-4" />
                                </button>
                            </div>
                            {/* Loyalty & balance info */}
                            {(Number(selectedCustomer.balance) > 0 || getMembershipDiscount(selectedCustomer.membership) > 0) && (
                                <div className="mt-2 flex gap-2 border-t border-primary/10 pt-2">
                                    {getMembershipDiscount(selectedCustomer.membership) > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            {getMembershipDiscount(selectedCustomer.membership)}% off
                                        </span>
                                    )}
                                    {Number(selectedCustomer.balance) > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                                            {formatCurrency(Number(selectedCustomer.balance))} balance
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search box */}
                    {isSearchMode && (
                        <div className="flex gap-2">
                            <div className="relative flex-1" ref={searchInputRef}>
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    {isSearching && searchParams ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                        <IconSearch className="h-4 w-4 text-gray-400" />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="form-input h-11 pl-10 pr-9 text-sm"
                                    placeholder={t('placeholder_customer_search')}
                                    value={customerSearch}
                                    onChange={onSearchChange}
                                    onFocus={onFocusResults}
                                />
                                {selectedCustomer && (
                                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={onClearCustomer}>
                                        <IconX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}

                                {/* Search results dropdown */}
                                {showSearchResults && searchParams && (
                                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                                        {error ? (
                                            <div className="px-4 py-3 text-center text-sm text-red-500">{t('msg_error_loading_customers')}</div>
                                        ) : customers.length > 0 ? (
                                            customers.map((customer) => (
                                                <div
                                                    key={customer.id}
                                                    className="flex cursor-pointer items-center gap-3 border-b border-gray-50 px-3 py-2.5 last:border-0 hover:bg-primary/5"
                                                    onClick={() => onCustomerSelect(customer)}
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                        {customer.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-gray-800">{customer.name}</p>
                                                        <p className="text-xs text-gray-500">{customer.phone}</p>
                                                    </div>
                                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getBadgeClass(customer.membership)}`}>
                                                        {String(customer.membership || 'normal').toUpperCase()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : !isSearching ? (
                                            <div className="px-4 py-6 text-center">
                                                <IconUser className="mx-auto mb-2 h-10 w-10 text-gray-200" />
                                                <p className="text-sm text-gray-500">{t('msg_no_customers_found')}</p>
                                                <p className="text-xs text-gray-400">{t('msg_try_different_search')}</p>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {/* New customer toggle */}
                            <button
                                type="button"
                                onClick={onToggleManualEntry}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-white"
                                title={t('pos_add_new_customer')}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Manual new-customer form */}
                    {isManualCustomerEntry && !selectedCustomer && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2.5">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('pos_add_new_customer')}</p>
                                <button type="button" onClick={onToggleManualEntry} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
                                    <IconX className="h-4 w-4" />
                                </button>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    {t('lbl_name')} <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    className="form-input h-10 text-sm"
                                    placeholder={t('placeholder_enter_name')}
                                    value={formData.customerName}
                                    onChange={onInputChange}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    {t('lbl_phone')} <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customerPhone"
                                    className="form-input h-10 text-sm"
                                    placeholder={t('placeholder_enter_phone')}
                                    value={formData.customerPhone}
                                    onChange={onInputChange}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    {t('lbl_email')} <span className="text-gray-400 text-xs font-normal">({t('lbl_optional')})</span>
                                </label>
                                <input
                                    type="email"
                                    name="customerEmail"
                                    className="form-input h-10 text-sm"
                                    placeholder={t('placeholder_enter_email')}
                                    value={formData.customerEmail}
                                    onChange={onInputChange}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerSection;
