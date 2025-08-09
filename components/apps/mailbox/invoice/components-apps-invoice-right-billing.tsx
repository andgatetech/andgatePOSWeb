'use client';

import React, { useEffect, useState } from 'react';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import IconX from '@/components/icon/icon-x';
import Link from 'next/link';
import { setUser } from '@/store/features/auth/authSlice';
import { useSelector } from 'react-redux';

import type { RootState } from '@/store';
const BillToForm: React.FC = () => {



const invoiceItems = useSelector((state: RootState) => state.invoice.items);

useEffect(() => {
    console.log('Current invoice items:', invoiceItems);
}, [invoiceItems]);



    const userId = useSelector((state: RootState) => state.auth.user?.id);

    return (
        <div className="mt-6 w-full xl:mt-0 xl:w-96">
            <div className="panel mb-5">
                <div className="mt-8 px-4">
                    <div className="flex flex-col justify-between lg:flex-row">
                        <div className="mb-6 w-full lg:w-full ltr:lg:mr-6 rtl:lg:ml-6">
                            <div className="text-lg">Bill To :-</div>
                            <div className="mt-4 flex items-center">
                                <label htmlFor="reciever-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Name
                                </label>
                                <input id="reciever-name" type="text" name="reciever-name" className="form-input flex-1" placeholder="Enter Name" />
                            </div>
                            <div className="mt-4 flex items-center">
                                <label htmlFor="reciever-email" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Email
                                </label>
                                <input id="reciever-email" type="email" name="reciever-email" className="form-input flex-1" placeholder="Enter Email" />
                            </div>

                            <div className="mt-4 flex items-center">
                                <label htmlFor="reciever-number" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Phone Number
                                </label>
                                <input id="reciever-number" type="text" name="reciever-number" className="form-input flex-1" placeholder="Enter Phone number" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="tax">Tax(%) </label>
                            <input id="tax" type="number" name="tax" className="form-input" defaultValue={0} placeholder="Tax" />
                        </div>
                        <div>
                            <label htmlFor="discount">Discount(%) </label>
                            <input id="discount" type="number" name="discount" className="form-input" defaultValue={0} placeholder="Discount" />
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor="payment-method">Accept Payment Via</label>
                    <select id="payment-method" name="payment-method" className="form-select">
                        <option value=" ">Select Payment</option>
                        <option value="bank">cash</option>
                        <option value="paypal">bkash </option>
                        <option value="upi">cque</option>
                    </select>
                </div>
                <div className="mt-4">
                    <label htmlFor="payment-method-2">"payment_status",</label>
                    <select id="payment-method-2" name="payment-method-2" className="form-select">
                        <option value=" ">Select Payment</option>
                        <option value="bank">paid</option>
                        <option value="paypal">unpaid</option>
                        <option value="upi">pending</option>
                    </select>
                </div>
            </div>
            <div className="panel">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1">
                    <button type="button" className="btn btn-success w-full gap-2">
                        <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                        Order Create
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary w-full gap-2"
                        // onClick={onPreview} // You can add preview function here
                    >
                        <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                        Preview Invoice
                    </button>

                    <Link href="/apps/invoice" className="btn btn-danger w-full gap-2" role="button" tabIndex={0}>
                        <IconX className="shrink-0 ltr:mr-2 rtl:ml-2" />
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BillToForm;
