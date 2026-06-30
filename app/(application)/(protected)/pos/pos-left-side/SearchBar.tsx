'use client';
import { getTranslation } from '@/i18n';
import { Camera, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
    searchTerm: string;
    barcodeEnabled: boolean;
    showCameraScanner: boolean;
    placeholder?: string;
    onSearchChange: (value: string) => void;
    onToggleBarcodeScanner: () => void;
    onToggleCameraScanner: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    searchTerm,
    barcodeEnabled,
    showCameraScanner,
    placeholder,
    onSearchChange,
    onToggleBarcodeScanner,
    onToggleCameraScanner,
}) => {
    const { t } = getTranslation();
    const [localSearch, setLocalSearch] = useState(searchTerm);
    // Prevent debounce firing when parent resets searchTerm externally (e.g. after scan auto-add)
    const skipNextDebounce = useRef(false);

    // Sync when parent clears searchTerm (scan auto-add, clear filters, etc.)
    useEffect(() => {
        if (searchTerm !== localSearch) {
            skipNextDebounce.current = true;
            setLocalSearch(searchTerm);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Debounced auto-search — fires 500ms after user stops typing
    useEffect(() => {
        if (skipNextDebounce.current) {
            skipNextDebounce.current = false;
            return;
        }
        if (localSearch === '') {
            onSearchChange('');
            return;
        }
        const timer = setTimeout(() => {
            onSearchChange(localSearch);
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localSearch]);

    const handleClear = () => {
        setLocalSearch('');
        onSearchChange('');
    };

    // Enter key triggers immediate search (no debounce wait)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            skipNextDebounce.current = true;
            onSearchChange(localSearch);
        }
    };

    const isActive = barcodeEnabled || showCameraScanner;

    return (
        <div className="mb-4">
            {/* Search row */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={placeholder || t('pos_scan_barcode')}
                        className="form-input h-11 w-full rounded-xl border border-gray-200 pl-9 pr-9 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    {localSearch && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Keyboard barcode scanner toggle */}
                <button
                    onClick={onToggleBarcodeScanner}
                    title={barcodeEnabled ? t('status_active') : t('pos_enable_barcode_scanner')}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                        barcodeEnabled
                            ? 'border-purple-500 bg-purple-500 text-white shadow-sm'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-purple-300 hover:text-purple-600'
                    }`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h1M4 10h1M4 14h1M4 18h1M8 4v16M12 4v16M16 6h1M16 10h1M16 14h1M16 18h1M20 4v16" />
                    </svg>
                </button>

                {/* Camera scanner toggle */}
                <button
                    onClick={onToggleCameraScanner}
                    title={showCameraScanner ? t('btn_close') : t('pos_scan_barcode')}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                        showCameraScanner
                            ? 'border-green-500 bg-green-500 text-white shadow-sm'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:text-green-600'
                    }`}
                >
                    <Camera className="h-5 w-5" />
                </button>
            </div>

            {/* Active scanner indicators */}
            {isActive && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {barcodeEnabled && (
                        <div className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" />
                            {t('pos_scan_barcode')}
                        </div>
                    )}
                    {showCameraScanner && (
                        <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                            {t('pos_camera_title')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
