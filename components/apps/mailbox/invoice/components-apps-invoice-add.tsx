'use client';
import IconDownload from '@/components/icon/icon-download';
import IconEye from '@/components/icon/icon-eye';
import IconPrinter from '@/components/icon/icon-printer';
import IconSave from '@/components/icon/icon-save';
import IconSend from '@/components/icon/icon-send';
import IconX from '@/components/icon/icon-x';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const ComponentsAppsInvoiceAdd = () => {

   

    const [items, setItems] = useState<any>([
        {
            id: 1,
            title: '',
            description: '',
            rate: 0,
            quantity: 0,
            amount: 0,
        },
    ]);

    const addItem = () => {
        let maxId = 0;
        maxId = items?.length ? items.reduce((max: number, character: any) => (character.id > max ? character.id : max), items[0].id) : 0;

        setItems([
            ...items,
            {
                id: maxId + 1,
                title: '',
                description: '',
                rate: 0,
                quantity: 0,
                amount: 0,
            },
        ]);
    };

    const removeItem = (item: any = null) => {
        setItems(items.filter((d: any) => d.id !== item.id));
    };

    const changeQuantityPrice = (type: string, value: string, id: number) => {
        const list = items;
        const item = list.find((d: any) => d.id === id);
        if (type === 'quantity') {
            item.quantity = Number(value);
        }
        if (type === 'price') {
            item.amount = Number(value);
        }
        setItems([...list]);
    };
const [invoiceNumber, setInvoiceNumber] = useState('');
    useEffect(() => {
        const now = Date.now(); // milliseconds since 1970
        const randomPart = Math.floor(100 + Math.random() * 900); // 3 random digits
        setInvoiceNumber(`#${now}-${randomPart}`);
    }, []);


    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <div className="flex flex-wrap justify-between px-4">
                    <div className="mb-6 w-full lg:w-1/2">
                        <div className="flex shrink-0 items-center text-black dark:text-white">
                            <img src="/assets/images/logo.svg" alt="img" className="w-14" />
                        </div>
                        <div className="mt-6 space-y-1 text-gray-500 dark:text-gray-400">
                            <div>Dhaka ,Bangladesh</div>
                            <div>andgate@gmail.com</div>
                            <div>+8801610108851</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 lg:max-w-fit">
                        <div className="flex items-center">
                            <label htmlFor="number" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Invoice Number
                            </label>
                            <input id="number" type="text" name="inv-num" className="form-input w-2/3 lg:w-[250px]" value={invoiceNumber} readOnly />
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

                <div className="mt-8">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th className="w-1">Quantity</th>
                                    <th className="w-1">Price</th>
                                    <th>Total</th>
                                    <th className="w-1"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length <= 0 && (
                                    <tr>
                                        <td colSpan={5} className="!text-center font-semibold">
                                            No Item Available
                                        </td>
                                    </tr>
                                )}
                                {items.map((item: any) => {
                                    return (
                                        <tr className="align-top" key={item.id}>
                                            <td>
                                                <input type="text" className="form-input min-w-[200px]" placeholder="Enter Item Name" defaultValue={item.title} />
                                                <textarea className="form-textarea mt-4" placeholder="Enter Description" defaultValue={item.description}></textarea>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-input w-32"
                                                    placeholder="Quantity"
                                                    defaultValue={item.quantity}
                                                    min={0}
                                                    onChange={(e) => changeQuantityPrice('quantity', e.target.value, item.id)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-input w-32"
                                                    placeholder="Price"
                                                    defaultValue={item.amount}
                                                    min={0}
                                                    onChange={(e) => changeQuantityPrice('price', e.target.value, item.id)}
                                                />
                                            </td>
                                            <td>${item.quantity * item.amount}</td>
                                            <td>
                                                <button type="button" onClick={() => removeItem(item)}>
                                                    <IconX className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                        <div className="mb-6 sm:mb-0">
                            <button type="button" className="btn btn-primary" onClick={() => addItem()}>
                                Add Item
                            </button>
                        </div>
                        <div className="sm:w-2/5">
                            <div className="flex items-center justify-between">
                                <div>Subtotal</div>
                                <div>$0.00</div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div>Tax(%)</div>
                                <div>0%</div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div>Discount(%)</div>
                                <div>0%</div>
                            </div>
                            <div className="mt-4 flex items-center justify-between font-semibold">
                                <div>Total</div>
                                <div>$0.00</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 px-4">
                    <label htmlFor="notes">Notes</label>
                    <textarea id="notes" name="notes" className="form-textarea min-h-[130px]" placeholder="Notes...."></textarea>
                </div>
            </div>
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
                                    <label htmlFor="reciever-address" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Address
                                    </label>
                                    <input id="reciever-address" type="text" name="reciever-address" className="form-input flex-1" placeholder="Enter Address" />
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
                            <option value="bank">Bank Account</option>
                            <option value="paypal">Paypal</option>
                            <option value="upi">UPI Transfer</option>
                        </select>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="payment-method">Accept Payment Via</label>
                        <select id="payment-method" name="payment-method" className="form-select">
                            <option value=" ">Select Payment</option>
                            <option value="bank">Bank Account</option>
                            <option value="paypal">Paypal</option>
                            <option value="upi">UPI Transfer</option>
                        </select>
                    </div>
                </div>
                <div className="panel">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1">
                        <button type="button" className="btn btn-success w-full gap-2">
                            <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Order Create
                        </button>

                        <Link href="/apps/invoice/preview" className="btn btn-primary w-full gap-2">
                            <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Preview
                        </Link>

                      

                       
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsAppsInvoiceAdd;
