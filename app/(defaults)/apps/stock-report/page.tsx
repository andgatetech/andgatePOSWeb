'use client';

import { useGetStockAnalysisQuery, useGetStockCategoryWiseQuery, useGetStockMovementQuery, useGetStockSummaryQuery } from '@/store/features/stock/stock';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import StockAnalysisTable from './__component/StockAnalysisTable';
import StockCategoryChart from './__component/StockCategoryChart';
import StockFilter from './__component/StockFilter';
import StockMovementChart from './__component/StockMovementChart';
import StockReportActions from './__component/StockReportActions';
import StockSummaryCard from './__component/StockSummaryCard';

const StockReportPage = ({ storeList = [] }) => {
    const [selectedStore, setSelectedStore] = useState('all');
    const [selectedRange, setSelectedRange] = useState('last30days');
    const [refreshToggle, setRefreshToggle] = useState(false); // For manual refresh

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => setRefreshToggle((prev) => !prev), 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch Data
    const { data: summaryData } = useGetStockSummaryQuery({ store_id: selectedStore, date_range: selectedRange }, { refetchOnMountOrArgChange: true });
    const { data: categoryData } = useGetStockCategoryWiseQuery({ store_id: selectedStore }, { refetchOnMountOrArgChange: true });
    const { data: movementData } = useGetStockMovementQuery({ store_id: selectedStore, date_range: selectedRange }, { refetchOnMountOrArgChange: true });
    const { data: analysisData } = useGetStockAnalysisQuery({ store_id: selectedStore }, { refetchOnMountOrArgChange: true });

    // Handlers
    const handleRefresh = () => setRefreshToggle((prev) => !prev);

    // const handleDownloadPDF = () => {
    //     const doc = new jsPDF();
    //     doc.setFontSize(14);
    //     doc.text('Stock Report', 10, 10);

    //     // Summary
    //     if (summaryData?.data) {
    //         doc.text(`Total Products: ${summaryData.data.total_products}`, 10, 20);
    //         doc.text(`Total Stock Value: ৳${summaryData.data.total_stock_value}`, 10, 30);
    //         doc.text(`Low Stock Items: ${summaryData.data.low_stock_items}`, 10, 40);
    //         doc.text(`Out of Stock: ${summaryData.data.out_of_stock}`, 10, 50);
    //     }
    //     doc.save(`StockReport_${new Date().toISOString()}.pdf`);
    // };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(14);
        doc.text('Stock Report', 10, 10);

        // Summary Section
        if (summaryData?.data) {
            doc.setFontSize(12);
            doc.text(`Total Products: ${summaryData.data.total_products}`, 10, 20);
            doc.text(`Total Stock Value: ৳${summaryData.data.total_stock_value}`, 10, 28);
            doc.text(`Low Stock Items: ${summaryData.data.low_stock_items}`, 10, 36);
            doc.text(`Out of Stock: ${summaryData.data.out_of_stock}`, 10, 44);
        }

        // Convert charts to images
        const chartElements = document.querySelectorAll('.apexcharts-canvas'); // ApexCharts canvas
        let yPosition = 50;

        for (let i = 0; i < chartElements.length; i++) {
            const canvas = await html2canvas(chartElements[i]);
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = 180; // A4 page width minus margins
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            if (yPosition + pdfHeight > 280) {
                doc.addPage();
                yPosition = 10;
            }
            doc.addImage(imgData, 'PNG', 15, yPosition, pdfWidth, pdfHeight);
            yPosition += pdfHeight + 10;
        }

        // Analysis Table Section
        const tableElement = document.getElementById('stock-analysis-table');
        if (tableElement) {
            const canvas = await html2canvas(tableElement);
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = 180;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            if (yPosition + pdfHeight > 280) {
                doc.addPage();
                yPosition = 10;
            }
            doc.addImage(imgData, 'PNG', 15, yPosition, pdfWidth, pdfHeight);
        }

        doc.save(`StockReport_${new Date().toISOString()}.pdf`);
    };

    const handlePrint = () => window.print();

    return (
        <div className="p-6">
            {/* <h1 className="mb-6 text-3xl font-bold">Stock Report</h1> */}
            <div className="mb-5">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Stock Report Analysis</h1>
                <p className="text-gray-600">Monitor inventory levels, movements, and performance</p>
            </div>

            {/* Filters */}
            <StockFilter storeList={storeList} selectedStore={selectedStore} setSelectedStore={setSelectedStore} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />

            {/* Actions */}
            <StockReportActions onRefresh={handleRefresh} onDownloadPDF={handleDownloadPDF} onPrint={handlePrint} />

            {/* Stock Summary */}
            {summaryData?.data && <StockSummaryCard summary={summaryData.data} />}

            {/* Category Chart */}
            {categoryData?.data && <StockCategoryChart categories={categoryData.data} />}

            {/* Stock Movement */}
            {movementData?.data && <StockMovementChart months={movementData.data} />}

            {/* Stock Analysis Table */}
            {analysisData?.data && <StockAnalysisTable analysis={analysisData.data} />}
        </div>
    );
};

export default StockReportPage;
