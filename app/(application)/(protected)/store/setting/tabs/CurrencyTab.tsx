import { Check, ChevronLeft, ChevronRight, Loader2, MoreVertical, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import Dropdown from './Dropdown';

export interface CurrencyForm {
    currency_code: string;
    currency_name: string;
    currency_symbol: string;
    currency_position: 'before' | 'after';
    decimal_places: number;
    thousand_separator: string;
    decimal_separator: string;
    is_active: boolean;
}

interface CurrencyTabProps {
    currency: any; // specific prop name kept for compatibility with StoreSetting, but receiving array or single object treated as list
    isLoading?: boolean;
    newCurrency: CurrencyForm;
    setNewCurrencyField: (field: keyof CurrencyForm, value: string | number | boolean) => void;
    handleCreateCurrency: () => void;
    editingCurrencyId: number | null;
    editingCurrency: CurrencyForm;
    setEditingCurrencyField: (field: keyof CurrencyForm, value: string | number | boolean) => void;
    startEditingCurrency: (currency: any) => void;
    cancelEditingCurrency: () => void;
    handleUpdateCurrency: (id: number) => void;
    handleDeleteCurrency: (id: number, name: string) => void;
    handleToggleCurrencyActive: (id: number, isActive: boolean) => void;
}

const CurrencyTab: React.FC<CurrencyTabProps> = ({
    currency,
    isLoading,
    newCurrency,
    setNewCurrencyField,
    handleCreateCurrency,
    editingCurrencyId,
    editingCurrency,
    setEditingCurrencyField,
    startEditingCurrency,
    cancelEditingCurrency,
    handleUpdateCurrency,
    handleDeleteCurrency,
    handleToggleCurrencyActive,
}) => {
    // Normalize currency input to array
    const currencyList = Array.isArray(currency) ? currency : currency ? [currency] : [];

    // Pagination state (kept for consistency, though usually 1 item)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate pagination
    const totalItems = currencyList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = currencyList.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderActiveToggle = (isActive: boolean, onToggle: () => void, labelId: string) => (
        <label className="relative inline-flex cursor-pointer items-center" htmlFor={labelId}>
            <input id={labelId} type="checkbox" checked={isActive} onChange={onToggle} className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
        </label>
    );

    const formatPreview = (currencyData: CurrencyForm) => {
        const amount = '1,234.56';
        if (currencyData.currency_position === 'before') {
            return `${currencyData.currency_symbol}${amount}`;
        }
        return `${amount}${currencyData.currency_symbol}`;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Currency Settings</h3>
                    <p className="text-sm text-gray-500">Configure the currency used for your store transactions and display.</p>
                </div>

                {/* Add Currency Form */}
                <div className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-800">Add Currency</h4>
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Currency Code *</label>
                            <input
                                type="text"
                                value={newCurrency.currency_code}
                                onChange={(e) => setNewCurrencyField('currency_code', e.target.value.toUpperCase())}
                                placeholder="e.g., USD, BDT, EUR"
                                maxLength={3}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm uppercase focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Currency Name *</label>
                            <input
                                type="text"
                                value={newCurrency.currency_name}
                                onChange={(e) => setNewCurrencyField('currency_name', e.target.value)}
                                placeholder="e.g., US Dollar, Bangladeshi Taka"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Symbol *</label>
                            <input
                                type="text"
                                value={newCurrency.currency_symbol}
                                onChange={(e) => setNewCurrencyField('currency_symbol', e.target.value)}
                                placeholder="e.g., $, ৳, €"
                                maxLength={5}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Symbol Position</label>
                            <select
                                value={newCurrency.currency_position}
                                onChange={(e) => setNewCurrencyField('currency_position', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="before">Before ($100)</option>
                                <option value="after">After (100$)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Decimal Places</label>
                            <input
                                type="number"
                                value={newCurrency.decimal_places}
                                onChange={(e) => setNewCurrencyField('decimal_places', parseInt(e.target.value) || 0)}
                                min={0}
                                max={4}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Thousand Separator</label>
                            <input
                                type="text"
                                value={newCurrency.thousand_separator}
                                onChange={(e) => setNewCurrencyField('thousand_separator', e.target.value)}
                                placeholder=","
                                maxLength={1}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Decimal Separator</label>
                            <input
                                type="text"
                                value={newCurrency.decimal_separator}
                                onChange={(e) => setNewCurrencyField('decimal_separator', e.target.value)}
                                placeholder="."
                                maxLength={1}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 bg-white p-3">
                        <span className="text-xs text-gray-500">Preview:</span>
                        <span className="text-sm font-medium text-emerald-700">{formatPreview(newCurrency)}</span>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleCreateCurrency}
                            className="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Currency
                        </button>
                    </div>
                </div>

                {/* Currency Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Symbol</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Position</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Decimals</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Active</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                    </td>
                                </tr>
                            ) : paginatedData && paginatedData.length > 0 ? (
                                paginatedData.map((cur: any) => {
                                    const isEditingThis = editingCurrencyId === cur.id;
                                    const activeValue = cur.is_active === true || cur.is_active === 1 || cur.is_active === '1';

                                    return (
                                        <tr key={cur.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{cur.id}</td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditingThis ? (
                                                    <input
                                                        type="text"
                                                        value={editingCurrency.currency_code}
                                                        onChange={(e) => setEditingCurrencyField('currency_code', e.target.value.toUpperCase())}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm uppercase focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        maxLength={3}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">{cur.currency_code}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditingThis ? (
                                                    <input
                                                        type="text"
                                                        value={editingCurrency.currency_name}
                                                        onChange={(e) => setEditingCurrencyField('currency_name', e.target.value)}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-900">{cur.currency_name}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditingThis ? (
                                                    <input
                                                        type="text"
                                                        value={editingCurrency.currency_symbol}
                                                        onChange={(e) => setEditingCurrencyField('currency_symbol', e.target.value)}
                                                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        maxLength={5}
                                                    />
                                                ) : (
                                                    <span className="text-lg font-bold text-emerald-600">{cur.currency_symbol}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditingThis ? (
                                                    <select
                                                        value={editingCurrency.currency_position}
                                                        onChange={(e) => setEditingCurrencyField('currency_position', e.target.value)}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    >
                                                        <option value="before">Before</option>
                                                        <option value="after">After</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-sm capitalize text-gray-600">{cur.currency_position}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center align-top">
                                                {isEditingThis ? (
                                                    <input
                                                        type="number"
                                                        value={editingCurrency.decimal_places}
                                                        onChange={(e) => setEditingCurrencyField('decimal_places', parseInt(e.target.value) || 0)}
                                                        className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        min={0}
                                                        max={4}
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-600">{cur.decimal_places}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center align-top">
                                                {isEditingThis
                                                    ? renderActiveToggle(
                                                          editingCurrency.is_active,
                                                          () => setEditingCurrencyField('is_active', !editingCurrency.is_active),
                                                          `edit-currency-active-${cur.id}`
                                                      )
                                                    : renderActiveToggle(activeValue, () => handleToggleCurrencyActive(cur.id, !activeValue), `currency-active-${cur.id}`)}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                {isEditingThis ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateCurrency(cur.id)}
                                                            className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                                                            title="Save"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button type="button" onClick={cancelEditingCurrency} className="rounded bg-gray-400 p-1.5 text-white hover:bg-gray-500" title="Cancel">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center">
                                                        <Dropdown
                                                            offset={[0, 5]}
                                                            placement="bottom-end"
                                                            btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            button={<MoreVertical className="h-5 w-5" />}
                                                        >
                                                            <ul className="min-w-[120px] rounded-lg border bg-white shadow-lg">
                                                                <li>
                                                                    <button
                                                                        onClick={() => startEditingCurrency(cur)}
                                                                        className="w-full cursor-pointer px-4 py-2 text-left font-medium text-blue-600 hover:bg-blue-50"
                                                                    >
                                                                        Edit Currency
                                                                    </button>
                                                                </li>
                                                                <li className="border-t">
                                                                    <button
                                                                        onClick={() => handleDeleteCurrency(cur.id, cur.currency_name)}
                                                                        className="w-full cursor-pointer px-4 py-2 text-left font-medium text-red-500 hover:bg-red-50"
                                                                    >
                                                                        Delete Currency
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </Dropdown>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No currency configured. Use the form above to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> of{' '}
                            <span className="font-semibold">{totalItems}</span> currencies
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`rounded px-3 py-1.5 text-sm font-medium ${
                                            currentPage === page ? 'bg-emerald-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrencyTab;
