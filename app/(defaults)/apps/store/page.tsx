'use client';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import React from 'react';
import { useGetStoresQuery } from '@/store/features/store/storeApi';

const Store = () => {
    // Sample data for the table
    const { data: stores = [], isLoading, error, refetch } = useGetStoresQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading stores: {error.message}</div>;
    // if (stores.length === 0) return <div>No stores available.</div>;

    const tableData = stores.map((store, index) => ({
        id: store.id,
        name: store.store_name,
        location: store.store_location,
        contact: store.store_contact,
    }));

    return (
        <PanelCodeHighlight title="Store List">
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
                        {tableData.map((data) => {
                            return (
                                <tr key={data.id}>
                                    <td>
                                        <div className="whitespace-nowrap">{data.name}</div>
                                    </td>
                                    <td>{data.location}</td>
                                    <td>{data.contact}</td>
                                    <td className="text-center">
                                        <Tippy content="Delete">
                                            <button type="button">
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
        </PanelCodeHighlight>
    );
};

export default Store;
