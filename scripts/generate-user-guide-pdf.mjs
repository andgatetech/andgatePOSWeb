import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfmake = require('pdfmake/build/pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');

// Register default Roboto VFS first (required by pdfmake 0.3)
pdfmake.addVirtualFileSystem(vfsFonts);

const root = process.cwd();
const resourcesDir = path.join(root, 'public', 'resources');
const fontDir = path.join(root, 'public', 'fonts');

// Add Bengali fonts on top of the default VFS
const bnRegular = fs.readFileSync(path.join(fontDir, 'NotoSansBengali-Regular.ttf')).toString('base64');
const bnBold = fs.readFileSync(path.join(fontDir, 'NotoSansBengali-Bold.ttf')).toString('base64');
const bnSerifRegular = fs.readFileSync(path.join(fontDir, 'NotoSerifBengali-Regular.ttf')).toString('base64');
const bnSerifBold = fs.readFileSync(path.join(fontDir, 'NotoSerifBengali-Bold.ttf')).toString('base64');

pdfmake.addVirtualFileSystem({
    'NotoSansBengali-Regular.ttf': bnRegular,
    'NotoSansBengali-Bold.ttf': bnBold,
    'NotoSerifBengali-Regular.ttf': bnSerifRegular,
    'NotoSerifBengali-Bold.ttf': bnSerifBold,
});

pdfmake.addFonts({
    NotoSansBengali: {
        normal: 'NotoSansBengali-Regular.ttf',
        bold: 'NotoSansBengali-Bold.ttf',
        italics: 'NotoSansBengali-Regular.ttf',
        bolditalics: 'NotoSansBengali-Bold.ttf',
    },
    NotoSerifBengali: {
        normal: 'NotoSerifBengali-Regular.ttf',
        bold: 'NotoSerifBengali-Bold.ttf',
        italics: 'NotoSerifBengali-Regular.ttf',
        bolditalics: 'NotoSerifBengali-Bold.ttf',
    },
});

const guides = [
    {
        lang: 'en',
        input: path.join(resourcesDir, 'andgatepos-user-guide-en.md'),
        output: path.join(resourcesDir, 'andgatepos-user-guide-en.pdf'),
        title: 'AndgatePOS Complete User Guide',
        subtitle: 'Step-by-step guide for Bangladeshi SME business users',
    },
    {
        lang: 'bn',
        input: path.join(resourcesDir, 'andgatepos-user-guide-bn.md'),
        output: path.join(resourcesDir, 'andgatepos-user-guide-bn.pdf'),
        title: 'AndgatePOS পূর্ণাঙ্গ ব্যবহার নির্দেশিকা',
        subtitle: 'বাংলাদেশি SME ব্যবসার ব্যবহারকারীদের জন্য ধাপে ধাপে গাইড',
    },
];

const screenshotMap = [
    {
        match: /login|লগইন|dashboard|ড্যাশবোর্ড/i,
        image: 'public/assets/user-guide/current/desktop/dashboard/dashboard__dashboard.png',
        caption: { en: 'Dashboard after login', bn: 'লগইনের পর ড্যাশবোর্ড' },
    },
    {
        match: /pos|first sale|প্রথম বিক্র|বিক্রয়|বিক্রয়/i,
        image: 'public/assets/user-guide/current/desktop/pos/pos__pos.png',
        caption: { en: 'POS sales screen', bn: 'POS বিক্রয় স্ক্রিন' },
    },
    {
        match: /business os|cash closing|petty cash|attendance|service jobs|ক্যাশ ক্লোজিং|হাজিরা|সার্ভিস/i,
        image: 'public/assets/user-guide/current/desktop/business-os/business-os__business-os.png',
        caption: { en: 'Business OS daily operations', bn: 'Business OS দৈনিক অপারেশন' },
    },
    {
        match: /product|variant|barcode|stock|পণ্য|ভ্যারিয়েন্ট|ভ্যারিয়েন্ট|বারকোড|স্টক/i,
        image: 'public/assets/user-guide/current/desktop/product/products-create__products__create.png',
        caption: { en: 'Product setup screen', bn: 'পণ্য সেটআপ স্ক্রিন' },
    },
    {
        match: /purchase|supplier|পারচেজ|সাপ্লায়ার|সাপ্লায়ার/i,
        image: 'public/assets/user-guide/current/desktop/purchase/purchases-create__purchases__create.png',
        caption: { en: 'Purchase and supplier workflow', bn: 'পারচেজ ও সাপ্লায়ার workflow' },
    },
    {
        match: /crm|customer|কাস্টমার/i,
        image: 'public/assets/user-guide/current/desktop/customer/customers-crm__customers__crm.png',
        caption: { en: 'Customer CRM screen', bn: 'কাস্টমার CRM স্ক্রিন' },
    },
    {
        match: /report|profit|loss|হিসাব|রিপোর্ট|লাভ/i,
        image: 'public/assets/user-guide/current/desktop/reports-profit-loss/reports-profit-loss__reports__profit-loss.png',
        caption: { en: 'Profit and loss report', bn: 'লাভ-ক্ষতি রিপোর্ট' },
    },
    {
        match: /ecommerce|courier|ই-কমার্স|কুরিয়ার|কুরিয়ার/i,
        image: 'public/assets/user-guide/current/desktop/ecommerce/ecommerce-orders__ecommerce__orders.png',
        caption: { en: 'Ecommerce orders screen', bn: 'ই-কমার্স অর্ডার স্ক্রিন' },
    },
];

const cleanInlineMarkdown = (text) =>
    text
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^\s*>+\s?/, '')
        .replace(/[✅○→↓]/g, '')
        .trim();

const pushScreenshotOnce = (content, heading, lang, usedImages) => {
    const shot = screenshotMap.find((item) => item.match.test(heading));
    if (!shot || usedImages.has(shot.image)) return;
    const imagePath = path.join(root, shot.image);
    if (!fs.existsSync(imagePath)) return;
    const imageData = `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;

    usedImages.add(shot.image);
    content.push({
        image: imageData,
        width: 430,
        margin: [0, 8, 0, 4],
    });
    content.push({
        text: shot.caption[lang],
        style: 'caption',
        margin: [0, 0, 0, 8],
    });
};

const markdownToContent = (markdown, lang) => {
    const content = [];
    const usedImages = new Set();
    const lines = markdown.split(/\r?\n/);

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line === '---') continue;
        if (/^!\[/.test(line)) continue;

        const heading = line.match(/^(#{1,4})\s+(.+)$/);
        if (heading) {
            const level = heading[1].length;
            const text = cleanInlineMarkdown(heading[2]);
            content.push({
                text,
                style: level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4',
                pageBreak: level === 2 && content.length > 8 ? 'before' : undefined,
            });
            pushScreenshotOnce(content, text, lang, usedImages);
            continue;
        }

        const numbered = line.match(/^\d+[\.)]\s+(.+)$/);
        if (numbered) {
            content.push({ text: cleanInlineMarkdown(numbered[1]), style: 'listItem' });
            continue;
        }

        const bullet = line.match(/^[-*]\s+(.+)$/);
        if (bullet) {
            content.push({ text: cleanInlineMarkdown(bullet[1]), style: 'listItem' });
            continue;
        }

        content.push({ text: cleanInlineMarkdown(line), style: 'paragraph' });
    }

    return content;
};

const buildDoc = ({ lang, input, title, subtitle }) => {
    const markdown = fs.readFileSync(input, 'utf8');
    return {
        pageSize: 'A4',
        pageMargins: [44, 58, 44, 58],
        defaultStyle: {
            font: lang === 'bn' ? 'NotoSansBengali' : 'Roboto',
            fontSize: 10,
            lineHeight: 1.25,
        },
        footer(currentPage, pageCount) {
            return {
                columns: [
                    { text: 'AndgatePOS', margin: [44, 0, 0, 0], color: '#64748b', fontSize: 8 },
                    { text: `${currentPage} / ${pageCount}`, alignment: 'right', margin: [0, 0, 44, 0], color: '#64748b', fontSize: 8 },
                ],
            };
        },
        content: [
            { text: title, style: 'coverTitle' },
            { text: subtitle, style: 'coverSubtitle' },
            { text: 'andgatepos.com', style: 'coverUrl' },
            { text: lang === 'bn' ? 'এই PDF-টি selectable text দিয়ে তৈরি। প্রয়োজন হলে search, copy এবং print করা যাবে।' : 'This PDF is generated with selectable text, so users can search, copy, and print it.', style: 'note' },
            ...markdownToContent(markdown, lang),
        ],
        styles: {
            coverTitle: { fontSize: 24, bold: true, color: '#034d79', margin: [0, 0, 0, 8] },
            coverSubtitle: { fontSize: 13, color: '#475569', margin: [0, 0, 0, 4] },
            coverUrl: { fontSize: 10, color: '#046ca9', margin: [0, 0, 0, 18] },
            note: { fontSize: 9, color: '#64748b', margin: [0, 0, 0, 18] },
            h1: { fontSize: 21, bold: true, color: '#034d79', margin: [0, 12, 0, 8] },
            h2: { fontSize: 16, bold: true, color: '#046ca9', margin: [0, 12, 0, 6] },
            h3: { fontSize: 13, bold: true, color: '#0f172a', margin: [0, 8, 0, 5] },
            h4: { fontSize: 11, bold: true, color: '#334155', margin: [0, 6, 0, 4] },
            paragraph: { fontSize: 10, color: '#1e293b', margin: [0, 0, 0, 5] },
            listItem: { fontSize: 10, color: '#1e293b', margin: [14, 0, 0, 4] },
            caption: { fontSize: 8, color: '#64748b', italics: true, alignment: 'center' },
        },
    };
};

const writePdf = async (guide) => {
    const pdfDoc = pdfmake.createPdf(buildDoc(guide));
    const blob = await new Promise((resolve) => {
        pdfDoc.getBlob((b) => resolve(b));
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(guide.output, buffer);
};

for (const guide of guides) {
    await writePdf(guide);
    const sizeKb = Math.round(fs.statSync(guide.output).size / 1024);
    console.log(`Generated ${path.relative(root, guide.output)} (${sizeKb} KB)`);
}
