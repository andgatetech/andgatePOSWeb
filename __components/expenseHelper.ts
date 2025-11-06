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
                
                .col-source { width: 12%; }
                .col-store { width: 12%; }
                .col-ledger { width: 15%; }
                .col-journal { width: 10%; }
                .col-amount { width: 10%; text-align: right; }
                .col-note { width: 15%; }
                .col-created_by { width: 12%; }
                .col-date { width: 14%; }
                
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
                
                .source-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    font-size: 7pt;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .source-expense {
                    background: #000;
                    color: #fff;
                }
                
                .source-journal {
                    background: #e0e0e0;
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
                <div class="report-title">EXPENSE REPORT</div>
                <div class="report-meta">
                    Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    ${reportData?.filters?.start_date ? `<br>Period: ${reportData.filters.start_date} to ${reportData.filters.end_date}` : ''}
                </div>
            </div>
            
            <div class="summary-section">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total Expenses</div>
                        <div class="summary-value">${reportData?.summary?.total_entries ?? 0}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Amount</div>
                        <div class="summary-value">৳${Number(reportData?.summary?.total_amount ?? 0).toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Pending Expenses</div>
                        <div class="summary-value">0</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Avg Expense</div>
                        <div class="summary-value">৳${Number(reportData?.summary?.total_entries > 0 ? (reportData?.summary?.total_amount ?? 0) / reportData?.summary?.total_entries : 0).toFixed(
                            2
                        )}</div>
                    </div>
                </div>
            </div>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th class="col-source">Source</th>
                        <th class="col-store">Store</th>
                        <th class="col-ledger">Ledger</th>
                        <th class="col-journal">Journal</th>
                        <th class="col-amount">Amount</th>
                        <th class="col-note">Note</th>
                        <th class="col-created_by">Created By</th>
                        <th class="col-date">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${(reportData?.items ?? [])
                        .map(
                            (item: any) => `
                        <tr>
                            <td class="col-source">
                                <span class="source-badge source-${item.source === 'Expense Table' ? 'expense' : 'journal'}">${item.source}</span>
                            </td>
                            <td class="col-store">${item.store_name}</td>
                            <td class="col-ledger">${item.ledger_name}</td>
                            <td class="col-journal">${item.journal_name || '-'}</td>
                            <td class="col-amount text-right text-bold">৳${Number(item.amount).toFixed(2)}</td>
                            <td class="col-note">${item.note || 'N/A'}</td>
                            <td class="col-created_by">${item.created_by}</td>
                            <td class="col-date">
                                <div>${new Date(item.created_at).toLocaleDateString('en-GB')}</div>
                                <div style="color: #777; font-size: 7pt; margin-top: 2px;">
                                    ${new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </td>
                        </tr>`
                        )
                        .join('')}
                </tbody>
            </table>
            
            <div class="report-footer">
                <strong>${storeName}</strong> | Expense Report<br>
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
        const headers = ['Source', 'Store Name', 'Ledger Name', 'Journal Name', 'Amount', 'Note', 'Created By', 'Created Date', 'Created Time'];
        // CSV Rows
        const rows = (reportData?.items ?? []).map((item: any) => {
            const createdDate = new Date(item.created_at);
            return [
                item.source,
                item.store_name,
                item.ledger_name,
                item.journal_name || 'N/A',
                Number(item.amount).toFixed(2),
                item.note || 'N/A',
                item.created_by,
                createdDate.toLocaleDateString('en-GB'),
                createdDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            ];
        });
        // Add summary rows at the end
        const avgExpense = reportData?.summary?.total_entries > 0 ? (reportData?.summary?.total_amount ?? 0) / reportData?.summary?.total_entries : 0;
        const summaryRows = [
            [],
            ['SUMMARY'],
            ['Total Expenses', reportData?.summary?.total_entries ?? 0],
            ['Total Amount', `৳${Number(reportData?.summary?.total_amount ?? 0).toFixed(2)}`],
            ['Pending Expenses', 0],
            ['Average Expense Value', `৳${Number(avgExpense).toFixed(2)}`],
        ];
        // Combine all rows
        const csvContent = [
            [`${storeName} - Expense Report`],
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
        const filename = `expense-report-${new Date().toISOString().split('T')[0]}.csv`;
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
        const filename = `expense-report-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
        console.log('✅ PDF saved:', filename);
        document.body.removeChild(container);
        return { success: true, filename };
    } catch (error) {
        console.error('❌ PDF export failed:', error);
        throw error;
    }
};
