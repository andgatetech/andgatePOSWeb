import React from 'react';
import Chart from 'react-apexcharts';

const StockMovementChart = ({ months }) => {
    const series = [
        { name: 'Stock In', data: months.map((m) => m.stock_in) },
        { name: 'Stock Out', data: months.map((m) => m.stock_out) },
    ];

    const options = {
        chart: { type: 'bar', stacked: false },
        xaxis: { categories: months.map((m) => m.month) },
        yaxis: { title: { text: 'Amount (৳)' } },
        colors: ['#34D399', '#F87171'],
        legend: { position: 'top' },
    };

    return <Chart options={options} series={series} type="bar" height={350} />;
};

export default StockMovementChart;
