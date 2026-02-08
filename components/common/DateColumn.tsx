import React from 'react';

interface DateColumnProps {
    date: string | null | undefined;
}

const DateColumn: React.FC<DateColumnProps> = ({ date }) => {
    if (!date) return <span className="text-sm text-gray-500">-</span>;

    const datePart = date.split(' ')[0];
    const timePart = date.split(' ').slice(1).join(' ');

    return (
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{datePart}</span>
            <span className="text-xs text-gray-500">{timePart}</span>
        </div>
    );
};

export default DateColumn;
