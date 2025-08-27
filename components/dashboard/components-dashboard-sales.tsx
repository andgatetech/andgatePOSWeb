'use client';

import { IRootState } from '@/store';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Recent_Order_Transactions from './Recent_Order_Transactions';
import Recent_Purchase_Transactions from './Recent_Purchase_Transactions';
import Recent_Orders from './Recent_Orders';
import Top_Selling_Products from './top_selling_products';
import Revenue from './Revenue';
import Sale_by from './Sale_by';

const ComponentsDashboardSales = () => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

   

   
    

   

    return (
        <>
            <div>
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Sales</span>
                    </li>
                </ul>

                <div className="pt-5">
                    <div className="mb-6 grid gap-6 xl:grid-cols-3">
                       <Revenue></Revenue>

                          {/* <Sale_by></Sale_by> */}
                    </div>

                    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                       

                        
                    </div>

                    {/* Recent Order Transactions */}
                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/*  Recent Transactions  */}
                        <Recent_Order_Transactions />

                        {/* purchase data show here */}
                        <Recent_Purchase_Transactions />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Recent_Orders />
                        {/* <Top_Selling_Products /> */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ComponentsDashboardSales;
