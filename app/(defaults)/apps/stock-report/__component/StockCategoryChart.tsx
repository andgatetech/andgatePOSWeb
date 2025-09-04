import React from 'react';
import Chart from 'react-apexcharts';

const StockCategoryChart = ({ categories }) => {
    const series = categories.map((cat) => cat.stock_count);
    const labels = categories.map((cat) => cat.category_name);

    const options = {
        chart: { type: 'pie' },
        labels,
        legend: { position: 'bottom' },
    };

    return <Chart options={options} series={series} type="pie" height={350} />;
};

export default StockCategoryChart;
