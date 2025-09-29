'use client';

import ReportHeader from '@/__components/ReportHeader';
import { useGetAdjustmentTypesQuery } from '@/store/features/AdjustmentType/adjustmentTypeApi';
import { useGetProductAdjustmentsQuery } from '@/store/features/ProductAjustmentHistory/productAdjustmentHistoryApi';
import { ArrowLeft, Download, FileText, Filter, Printer, RefreshCw, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ProductAdjustmentHistory {
    id: number;
    product_id: number;
    product_name: string;
    stock_type: string;
    previous_stock: number;
    adjusted_stock: number;
    direction: 'increase' | 'decrease';
    reference_no: string;
    reason: string;
    user: string;
    created_at: string;
}

interface ProductHistoryPageProps {
    storeId: string;
    productId: string;
    productName?: string;
}

interface PageProps {
    params: { storeId: string; productId: string; productName?: string };
}

const ProductHistoryPage = ({ params }: PageProps) => {
    const { storeId, productId, productName } = params;
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(storeId);

    const printRef = useRef(null);
    const headerRef = useRef(null);

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        from_date: '',
        to_date: '',
        selected_date: '',
        direction: '',
        product_stock_type_id: '',
    });
    const [appliedFilters, setAppliedFilters] = useState({});

    // API Query with proper memoization
    const queryParams = useMemo(
        () => ({
            storeId: Number(storeId),
            productId: Number(productId),
            params: Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined,
        }),
        [storeId, productId, appliedFilters]
    );

    const adjustmentsQuery = useGetProductAdjustmentsQuery(queryParams);

    const adjustments: ProductAdjustmentHistory[] = adjustmentsQuery.data?.data || [];

    const { data: adjustmentTypesResponse, isLoading: adjustmentTypesLoading } = useGetAdjustmentTypesQuery();
    const adjustmentTypes = adjustmentTypesResponse?.adjustment_types || [];

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            // Clear conflicting date filters
            ...(key === 'selected_date' && value ? { from_date: '', to_date: '' } : {}),
            ...(key === 'from_date' || key === 'to_date' ? { selected_date: '' } : {}),
        }));
    };

    // Apply filters
    const handleApplyFilters = () => {
        const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        setAppliedFilters(cleanedFilters);
        setShowFilters(false);
    };

    // Clear filters
    const handleClearFilters = () => {
        setFilters({
            from_date: '',
            to_date: '',
            selected_date: '',
            direction: '',
            product_stock_type_id: '',
        });
        setAppliedFilters({});
    };

    // Count active filters
    const activeFilterCount = useMemo(() => {
        return Object.values(appliedFilters).filter(Boolean).length;
    }, [appliedFilters]);

    const router = useRouter();

    // Print functionality
    const handlePrint = async () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Get header and table content
        const headerHtml = headerRef.current?.innerHTML || '';
        const tableHtml = printRef.current?.innerHTML || '';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Product Adjustment History</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: white; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f9fafb; 
                        font-weight: bold; 
                    }
                    .header-content {
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .store-logo {
                        width: 60px;
                        height: 60px;
                        object-fit: contain;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        margin-right: 12px;
                    }
                    .store-header {
                        text-align: center;
                        margin-bottom: 24px;
                    }
                    .store-title {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 12px;
                    }
                    .store-name {
                        font-size: 28px;
                        font-weight: bold;
                        color: #111827;
                        margin: 0;
                    }
                    .store-subtitle {
                        font-size: 18px;
                        font-weight: 500;
                        color: #4b5563;
                        margin-bottom: 8px;
                    }
                    .store-details {
                        font-size: 14px;
                        color: #4b5563;
                        line-height: 1.4;
                    }
                    .report-title {
                        font-size: 24px;
                        font-weight: 600;
                        color: #111827;
                        margin-top: 16px;
                        padding-top: 16px;
                        border-top: 1px solid #e5e7eb;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 2px 10px;
                        border-radius: 9999px;
                        font-size: 12px;
                        font-weight: 500;
                    }
                    .status-active {
                        background-color: #dcfce7;
                        color: #166534;
                    }
                    .status-inactive {
                        background-color: #fee2e2;
                        color: #991b1b;
                    }
                    .direction-badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 2px 8px;
                        border-radius: 9999px;
                        font-size: 12px;
                        font-weight: 500;
                    }
                    .direction-increase { background-color: #dcfce7; color: #166534; }
                    .direction-decrease { background-color: #fee2e2; color: #991b1b; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header-content">${headerHtml}</div>
                <div>${tableHtml}</div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    // Export to CSV
    const handleExportCSV = () => {
        if (!adjustments.length) return;

        const headers = ['Date', 'Reference No', 'Stock Type', 'Previous Stock', 'Adjusted Stock', 'Direction', 'Reason', 'User'];

        const csvContent = [
            headers.join(','),
            ...adjustments.map((adj) =>
                [
                    `"${new Date(adj.created_at).toLocaleDateString()}"`,
                    `"${adj.reference_no || 'N/A'}"`,
                    `"${adj.stock_type || 'N/A'}"`,
                    adj.previous_stock,
                    adj.adjusted_stock,
                    `"${adj.direction}"`,
                    `"${adj.reason || 'N/A'}"`,
                    `"${adj.user || 'N/A'}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `product-${productId}-history-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download PDF functionality
    const handleDownloadPDF = async () => {
        if (!printRef.current || !headerRef.current) return;

        try {
            // Create a loading state
            const loadingToast = document.createElement('div');
            loadingToast.textContent = 'Generating PDF...';
            loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(loadingToast);

            // Create a temporary container with header and content
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm'; // A4 width
            tempContainer.style.backgroundColor = 'white';
            tempContainer.style.padding = '20px';
            tempContainer.style.fontFamily = 'Arial, sans-serif';

            // Clone header and table content
            const headerClone = headerRef.current.cloneNode(true) as HTMLElement;
            const tableClone = printRef.current.cloneNode(true) as HTMLElement;

            // Style the header for PDF
            headerClone.style.borderBottom = '1px solid #e5e7eb';
            headerClone.style.paddingBottom = '20px';
            headerClone.style.marginBottom = '20px';

            tempContainer.appendChild(headerClone);
            tempContainer.appendChild(tableClone);
            document.body.appendChild(tempContainer);

            // Configure html2canvas options for better quality
            const canvas = await html2canvas(tempContainer, {
                scale: 2, // Higher resolution
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: tempContainer.scrollWidth,
                height: tempContainer.scrollHeight,
            });

            // Remove temporary container
            document.body.removeChild(tempContainer);

            const imgData = canvas.toDataURL('image/png');

            // Calculate PDF dimensions
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            // Add the image to PDF
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

            // Save the PDF
            const fileName = `product-${productId}-history-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            // Remove loading toast
            document.body.removeChild(loadingToast);

            // Success toast
            const successToast = document.createElement('div');
            successToast.textContent = 'PDF downloaded successfully!';
            successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(successToast);
            setTimeout(() => document.body.removeChild(successToast), 3000);
        } catch (error) {
            console.error('Error generating PDF:', error);

            // Error toast
            const errorToast = document.createElement('div');
            errorToast.textContent = 'Failed to generate PDF. Please try again.';
            errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(errorToast);
            setTimeout(() => document.body.removeChild(errorToast), 3000);
        }
    };

    const handleBackClick = () => {
        router.back();
    };

    if (adjustmentsQuery?.error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ReportHeader
                    title={`${adjustmentsQuery?.data?.product_name || productName} Adjustment History`}
                    subtitle={`Adjustment history for ${productName || `Product #${productId}`}`}
                    showStoreSelector={false}
                    selectedStoreId={selectedStoreId}
                    onStoreChange={setSelectedStoreId}
                />
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-red-50 p-4">
                        <div className="text-red-800">
                            <h3 className="text-sm font-medium">Error loading adjustment history</h3>
                            <p className="mt-1 text-sm">Please try again later.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Report Header */}
            <div ref={headerRef}>
                <ReportHeader
                    title={`${adjustmentsQuery?.data?.product_name || productName} Adjustment History`}
                    subtitle={`Adjustment history for ${productName || `Product #${productId}`}`}
                    showStoreSelector={false}
                    selectedStoreId={selectedStoreId}
                    onStoreChange={setSelectedStoreId}
                />
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button and Action Buttons */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={handleBackClick}
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </button>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Export CSV
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">Total: {adjustments.length} adjustments</div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="mb-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-inset transition-colors ${
                                    showFilters ? 'bg-blue-50 text-blue-700 ring-blue-300' : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{activeFilterCount}</span>
                                )}
                            </button>

                            {activeFilterCount > 0 && (
                                <button onClick={handleClearFilters} className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                    <X className="mr-1 h-4 w-4" />
                                    Clear All
                                </button>
                            )}
                        </div>

                        <button
                            onClick={adjustmentsQuery.refetch}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            disabled={adjustmentsQuery.isLoading}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${adjustmentsQuery.isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Active Filters Display */}
                    {activeFilterCount > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {Object.entries(appliedFilters).map(([key, value]) => {
                                if (!value) return null;

                                let displayValue = value;
                                let displayLabel = key;

                                // Format display labels and values
                                switch (key) {
                                    case 'from_date':
                                        displayLabel = 'From Date';
                                        displayValue = new Date(value).toLocaleDateString();
                                        break;
                                    case 'to_date':
                                        displayLabel = 'To Date';
                                        displayValue = new Date(value).toLocaleDateString();
                                        break;
                                    case 'selected_date':
                                        displayLabel = 'Date';
                                        displayValue = new Date(value).toLocaleDateString();
                                        break;
                                    case 'direction':
                                        displayLabel = 'Direction';
                                        displayValue = value.charAt(0).toUpperCase() + value.slice(1);
                                        break;
                                    case 'product_stock_type_id':
                                        displayLabel = 'Stock Type';
                                        const stockType = adjustmentTypes.find((type) => type.id.toString() === value);
                                        displayValue = stockType?.type || value;
                                        break;
                                }

                                return (
                                    <span key={key} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                        {displayLabel}: {displayValue}
                                        <button
                                            onClick={() => {
                                                const newFilters = { ...appliedFilters };
                                                delete newFilters[key];
                                                setAppliedFilters(newFilters);
                                                setFilters((prev) => ({ ...prev, [key]: '' }));
                                                adjustmentsQuery.refetch();
                                            }}
                                            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {/* Date Range Filters */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Date Range</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
                                            <input
                                                type="date"
                                                value={filters.from_date}
                                                onChange={(e) => handleFilterChange('from_date', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                disabled={!!filters.selected_date}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">To Date</label>
                                            <input
                                                type="date"
                                                value={filters.to_date}
                                                onChange={(e) => handleFilterChange('to_date', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                disabled={!!filters.selected_date}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Single Date Filter */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Specific Date</h4>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Select Date</label>
                                        <input
                                            type="date"
                                            value={filters.selected_date}
                                            onChange={(e) => handleFilterChange('selected_date', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            disabled={!!(filters.from_date || filters.to_date)}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">Use this OR date range, not both</p>
                                </div>

                                {/* Direction Filter */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Direction</h4>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Adjustment Direction</label>
                                        <select
                                            value={filters.direction}
                                            onChange={(e) => handleFilterChange('direction', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        >
                                            <option value="">All Directions</option>
                                            <option value="increase">Increase</option>
                                            <option value="decrease">Decrease</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Stock Type Filter */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Stock Type</h4>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Product Stock Type</label>
                                        <select
                                            value={filters.product_stock_type_id}
                                            onChange={(e) => handleFilterChange('product_stock_type_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            disabled={adjustmentTypesLoading}
                                        >
                                            <option value="">All Stock Types</option>
                                            {adjustmentTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Actions */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button onClick={handleClearFilters} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                    Clear All
                                </button>
                                <button onClick={handleApplyFilters} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div ref={printRef} className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reference No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Previous Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Adjusted Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Direction</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {adjustmentsQuery.isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-16 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-16 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : adjustments.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No adjustment history found for this product
                                            {activeFilterCount > 0 && (
                                                <div className="mt-2">
                                                    <button onClick={handleClearFilters} className="text-blue-600 hover:text-blue-500">
                                                        Clear filters to see all adjustments
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    adjustments.map((adjustment) => (
                                        <tr key={adjustment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{new Date(adjustment.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{adjustment.reference_no || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                    {adjustment.stock_type || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{Number(adjustment.previous_stock).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{Number(adjustment.adjusted_stock).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        adjustment.direction === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {adjustment.direction === 'increase' ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                                                    {adjustment.direction === 'increase' ? 'Increase' : 'Decrease'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{adjustment.reason || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{adjustment.user || 'N/A'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductHistoryPage;
