'use client';

import { getTranslation } from '@/i18n';
import { showConfirmDialog, showMessage } from '@/lib/toast';
import { useCreateAdjustmentTypeMutation, useDeleteAdjustmentTypeMutation, useGetAdjustmentTypesQuery } from '@/store/features/productStockType/productStockTypeApi';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface ProductStockTypesTabProps {
    storeId: number | undefined;
}

const ProductStockTypesTab: React.FC<ProductStockTypesTabProps> = ({ storeId }) => {
    const { t } = getTranslation();
    const [typeName, setTypeName] = useState('');
    const [description, setDescription] = useState('');

    const { data, isLoading, refetch } = useGetAdjustmentTypesQuery({ store_id: storeId as number }, { skip: !storeId });
    const [createType, { isLoading: creating }] = useCreateAdjustmentTypeMutation();
    const [deleteType] = useDeleteAdjustmentTypeMutation();

    const types = data?.data || [];

    const handleCreate = async () => {
        if (!typeName.trim() || !description.trim()) {
            showMessage(t('msg_adjustment_type_fields_required'), 'error');
            return;
        }
        try {
            await createType({ store_id: storeId as number, type: typeName.trim(), description: description.trim() }).unwrap();
            setTypeName('');
            setDescription('');
            refetch();
            showMessage(t('msg_adjustment_type_created'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirmDialog(t('msg_are_you_sure'), t('msg_adjustment_type_delete_confirm'));
        if (!confirmed) return;
        try {
            await deleteType(id).unwrap();
            refetch();
            showMessage(t('msg_adjustment_type_deleted'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('store_adjustment_types_title')}</h3>
                <p className="mb-4 text-sm text-gray-500">{t('store_adjustment_types_desc')}</p>

                <div className="mb-4 space-y-2">
                    <input
                        type="text"
                        value={typeName}
                        onChange={(e) => setTypeName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder={t('placeholder_adjustment_type')}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#046ca9] focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder={t('placeholder_description_optional')}
                            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-[#046ca9] focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                        />
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={creating}
                            className="inline-flex items-center rounded bg-[#046ca9] px-4 py-2 text-sm font-medium text-white hover:bg-[#034d79] disabled:opacity-50"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            {t('btn_add')}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('lbl_id')}</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('store_adjustment_type_name')}</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('lbl_description')}</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t('lbl_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                    </td>
                                </tr>
                            ) : types.length > 0 ? (
                                types.map((item: any) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.id}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.type}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.description || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                title={t('btn_delete')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                        {t('msg_no_adjustment_types_yet')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductStockTypesTab;
