import IconSearch from '@/components/icon/icon-search';
import IconUser from '@/components/icon/icon-user';
import IconX from '@/components/icon/icon-x';
import { useCurrency } from '@/hooks/useCurrency';
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
    searchInputRef: React.RefObject<HTMLDivElement>;
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
    showManualCustomerForm,
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
    const { formatCurrency } = useCurrency();
    return (
        <div className="mt-4 px-3 sm:mt-8 sm:px-4">
            <div className="flex flex-col justify-between lg:flex-row">
                <div className="mb-4 w-full sm:mb-6 lg:w-full">
                    <div className="mb-3 mt-6 flex items-center justify-between sm:mb-4 sm:mt-[1.625rem]">
                        <div className="text-base font-semibold text-gray-800 sm:text-lg ">Bill To :-</div>
                        <button
                            type="button"
                            onClick={onSelectWalkInCustomer}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 sm:px-4 sm:py-2 sm:text-sm"
                        >
                            Walk-in Customer
                        </button>
                    </div>

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
                                <button onClick={onClearWalkInCustomer} className="text-orange-600 hover:text-orange-800">
                                    <IconX className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {formData.customerId !== 'walk-in' && (
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium">Customer Search</label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative flex-1 sm:w-[70%] sm:flex-none" ref={searchInputRef}>
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <IconSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="form-input h-12 pl-10 pr-10"
                                        placeholder="Search by name, email, or phone..."
                                        value={customerSearch}
                                        onChange={onSearchChange}
                                        onFocus={onFocusResults}
                                    />
                                    {selectedCustomer && (
                                        <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={onClearCustomer}>
                                            <IconX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                    {isSearching && searchParams && (
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    )}

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
                                                        onClick={() => onCustomerSelect(customer)}
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
                                                                <div className={`rounded-full px-2 py-1 text-xs font-medium ${getBadgeClass(customer.membership)}`}>
                                                                    {String(customer.membership || 'normal').toUpperCase()}
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
                                <button
                                    type="button"
                                    onClick={onToggleManualEntry}
                                    className={`flex h-12 w-full items-center justify-center rounded-lg border-2 px-4 text-sm font-semibold transition-colors sm:w-[30%] sm:flex-none ${
                                        isManualCustomerEntry ? 'border-primary bg-primary text-white shadow-sm' : 'border-primary text-primary hover:bg-primary hover:text-white'
                                    }`}
                                >
                                    {isManualCustomerEntry ? 'Cancel New Customer' : 'Add New Customer'}
                                </button>
                            </div>
                        </div>
                    )}

                    {selectedCustomer && (
                        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-sm font-medium text-blue-900">Selected Customer</h4>
                                <div className={`rounded-full px-2 py-1 text-xs font-medium ${getBadgeClass(selectedCustomer.membership)}`}>
                                    {String(selectedCustomer.membership || 'normal').toUpperCase()} - {getMembershipDiscount(selectedCustomer.membership)}% OFF
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                <div>
                                    <span className="font-medium text-blue-700">Loyalty Points:</span>
                                    <div className="font-semibold text-blue-900">{Number(selectedCustomer.points) || 0}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-700">Balance:</span>
                                    <div className="font-semibold text-blue-900">{formatCurrency(Number(selectedCustomer.balance) || 0)}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-700">Status:</span>
                                    <div className={`font-semibold ${selectedCustomer.is_active ? 'text-green-600' : 'text-red-600'}`}>{selectedCustomer.is_active ? 'Active' : 'Inactive'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showManualCustomerForm && formData.customerId !== 'walk-in' && (
                        <div className="space-y-3 sm:space-y-4">
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
                                    onChange={onInputChange}
                                    disabled={!!selectedCustomer}
                                />
                            </div>
                            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-0">
                                <label className="text-sm font-medium sm:w-1/3">Email (Optional)</label>
                                <input
                                    type="email"
                                    name="customerEmail"
                                    className="form-input w-full flex-1"
                                    placeholder="Enter Email"
                                    value={formData.customerEmail}
                                    onChange={onInputChange}
                                    disabled={!!selectedCustomer}
                                />
                            </div>
                            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-0">
                                <label className="text-sm font-medium sm:w-1/3">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customerPhone"
                                    className="form-input w-full flex-1"
                                    placeholder="Enter Phone number"
                                    value={formData.customerPhone}
                                    onChange={onInputChange}
                                    disabled={!!selectedCustomer}
                                    required={!selectedCustomer}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerSection;
