import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const localePath = path.join(rootDir, 'public', 'locales', 'en.json');
const scanDirs = ['app', 'components', 'lib', 'store'];
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx']);

if (!existsSync(localePath)) {
    console.error(`Missing locale file: ${path.relative(rootDir, localePath)}`);
    process.exit(1);
}

const locale = JSON.parse(readFileSync(localePath, 'utf8'));

function flattenKeys(value, prefix = '', keys = new Set()) {
    if (Array.isArray(value)) {
        if (prefix) keys.add(prefix);

        value.forEach((child, index) => {
            const nextPrefix = prefix ? `${prefix}.${index}` : String(index);
            keys.add(nextPrefix);
            flattenKeys(child, nextPrefix, keys);
        });

        return keys;
    }

    if (!value || typeof value !== 'object') {
        if (prefix) keys.add(prefix);
        return keys;
    }

    for (const [key, child] of Object.entries(value)) {
        const nextPrefix = prefix ? `${prefix}.${key}` : key;
        keys.add(nextPrefix);
        flattenKeys(child, nextPrefix, keys);
    }

    return keys;
}

function listSourceFiles(dir) {
    if (!existsSync(dir)) return [];

    const entries = readdirSync(dir);
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            if (['.next', 'node_modules'].includes(entry)) continue;
            files.push(...listSourceFiles(fullPath));
            continue;
        }

        if (stats.isFile() && extensions.has(path.extname(entry))) {
            files.push(fullPath);
        }
    }

    return files;
}

function findTranslationCalls(source) {
    const keys = [];
    const callPattern = /\bt\s*\(\s*(["'`])([^"'`${}]+)\1/g;
    let match;

    while ((match = callPattern.exec(source)) !== null) {
        keys.push(match[2]);
    }

    return keys;
}

const localeKeys = flattenKeys(locale);
const missing = new Map();

for (const scanDir of scanDirs) {
    for (const file of listSourceFiles(path.join(rootDir, scanDir))) {
        const source = readFileSync(file, 'utf8');
        const relativeFile = path.relative(rootDir, file);

        for (const key of findTranslationCalls(source)) {
            if (localeKeys.has(key)) continue;

            if (!missing.has(key)) missing.set(key, []);
            missing.get(key).push(relativeFile);
        }
    }
}

if (missing.size > 0) {
    console.error(`Missing ${missing.size} translation key(s) in public/locales/en.json:\n`);

    for (const [key, files] of [...missing.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        const uniqueFiles = [...new Set(files)].sort();
        console.error(`- ${key}`);
        for (const file of uniqueFiles) {
            console.error(`  ${file}`);
        }
    }

    process.exit(1);
}

console.log(`All static t('key') calls resolve in public/locales/en.json (${localeKeys.size} keys checked).`);
