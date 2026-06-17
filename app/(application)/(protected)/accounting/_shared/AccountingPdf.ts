import { closeReservedPdfWindow, downloadPdfMake, isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';

let _pdfPromise: Promise<any> | null = null;
let _bnLoaded = false;

export const ensureAccountingPdf = (): Promise<void> => {
    if (_bnLoaded) return Promise.resolve();
    if (_pdfPromise) return _pdfPromise;

    const blobToBase64 = (blob: Blob): Promise<string> =>
        new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res((r.result as string).split(',')[1]);
            r.onerror = rej;
            r.readAsDataURL(blob);
        });

    _pdfPromise = (async () => {
        try {
            const pmMod: any = await import('pdfmake/build/pdfmake');
            const pm = pmMod.default || pmMod;
            const vfsFonts: any = await import('pdfmake/build/vfs_fonts');
            pm.addVirtualFileSystem(vfsFonts.default ?? vfsFonts);

            const [rr, br] = await Promise.all([
                fetch('/fonts/NotoSansBengali-Regular.ttf'),
                fetch('/fonts/NotoSansBengali-Bold.ttf'),
            ]);
            if (rr.ok && br.ok) {
                const [rb64, bb64] = await Promise.all([rr.blob().then(blobToBase64), br.blob().then(blobToBase64)]);
                pm.addVirtualFileSystem({
                    'NotoSansBengali-Regular.ttf': rb64,
                    'NotoSansBengali-Bold.ttf': bb64,
                });
                pm.addFonts({
                    NotoSansBengali: {
                        normal: 'NotoSansBengali-Regular.ttf',
                        bold: 'NotoSansBengali-Bold.ttf',
                        italics: 'NotoSansBengali-Regular.ttf',
                        bolditalics: 'NotoSansBengali-Bold.ttf',
                    },
                });
                _bnLoaded = true;
            }
        } catch {
            _pdfPromise = null;
        }
    })();
    return _pdfPromise;
};

export const fixPdfNode = (n: any): any => {
    if (!n || typeof n !== 'object') return n;
    if (Array.isArray(n)) return n.map(fixPdfNode);
    const o: any = { ...n };
    if (typeof o.text === 'string' && o.text.length > 0) {
        const hasBn = /[ঀ-৿]/.test(o.text);
        const hasLatin = o.text.replace(/[ঀ-৿]/g, '').length > 0;
        if (hasBn && hasLatin) {
            const segs: any[] = [];
            let run = '', runBn = /[ঀ-৿]/.test(o.text[0]);
            for (const ch of o.text) {
                const isBn = /[ঀ-৿]/.test(ch);
                if (isBn === runBn) { run += ch; }
                else { if (run) segs.push({ text: run, font: runBn ? 'NotoSansBengali' : 'Roboto' }); run = ch; runBn = isBn; }
            }
            if (run) segs.push({ text: run, font: runBn ? 'NotoSansBengali' : 'Roboto' });
            o.text = segs; delete o.font;
        } else if (hasBn) {
            o.font = 'NotoSansBengali';
        }
    } else if (Array.isArray(o.text)) {
        o.text = o.text.map(fixPdfNode);
    }
    if (Array.isArray(o.stack)) o.stack = o.stack.map(fixPdfNode);
    if (Array.isArray(o.columns)) o.columns = o.columns.map(fixPdfNode);
    if (o.table?.body) o.table = { ...o.table, body: o.table.body.map((r: any[]) => r.map(fixPdfNode)) };
    return o;
};

export interface PdfHeaderInfo {
    storeName: string;
    storeContact: string;
    storeLocation: string;
    reportTitle: string;
    periodText: string;
    storeDisplayText: string;
    generatedText: string;
    tDoc: (key: string) => string;
    san: (text: string) => string;
    marginPts: number;
    usableW: number;
}

export const buildPdfHeader = (info: PdfHeaderInfo): any[] => {
    const { storeName, storeContact, storeLocation, reportTitle, periodText, storeDisplayText, generatedText, tDoc, san, marginPts, usableW } = info;
    return [
        {
            columns: [
                {
                    stack: [
                        { text: san(storeName), fontSize: 14, bold: true, color: '#1e1e1e', margin: [0, 0, 0, 3] },
                        ...(storeContact.trim() ? [{ text: `${tDoc('lbl_phone')}: ${san(storeContact)}`, fontSize: 8, color: '#666666' }] : []),
                        ...(storeLocation.replace(/[\s,;.|/-]/g, '').length > 0 ? [{ text: `${tDoc('lbl_address')}: ${san(storeLocation)}`, fontSize: 8, color: '#666666' }] : []),
                    ],
                    width: '*',
                },
                {
                    stack: [
                        { text: reportTitle, fontSize: 12, bold: true, color: '#3b82f6', alignment: 'right' },
                        { text: `${tDoc('lbl_period')}: ${san(periodText)}`, fontSize: 8, color: '#666666', alignment: 'right' },
                        { text: `${tDoc('lbl_store')}: ${san(storeDisplayText)}`, fontSize: 8, color: '#666666', alignment: 'right' },
                        { text: generatedText, fontSize: 8, color: '#666666', alignment: 'right' },
                    ],
                    width: '*',
                },
            ],
            columnGap: 10,
            margin: [0, 0, 0, 8],
        },
        {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: usableW, y2: 0, lineWidth: 0.5, lineColor: '#c8c8c8' }],
            margin: [0, 0, 0, 8],
        },
    ];
};

export const buildPdfFooter = (footerText: string, marginPts: number, tDoc: (key: string) => string) =>
    (currentPage: number, pageCount: number) => ({
        columns: [
            { text: footerText, margin: [marginPts, 5, 0, 0], fontSize: 7, color: '#999999' },
            { text: `${tDoc('lbl_page')} ${currentPage} ${tDoc('lbl_of')} ${pageCount}`, alignment: 'right', margin: [0, 5, marginPts, 0], fontSize: 7, color: '#999999' },
        ],
    });

export interface PdfColumnDef {
    key: string;
    label: string;
    width: number;
    numeric?: boolean;
}

export const computeColumnWidths = (columns: PdfColumnDef[], usableW: number): number[] => {
    const rawWidths = columns.map((c) => c.width);
    const rawTotal = rawWidths.reduce((s, w) => s + w, 0);
    const colWidths = rawWidths.map((w) => Math.floor((w / rawTotal) * usableW * 100) / 100);
    const widthDiff = usableW - colWidths.reduce((s, w) => s + w, 0);
    colWidths[colWidths.length - 1] = Math.max(12, colWidths[colWidths.length - 1] + widthDiff);
    return colWidths;
};

export const clampPdfText = (value: string, maxLength = 90): string => {
    if (!value) return '';
    const normalized = String(value).replace(/\s+/g, ' ').trim();
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
};

export const sanText = (text: string, useBnFont: boolean): string => {
    if (!text) return '';
    if (useBnFont) return String(text);
    return String(text).replace(/[^\x00-\x7F]/g, '');
};

export const buildTableLayout = (hasTotals: boolean, cellPad = 2.5) => ({
    hLineWidth: () => 0.1,
    vLineWidth: () => 0.1,
    hLineColor: () => '#e6e6e6',
    vLineColor: () => '#e6e6e6',
    fillColor: (rowIndex: number, node: any) => {
        if (rowIndex === 0) return '#3b82f6';
        if (hasTotals && rowIndex === node.table.body.length - 1) return '#dce6f5';
        return (rowIndex - 1) % 2 === 0 ? null : '#f8fafc';
    },
    paddingLeft: () => cellPad,
    paddingRight: () => cellPad,
    paddingTop: () => cellPad + 0.5,
    paddingBottom: () => cellPad + 0.5,
});

export const buildHeaderRow = (columns: PdfColumnDef[], fontSize = 7.5): any[] =>
    columns.map((col) => ({
        text: clampPdfText(col.label, 28),
        bold: true,
        color: '#ffffff',
        fontSize,
        alignment: col.numeric ? 'right' : 'left',
        noWrap: false,
    }));

export const buildDataRows = (
    rows: any[],
    columns: PdfColumnDef[],
    formatValue: (row: any, col: PdfColumnDef) => string,
    fontSize = 7.5
): any[][] =>
    rows.map((row) =>
        columns.map((col) => ({
            text: clampPdfText(formatValue(row, col), col.numeric ? 26 : 70),
            alignment: col.numeric ? 'right' : 'left',
            fontSize,
            noWrap: false,
        }))
    );

export const buildTotalsRow = (
    columns: PdfColumnDef[],
    getTotal: (col: PdfColumnDef, idx: number) => string,
    tDoc: (key: string) => string,
    fontSize = 8
): any[] =>
    columns.map((col, idx) => {
        let txt = '';
        if (idx === 0) txt = tDoc('lbl_total').toUpperCase();
        else txt = getTotal(col, idx);
        return {
            text: clampPdfText(txt, 28),
            bold: true,
            alignment: col.numeric ? 'right' : 'left',
            fontSize,
            noWrap: false,
        };
    });

export const outputPdf = async (
    docDefinition: any,
    useBnFont: boolean,
    mode: 'download' | 'print',
    fileName: string,
    reservedPdfWindow?: Window | null,
    footerFn?: (...args: any[]) => any
) => {
    if (useBnFont) {
        docDefinition.content = (docDefinition.content as any[]).map(fixPdfNode);
        if (footerFn) {
            const _origFooter = footerFn;
            docDefinition.footer = (...args: any[]) => fixPdfNode(_origFooter(...args));
        }
    }

    const pmMod: any = await import('pdfmake/build/pdfmake');
    const pm = pmMod.default || pmMod;
    if (!pm) return;

    const pdf = pm.createPdf(docDefinition);
    if (mode === 'print' && !isMobilePdfDownloadRisk()) {
        pdf.print();
    } else {
        await downloadPdfMake(pdf, fileName, reservedPdfWindow);
    }
};
