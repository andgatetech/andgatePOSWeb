import type { StockAdjustmentItem, AdjustmentConfig, GlobalAdjustmentConfig } from '@/store/features/StockAdjustment/stockAdjustmentSlice';

let _slipLoadPromise: Promise<void> | null = null;
let _slipBnLoaded = false;

const _ensureSlipPdf = (): Promise<void> => {
    if (_slipLoadPromise) return _slipLoadPromise;
    _slipLoadPromise = (async () => {
        try {
            // Explicitly register Roboto VFS — do not rely on window.pdfMake side-effect (unreliable in Next.js ESM)
            const pdfMake = (await import('pdfmake/build/pdfmake')).default;
            const vfsFonts: any = await import('pdfmake/build/vfs_fonts');
            pdfMake.addVirtualFileSystem(vfsFonts.default ?? vfsFonts);

            const toBase64 = (buf: ArrayBuffer) => {
                const bytes = new Uint8Array(buf);
                let bin = '';
                for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
                return btoa(bin);
            };

            try {
                const [reg, bold] = await Promise.all([
                    fetch('/fonts/NotoSansBengali-Regular.ttf').then((r) => r.arrayBuffer()),
                    fetch('/fonts/NotoSansBengali-Bold.ttf').then((r) => r.arrayBuffer()),
                ]);
                pdfMake.addVirtualFileSystem({
                    'NotoSansBengali-Regular.ttf': toBase64(reg),
                    'NotoSansBengali-Bold.ttf': toBase64(bold),
                });
                _slipBnLoaded = true;
            } catch {
                _slipBnLoaded = false;
            }

            pdfMake.addFonts({
                Roboto: {
                    normal: 'Roboto-Regular.ttf',
                    bold: 'Roboto-Medium.ttf',
                    italics: 'Roboto-Italic.ttf',
                    bolditalics: 'Roboto-MediumItalic.ttf',
                },
                ...(_slipBnLoaded ? {
                    NotoSansBengali: {
                        normal: 'NotoSansBengali-Regular.ttf',
                        bold: 'NotoSansBengali-Bold.ttf',
                        italics: 'NotoSansBengali-Regular.ttf',
                        bolditalics: 'NotoSansBengali-Bold.ttf',
                    },
                } : {}),
            });
        } catch {
            _slipLoadPromise = null;
        }
    })();
    return _slipLoadPromise;
};

const _fixNode = (n: any): any => {
    if (!n || typeof n !== 'object') return n;
    if (Array.isArray(n)) return n.map(_fixNode);
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
        } else if (hasBn) { o.font = 'NotoSansBengali'; }
    } else if (Array.isArray(o.text)) { o.text = o.text.map(_fixNode); }
    if (Array.isArray(o.stack)) o.stack = o.stack.map(_fixNode);
    if (Array.isArray(o.columns)) o.columns = o.columns.map(_fixNode);
    if (o.table?.body) o.table = { ...o.table, body: o.table.body.map((r: any[]) => r.map(_fixNode)) };
    return o;
};

export interface SlipStore {
    store_name?: string;
    store_location?: string;
    store_contact?: string;
    store_email?: string;
}

export async function printStockAdjustmentSlip(
    items: StockAdjustmentItem[],
    configsByItem: { [itemId: number]: AdjustmentConfig },
    globalConfig: GlobalAdjustmentConfig,
    store: SlipStore,
    reasonLabels: { [id: string]: string } = {}
) {
    await _ensureSlipPdf();
    const pdfMake = (await import('pdfmake/build/pdfmake')).default;

    const isBn = typeof document !== 'undefined'
        ? document.cookie.split(';').some((c) => c.trim().startsWith('i18nextLng=bn'))
        : false;
    const useBnFont = isBn && _slipBnLoaded;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    const refNo = 'SA-' + now.getTime().toString(36).toUpperCase();

    const resolveReason = (reason: string) => {
        if (!reason) return globalConfig.reason ? resolveReason(globalConfig.reason) : '-';
        if (!isNaN(Number(reason))) return reasonLabels[reason] || `Reason #${reason}`;
        return reason;
    };

    const tableBody: any[][] = [
        [
            { text: 'Product', style: 'tableHeader' },
            { text: 'Type', style: 'tableHeader' },
            { text: 'Qty', style: 'tableHeader', alignment: 'center' },
            { text: 'Reason', style: 'tableHeader' },
            { text: 'Notes', style: 'tableHeader' },
        ],
    ];

    let totalIncrease = 0;
    let totalDecrease = 0;
    let totalSerialOps = 0;

    for (const item of items) {
        const cfg = configsByItem[item.id];
        const productLabel = [item.title || item.name, item.variantName].filter(Boolean).join(' / ');

        if (item.has_serial) {
            const serials = cfg?.serialAdjustments || [];
            totalSerialOps += serials.length;
            const serialSummary = serials.length > 0
                ? serials.slice(0, 5).map((s: any) => `${s.serial_number} → ${s.status}`).join('\n') +
                  (serials.length > 5 ? `\n…+${serials.length - 5} more` : '')
                : 'No serials';
            tableBody.push([
                { text: productLabel, style: 'tableCell' },
                { text: 'Serial', style: 'tableCellCenter', color: '#7c3aed' },
                { text: String(serials.length), style: 'tableCellCenter' },
                { text: resolveReason(cfg?.reason || ''), style: 'tableCell' },
                { text: serialSummary || '-', style: 'tableCellSmall' },
            ]);
        } else if (cfg && cfg.adjustmentQuantity > 0) {
            const isIncrease = cfg.adjustmentType === 'increase';
            if (isIncrease) totalIncrease += cfg.adjustmentQuantity;
            else totalDecrease += cfg.adjustmentQuantity;
            tableBody.push([
                { text: productLabel, style: 'tableCell' },
                {
                    text: isIncrease ? '▲ Increase' : '▼ Decrease',
                    style: 'tableCellCenter',
                    color: isIncrease ? '#15803d' : '#dc2626',
                },
                { text: String(cfg.adjustmentQuantity), style: 'tableCellCenter' },
                { text: resolveReason(cfg.reason), style: 'tableCell' },
                { text: cfg.notes || globalConfig.notes || '-', style: 'tableCellSmall' },
            ]);
        }
    }

    const docDef: any = {
        pageSize: 'A4',
        pageMargins: [30, 30, 30, 50],
        defaultStyle: { font: 'Roboto', fontSize: 9 },
        styles: {
            title: { fontSize: 16, bold: true, color: '#1e3a5f' },
            subtitle: { fontSize: 9, color: '#6b7280' },
            sectionHeader: { fontSize: 10, bold: true, color: '#374151', margin: [0, 8, 0, 4] },
            tableHeader: { fontSize: 9, bold: true, fillColor: '#1e3a5f', color: '#ffffff', margin: [4, 4, 4, 4] },
            tableCell: { fontSize: 9, margin: [4, 3, 4, 3] },
            tableCellCenter: { fontSize: 9, margin: [4, 3, 4, 3], alignment: 'center' },
            tableCellSmall: { fontSize: 8, margin: [4, 3, 4, 3], color: '#6b7280' },
            summaryLabel: { fontSize: 9, color: '#6b7280' },
            summaryValue: { fontSize: 10, bold: true },
        },
        content: [
            // Header
            {
                columns: [
                    {
                        stack: [
                            { text: store.store_name || 'Store', style: 'title' },
                            ...(store.store_location?.replace(/[\s,;.|/-]/g, '').length
                                ? [{ text: store.store_location, style: 'subtitle' }]
                                : []),
                            ...(store.store_contact ? [{ text: `Tel: ${store.store_contact}`, style: 'subtitle' }] : []),
                        ],
                    },
                    {
                        stack: [
                            { text: 'STOCK ADJUSTMENT SLIP', style: 'title', alignment: 'right' },
                            { text: `Ref: ${refNo}`, style: 'subtitle', alignment: 'right' },
                            { text: `${dateStr}  ${timeStr}`, style: 'subtitle', alignment: 'right' },
                        ],
                    },
                ],
            },
            { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 535, y2: 4, lineWidth: 1, lineColor: '#1e3a5f' }], margin: [0, 8, 0, 8] },
            // Items table
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 70, 40, 100, '*'],
                    body: tableBody,
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0,
                    hLineColor: () => '#e5e7eb',
                    fillColor: (rowIndex: number) => (rowIndex > 0 && rowIndex % 2 === 0 ? '#f9fafb' : null),
                },
            },
            // Summary
            { text: 'Summary', style: 'sectionHeader' },
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        table: {
                            body: [
                                [
                                    { text: 'Total Items:', style: 'summaryLabel' },
                                    { text: String(items.length), style: 'summaryValue', alignment: 'right' },
                                ],
                                ...(totalIncrease > 0 ? [[
                                    { text: 'Total Increase:', style: 'summaryLabel', color: '#15803d' },
                                    { text: `+${totalIncrease}`, style: 'summaryValue', color: '#15803d', alignment: 'right' },
                                ]] : []),
                                ...(totalDecrease > 0 ? [[
                                    { text: 'Total Decrease:', style: 'summaryLabel', color: '#dc2626' },
                                    { text: `-${totalDecrease}`, style: 'summaryValue', color: '#dc2626', alignment: 'right' },
                                ]] : []),
                                ...(totalSerialOps > 0 ? [[
                                    { text: 'Serial Operations:', style: 'summaryLabel', color: '#7c3aed' },
                                    { text: String(totalSerialOps), style: 'summaryValue', color: '#7c3aed', alignment: 'right' },
                                ]] : []),
                            ],
                        },
                        layout: 'noBorders',
                    },
                ],
                margin: [0, 4, 0, 0],
            },
            ...(globalConfig.notes ? [
                { text: `Global Notes: ${globalConfig.notes}`, style: 'subtitle', margin: [0, 8, 0, 0] },
            ] : []),
        ],
        footer: (currentPage: number, pageCount: number) => ({
            text: `Page ${currentPage} of ${pageCount}  |  Generated by andgatePOS  |  ${dateStr}`,
            alignment: 'center',
            fontSize: 8,
            color: '#9ca3af',
            margin: [0, 10, 0, 0],
        }),
    };

    if (useBnFont) {
        docDef.content = (docDef.content as any[]).map(_fixNode);
    }

    const pdf = pdfMake.createPdf(docDef);
    pdf.print();
}
