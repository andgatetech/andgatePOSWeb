'use client';
import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import UniversalFilter from '@/components/common/UniversalFilter';
import Dropdown from '@/components/dropdown';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useDeleteStoreMutation, useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import { Building2, CheckCircle, MapPin, MoreVertical, Phone, Settings, Store, Trash2, Users, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import Swal from 'sweetalert2';

const AllStoreComponent = () => {
    const { userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});

    // Build query parameters for API
    let queryParams: Record<string, any> = {};

    if (Object.keys(apiParams).length > 0) {
        // Filter is active - use filter parameters
        if (apiParams.store_ids === 'all') {
            // "All Stores" selected - send all user's store IDs
            const allStoreIds = userStores.map((store: any) => store.id);
            queryParams = { ...apiParams, store_ids: allStoreIds };
        } else if (apiParams.store_id) {
            // Specific store selected in filter
            queryParams = apiParams;
        } else {
            // Filter active but no specific store
            queryParams = apiParams;
        }
    } else {
        // No filter active - show all user stores
        const allStoreIds = userStores.map((store: any) => store.id);
        queryParams = { store_ids: allStoreIds };
    }

    console.log('AllStores - Query Params:', queryParams);

    const { data: storesResponse, error, isLoading } = useFullStoreListWithFilterQuery(queryParams);
    const [deleteStore] = useDeleteStoreMutation();
    const stores = storesResponse?.data || [];

    // Handle filter changes from UniversalFilter
    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        console.log('AllStores - Filter changed:', newApiParams);
        setApiParams(newApiParams);
    }, []);

    // Define table columns
    const columns: TableColumn[] = [
        {
            key: 'logo_path',
            label: 'Logo',
            render: (value, row) => (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                    {value ? <Image src={value} alt={`${row.store_name} logo`} width={48} height={48} className="h-12 w-12 rounded-lg object-cover" /> : <Store className="h-6 w-6 text-gray-400" />}
                </div>
            ),
        },
        {
            key: 'store_name',
            label: 'Store Details',
            sortable: true,
            render: (value, row) => (
                <div className="space-y-1">
                    <div className="font-semibold text-gray-900">{value}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {row.store_location || 'No location'}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        {row.store_contact || 'No contact'}
                    </div>
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            sortable: true,
            render: (value, row) => (
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${value && !row.store_disabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {value && !row.store_disabled ? (
                        <>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Active
                        </>
                    ) : (
                        <>
                            <XCircle className="mr-1 h-4 w-4" />
                            Inactive
                        </>
                    )}
                </span>
            ),
        },
        {
            key: 'members_count',
            label: 'Members',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{value || 0}</span>
                </div>
            ),
        },
        {
            key: 'opening_time',
            label: 'Working Hours',
            render: (value, row) => (
                <div className="text-sm">
                    {value && row.closing_time ? (
                        <span className="text-gray-700">
                            {value} - {row.closing_time}
                        </span>
                    ) : (
                        <span className="text-gray-400">Not set</span>
                    )}
                </div>
            ),
        },
        {
            key: 'loyalty_points_enabled',
            label: 'Features',
            render: (value, row) => (
                <div className="space-y-1">
                    {value && <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">Loyalty Points ({row.loyalty_points_rate || 1}%)</span>}
                    {row.max_discount && <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs text-green-700">Max Discount: {row.max_discount}%</span>}
                </div>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (value) => <span className="text-sm text-gray-600">{new Date(value).toLocaleDateString()}</span>,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (value, row) => (
                <Dropdown
                    offset={[0, 5]}
                    placement="bottom-end"
                    btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    button={<MoreVertical className="h-5 w-5" />}
                >
                    <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                        
                        <li className="border-t">
                            <button onClick={() => handleDeleteStore(row)} className="flex w-full items-center gap-2 px-4 py-2 text-left font-medium text-red-500 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                                Delete Store
                            </button>
                        </li>
                    </ul>
                </Dropdown>
            ),
        },
    ];

    // Handle delete store
    const handleDeleteStore = async (store: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${store.store_name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                await deleteStore(store.id).unwrap();

                Swal.fire({
                    title: 'Deleted!',
                    text: 'Store has been deleted successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete store. Please try again.',
                    icon: 'error',
                });
            }
        }
    };

    // Custom filters for store-specific filtering
    const customFilters = (
        <div className="relative">
            <select
                className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => {
                    const newParams = { ...apiParams, status: e.target.value };
                    setApiParams(newParams);
                }}
                defaultValue="all"
            >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
    );

    if (error) {
        return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">Error loading stores. Please try again later.</div>;
    }

    return (
        <div className="">
            {/* Universal Filter - No store dropdown needed for all stores view */}
            <UniversalFilter
                onFilterChange={handleFilterChange}
                placeholder="Search stores..."
                showStoreFilter={false} // Hide store filter since we're showing all stores
                showDateFilter={true}
                showSearch={true}
                customFilters={customFilters}
                initialFilters={{
                    dateRange: { type: 'none' }, // No default date filter
                }}
            />

            {/* Reusable Table */}
            <ReusableTable data={stores} columns={columns} isLoading={isLoading} />
        </div>
    );
};

export default AllStoreComponent;
