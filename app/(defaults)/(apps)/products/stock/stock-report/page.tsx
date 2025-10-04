'use client';

import UniversalFilter, { CustomFilterConfig, FilterOptions } from '@/__components/Universalfilters';

import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { useGetProductStocksQuery } from '@/store/features/ProductStock/productStockApi';
import { useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ChevronLeft, ChevronRight, Download, Eye, FileText, Layers, Printer, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

interface ProductStock {
    product_id: number;
    product_sku: string;
    product_name: string;
    category: string;
    store_id: number;
    [key: string]: any;
}

interface StockReportData {
    current_page: number;
    data: ProductStock[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        page: number | null;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface StockReportResponse {
    success: boolean;
    data: StockReportData;
    stock_types: string[];
}

const StockReportPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [filters, setFilters] = useState<FilterOptions>({});
    const [sortBy, setSortBy] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    const printRef = useRef<HTMLDivElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // API Queries
    const {
        data: stockResponse,
        isLoading: stockLoading,
        error: stockError,
    } = useGetProductStocksQuery({
        page: currentPage,
        per_page: perPage,
        search: filters.search,
        category_id: filters.categoryId,
        brand_id: filters.brandId,
        store_id: filters.storeId,
        sort_by: sortBy,
        order,
    });

    const { data: categoriesResponse, isLoading: categoriesLoading } = useGetCategoryQuery();
    const { data: brandsResponse, isLoading: brandsLoading } = useGetBrandsQuery();
    const { data: storesResponses } = useFullStoreListWithFilterQuery();

    const stores = storesResponses?.data ?? [];
    const stockData = stockResponse as StockReportResponse;
    const categories = categoriesResponse?.data || [];
    const brands = brandsResponse?.data || [];
    const products = stockData?.data?.data || [];
    const stockTypes = stockData?.stock_types || [];
    const pagination = stockData?.data;

    // Custom filters configuration
    const customFilters: CustomFilterConfig[] = [
        {
            key: 'categoryId',
            label: 'Category',
            type: 'select',
            icon: <Layers className="h-5 w-5 text-gray-400" />,
            options: categories.map((cat: any) => ({
                value: cat.id,
                label: cat.name,
            })),
            defaultValue: 'all',
        },
        {
            key: 'brandId',
            label: 'Brand',
            type: 'select',
            icon: <Tag className="h-5 w-5 text-gray-400" />,
            options: brands.map((brand: any) => ({
                value: brand.id,
                label: brand.name,
            })),
            defaultValue: 'all',
        },
    ];

    // Handle filter changes
    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Function to format stock information for a product
    const formatStockInfo = (product: ProductStock) => {
        const stockInfo: { type: string; value: number; label: string }[] = [];

        stockTypes.forEach((stockType) => {
            const value = Number(product[stockType] || 0);
            if (value > 0) {
                let label = stockType
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                stockInfo.push({ type: stockType, value, label });
            }
        });

        return stockInfo;
    };

    // Function to get stock badge color based on type
    const getStockBadgeColor = (stockType: string) => {
        switch (stockType) {
            case 'damage':
                return 'bg-red-100 text-red-800';
            case 'stock-out':
                return 'bg-yellow-100 text-yellow-800';
            case 'in-stock':
                return 'bg-green-100 text-green-800';
            case 'lost':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Print functionality
    const handlePrint = async () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const tableHtml = printRef.current?.innerHTML || '';

        // Get store info
        const selectedStore = filters.storeId && filters.storeId !== 'all' ? stores.find((s: any) => s.id === filters.storeId) : null;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Stock Report</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background: white; 
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #e5e7eb;
                    }
                    .header h1 {
                        font-size: 24px;
                        margin: 0 0 10px 0;
                        color: #111827;
                    }
                    .header p {
                        font-size: 14px;
                        color: #6b7280;
                        margin: 5px 0;
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
                    .status-badge {
                        display: inline-block;
                        padding: 2px 10px;
                        border-radius: 9999px;
                        font-size: 12px;
                        font-weight: 500;
                        margin: 2px;
                    }
                    .stock-damage { background-color: #fee2e2; color: #991b1b; }
                    .stock-out { background-color: #fef3c7; color: #92400e; }
                    .stock-in { background-color: #dcfce7; color: #166534; }
                    .stock-lost { background-color: #fed7aa; color: #9a3412; }
                    .stock-default { background-color: #f3f4f6; color: #374151; }
                    @media print {
                        body { margin: 0; }
                        .actions-column { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Stock Report</h1>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                    ${selectedStore ? `<p>Store: ${selectedStore.store_name}</p>` : ''}
                    <p>Total Products: ${pagination?.total || 0}</p>
                </div>
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
        if (!products.length) return;

        const headers = ['Product SKU', 'Product Name', 'Category', 'Stock Information'];

        const csvContent = [
            headers.join(','),
            ...products.map((product) => {
                const stockInfo = formatStockInfo(product);
                const stockString = stockInfo.map((item) => `${item.label}: ${item.value}`).join('; ');
                return [`"${product.product_sku}"`, `"${product.product_name}"`, `"${product.category || 'N/A'}"`, `"${stockString}"`].join(',');
            }),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `stock-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download PDF functionality
    const handleDownloadPDF = async () => {
        if (!printRef.current) return;

        try {
            const loadingToast = document.createElement('div');
            loadingToast.textContent = 'Generating PDF...';
            loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(loadingToast);

            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm';
            tempContainer.style.backgroundColor = 'white';
            tempContainer.style.padding = '20px';
            tempContainer.style.fontFamily = 'Arial, sans-serif';

            // Create header
            const selectedStore = filters.storeId && filters.storeId !== 'all' ? stores.find((s: any) => s.id === filters.storeId) : null;

            const headerDiv = document.createElement('div');
            headerDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
                    <h1 style="font-size: 24px; margin: 0 0 10px 0; color: #111827;">Stock Report</h1>
                    <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Generated on ${new Date().toLocaleDateString()}</p>
                    ${selectedStore ? `<p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Store: ${selectedStore.store_name}</p>` : ''}
                    <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Total Products: ${pagination?.total || 0}</p>
                </div>
            `;

            const tableClone = printRef.current.cloneNode(true) as HTMLElement;

            const actionsElements = tableClone.querySelectorAll('.actions-column');
            actionsElements.forEach((el) => {
                (el as HTMLElement).style.display = 'none';
            });

            tempContainer.appendChild(headerDiv);
            tempContainer.appendChild(tableClone);
            document.body.appendChild(tempContainer);

            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: tempContainer.scrollWidth,
                height: tempContainer.scrollHeight,
            });

            document.body.removeChild(tempContainer);

            const imgData = canvas.toDataURL('image/png');

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

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

            const fileName = `stock-report-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            document.body.removeChild(loadingToast);

            const successToast = document.createElement('div');
            successToast.textContent = 'PDF downloaded successfully!';
            successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(successToast);
            setTimeout(() => document.body.removeChild(successToast), 3000);
        } catch (error) {
            console.error('Error generating PDF:', error);

            const errorToast = document.createElement('div');
            errorToast.textContent = 'Failed to generate PDF. Please try again.';
            errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(errorToast);
            setTimeout(() => document.body.removeChild(errorToast), 3000);
        }
    };

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setOrder('asc');
        }
        setCurrentPage(1);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (stockError) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Stock Report</h1>
                        <p className="mt-1 text-sm text-gray-500">Current stock levels across all products</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-4">
                        <div className="text-red-800">
                            <h3 className="text-sm font-medium">Error loading stock data</h3>
                            <p className="mt-1 text-sm">Please try again later.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Stock Report</h1>
                    <p className="mt-1 text-sm text-gray-500">Current stock levels across all products</p>
                </div>

                {/* Universal Filter */}
                <UniversalFilter
                    onFilterChange={handleFilterChange}
                    placeholder="Search by product name or SKU..."
                    showStoreFilter={true}
                    showDateFilter={false}
                    showSearch={true}
                    customFilters={customFilters}
                    initialFilters={filters}
                    className="mb-6"
                />

                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Export CSV
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Total: {pagination?.total || 0} products</span>
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value={10}>10 / page</option>
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                            <option value={100}>100 / page</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div ref={printRef} className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                                        onClick={() => handleSort('product_sku')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Product SKU</span>
                                            {sortBy === 'product_sku' && <span className="text-blue-500">{order === 'asc' ? '↑' : '↓'}</span>}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                                        onClick={() => handleSort('product_name')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Product Name</span>
                                            {sortBy === 'product_name' && <span className="text-blue-500">{order === 'asc' ? '↑' : '↓'}</span>}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                                        onClick={() => handleSort('category')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Category</span>
                                            {sortBy === 'category' && <span className="text-blue-500">{order === 'asc' ? '↑' : '↓'}</span>}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                                    <th className="actions-column px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {stockLoading ? (
                                    Array.from({ length: perPage }).map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-40 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="actions-column px-6 py-4">
                                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const stockInfo = formatStockInfo(product);
                                        return (
                                            <tr key={product.product_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.product_sku}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.product_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{product.category || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="flex flex-col gap-1">
                                                        {stockInfo.length === 0 ? (
                                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">No Stock</span>
                                                        ) : (
                                                            stockInfo.map((item, index) => (
                                                                <span
                                                                    key={index}
                                                                    className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStockBadgeColor(item.type)}`}
                                                                >
                                                                    {item.label}: {Number(item.value).toFixed(2)}
                                                                </span>
                                                            ))
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="actions-column px-6 py-4 text-sm text-gray-500">
                                                    <Link
                                                        href={`/stores/${product.store_id}/product/${product.product_id}`}
                                                        className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.last_page}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                                            .filter((page) => page === 1 || page === pagination.last_page || Math.abs(page - currentPage) <= 1)
                                            .map((page, index, array) => {
                                                if (index > 0 && array[index - 1] < page - 1) {
                                                    return [
                                                        <span
                                                            key={`ellipsis-${page}`}
                                                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                                                        >
                                                            ...
                                                        </span>,
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                currentPage === page ? 'z-10 bg-blue-600 text-white focus:ring-blue-500' : 'text-gray-900'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>,
                                                    ];
                                                }
                                                // return (
                                                //     <button
                                                //         key={page}
                                                //         onClick={() => handlePageChange(page)}
                                                //         className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                //             currentPage === page ? 'z-10 bg-blue-600 text-white focus:ring-blue-500' : 'text-gray-900'
                                                //         }`}
                                                //     >
                                                //         {page}
                                                //     </button>
                                                // );
                                            })}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === pagination.last_page}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockReportPage;
