import { getTranslation } from '@/i18n';
import { useGetUnitConversionsQuery } from '@/store/features/ProductStock/unitConversionApi';

interface LineItemUnitSelectProps {
    stockId?: number;
    unit?: string;
    availableUnits?: { unit: string; factor?: number }[];
    onChange: (unit: string, factor: number) => void;
}

const normalizeUnitOptions = (options: { unit: string; factor?: number }[], currentUnit?: string, currentFactor?: number) => {
    const seen = new Set<string>();
    return [...options, { unit: currentUnit || '', factor: currentFactor || 1 }]
        .filter((option) => option?.unit)
        .filter((option) => {
            const key = option.unit.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

/**
 * Cart-line unit picker. Most products only have one unit (their stock's own), so this
 * stays a plain badge exactly like before — the dropdown only appears once a product has
 * alternate units configured (e.g. stock kept in Ton, also sellable by CFT or Truck).
 */
const LineItemUnitSelect: React.FC<LineItemUnitSelectProps> = ({ stockId, unit, availableUnits = [], onChange }) => {
    const { t } = getTranslation();
    const { data } = useGetUnitConversionsQuery(stockId as number, { skip: !stockId });
    const currentFactor = availableUnits.find((option) => option.unit.toLowerCase() === String(unit || '').toLowerCase())?.factor;
    const options = normalizeUnitOptions([...(data?.data || []), ...availableUnits], unit, currentFactor);
    const displayUnit = (u?: string) => (u && u.toLowerCase() !== 'piece' ? u : t('lbl_piece'));

    if (!stockId || options.length <= 1) {
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{displayUnit(unit)}</span>;
    }

    return (
        <select
            value={unit || options[0]?.unit || ''}
            onChange={(e) => {
                const selected = options.find((o) => o.unit.toLowerCase() === e.target.value.toLowerCase());
                onChange(e.target.value, Number(selected?.factor || 1));
            }}
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
