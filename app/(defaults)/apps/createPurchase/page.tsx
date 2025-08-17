
import ComponentsFormsLayoutsGrid from '@/components/forms/layouts/components-forms-layouts-grid';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Create Product',
};

const Layouts = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
               
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Create Purchase</span>
                </li>
            </ul>

            <div className="grid grid-cols-1 gap-1 pt-5 lg:grid-cols-1">
              
               

                {/* Grid */}
                <ComponentsFormsLayoutsGrid />

              
            </div>
        </div>
    );
};

export default Layouts;
