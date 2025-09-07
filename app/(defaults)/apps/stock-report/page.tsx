'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useGetStockAnalysisQuery, useGetStockCategoryWiseQuery, useGetStockMovementQuery, useGetStockSummaryQuery } from '@/store/features/stock/stock';

import StockAnalysisTable from './__component/StockAnalysisTable';
import StockFilter from './__component/StockFilter';
import StockReportActions from './__component/StockReportActions';
import StockSummaryCard from './__component/StockSummaryCard';

// Lazy-load charts to prevent SSR errors
const StockCategoryChart = dynamic(() => import('./__component/StockCategoryChart'), { ssr: false });
const StockMovementChart = dynamic(() => import('./__component/StockMovementChart'), { ssr: false });

const StockReportPage = ({ storeList = [] }) => {
    const [selectedStore, setSelectedStore] = useState('all');
    const [selectedRange, setSelectedRange] = useState('last30days');
    const [refreshToggle, setRefreshToggle] = useState(false);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => setRefreshToggle((prev) => !prev), 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch data
    const { data: summaryData } = useGetStockSummaryQuery({ store_id: selectedStore, date_range: selectedRange }, { refetchOnMountOrArgChange: true });
    const { data: categoryData } = useGetStockCategoryWiseQuery({ store_id: selectedStore }, { refetchOnMountOrArgChange: true });
    const { data: movementData } = useGetStockMovementQuery({ store_id: selectedStore, date_range: selectedRange }, { refetchOnMountOrArgChange: true });
    const { data: analysisData } = useGetStockAnalysisQuery({ store_id: selectedStore }, { refetchOnMountOrArgChange: true });

    const handleRefresh = () => setRefreshToggle((prev) => !prev);

    const handleDownloadPDF = async () => {
        if (typeof window === 'undefined') return;

        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(14);
        doc.text('Stock Report', 10, 10);

        if (summaryData?.data) {
            doc.setFontSize(12);
            doc.text(`Total Products: ${summaryData.data.total_products}`, 10, 20);
            doc.text(`Total Stock Value: ৳${summaryData.data.total_stock_value}`, 10, 28);
            doc.text(`Low Stock Items: ${summaryData.data.low_stock_items}`, 10, 36);
            doc.text(`Out of Stock: ${summaryData.data.out_of_stock}`, 10, 44);
        }

        // Charts
        const chartElements = document.querySelectorAll('.apexcharts-canvas');
        let yPosition = 50;

        for (const chartEl of chartElements) {
            const canvas = await html2canvas(chartEl);
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = 180;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            if (yPosition + pdfHeight > 280) {
                doc.addPage();
                yPosition = 10;
            }

            doc.addImage(imgData, 'PNG', 15, yPosition, pdfWidth, pdfHeight);
            yPosition += pdfHeight + 10;
        }

        // Stock Analysis Table
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

    const handlePrint = () => {
        if (typeof window !== 'undefined') window.print();
    };

    return (
        <div className="p-6">
            <div className="mb-5">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Stock Report Analysis</h1>
                <p className="text-gray-600">Monitor inventory levels, movements, and performance</p>
            </div>

            <StockFilter storeList={storeList} selectedStore={selectedStore} setSelectedStore={setSelectedStore} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />

            <StockReportActions onRefresh={handleRefresh} onDownloadPDF={handleDownloadPDF} onPrint={handlePrint} />

            {summaryData?.data && <StockSummaryCard summary={summaryData.data} />}
            {categoryData?.data && <StockCategoryChart categories={categoryData.data} />}
            {movementData?.data && <StockMovementChart months={movementData.data} />}
            {analysisData?.data && <StockAnalysisTable analysis={analysisData.data} />}
        </div>
    );
};

export default StockReportPage;
