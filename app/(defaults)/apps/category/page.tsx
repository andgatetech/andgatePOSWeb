'use client';
import ShowCategory from '@/__components/show_category';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { useDeleteCategoryMutation, useGetCategoriesQuery } from '@/store/features/category/categoryApi';
import { useGetAllStoresQuery } from '@/store/features/store/storeApi';
import Tippy from '@tippyjs/react';
import { toast } from 'react-toastify';
import 'tippy.js/dist/tippy.css';

const Category = () => {
    const { data: categories, isLoading, error, refetch } = useGetCategoriesQuery();
    const [deleteCategory] = useDeleteCategoryMutation();
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading categories: {error.message}</div>;
    if (categories.data.length === 0) return <div>No categories available.</div>;

    const tableData = categories?.data?.map((category, index) => ({
        id: category.id,
        name: category.name,
        description: category.description,
    }));

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id).unwrap();
            refetch();
            toast.success('Category deleted successfully');
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    return (
        <ShowCategory title="Category List">
            <div className="table-responsive mb-5">
                <table className="table-hover">
                    <thead>
                        <tr className="">
                            <th>Name</th>
                            <th>Description</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((data) => {
                            return (
                                <tr key={data.id}>
                                    <td>
                                        <div className="whitespace-nowrap">{data.name}</div>
                                    </td>
                                    <td>{data.description}</td>
                                    <td className="text-center">
                                        <Tippy content="Delete">
                                            <button type="button" onClick={() => handleDelete(data.id)}>
                                                <IconTrashLines className="m-auto" />
                                            </button>
                                        </Tippy>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </ShowCategory>
    );
};

export default Category;
