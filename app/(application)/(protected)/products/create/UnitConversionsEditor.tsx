'use client';

import { getTranslation } from '@/i18n';
import {
    useGetUnitConversionsQuery,
    useCreateUnitConversionMutation,
    useDeleteUnitConversionMutation,
} from '@/store/features/ProductStock/unitConversionApi';
import { Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface UnitConversionRow {
    id: number | null;
    unit: string;
    factor: number;
}

interface UnitConversionsEditorProps {
    stockId: number;
    baseUnit: string;
    units: any[];
}

/**
 * Lets a product row that's sold/purchased in more than one unit (e.g. stock kept in
 * Ton, also sold by CFT or Truck) declare the conversion factor between them.
 * Only usable once the stock row is persisted (has a real id) — see VariantsTab.tsx.
 */
const UnitConversionsEditor: React.FC<UnitConversionsEditorProps> = ({ stockId, baseUnit, units }) => {
    const { t } = getTranslation();
    const { data, isLoading } = useGetUnitConversionsQuery(stockId);
    const [createUnitConversion, { isLoading: isSaving }] = useCreateUnitConversionMutation();
    const [deleteUnitConversion] = useDeleteUnitConversionMutation();

    const [newUnitName, setNewUnitName] = useState('');
    const [newFactor, setNewFactor] = useState('');
    const [error, setError] = useState<string | null>(null);

    const rows: UnitConversionRow[] = data?.data || [];
    const alternates = rows.filter((r) => r.id !== null);
    const existingUnitNames = new Set(rows.map((row) => row.unit?.trim().toLowerCase()).filter(Boolean));
    const selectableUnits = units
        .filter((unit: any) => unit?.is_active !== false)
        .filter((unit: any) => unit?.name && unit.name.trim().toLowerCase() !== baseUnit?.trim().toLowerCase())
        .filter((unit: any) => !existingUnitNames.has(unit.name.trim().toLowerCase()));

    const handleAdd = async () => {
        setError(null);
        const factor = parseFloat(newFactor);

        if (!newUnitName.trim()) {
            setError(t('err_unit_conversion_unit_required'));
            return;
        }
        if (!factor || factor <= 0) {
            setError(t('err_unit_conversion_factor_invalid'));
            return;
        }

        try {
            await createUnitConversion({ stockId, unit_name: newUnitName.trim(), factor }).unwrap();
            setNewUnitName('');
            setNewFactor('');
        } catch (e: any) {
            setError(e?.data?.errors?.unit_name?.[0] || e?.data?.message || t('err_unit_conversion_failed'));
        }
    };

    const handleDelete = async (conversionId: number) => {
        await deleteUnitConversion({ stockId, conversionId }).unwrap().catch(() => {});
    };

    return (
        <div>
            <h5 className="mb-1 text-sm font-semibold text-gray-900">{t('lbl_alternate_units')}</h5>
            <p className="mb-3 text-xs text-gray-500">{t('hint_alternate_units')}</p>
            <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">
                {t('hint_unit_conversion_no_price')}
            </div>

            {isLoading ? (
                <div className="text-xs text-gray-400">{t('lbl_loading')}</div>
            ) : (
                alternates.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {alternates.map((row) => (
                            <div key={row.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                                <span>
                                    1 {row.unit} = {row.factor} {baseUnit}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => row.id !== null && handleDelete(row.id)}
                                    className="text-gray-400 hover:text-red-500"
                                    aria-label={t('btn_remove')}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}

            <div className="flex flex-wrap items-end gap-2">
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">{t('lbl_alternate_unit_name')}</label>
                    <select
                        value={newUnitName}
                        onChange={(e) => setNewUnitName(e.target.value)}
                        className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#cde2ef] focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">{t('lbl_unit')}</option>
                        {selectableUnits.map((unit: any) => (
                            <option key={unit.id ?? unit.name} value={unit.name}>
                                {unit.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        {t('lbl_conversion_factor')} ({t('lbl_no_price')})
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={newFactor}
                        onChange={(e) => setNewFactor(e.target.value)}
                        placeholder="0.00"
                        className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#cde2ef] focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isSaving}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    {t('btn_add')}
                </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default UnitConversionsEditor;
