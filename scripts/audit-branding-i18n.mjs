import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
    'app',
    'components',
    'public/resources',
];

const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.md']);
const skipParts = new Set(['node_modules', '.next', 'out', 'coverage', 'playwright-report', 'test-results']);

const oldBrandPattern = /\b(?:AndgatePOS|Andgate POS|AndGate POS|AndGate-next)\b/g;
const literalPatterns = [
    />\s*([A-Z][A-Za-z0-9 ,.'!?&()/:%-]{3,})\s*</g,
    /\b(?:title|aria-label|placeholder)=["']([A-Z][^"']{3,})["']/g,
];

const allowText = [
    /^VAT\b/,
    /^BIN\b/,
    /^SKU\b/,
    /^PDF\b/,
    /^CSV\b/,
    /^HTML\b/,
    /^HTTP\b/,
    /^POST\b/,
    /^GET\b/,
    /^Pathao$/,
    /^RedX$/,
    /^Steadfast$/,
    /^WhatsApp$/,
    /^Hawkeri$/,
    /^OpenStreetMap$/,
    /^Andgate$/,
    /^AndgateBOS\b/,
    /^Andgate Technologies$/,
    /^Mushak\b/,
    /^N\/A$/,
    /^Generic HTTP$/,
    /^ZKTeco HTTP$/,
    /^Suprema HTTP$/,
    /^Solar Icon$/,
    /^Line Duotone$/,
    /^Bold Duotone$/,
    /^Litecoin$/,
    /^Promise$/,
];

const allowPath = [
    /public\/resources\/andgatepos-user-guide-(en|bn)\.md$/,
    /app\/promotion\//,
    /app\/affiliate\//,
    /app\/about\//,
    /app\/contact\//,
    /app\/training\//,
    /app\/user-guide\//,
    /app\/features\//,
];

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (skipParts.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, files);
        else if (exts.has(path.extname(entry.name))) files.push(full);
    }
    return files;
}

function lineOf(content, index) {
    return content.slice(0, index).split('\n').length;
}

function isAllowedText(text) {
    const compact = text.trim().replace(/\s+/g, ' ');
    return allowText.some((pattern) => pattern.test(compact));
}

function stripComments(content) {
    return content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((line) => !line.trimStart().startsWith('//'))
        .join('\n');
}

const files = targets.flatMap((target) => {
    const full = path.join(root, target);
    return fs.existsSync(full) ? walk(full) : [];
});

const findings = [];

for (const file of files) {
    const rel = path.relative(root, file);
    const rawContent = fs.readFileSync(file, 'utf8');
    const content = stripComments(rawContent);

    for (const match of content.matchAll(oldBrandPattern)) {
        findings.push({
            type: 'old-brand',
            file: rel,
            line: lineOf(content, match.index ?? 0),
            text: match[0],
        });
    }

    if (allowPath.some((pattern) => pattern.test(rel))) continue;

    for (const pattern of literalPatterns) {
        for (const match of content.matchAll(pattern)) {
            const text = (match[1] || '').trim().replace(/\s+/g, ' ');
            if (!text || isAllowedText(text)) continue;
            if (/^[A-Z0-9_ -]+$/.test(text) && text.length <= 8) continue;
            findings.push({
                type: 'hardcoded-english',
                file: rel,
                line: lineOf(content, match.index ?? 0),
                text,
            });
        }
    }
}

const grouped = findings.slice(0, 200);
for (const finding of grouped) {
    console.log(`${finding.type}\t${finding.file}:${finding.line}\t${finding.text}`);
}

console.log(`\nBrand/i18n audit findings: ${findings.length}`);
if (findings.length > grouped.length) {
    console.log(`Showing first ${grouped.length}.`);
}

if (process.argv.includes('--fail-on-findings') && findings.length > 0) {
    process.exitCode = 1;
}
