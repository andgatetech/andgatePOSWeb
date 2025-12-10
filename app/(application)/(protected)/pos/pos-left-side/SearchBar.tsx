import { Camera, Search } from 'lucide-react';
import React, { useState } from 'react';

interface SearchBarProps {
    searchTerm: string;
    barcodeEnabled: boolean;
    showCameraScanner: boolean;
    onSearchChange: (value: string) => void;
    onToggleBarcodeScanner: () => void;
    onToggleCameraScanner: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, barcodeEnabled, showCameraScanner, onSearchChange, onToggleBarcodeScanner, onToggleCameraScanner }) => {
    const [localSearch, setLocalSearch] = useState(searchTerm);

    const handleSearchClick = () => {
        onSearchChange(localSearch);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleInputChange = (value: string) => {
        setLocalSearch(value);
        // Auto-trigger for SKU scanning (instant add)
        if (value.toLowerCase().startsWith('sku-') && value.length > 10) {
            onSearchChange(value);
        }
    };

    const handleClear = () => {
        setLocalSearch('');
        onSearchChange('');
    };

    return (
        <div className="relative mb-4 sm:mb-6">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                    <input
                        type="text"
                        placeholder="Search or scan..."
                        className="form-input w-full rounded-lg border border-gray-300 py-2 pl-8 pr-20 text-sm focus:border-transparent focus:ring-2 focus:ring-primary sm:py-3 sm:pl-10 sm:pr-24 sm:text-base"
                        value={localSearch}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    {localSearch && (
                        <button onClick={handleClear} className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 sm:right-14" title="Clear search">
                            ✕
                        </button>
                    )}
                </div>
                {/* Search Button */}
                <button
                    onClick={handleSearchClick}
                    className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:px-6 sm:py-3"
                    title="Search"
                >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                {/* Keyboard Scanner Button */}
                <button
                    onClick={onToggleBarcodeScanner}
                    className={`flex items-center justify-center rounded-lg px-3 py-2 transition-colors sm:px-4 sm:py-3 ${
                        barcodeEnabled ? 'bg-purple-500 text-white hover:bg-purple-600' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title={barcodeEnabled ? 'USB Scanner active' : 'Enable USB Scanner'}
                >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {/* Camera Scanner Button */}
                <button
                    onClick={onToggleCameraScanner}
                    className={`flex items-center justify-center rounded-lg px-3 py-2 transition-colors sm:px-4 sm:py-3 ${
                        showCameraScanner ? 'bg-green-500 text-white hover:bg-green-600' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title={showCameraScanner ? 'Close camera scanner' : 'Open camera scanner'}
                >
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
            </div>
            {barcodeEnabled && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                    Keyboard scanner active - Ready to scan with USB/Bluetooth scanner
                </div>
            )}
        </div>
    );
};

export default SearchBar;
