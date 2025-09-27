import { Metadata } from 'next';
import ProductCreateForm from './product-create-form';

export const metadata: Metadata = {
    title: 'Andgate POS - Create Product',
};

const Layouts = () => {
    return (
        <div>
            <div className="">
               
                <ProductCreateForm />
            </div>
        </div>
    );
};

export default Layouts;
