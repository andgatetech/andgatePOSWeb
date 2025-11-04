import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate Print/PDF Content with Store Header for Income Report
 * Professional POS-style black & white layout
 */
// export const generatePrintableContent = (reportData: any, currentStore: { store_name: string; logo_path?: string } | null): string => {
//     const storeName = currentStore?.store_name || 'Store Name';
//     const logoPath = currentStore?.logo_path || '';

//     // Client-side summary calculations (match frontend)
//     const totalIncome = reportData?.summary?.total_income ?? 0;
//     const totalTransactions = reportData?.summary?.transactions ?? 0;
//     const averageIncome = totalTransactions > 0 ? totalIncome / totalTransactions : 0;
//     const cashPayments = reportData?.items?.filter((r: any) => r.payment_type?.toLowerCase() === 'cash').length ?? 0;
//     const digitalPayments = totalTransactions - cashPayments;

//     return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <meta charset="UTF-8">
//             <style>
//                 * {
//                     margin: 0;
//                     padding: 0;
//                     box-sizing: border-box;
//                 }

//                 body {
//                     font-family: 'Arial', 'Helvetica', sans-serif;
//                     color: #1a1a1a;
//                     background: #fff;
//                     padding: 20mm;
//                     font-size: 9pt;
//                     line-height: 1.5;
//                 }

//                 .report-header {
//                     text-align: center;
//                     padding-bottom: 20px;
//                     margin-bottom: 30px;
//                     background: #f8f9fa;
//                     padding: 25px 20px;
//                 }

//                 .store-logo {
//                     width: 80px;
//                     height: 80px;
//                     object-fit: contain;
//                     margin: 0 auto 12px;
//                     display: block;
//                     filter: grayscale(100%);
//                 }

//                 .store-name {
//                     font-size: 20pt;
//                     font-weight: bold;
//                     text-transform: uppercase;
//                     letter-spacing: 2px;
//                     margin-bottom: 8px;
//                     color: #000;
//                 }

//                 .report-title {
//                     font-size: 16pt;
//                     font-weight: 600;
//                     margin: 10px 0 8px;
//                     color: #2c3e50;
//                 }

//                 .report-meta {
//                     font-size: 9pt;
//                     color: #555;
//                     margin-top: 8px;
//                     line-height: 1.6;
//                 }

//                 .summary-section {
//                     margin: 25px 0;
//                     padding: 0;
//                 }

//                 .summary-grid {
//                     display: grid;
//                     grid-template-columns: repeat(4, 1fr);
//                     gap: 0;
//                 }

//                 .summary-item {
//                     text-align: center;
//                     padding: 18px 12px;
//                     background: #fff;
//                 }

//                 .summary-item:nth-child(odd) {
//                     background: #f8f9fa;
//                 }

//                 .summary-label {
//                     font-size: 8pt;
//                     text-transform: uppercase;
//                     color: #666;
//                     margin-bottom: 6px;
//                     font-weight: 600;
//                     letter-spacing: 0.5px;
//                 }

//                 .summary-value {
//                     font-size: 14pt;
//                     font-weight: bold;
//                     color: #000;
//                 }

//                 .report-table {
//                     width: 100%;
//                     border-collapse: collapse;
//                     margin-top: 25px;
//                     font-size: 8pt;
//                 }

//                 .report-table thead {
//                     background: #2c3e50;
//                     color: #fff;
//                 }

//                 .report-table th {
//                     padding: 10px 8px;
//                     text-align: left;
//                     font-weight: 600;
//                     font-size: 8pt;
//                     text-transform: uppercase;
//                     letter-spacing: 0.5px;
//                 }

//                 .report-table td {
//                     padding: 10px 8px;
//                     font-size: 8pt;
//                 }

//                 .report-table tbody tr {
//                     background: #fff;
//                 }

//                 .report-table tbody tr:nth-child(even) {
//                     background: #f8f9fa;
//                 }

//                 .col-sl { width: 5%; text-align: center; }
//                 .col-ref { width: 12%; font-weight: 600; }
//                 .col-income-for { width: 15%; }
//                 .col-store { width: 10%; }
//                 .col-category { width: 10%; }
//                 .col-brand { width: 10%; }
//                 .col-payment { width: 10%; text-align: center; }
//                 .col-amount { width: 10%; text-align: right; }
//                 .col-date { width: 12%; }

//                 .report-footer {
//                     margin-top: 30px;
//                     padding-top: 15px;
//                     text-align: center;
//                     font-size: 8pt;
//                     color: #666;
//                     background: #f8f9fa;
//                     padding: 15px;
//                 }

//                 @media print {
//                     body { padding: 15mm; }
//                     .report-table { page-break-inside: auto; }
//                     .report-table tr {
//                         page-break-inside: avoid;
//                         page-break-after: auto;
//                     }
//                     @page {
//                         margin: 15mm;
//                         size: A4 portrait;
//                     }
//                 }

//                 .payment-badge {
//                     display: inline-block;
//                     padding: 3px 8px;
//                     font-size: 7pt;
//                     font-weight: 600;
//                     text-transform: uppercase;
//                     letter-spacing: 0.5px;
//                 }

//                 .payment-cash {
//                     background: #000;
//                     color: #fff;
//                 }

//                 .payment-digital {
//                     background: #e0e0e0;
//                     color: #000;
//                 }

//                 .text-right { text-align: right; }
//                 .text-center { text-align: center; }
//                 .text-bold { font-weight: 600; }
//             </style>
//         </head>
//         <body>
//             <div class="report-header">
//                 ${logoPath ? `<img src="${logoPath}" alt="Logo" class="store-logo" crossorigin="anonymous" />` : ''}
//                 <div class="store-name">${storeName}</div>
//                 <div class="report-title">INCOME REPORT</div>
//                 <div class="report-meta">
//                     Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
//                     ${reportData?.filters?.from_date ? `<br>Period: ${reportData.filters.from_date} to ${reportData.filters.to_date}` : ''}
//                 </div>
//             </div>

//             <div class="summary-section">
//                 <div class="summary-grid">
//                     <div class="summary-item">
//                         <div class="summary-label">Total Income</div>
//                         <div class="summary-value">৳${Number(totalIncome).toFixed(2)}</div>
//                     </div>
//                     <div class="summary-item">
//                         <div class="summary-label">Total Transactions</div>
//                         <div class="summary-value">${totalTransactions}</div>
//                     </div>
//                     <div class="summary-item">
//                         <div class="summary-label">Average Income</div>
//                         <div class="summary-value">৳${Number(averageIncome).toFixed(2)}</div>
//                     </div>
//                     <div class="summary-item">
//                         <div class="summary-label">Cash / Digital</div>
//                         <div class="summary-value">${cashPayments} / ${digitalPayments}</div>
//                     </div>
//                 </div>
//             </div>

//             <table class="report-table">
//                 <thead>
//                     <tr>
//                         <th class="col-sl">SL</th>
//                         <th class="col-ref">Reference No</th>
//                         <th class="col-income-for">Income For</th>
//                         <th class="col-store">Store</th>
//                         <th class="col-category">Category</th>
//                         <th class="col-brand">Brand</th>
//                         <th class="col-payment">Payment Type</th>
//                         <th class="col-amount">Amount</th>
//                         <th class="col-date">Date</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${(reportData?.items ?? [])
//                         .map((item: any) => {
//                             const incomeDate = new Date(item.income_date);
//                             const paymentClass = item.payment_type?.toLowerCase() === 'cash' ? 'payment-cash' : 'payment-digital';
//                             return `
//                                 <tr>
//                                     <td class="col-sl text-center">${item.sl}</td>
//                                     <td class="col-ref">${item.reference_no}</td>
//                                     <td class="col-income-for">${item.income_for || 'Walk-in Customer'}</td>
//                                     <td class="col-store">${item.store}</td>
//                                     <td class="col-category">${item.category}</td>
//                                     <td class="col-brand">${item.brand}</td>
//                                     <td class="col-payment text-center">
//                                         <span class="payment-badge ${paymentClass}">${item.payment_type}</span>
//                                     </td>
//                                     <td class="col-amount text-right text-bold">৳${Number(item.amount).toFixed(2)}</td>
//                                     <td class="col-date">
//                                         <div>${incomeDate.toLocaleDateString('en-GB')}</div>
//                                         <div style="color: #777; font-size: 7pt; margin-top: 2px;">
//                                             ${incomeDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
//                                         </div>
//                                     </td>
//                                 </tr>`;
//                         })
//                         .join('')}
//                 </tbody>
//             </table>

//             <div class="report-footer">
//                 <strong>${storeName}</strong> | Income Report<br>
//                 This is a system-generated report. No signature required.
//             </div>
//         </body>
//         </html>
//     `;
// };

export const generatePrintableContent = (reportData: any, currentStore: { store_name: string; logo_path?: string } | null): string => {
    const storeName = currentStore?.store_name || 'Store Name';
    const logoPath = currentStore?.logo_path || '';

    console.log(reportData);

    // Client-side summary calculations (match frontend)
    const totalIncome = reportData?.summary?.total_income ?? 0;
    const totalTransactions = reportData?.summary?.transactions ?? 0;
    const averageIncome = totalTransactions > 0 ? totalIncome / totalTransactions : 0;
    const cashPayments = reportData?.items?.filter((r: any) => r.payment_type?.toLowerCase() === 'cash').length ?? 0;
    const digitalPayments = totalTransactions - cashPayments;

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
                    color: #000;
                    background: #fff;
                    padding: 15mm 20mm;
                    font-size: 10pt;
                    line-height: 1.4;
                }
                
                .report-header {
                    text-align: center;
                    padding: 20px 0;
                    margin-bottom: 25px;
                    border-bottom: 2px solid #000;
                }
                
                .store-logo {
                    width: 70px;
                    height: 70px;
                    object-fit: contain;
                    margin: 0 auto 10px;
                    display: block;
                }
                
                .store-name {
                    font-size: 22pt;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 5px;
                    color: #000;
                }
                
                .report-title {
                    font-size: 14pt;
                    font-weight: 600;
                    margin: 8px 0 5px;
                    color: #000;
                    text-transform: uppercase;
                }
                
                .report-meta {
                    font-size: 9pt;
                    color: #333;
                    margin-top: 5px;
                    line-height: 1.5;
                }
                
                .summary-section {
                    margin: 20px 0 25px;
                    border: 1px solid #ddd;
                }
                
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0;
                }
                
                .summary-item {
                    text-align: center;
                    padding: 15px 10px;
                    border-right: 1px solid #ddd;
                }
                
                .summary-item:last-child {
                    border-right: none;
                }
                
                .summary-item:nth-child(odd) {
                    background: #f5f5f5;
                }
                
                .summary-label {
                    font-size: 8pt;
                    text-transform: uppercase;
                    color: #555;
                    margin-bottom: 5px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }
                
                .summary-value {
                    font-size: 13pt;
                    font-weight: bold;
                    color: #000;
                }
                
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 9pt;
                }
                
                .report-table thead th {
                    background: #f0f0f0;
                    padding: 10px 6px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 8pt;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    border-top: 2px solid #000;
                    border-bottom: 2px solid #000;
                    color: #000;
                }
                
                .report-table tbody td {
                    padding: 8px 6px;
                    font-size: 8pt;
                    border: none;
                }
                
                .report-table tbody tr {
                    background: #fff;
                }
                
                .report-table tbody tr:nth-child(even) {
                    background: #fafafa;
                }
                
                .col-sl { width: 4%; text-align: center; }
                .col-ref { width: 12%; font-weight: 600; }
                .col-income-for { width: 13%; }
                .col-store { width: 10%; }
                .col-category { width: 12%; }
                .col-brand { width: 12%; }
                .col-payment { width: 10%; text-align: center; }
                .col-amount { width: 12%; text-align: right; font-weight: 600; }
                .col-date { width: 13%; }
                
                .report-footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 8pt;
                    color: #555;
                }
                
                @media print {
                    body { 
                        padding: 10mm 15mm;
                    }
                    .report-table { 
                        page-break-inside: auto;
                    }
                    .report-table tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    .report-table thead {
                        display: table-header-group;
                    }
                    @page {
                        margin: 10mm 15mm;
                        size: A4 portrait;
                    }
                }
                
                .payment-type {
                    font-size: 8pt;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .text-bold { font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="report-header">
                ${logoPath ? `<img src="${logoPath}" alt="Logo" class="store-logo" crossorigin="anonymous" onerror="this.style.display='none'" />` : ''}
                <div class="store-name">${storeName}</div>
                <div class="report-title">Income Report</div>
                <div class="report-meta">
                    Generated: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    ${reportData?.filters?.from_date && reportData?.filters?.to_date ? `<br>Period: ${reportData.filters.from_date} to ${reportData.filters.to_date}` : ''}
                </div>
            </div>
            
            <div class="summary-section">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total Income</div>
                        <div class="summary-value">৳${Number(totalIncome).toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Transactions</div>
                        <div class="summary-value">${totalTransactions}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Average Income</div>
                        <div class="summary-value">৳${Number(averageIncome).toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Cash / Digital</div>
                        <div class="summary-value">${cashPayments} / ${digitalPayments}</div>
                    </div>
                </div>
            </div>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th class="col-sl">SL</th>
                        <th class="col-ref">Reference No</th>
                        <th class="col-income-for">Income For</th>
                        <th class="col-store">Store</th>
                        <th class="col-category">Category</th>
                        <th class="col-brand">Brand</th>
                        <th class="col-payment">Payment</th>
                        <th class="col-amount">Amount</th>
                        <th class="col-date">Date & Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${(reportData?.items ?? [])
                        .map((item: any) => {
                            const incomeDate = new Date(item.income_date);
                            return `
                                <tr>
                                    <td class="col-sl text-center">${item.sl}</td>
                                    <td class="col-ref">${item.reference_no}</td>
                                    <td class="col-income-for">${item.income_for || 'Walk-in Customer'}</td>
                                    <td class="col-store">${item.store}</td>
                                    <td class="col-category">${item.category}</td>
                                    <td class="col-brand">${item.brand}</td>
                                    <td class="col-payment text-center">
                                        <span class="payment-type">${item.payment_type}</span>
                                    </td>
                                    <td class="col-amount text-right">৳${Number(item.amount).toFixed(2)}</td>
                                    <td class="col-date">
                                        ${incomeDate.toLocaleDateString('en-GB')}<br>
                                        <span style="color: #666; font-size: 7pt;">
                                            ${incomeDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                </tr>`;
                        })
                        .join('')}
                </tbody>
            </table>
            
            <div class="report-footer">
                <strong>${storeName}</strong> - Income Report<br>
                This is a computer-generated report. No signature required.
            </div>
        </body>
        </html>
    `;
};

/**
 * Handle Print - Opens browser print dialog for Income Report
 */
export const handlePrint = async (reportData: any, currentStore: { store_name: string; logo_path?: string } | null) => {
    try {
        const printContent = generatePrintableContent(reportData, currentStore);
        console.log(reportData);
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
 * Handle CSV Export for Income Report
 */
export const handleExportCSV = (reportData: any, currentStore: { store_name: string; logo_path?: string } | null) => {
    try {
        const storeName = currentStore?.store_name || 'Store Name';

        // Client-side summary calculations
        const totalIncome = reportData?.summary?.total_income ?? 0;
        const totalTransactions = reportData?.summary?.transactions ?? 0;
        const averageIncome = totalTransactions > 0 ? totalIncome / totalTransactions : 0;
        const cashPayments = reportData?.items?.filter((r: any) => r.payment_type?.toLowerCase() === 'cash').length ?? 0;
        const digitalPayments = totalTransactions - cashPayments;

        // CSV Headers
        const headers = ['SL', 'Reference No', 'Income For', 'Store', 'Category', 'Brand', 'Payment Type', 'Amount', 'Date'];

        // CSV Rows
        const rows = (reportData?.items ?? []).map((item: any) => {
            const incomeDate = new Date(item.income_date);
            return [
                item.sl,
                item.reference_no,
                item.income_for || 'Walk-in Customer',
                item.store,
                item.category,
                item.brand,
                item.payment_type || 'N/A',
                Number(item.amount).toFixed(2),
                incomeDate.toLocaleDateString('en-GB'),
            ];
        });

        // Add summary rows at the end
        const summaryRows = [
            [],
            ['SUMMARY'],
            ['Total Income', `৳${Number(totalIncome).toFixed(2)}`],
            ['Total Transactions', totalTransactions],
            ['Average Income', `৳${Number(averageIncome).toFixed(2)}`],
            ['Cash Payments', cashPayments],
            ['Digital Payments', digitalPayments],
        ];

        // Combine all rows
        const csvContent = [
            [`${storeName} - Income Report`],
            [`Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`],
            reportData?.filters?.from_date ? [`Period: ${reportData.filters.from_date} to ${reportData.filters.to_date}`] : [],
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

        const filename = `income-report-${new Date().toISOString().split('T')[0]}.csv`;
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
 * Handle PDF Export for Income Report using html2canvas and jsPDF
 */
export const handleExportPDF = async (reportData: any, currentStore: { store_name: string; logo_path?: string } | null) => {
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

        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for render

        const frameElement = printFrame.contentDocument?.body || frameDoc.body;
        if (!frameElement) throw new Error('Could not access frame body');

        // Capture with html2canvas
        const canvas = await html2canvas(frameElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
        });

        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add subsequent pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save PDF
        const filename = `income-report-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(printFrame);
        }, 1000);

        console.log('✅ PDF exported:', filename);

        return { success: true, filename };
    } catch (error) {
        console.error('❌ PDF export failed:', error);
        throw error;
    }
};
