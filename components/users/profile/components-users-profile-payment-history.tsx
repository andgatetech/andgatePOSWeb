'use client';

import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import React from 'react';

const ComponentsUsersProfilePaymentHistory = () => {
    const isRtl = useSelector((state: RootState) => state.themeConfig.rtlClass) === 'rtl';
    const user = useSelector((state: RootState) => state.auth.user);

    if (!user) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-gray-500">No payment history found.</p>
            </div>
        );
    }

    // Get subscription history if available
    const history = user.subscription_user?.subscription?.history || []; // make sure backend sends `history` array

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Subscription History</h5>
            </div>
            <div>
                {history.length > 0 ? (
                    history.map((item: any, index: number) => (
                        <div key={index} className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                            <div className="flex items-center justify-between py-2">
                                <h6 className="font-semibold text-[#515365] dark:text-white-dark">
                                    {new Date(item.date).toLocaleString('default', { month: 'long' })}
                                    <span className="block text-white-dark dark:text-white-light">
                                        {item.description}
                                    </span>
                                </h6>
                                <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                                    <p className="font-semibold">${item.amount.toFixed(2)}</p>
                                    <div className="dropdown ltr:ml-4 rtl:mr-4">
                                        <Dropdown
                                            offset={[0, 5]}
                                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                            btnClassName="hover:text-primary"
                                            button={<IconHorizontalDots className="opacity-80 hover:opacity-100" />}
                                        >
                                            <ul className="!min-w-[150px]">
                                                <li>
                                                    <button type="button">View Invoice</button>
                                                </li>
                                                <li>
                                                    <button type="button">Download Invoice</button>
                                                </li>
                                            </ul>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 dark:text-white-dark">No subscription/payment history available.</p>
                )}
            </div>
        </div>
    );
};

export default ComponentsUsersProfilePaymentHistory;
