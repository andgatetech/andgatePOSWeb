type ReservedPdfWindow = Window | null;

const isBrowser = () => typeof window !== 'undefined' && typeof navigator !== 'undefined';

export const isMobilePdfDownloadRisk = (): boolean => {
    if (!isBrowser()) return false;

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    const isIOS = /iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isMobileUA = /Mobile|Tablet|CriOS|FxiOS/i.test(ua);
    const isStandalonePwa = window.matchMedia?.('(display-mode: standalone)').matches || Boolean((navigator as any).standalone);

    return isIOS || isAndroid || isMobileUA || isStandalonePwa;
};

export const reservePdfWindow = (filename = 'document.pdf'): ReservedPdfWindow => {
    if (!isMobilePdfDownloadRisk()) return null;

    const reservedWindow = window.open('', '_blank');
    if (!reservedWindow) return null;

    reservedWindow.document.write(`<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${filename}</title>
    <style>
        body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f8fafc;color:#0f172a}
        div{padding:24px;text-align:center}
        p{margin:8px 0 0;color:#64748b}
    </style>
</head>
<body><div><strong>Preparing PDF...</strong><p>Please wait.</p></div></body>
</html>`);
    reservedWindow.document.close();

    return reservedWindow;
};

export const closeReservedPdfWindow = (reservedWindow?: ReservedPdfWindow) => {
    try {
        if (reservedWindow && !reservedWindow.closed) reservedWindow.close();
    } catch {
        // Ignore cross-browser close restrictions.
    }
};

export const openPdfBlob = (blob: Blob, filename: string, reservedWindow?: ReservedPdfWindow): boolean => {
    if (!isBrowser()) return false;

    const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);

    setTimeout(() => URL.revokeObjectURL(url), 60_000);

    try {
        if (reservedWindow && !reservedWindow.closed) {
            reservedWindow.document.title = filename;
            reservedWindow.location.href = url;
            return true;
        }

        if (isMobilePdfDownloadRisk()) {
            window.location.assign(url);
            return true;
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
    } catch {
        return false;
    }
};

export const downloadPdfMake = (pdfDoc: any, filename: string, reservedWindow?: ReservedPdfWindow): Promise<void> =>
    new Promise((resolve, reject) => {
        if (!pdfDoc) {
            closeReservedPdfWindow(reservedWindow);
            reject(new Error('PDF document is not ready.'));
            return;
        }

        if (reservedWindow || isMobilePdfDownloadRisk()) {
            pdfDoc.getBlob((blob: Blob) => {
                const opened = openPdfBlob(blob, filename, reservedWindow);
                if (!opened) {
                    closeReservedPdfWindow(reservedWindow);
                    reject(new Error('PDF open failed.'));
                    return;
                }
                resolve();
            });
            return;
        }

        pdfDoc.download(filename);
        resolve();
    });

export const downloadJsPdf = (doc: any, filename: string, reservedWindow?: ReservedPdfWindow) => {
    if (reservedWindow || isMobilePdfDownloadRisk()) {
        const blob = doc.output('blob') as Blob;
        const opened = openPdfBlob(blob, filename, reservedWindow);
        if (!opened) throw new Error('PDF open failed.');
        return;
    }

    doc.save(filename);
};
