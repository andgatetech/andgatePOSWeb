import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface LowStockReportItem {
    store: string;
    product: string;
    brand: string;
    category: string;
    sku: string;
    unit: string;
    quantity: number;
    low_limit: number;
    price: number;
}

interface LowStockReportData {
    generated_at?: string;
    filters?: {
        store_ids: number[];
        category_id?: number;
        brand_id?: number;
        format: string;
    };
    summary: {
        total_products: number;
        total_quantity: number;
    };
    items: LowStockReportItem[];
}

/**
 * Calculate stock shortage
 */
const calculateShortage = (quantity: number, lowLimit: number) => {
    return Math.max(0, lowLimit - quantity);
};

/**
 * Generate Print/PDF Content with Store Header
 * Professional POS-style black & white layout
 */
export const generatePrintableContent = (reportData: LowStockReportData, currentStore: { store_name: string; logo_path?: string } | null): string => {
    const storeName = currentStore?.store_name || 'Store Name';
    const logoPath = currentStore?.logo_path || '';

    // Calculate additional metrics
    const outOfStockCount = reportData?.items?.filter((item) => item.quantity === 0).length || 0;
    const criticalStockCount = reportData?.items?.filter((item) => item.quantity > 0 && item.quantity < item.low_limit).length || 0;

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
                    grid-template-columns: repeat(4, 1fr);
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
                
                .col-store { width: 12%; }
                .col-product { width: 18%; }
                .col-brand { width: 10%; }
                .col-category { width: 10%; }
                .col-current { width: 10%; text-align: center; }
                .col-limit { width: 10%; text-align: center; }
                .col-shortage { width: 10%; text-align: center; }
                .col-price { width: 10%; text-align: right; }
                .col-status { width: 10%; text-align: center; }
                
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
                
                .status-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    font-size: 7pt;
                    font-weight: 600;
                    border-radius: 3px;
                }
                
                .status-out { background: #000; color: #fff; }
                .status-critical { background: #d0d0d0; color: #000; }
                .status-low { background: #e8e8e8; color: #000; }
                
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .text-bold { font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="report-header">
                ${logoPath ? `<img src="${logoPath}" alt="Logo" class="store-logo" crossorigin="anonymous" />` : ''}
                <div class="store-name">${storeName}</div>
                <div class="report-title">LOW STOCK REPORT</div>
                <div class="report-meta">
                    Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            
            <div class="summary-section">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total Low Stock</div>
                        <div class="summary-value">${reportData?.summary?.total_products ?? 0}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Out of Stock</div>
                        <div class="summary-value">${outOfStockCount}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Critical Stock</div>
                        <div class="summary-value">${criticalStockCount}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Quantity</div>
                        <div class="summary-value">${reportData?.summary?.total_quantity ?? 0}</div>
                    </div>
                </div>
            </div>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th class="col-store">Store</th>
                        <th class="col-product">Product (SKU)</th>
                        <th class="col-brand">Brand</th>
                        <th class="col-category">Category</th>
                        <th class="col-current">Current Stock</th>
                        <th class="col-limit">Low Limit</th>
                        <th class="col-shortage">Shortage</th>
                        <th class="col-price">Unit Price</th>
                        <th class="col-status">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${(reportData?.items ?? [])
                        .map((item: LowStockReportItem) => {
                            const shortage = calculateShortage(item.quantity, item.low_limit);
                            const status = item.quantity === 0 ? 'Out of Stock' : shortage > 0 ? 'Critical' : 'Low Stock';
                            const statusClass = item.quantity === 0 ? 'status-out' : shortage > 0 ? 'status-critical' : 'status-low';

                            return `
                        <tr>
                            <td class="col-store text-bold">${item.store}</td>
                            <td class="col-product">
                                <div class="text-bold">${item.product}</div>
                                <div style="color: #777; font-size: 7pt;">SKU: ${item.sku}</div>
                            </td>
                            <td class="col-brand">${item.brand}</td>
                            <td class="col-category">${item.category}</td>
                            <td class="col-current text-center text-bold">${item.quantity} ${item.unit}</td>
                            <td class="col-limit text-center">${item.low_limit} ${item.unit}</td>
                            <td class="col-shortage text-center text-bold">${shortage > 0 ? `${shortage} ${item.unit}` : '-'}</td>
                            <td class="col-price text-right">৳${Number(item.price).toFixed(2)}</td>
                            <td class="col-status text-center">
                                <span class="status-badge ${statusClass}">${status}</span>
                            </td>
                        </tr>`;
                        })
                        .join('')}
                </tbody>
            </table>
            
            <div class="report-footer">
                <strong>${storeName}</strong> | Low Stock Report<br>
                This is a system-generated report. No signature required.
            </div>
        </body>
        </html>
    `;
};

/**
 * Handle Print - Opens browser print dialog
 */
export const handlePrint = async (reportData: LowStockReportData, currentStore: { store_name: string; logo_path?: string } | null) => {
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
export const handleExportCSV = (reportData: LowStockReportData, currentStore: { store_name: string; logo_path?: string } | null) => {
    try {
        const storeName = currentStore?.store_name || 'Store Name';

        // Calculate additional metrics
        const outOfStockCount = reportData?.items?.filter((item) => item.quantity === 0).length || 0;
        const criticalStockCount = reportData?.items?.filter((item) => item.quantity > 0 && item.quantity < item.low_limit).length || 0;

        // CSV Headers
        const headers = ['Store', 'Product', 'SKU', 'Brand', 'Category', 'Current Stock', 'Unit', 'Low Limit', 'Shortage', 'Unit Price', 'Status'];

        // CSV Rows
        const rows = (reportData?.items ?? []).map((item: LowStockReportItem) => {
            const shortage = calculateShortage(item.quantity, item.low_limit);
            const status = item.quantity === 0 ? 'Out of Stock' : shortage > 0 ? 'Critical' : 'Low Stock';

            return [item.store, item.product, item.sku, item.brand, item.category, item.quantity, item.unit, item.low_limit, shortage > 0 ? shortage : 0, Number(item.price).toFixed(2), status];
        });

        // Add summary rows at the end
        const summaryRows = [
            [],
            ['SUMMARY'],
            ['Total Low Stock', reportData?.summary?.total_products ?? 0],
            ['Out of Stock', outOfStockCount],
            ['Critical Stock', criticalStockCount],
            ['Total Quantity', reportData?.summary?.total_quantity ?? 0],
        ];

        // Combine all rows
        const csvContent = [
            [`${storeName} - Low Stock Report`],
            [`Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`],
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
        const filename = `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`;

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
export const handleExportPDF = async (reportData: LowStockReportData, currentStore: { store_name: string; logo_path?: string } | null) => {
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

        container.innerHTML = printContent.replace('<!DOCTYPE html><html><head><meta charset="UTF-8">', '').replace('</head><body>', '').replace('</body></html>', '');

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

        const filename = `low-stock-report-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        console.log('✅ PDF saved:', filename);
        document.body.removeChild(container);

        return { success: true, filename };
    } catch (error) {
        console.error('❌ PDF export failed:', error);
        throw error;
    }
};
