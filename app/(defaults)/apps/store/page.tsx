'use client';
import ShowTable from '@/__components/show_table';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { useDeleteStoreMutation, useGetAllStoreAdminStoresQuery, useGetAllStoresQuery, useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import Tippy from '@tippyjs/react';
import { CheckCircle, Shield, Users, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'tippy.js/dist/tippy.css';
const Store = () => {
    const user = useSelector((state: any) => state.auth.user);
    const { data: staffResponse } = useGetStaffMemberQuery();
    const staffMembers = staffResponse?.data || [];
    const [deleteStore] = useDeleteStoreMutation();
    const handleDelete = async (id: number) => {
        try {
            await deleteStore(id).unwrap();
            toast.success('Store deleted successfully');
        } catch (error) {
            console.error('Failed to delete store:', error);
        }
    };
    const getStats = () => {
        if (!staffMembers || staffMembers.length === 0) return { total: 0, admins: 0, staff: 0, managers: 0 };

        return {
            total: staffMembers.length,
            admins: staffMembers.filter((s) => s.role_in_store === 'store admin').length,
            staff: staffMembers.filter((s) => s.role_in_store === 'staff').length,
            managers: staffMembers.filter((s) => s.role_in_store === 'manager').length,
        };
    };

    const stats = getStats();

    // Sample data for the table
    // const { data: stores, isLoading, error, refetch } = useGetAllStoresQuery();
    const { data: stores, isLoading, error, refetch } = useGetAllStoreAdminStoresQuery();
    console.log('stores', stores);
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading stores: {error.message}</div>;

    const tableData = stores?.data?.map((store, index) => ({
        id: store.id,
        name: store.store_name,
        location: store.store_location,
        contact: store.store_contact,
    }));

    return (
        <div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Total Staff</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Administrators</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                        </div>
                        <Shield className="h-8 w-8 text-purple-600" />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Staff Members</p>
                            <p className="text-2xl font-bold text-green-600">{stats.staff}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Managers</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.managers}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
            </div>
            <ShowTable role={user?.role} title="Store List">
                <div className="table-responsive mb-5">
                    <table className="table-hover">
                        <thead>
                            <tr className="">
                                <th>Name</th>
                                <th>Location</th>
                                <th>Contact</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData?.map((data) => {
                                return (
                                    <tr key={data.id}>
                                        <td>
                                            <div className="whitespace-nowrap">{data.name}</div>
                                        </td>
                                        <td>{data.location}</td>
                                        <td>{data.contact}</td>
                                        <td className="text-center">
                                            <Tippy content="Delete">
                                                <button onClick={() => handleDelete(data.id)} type="button">
                                                    <IconTrashLines className="m-auto" />
                                                </button>
                                            </Tippy>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </ShowTable>
        </div>
    );
};

export default Store;
