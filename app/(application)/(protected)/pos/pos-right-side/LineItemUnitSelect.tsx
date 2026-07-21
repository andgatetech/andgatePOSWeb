import { getTranslation } from '@/i18n';
import { useGetUnitConversionsQuery } from '@/store/features/ProductStock/unitConversionApi';

interface LineItemUnitSelectProps {
    stockId?: number;
    unit?: string;
    onChange: (unit: string) => void;
}

/**
 * Cart-line unit picker. Most products only have one unit (their stock's own), so this
 * stays a plain badge exactly like before — the dropdown only appears once a product has
 * alternate units configured (e.g. stock kept in Ton, also sellable by CFT or Truck).
 */
const LineItemUnitSelect: React.FC<LineItemUnitSelectProps> = ({ stockId, unit, onChange }) => {
    const { t } = getTranslation();
    const { data } = useGetUnitConversionsQuery(stockId as number, { skip: !stockId });
    const options: { unit: string }[] = data?.data || [];
    const displayUnit = (u?: string) => (u && u.toLowerCase() !== 'piece' ? u : t('lbl_piece'));

    if (!stockId || options.length <= 1) {
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{displayUnit(unit)}</span>;
    }

    return (
        <select
            value={unit || options[0]?.unit || ''}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-full border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 focus:border-primary focus:ring-1 focus:ring-primary"
        >
            {options.map((o) => (
                <option key={o.unit} value={o.unit}>
                    {o.unit}
                </option>
            ))}
        </select>
    );
};

export default LineItemUnitSelect;
