import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StockItem {
    product_id: number;
    product_name: string;
    category: string | null;
    brand: string | null;
    store_name: string | null;
    price: number;
    stock_types: Record<string, number>;
    total_qty: number;
    total_value: number;
}

interface StockReportData {
    generated_at: string;
    filters: {
        store_ids: number[];
        category_id?: number;
        brand_id?: number;
        search?: string;
    };
    summary: {
        total_products: number;
        total_quantity: number;
        total_value: number;
    };
    items: StockItem[];
}

/**
 * Generate Print/PDF Content with Store Header
 * Professional POS-style black & white layout
 */
export const generatePrintableContent = (
    reportData: StockReportData,
    currentStore: { store_name: string; logo_path?: string } | null
): string => {
    const storeName = currentStore?.store_name || 'Store Name';
    const logoPath = currentStore?.logo_path || '';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    color: #1a1a1a;
                    background: #fff;
                    padding: 20mm;
                    font-size: 9pt;
                    line-height: 1.5;
                }
                
                .report-header {
                    text-align: center;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                    background: #f8f9fa;
                    padding: 25px 20px;
                }
                
                .store-logo {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    margin: 0 auto 12px;
                    display: block;
                    filter: grayscale(100%);
                }
                
                .store-name {
                    font-size: 20pt;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                    color: #000;
                }
                
                .report-title {
                    font-size: 16pt;
                    font-weight: 600;
                    margin: 10px 0 8px;
                    color: #2c3e50;
                }
                
                .report-meta {
                    font-size: 9pt;
                    color: #555;
                    margin-top: 8px;
                    line-height: 1.6;
                }
                
                .summary-section {
                    margin: 25px 0;
                    padding: 0;
                }
                
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0;
                }
                
                .summary-item {
                    text-align: center;
                    padding: 18px 12px;
                    background: #fff;
                }
                
                .summary-item:nth-child(odd) {
                    background: #f8f9fa;
                }
                
                .summary-label {
                    font-size: 8pt;
                    text-transform: uppercase;
                    color: #666;
                    margin-bottom: 6px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                
                .summary-value {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #000;
                }
                
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 25px;
                    font-size: 8pt;
                }
                
                .report-table thead {
                    background: #2c3e50;
                    color: #fff;
                }
                
                .report-table th {
                    padding: 10px 8px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 8pt;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .report-table td {
                    padding: 10px 8px;
                    font-size: 8pt;
                }
                
                .report-table tbody tr {
                    background: #fff;
                }
                
                .report-table tbody tr:nth-child(even) {
                    background: #f8f9fa;
                }
                
                .col-product { width: 20%; }
                .col-category { width: 12%; }
                .col-brand { width: 12%; }
                .col-store { width: 12%; }
                .col-price { width: 10%; text-align: right; }
                .col-stock-types { width: 15%; }
                .col-qty { width: 10%; text-align: right; }
                .col-value { width: 12%; text-align: right; }
                
                .report-footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    text-align: center;
                    font-size: 8pt;
                    color: #666;
                    background: #f8f9fa;
                    padding: 15px;
                }
                
                @media print {
                    body { padding: 15mm; }
                    .report-table { page-break-inside: auto; }
                    .report-table tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    @page {
                        margin: 15mm;
                        size: A4 landscape;
                    }
                }
                
                .stock-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    font-size: 7pt;
                    font-weight: 600;
                    background: #e0e0e0;
                    color: #000;
                    margin: 2px;
                    border-radius: 3px;
                }
                
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .text-bold { font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="report-header">
                ${logoPath ? `<img src="${logoPath}" alt="Logo" class="store-logo" crossorigin="anonymous" />` : ''}
                <div class="store-name">${storeName}</div>
                <div class="report-title">CURRENT STOCK REPORT</div>
                <div class="report-meta">
                    Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    ${reportData?.filters?.category_id ? `<br>Category ID: ${reportData.filters.category_id}` : ''}
                    ${reportData?.filters?.brand_id ? `<br>Brand ID: ${reportData.filters.brand_id}` : ''}
                    ${reportData?.filters?.search ? `<br>Search: ${reportData.filters.search}` : ''}
                </div>
            </div>
            
            <div class="summary-section">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total Products</div>
                        <div class="summary-value">${reportData?.summary?.total_products ?? 0}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Quantity</div>
                        <div class="summary-value">${reportData?.summary?.total_quantity ?? 0}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Value</div>
                        <div class="summary-value">৳${Number(reportData?.summary?.total_value ?? 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th class="col-product">Product Name</th>
                        <th class="col-category">Category</th>
                        <th class="col-brand">Brand</th>
                        <th class="col-store">Store</th>
                        <th class="col-price">Price</th>
                        <th class="col-stock-types">Stock Types</th>
                        <th class="col-qty">Total Qty</th>
                        <th class="col-value">Total Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${(reportData?.items ?? [])
                        .map(
                            (item: StockItem) => `
                        <tr>
                            <td class="col-product text-bold">${item.product_name}</td>
                            <td class="col-category">${item.category || 'N/A'}</td>
                            <td class="col-brand">${item.brand || 'N/A'}</td>
                            <td class="col-store">${item.store_name || 'N/A'}</td>
                            <td class="col-price text-right">৳${Number(item.price).toFixed(2)}</td>
                            <td class="col-stock-types">
                                ${Object.entries(item.stock_types || {})
                                    .map(([type, qty]) => `<span class="stock-badge">${type}: ${qty}</span>`)
                                    .join(' ')}
                            </td>
                            <td class="col-qty text-right text-bold">${item.total_qty}</td>
                            <td class="col-value text-right text-bold">৳${Number(item.total_value).toFixed(2)}</td>
                        </tr>`
                        )
                        .join('')}
                </tbody>
            </table>
            
            <div class="report-footer">
                <strong>${storeName}</strong> | Current Stock Report<br>
                This is a system-generated report. No signature required.
            </div>
        </body>
        </html>
    `;
};

/**
 * Handle Print - Opens browser print dialog
 */
export const handlePrint = async (
    reportData: StockReportData,
    currentStore: { store_name: string; logo_path?: string } | null
) => {
    try {
        const printContent = generatePrintableContent(reportData, currentStore);
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'absolute';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = 'none';
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentWindow?.document;
        if (!frameDoc) throw new Error('Could not access iframe document');

        frameDoc.open();
        frameDoc.write(printContent);
        frameDoc.close();

        await new Promise((resolve) => setTimeout(resolve, 500));
        printFrame.contentWindow?.print();

        setTimeout(() => {
            document.body.removeChild(printFrame);
        }, 1000);
    } catch (error) {
        console.error('Print failed:', error);
        throw error;
    }
};

/**
 * Handle CSV Export
 */
export const handleExportCSV = (
    reportData: StockReportData,
    currentStore: { store_name: string; logo_path?: string } | null
) => {
    try {
        const storeName = currentStore?.store_name || 'Store Name';

        // CSV Headers
        const headers = [
            'Product ID',
            'Product Name',
            'Category',
            'Brand',
            'Store',
            'Price',
            'Stock Types',
            'Total Quantity',
            'Total Value',
        ];

        // CSV Rows
        const rows = (reportData?.items ?? []).map((item: StockItem) => {
            const stockTypesStr = Object.entries(item.stock_types || {})
                .map(([type, qty]) => `${type}:${qty}`)
                .join('; ');

            return [
                item.product_id,
                item.product_name,
                item.category || 'N/A',
                item.brand || 'N/A',
                item.store_name || 'N/A',
                Number(item.price).toFixed(2),
                stockTypesStr,
                item.total_qty,
                Number(item.total_value).toFixed(2),
            ];
        });

        // Add summary rows at the end
        const summaryRows = [
            [],
            ['SUMMARY'],
            ['Total Products', reportData?.summary?.total_products ?? 0],
            ['Total Quantity', reportData?.summary?.total_quantity ?? 0],
            ['Total Value', `৳${Number(reportData?.summary?.total_value ?? 0).toFixed(2)}`],
        ];

        // Combine all rows
        const csvContent = [
            [`${storeName} - Current Stock Report`],
            [`Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`],
            reportData?.filters?.category_id ? [`Category ID: ${reportData.filters.category_id}`] : [],
            reportData?.filters?.brand_id ? [`Brand ID: ${reportData.filters.brand_id}`] : [],
            reportData?.filters?.search ? [`Search: ${reportData.filters.search}`] : [],
            [],
            headers,
            ...rows,
            ...summaryRows,
        ]
            .filter((row) => row.length > 0)
            .map((row) =>
                row
                    .map((cell) => {
                        const cellStr = String(cell ?? '');
                        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                            return `"${cellStr.replace(/"/g, '""')}"`;
                        }
                        return cellStr;
                    })
                    .join(',')
            )
            .join('\n');

        // Create blob and download
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const filename = `stock-report-${new Date().toISOString().split('T')[0]}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('✅ CSV exported:', filename);
        return { success: true, filename };
    } catch (error) {
        console.error('❌ CSV export failed:', error);
        throw error;
    }
};

/**
 * Handle PDF Export - Uses same layout as print
 */
export const handleExportPDF = async (
    reportData: StockReportData,
    currentStore: { store_name: string; logo_path?: string } | null
) => {
    try {
        console.log('📄 PDF Export started');

        const printContent = generatePrintableContent(reportData, currentStore);
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-99999px';
        container.style.top = '0';
        container.style.width = '297mm'; // A4 landscape width
        container.style.background = '#fff';
        document.body.appendChild(container);

        container.innerHTML = printContent
            .replace('<!DOCTYPE html><html><head><meta charset="UTF-8">', '')
            .replace('</head><body>', '')
            .replace('</body></html>', '');

        await new Promise((resolve) => setTimeout(resolve, 300));

        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
        });

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
        }

        const filename = `stock-report-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        console.log('✅ PDF saved:', filename);
        document.body.removeChild(container);

        return { success: true, filename };
    } catch (error) {
        console.error('❌ PDF export failed:', error);
        throw error;
    }
};