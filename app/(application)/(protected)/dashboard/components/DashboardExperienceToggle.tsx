'use client';

import { getTranslation } from '@/i18n';
import type { DashboardExperience } from '@/hooks/useDashboardExperience';
import { LayoutGrid, Rows3 } from 'lucide-react';

interface DashboardExperienceToggleProps {
    value: DashboardExperience;
    onChange: (value: DashboardExperience) => void;
}

// Always visible, always free — this is the escape hatch for anyone the full
// dashboard overwhelms, so it can't be gated behind the paid customize page.
const DashboardExperienceToggle: React.FC<DashboardExperienceToggleProps> = ({ value, onChange }) => {
    const { t } = getTranslation();

    return (
        <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-white p-1 text-xs font-semibold shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <button
                type="button"
                onClick={() => onChange('simple')}
                aria-pressed={value === 'simple'}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
                    value === 'simple' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
                <Rows3 className="h-3.5 w-3.5" />
                {t('dashboard_view_simple')}
            </button>
            <button
                type="button"
                onClick={() => onChange('owner')}
                aria-pressed={value === 'owner'}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
                    value === 'owner' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                {t('dashboard_view_full')}
            </button>
        </div>
    );
};

export default DashboardExperienceToggle;
