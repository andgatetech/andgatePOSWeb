'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function QrCodeTable({ qrCodes }: { qrCodes: any[] }) {
    // PDF Generation: quantity অনুযায়ী QR loop
    const handleGeneratePdf = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        let x = 10;
        let y = 20;
        const cellSize = 50; // QR code box size
        const margin = 10;
        const perRow = 3; // প্রতি রোতে কতটি QR

        for (const item of qrCodes) {
            // প্রোডাক্ট নাম
            pdf.setFontSize(14);
            pdf.text(item.product_name + ' (x' + item.quantity + ')', 10, y);
            y += 10;

            // QR image load
            const pngData = await new Promise<string>((resolve) => {
                const img = new Image();
                img.src = item.qrcode; // data:image/svg+xml;base64,...
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
            });

            // quantity অনুযায়ী QR loop
            for (let i = 0; i < item.quantity; i++) {
                // পেজ overflow check
                if (y + cellSize > pageHeight - 10) {
                    pdf.addPage();
                    x = 10;
                    y = 20;
                }

                pdf.addImage(pngData, 'PNG', x, y, cellSize, cellSize);
                x += cellSize + margin;

                // প্রতি row শেষে reset
                if ((i + 1) % perRow === 0) {
                    x = 10;
                    y += cellSize + margin;
                }
            }

            // পরবর্তী প্রোডাক্টের জন্য position reset
            if (x !== 10) {
                x = 10;
                y += cellSize + margin;
            }

            // পেজ overflow check
            if (y > pageHeight - 20) {
                pdf.addPage();
                y = 20;
            }
        }

        pdf.save('qrcodes.pdf');
    };

    if (!qrCodes.length) {
        return <div className="text-gray-500">No QR Codes generated yet</div>;
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h5 className="text-lg font-semibold">QR Codes</h5>
                <button className="btn btn-success" onClick={handleGeneratePdf}>
                    Generate PDF
                </button>
            </div>
            <table className="table w-full border">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Qr Quantity</th>
                        <th>QR Preview</th>
                    </tr>
                </thead>
                <tbody>
                    {qrCodes.map((q) => (
                        <tr key={q.productId} className="border-b">
                            <td>{q.product_name}</td>
                            <td>{q.quantity}</td>
                            <td>
                                <img src={q.qrcode} alt="QR" className="h-16 w-16" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
