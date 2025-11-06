import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StockAdjustmentItem {
    id: number;
    reference_no: string;
    product_id: number;
    product_name: string;
    product_sku: string;
    store_name: string;
    stock_type: string;
    direction: 'increase' | 'decrease';
    previous_stock: number;
    adjusted_stock: number;
    adjustment_quantity: number;
    reason: string | null;
    user_name: string;
    created_at: string;
}

interface StockAdjustmentReportData {
    generated_at: string;
    filters: {
        store_ids: number[];
        start_date?: string;
        end_date?: string;
        direction?: string;
        stock_type_id?: number;
        format: string;
    };
    summary: {
        total_adjustments: number;
        total_increases: number;
        total_decreases: number;
        net_change: number;
    };
    items: StockAdjustmentItem[];
}

/**
 * Generate Print/PDF Content with Store Header
 * Professional POS-style black & white layout
 */
export const generatePrintableContent = (reportData: StockAdjustmentReportData, currentStore: { store_name: string; logo_path?: string } | null): string => {
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
                
                .col-ref { width: 10%; }
                .col-product { width: 15%; }
                .col-store { width: 10%; }
                .col-stock-type { width: 10%; }
                .col-direction { width: 8%; text-align: center; }
                .col-previous { width: 8%; text-align: center; }
                .col-adjusted { width: 8%; text-align: center; }
                .col-change { width: 8%; text-align: center; }
                .col-user { width: 10%; }
                .col-date { width: 13%; }
                
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
                
                .direction-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    font-size: 7pt;
                    font-weight: 600;
                    border-radius: 3px;
                }
                
                .direction-increase { background: #e8e8e8; color: #000; }
                .direction-decrease { background: #d0d0d0; color: #000; }
                
                .stock-type-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    font-size: 7pt;
                    font-weight: 600;
                    background: #e0e0e0;
                    color: #000;
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
                <div class="report-title">STOCK ADJUSTMENT REPORT</div>
                <div class="report-meta">
                    Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    ${reportData?.filters?.start_date && reportData?.filters?.end_date ? `<br>Period: ${reportData.filters.start_date} to ${reportData.filters.end_date}` : ''}
                </div>
            </div>
            
            <div class="summary-section">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total Adjustments</div>
                        <div class="summary-value">${reportData?.summary?.total_adjustments ?? 0}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Increases</div>
                        <div class="summary-value">${reportData?.summary?.total_increases ?? 0}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Decreases</div>
                        <div class="summary-value">${reportData?.summary?.total_decreases ?? 0}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Net Change</div>
                        <div class="summary-value">${reportData?.summary?.net_change >= 0 ? '+' : ''}${reportData?.summary?.net_change ?? 0}</div>
                    </div>
                </div>
            </div>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th class="col-ref">Reference No</th>
                        <th class="col-product">Product (SKU)</th>
                        <th class="col-store">Store</th>
                        <th class="col-stock-type">Stock Type</th>
                        <th class="col-direction">Direction</th>
                        <th class="col-previous">Previous</th>
                        <th class="col-adjusted">Adjusted</th>
                        <th class="col-change">Change</th>
                        <th class="col-user">User</th>
                        <th class="col-date">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${(reportData?.items ?? [])
                        .map((item: StockAdjustmentItem) => {
                            const directionClass = item.direction === 'increase' ? 'direction-increase' : 'direction-decrease';
                            const changeValue = item.direction === 'increase' ? `+${item.adjustment_quantity}` : `-${item.adjustment_quantity}`;

                            return `
                        <tr>
                            <td class="col-ref text-bold">${item.reference_no}</td>
                            <td class="col-product">
                                <div class="text-bold">${item.product_name}</div>
                                <div style="color: #777; font-size: 7pt;">${item.product_sku || 'N/A'}</div>
                            </td>
                            <td class="col-store">${item.store_name}</td>
                            <td class="col-stock-type">
                                <span class="stock-type-badge">${item.stock_type}</span>
                            </td>
                            <td class="col-direction text-center">
                                <span class="direction-badge ${directionClass}">${item.direction}</span>
                            </td>
                            <td class="col-previous text-center">${item.previous_stock}</td>
                            <td class="col-adjusted text-center text-bold">${item.adjusted_stock}</td>
                            <td class="col-change text-center text-bold">${changeValue}</td>
                            <td class="col-user">${item.user_name || 'N/A'}</td>
                            <td class="col-date">
                                <div>${new Date(item.created_at).toLocaleDateString('en-GB')}</div>
                                <div style="color: #777; font-size: 7pt; margin-top: 2px;">
                                    ${new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </td>
                        </tr>`;
                        })
                        .join('')}
                </tbody>
            </table>
            
            <div class="report-footer">
                <strong>${storeName}</strong> | Stock Adjustment Report<br>
                This is a system-generated report. No signature required.
            </div>
        </body>
        </html>
    `;
};

/**
 * Handle Print - Opens browser print dialog
 */
export const handlePrint = async (reportData: StockAdjustmentReportData, currentStore: { store_name: string; logo_path?: string } | null) => {
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
export const handleExportCSV = (reportData: StockAdjustmentReportData, currentStore: { store_name: string; logo_path?: string } | null) => {
    try {
        const storeName = currentStore?.store_name || 'Store Name';

        // CSV Headers
        const headers = ['Reference No', 'Product', 'SKU', 'Store', 'Stock Type', 'Direction', 'Previous Stock', 'Adjusted Stock', 'Change', 'User', 'Date', 'Time'];

        // CSV Rows
        const rows = (reportData?.items ?? []).map((item: StockAdjustmentItem) => {
            const changeValue = item.direction === 'increase' ? `+${item.adjustment_quantity}` : `-${item.adjustment_quantity}`;
            const createdDate = new Date(item.created_at);

            return [
                item.reference_no,
                item.product_name,
                item.product_sku || 'N/A',
                item.store_name,
                item.stock_type,
                item.direction,
                item.previous_stock,
                item.adjusted_stock,
                changeValue,
                item.user_name || 'N/A',
                createdDate.toLocaleDateString('en-GB'),
                createdDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            ];
        });

        // Add summary rows at the end
        const summaryRows = [
            [],
            ['SUMMARY'],
            ['Total Adjustments', reportData?.summary?.total_adjustments ?? 0],
            ['Total Increases', reportData?.summary?.total_increases ?? 0],
            ['Total Decreases', reportData?.summary?.total_decreases ?? 0],
            ['Net Change', `${reportData?.summary?.net_change >= 0 ? '+' : ''}${reportData?.summary?.net_change ?? 0}`],
        ];

        // Combine all rows
        const csvContent = [
            [`${storeName} - Stock Adjustment Report`],
            [`Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`],
            reportData?.filters?.start_date && reportData?.filters?.end_date ? [`Period: ${reportData.filters.start_date} to ${reportData.filters.end_date}`] : [],
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
        const filename = `stock-adjustment-report-${new Date().toISOString().split('T')[0]}.csv`;

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
export const handleExportPDF = async (reportData: StockAdjustmentReportData, currentStore: { store_name: string; logo_path?: string } | null) => {
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

        const filename = `stock-adjustment-report-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        console.log('✅ PDF saved:', filename);
        document.body.removeChild(container);

        return { success: true, filename };
    } catch (error) {
        console.error('❌ PDF export failed:', error);
        throw error;
    }
};
