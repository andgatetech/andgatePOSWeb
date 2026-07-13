import { Metadata } from 'next';
import ProductEditForm from './product-edit-form';

export const metadata: Metadata = {
    title: 'AndgateBOS - Edit Product',
};

const EditProductPage = () => {
    return (
        <div>
            <div className="">
                <ProductEditForm />
            </div>
        </div>
    );
};

export default EditProductPage;
