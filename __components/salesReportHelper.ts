import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate Print/PDF Content with Store Header
 * Professional POS-style black & white layout
 */

export const generatePrintableContent = (reportData: any, currentStore: { store_name: string; logo_path?: string } | null): string => {
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
                
                .col-invoice { width: 10%; font-weight: 600; }
                .col-customer { width: 15%; }
                .col-items { width: 6%; text-align: center; }
                .col-status { width: 8%; text-align: center; }
                .col-payment { width: 10%; }
                .col-amount { width: 10%; text-align: right; }
                .col-date { width: 12%; }
                
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
                        size: A4 portrait;
                    }
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    font-size: 7pt;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .status-paid {
                    background: #000;
                    color: #fff;
                }
                
                .status-pending {
                    background: #e0e0e0;
                    color: #000;
                }
                
                .status-failed {
                    background: #f5f5f5;
                    color: #000;
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
                <div class="report-title">SALES REPORT</div>
                <div class="report-meta">
                    Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    ${reportData?.filters?.start_date ? `<br>Period: ${reportData.filters.start_date} to ${reportData.filters.end_date}` : ''}
                </div>
            </div>
            
            <div class="summary-section">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total Orders</div>
                        <div class="summary-value">${reportData?.summary?.total_orders ?? 0}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Paid Orders</div>
                        <div class="summary-value">${reportData?.summary?.paid_orders ?? 0}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Revenue</div>
                        <div class="summary-value">৳${Number(reportData?.summary?.total_revenue ?? 0).toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Avg Order</div>
                        <div class="summary-value">৳${Number(reportData?.summary?.avg_order_value ?? 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th class="col-invoice">Invoice</th>
                        <th class="col-customer">Customer</th>
                        <th class="col-items">Items</th>
                        <th class="col-status">Status</th>
                        <th class="col-payment">Payment</th>
                        <th class="col-amount">Subtotal</th>
                        <th class="col-amount">Tax</th>
                        <th class="col-amount">Discount</th>
                        <th class="col-amount">Total</th>
                        <th class="col-date">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${(reportData?.items ?? [])
                        .map(
                            (item: any) => `
                        <tr>
                            <td class="col-invoice">${item.invoice}</td>
                            <td class="col-customer">
                                <div style="font-weight: 600;">${item.customer_name || 'Walk-in'}</div>
                                <div style="color: #777; font-size: 7pt; margin-top: 2px;">${item.customer_phone || 'N/A'}</div>
                            </td>
                            <td class="col-items text-center">${item.items_count}</td>
                            <td class="col-status text-center">
                                <span class="status-badge status-${item.payment_status}">${item.payment_status}</span>
                            </td>
                            <td class="col-payment">${item.payment_method}</td>
                            <td class="col-amount text-right">৳${Number(item.subtotal).toFixed(2)}</td>
                            <td class="col-amount text-right">৳${Number(item.tax).toFixed(2)}</td>
                            <td class="col-amount text-right">৳${Number(item.discount).toFixed(2)}</td>
                            <td class="col-amount text-right text-bold">৳${Number(item.grand_total).toFixed(2)}</td>
                            <td class="col-date">
                                <div>${new Date(item.order_date).toLocaleDateString('en-GB')}</div>
                                <div style="color: #777; font-size: 7pt; margin-top: 2px;">
                                    ${new Date(item.order_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </td>
                        </tr>`
                        )
                        .join('')}
                </tbody>
            </table>
            
            <div class="report-footer">
                <strong>${storeName}</strong> | Sales Report<br>
                This is a system-generated report. No signature required.
            </div>
        </body>
        </html>
    `;
};

/**
 * Handle Print - Opens browser print dialog
 */
export const handlePrint = async (reportData: any, currentStore: { store_name: string; logo_path?: string } | null) => {
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
export const handleExportCSV = (reportData: any, currentStore: { store_name: string; logo_path?: string } | null) => {
    try {
        const storeName = currentStore?.store_name || 'Store Name';

        // CSV Headers
        const headers = ['Invoice', 'Customer Name', 'Customer Phone', 'Items Count', 'Payment Status', 'Payment Method', 'Subtotal', 'Tax', 'Discount', 'Grand Total', 'Order Date', 'Order Time'];

        // CSV Rows
        const rows = (reportData?.items ?? []).map((item: any) => {
            const orderDate = new Date(item.order_date);
            return [
                item.invoice,
                item.customer_name || 'Walk-in Customer',
                item.customer_phone || 'N/A',
                item.items_count,
                item.payment_status,
                item.payment_method || 'N/A',
                Number(item.subtotal).toFixed(2),
                Number(item.tax).toFixed(2),
                Number(item.discount).toFixed(2),
                Number(item.grand_total).toFixed(2),
                orderDate.toLocaleDateString('en-GB'),
                orderDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            ];
        });

        // Add summary rows at the end
        const summaryRows = [
            [],
            ['SUMMARY'],
            ['Total Orders', reportData?.summary?.total_orders ?? 0],
            ['Paid Orders', reportData?.summary?.paid_orders ?? 0],
            ['Pending Orders', reportData?.summary?.pending_orders ?? 0],
            ['Failed Orders', reportData?.summary?.failed_orders ?? 0],
            ['Total Revenue', `৳${Number(reportData?.summary?.total_revenue ?? 0).toFixed(2)}`],
            ['Average Order Value', `৳${Number(reportData?.summary?.avg_order_value ?? 0).toFixed(2)}`],
        ];

        // Combine all rows
        const csvContent = [
            [`${storeName} - Sales Report`],
            [`Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`],
            reportData?.filters?.start_date ? [`Period: ${reportData.filters.start_date} to ${reportData.filters.end_date}`] : [],
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

        const filename = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
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
export const handleExportPDF = async (reportData: any, currentStore: { store_name: string; logo_path?: string } | null) => {
    try {
        console.log('📄 PDF Export started');

        const printContent = generatePrintableContent(reportData, currentStore);

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-99999px';
        container.style.top = '0';
        container.style.width = '210mm';
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
            orientation: 'portrait',
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

        const filename = `sales-report-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        console.log('✅ PDF saved:', filename);
        document.body.removeChild(container);

        return { success: true, filename };
    } catch (error) {
        console.error('❌ PDF export failed:', error);
        throw error;
    }
};
