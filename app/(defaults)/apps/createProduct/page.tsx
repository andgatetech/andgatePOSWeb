import ComponentsFormsLayoutsGrid from '@/components/forms/layouts/components-forms-layouts-grid';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Product',
};

const Layouts = () => {
    return (
        <div>
            <div className="">
                {/* Grid */}
                <ComponentsFormsLayoutsGrid />
            </div>
        </div>
    );
};

export default Layouts;
