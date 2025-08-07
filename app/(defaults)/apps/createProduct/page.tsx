import ComponentsFormsLayoutsActionsButtons from '@/components/forms/layouts/components-forms-layouts-actions-buttons';
import ComponentsFormsLayoutsAutoSizing from '@/components/forms/layouts/components-forms-layouts-auto-sizing';
import ComponentsFormsLayoutsGrid from '@/components/forms/layouts/components-forms-layouts-grid';
import ComponentsFormsLayoutsHorizontal from '@/components/forms/layouts/components-forms-layouts-horizontal';
import ComponentsFormsLayoutsInline from '@/components/forms/layouts/components-forms-layouts-inline';
import ComponentsFormsLayoutsLogin from '@/components/forms/layouts/components-forms-layouts-login';
import ComponentsFormsLayoutsRegistration from '@/components/forms/layouts/components-forms-layouts-registration';
import ComponentsFormsLayoutsStack from '@/components/forms/layouts/components-forms-layouts-stack';
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
                    <span>Create Product</span>
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
