'use client';

import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import { IRootState } from '@/store';
import React from 'react';
import { useSelector } from 'react-redux';

const ComponentsTablesDropdown = () => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const tableData = [
        {
            id: 1,
            name: 'John Doe',
            email: 'johndoe@yahoo.com',
            date: '10/08/2020',
            sale: 120,
            status: 'Draft',
            register: '5 min ago',
            progress: '40%',
            position: 'Developer',
            office: 'London',
        },
        {
            id: 2,
            name: 'Shaun Park',
            email: 'shaunpark@gmail.com',
            date: '11/08/2020',
            sale: 400,
            status: 'Received',
            register: '11 min ago',
            progress: '23%',
            position: 'Designer',
            office: 'New York',
        },
        {
            id: 3,
            name: 'Alma Clarke',
            email: 'alma@gmail.com',
            date: '12/02/2020',
            sale: 310,
            status: 'Delivered',
            register: '1 hour ago',
            progress: '80%',
            position: 'Accountant',
            office: 'Amazon',
        },
        {
            id: 4,
            name: 'Vincent Carpenter',
            email: 'vincent@gmail.com',
            date: '13/08/2020',
            sale: 100,
            status: 'Canceled',
            register: '1 day ago',
            progress: '60%',
            position: 'Data Scientist',
            office: 'Canada',
        },
    ];

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Draft':
                return 'bg-warning';
            case 'Received':
                return 'bg-secondary';
            case 'Delivered':
                return 'bg-success';
            case 'Canceled':
                return 'bg-danger';
            default:
                return 'bg-primary';
        }
    };

    return (
        <PanelCodeHighlight>
            <div className="table-responsive mb-5">
                <table>
                    <thead>
                        <tr>
                            <th>Purchase Id</th>
                            <th>Payment Status</th>
                            <th>Grand Total</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((data) => (
                            <tr key={data.id}>
                                <td>
                                    <div className="whitespace-nowrap">{data.name}</div>
                                </td>
                                <td>{data.date}</td>
                                <td>{data.sale}</td>
                                <td>
                                    <span className={`badge whitespace-nowrap ${getStatusBadgeClass(data.status)}`}>{data.status}</span>
                                </td>
                                <td className="text-center">
                                    <div className="dropdown">
                                        <Dropdown offset={[0, 5]} placement={isRtl ? 'bottom-start' : 'bottom-end'} button={<IconHorizontalDots className="m-auto opacity-70" />}>
                                            <ul>
                                                <li>
                                                    <button type="button">Draft</button>
                                                </li>
                                                <li>
                                                    <button type="button">Received</button>
                                                </li>
                                                <li>
                                                    <button type="button">Delivered</button>
                                                </li>
                                                <li>
                                                    <button type="button">Canceled</button>
                                                </li>
                                            </ul>
                                        </Dropdown>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PanelCodeHighlight>
    );
};

export default ComponentsTablesDropdown;
