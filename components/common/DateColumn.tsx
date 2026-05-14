import React from 'react';
import { getTranslation } from '@/i18n';
import { formatLocalizedNumber } from '@/lib/localized-number';

interface DateColumnProps {
    date: string | null | undefined;
}

const DateColumn: React.FC<DateColumnProps> = ({ date }) => {
    const { i18n } = getTranslation();
    if (!date) return <span className="text-sm text-gray-500">-</span>;

    const datePart = date.split(' ')[0];
    const timePart = date.split(' ').slice(1).join(' ');
    const localizeDigits = (value: string) => value.replace(/\d+/g, (match) => formatLocalizedNumber(match, i18n.language, { useGrouping: false }));

    return (
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{localizeDigits(datePart)}</span>
            <span className="text-xs text-gray-500">{localizeDigits(timePart)}</span>
        </div>
    );
};

export default DateColumn;
