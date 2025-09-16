'use client';

import { useAllStoresQuery } from '@/store/features/store/storeApi';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Store {
    id: number;
    store_name: string;
    store_location: string;
    store_contact: string;
    logo_path: string;
    is_active: number;
    store_disabled: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    pivot?: {
        user_id: number;
        store_id: number;
        role_in_store: string;
        created_at: string;
        updated_at: string;
    };
}

interface StoreApiResponse {
    success: boolean;
    data: Store[];
}

interface ReportHeaderProps {
    title?: string;
    subtitle?: string;
    showStoreSelector?: boolean;
    selectedStoreId?: string | number | null;
    onStoreChange?: ((storeId: string) => void) | null;
}

const ReportHeader = ({
    title = 'Report',
    subtitle = '',
    showStoreSelector = false,
    selectedStoreId = null,
    onStoreChange = null
}: ReportHeaderProps) => {

    const { data: storesResponse, isLoading: storesLoading } = useAllStoresQuery({});
    const [logoError, setLogoError] = useState(false);

    const stores: Store[] = (storesResponse as StoreApiResponse)?.data || [];
    const displayStore = stores.find(
        (s) => (selectedStoreId ? s.id.toString() === selectedStoreId.toString() : true)
    ) || stores[0];

    useEffect(() => setLogoError(false), [displayStore?.id]);

    if (storesLoading) {
        return (
            <div className="mb-6 border-b border-gray-200 bg-white p-6">
                <div className="animate-pulse">
                    <div className="mb-4 flex items-center justify-center">
                        <div className="mr-3 h-8 w-8 rounded bg-blue-200"></div>
                        <div className="h-6 w-48 rounded bg-gray-200"></div>
                    </div>
                    <div className="space-y-2 text-center">
                        <div className="mx-auto h-4 w-64 rounded bg-gray-200"></div>
                        <div className="mx-auto h-4 w-48 rounded bg-gray-200"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!displayStore) {
        return (
            <div className="border-b border-gray-200 bg-white p-6 text-center text-gray-500">
                No stores found.
            </div>
        );
    }

    return (
        <div className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Store Info Header */}
                <div className="mb-6 text-center">
                    <div className="mb-3 flex items-center justify-center">
                        <div className="mr-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                            {displayStore.logo_path && !logoError ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/${displayStore.logo_path}`}
                                    alt={`${displayStore.store_name} Logo`}
                                    width={60}
                                    height={60}
                                    className="h-full w-full object-contain"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <div className="px-2 text-center text-xs font-medium text-gray-500">Logo Here</div>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{displayStore.store_name}</h1>
                    </div>
                    <p className="mb-2 text-lg font-medium text-gray-600">Accounting Management System</p>

                    <div className="space-y-1 text-sm text-gray-600">
                        <p>
                            <span className="font-medium">Phone:</span> {displayStore.store_contact || 'N/A'}
                        </p>
                        <p>
                            <span className="font-medium">Address:</span> {displayStore.store_location || 'N/A'}
                        </p>
                        <div className="mt-2 flex justify-center gap-4 text-xs">
                            Status:{' '}
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${displayStore.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {displayStore.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div>
                            <h2 className="mb-1 text-2xl font-semibold text-gray-900">{title}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportHeader;
