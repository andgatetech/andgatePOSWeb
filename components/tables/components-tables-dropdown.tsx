'use client';

import PanelCodeHighlight from '@/components/panel-code-highlight';
import { IRootState } from '@/store';
import { useGetAllPurchasesQuery } from '@/store/features/purchase/purchase';
import { useSelector } from 'react-redux';
import Dropdown from '../dropdown';
import IconHorizontalDots from '../icon/icon-horizontal-dots';

const ComponentsTablesDropdown = () => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const { data: purchases, isLoading } = useGetAllPurchasesQuery();
    console.log('Purchases:', purchases);
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
    const getPaymentStatusBadgeClass = (payment_status: string) => {
        switch (payment_status) {
            case 'Pending':
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

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <PanelCodeHighlight>
            <div className="table-responsive mb-5">
                <table>
                    <thead>
                        <tr>
                            <th>Purchase Id</th>
                            <th>Purchaser Name</th>
                            <th>Payment Status</th>
                            <th>Status</th>
                            <th>Grand Total</th>
                            <th>Total</th>
                            <th>Tax</th>
                            <th>Payment Type</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases?.map((data) => (
                            <tr key={data.id}>
                                <td>
                                    <div className="whitespace-nowrap">{data?.id}</div>
                                </td>
                                <td>{data?.user?.name}</td>

                                <td>
                                    <span className={`badge whitespace-nowrap ${getStatusBadgeClass(data.payment_status)}`}>{data.payment_status}</span>
                                </td>
                                <td>
                                    <span className={`badge whitespace-nowrap ${getStatusBadgeClass(data.status)}`}>{data.status}</span>
                                </td>
                                <td>{data.grand_total}</td>
                                <td>{data.total}</td>
                                <td>{data.tax}</td>
                                <td>{data.payment_type}</td>
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
