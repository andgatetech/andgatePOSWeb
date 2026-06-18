'use client';

import { getTranslation } from '@/i18n';
import { STORE_TYPES } from '@/lib/storeTypes';
import { Search, ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SearchableStoreTypeProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function SearchableStoreType({ value, onChange, className }: SearchableStoreTypeProps) {
    const { t } = getTranslation();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = STORE_TYPES.find((t) => t.value === value);

    const results = search.trim()
        ? STORE_TYPES.filter((type) => {
            const label = t(type.labelKey).toLowerCase();
            return label.includes(search.toLowerCase());
        })
        : STORE_TYPES;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className || ''}`}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-left transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
            >
                <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
                    {selected ? t(selected.labelKey) : t('lbl_select_store_type')}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="flex items-center border-b border-gray-100 px-3 py-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('lbl_search') + '...'}
                            className="ml-2 w-full text-sm outline-none"
                            autoFocus
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} className="p-1 text-gray-400 hover:text-gray-600">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400">{t('msg_no_results')}</div>
                        ) : (
                            results.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(type.value);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                                        value === type.value ? 'bg-[#046ca9]/5 font-semibold text-[#046ca9]' : 'text-gray-700'
                                    }`}
                                >
                                    {t(type.labelKey)}
                                    {value === type.value && <span className="ml-auto text-[#046ca9]">✓</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
