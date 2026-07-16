'use client';

import { useEffect } from 'react';
import UniversalCookie from 'universal-cookie';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const SKIP_SELECTOR = [
    'script',
    'style',
    'noscript',
    'input',
    'textarea',
    'select',
    'option',
    'code',
    'pre',
    'kbd',
    'samp',
    'canvas',
    'svg',
    '[contenteditable="true"]',
    '[data-no-localize-digits]',
].join(',');

// Only localize digit runs that aren't part of an alphanumeric identifier (SKU, product
// name, order code, etc.) — a digit run touching a Latin letter (e.g. "GAD260754", "E2E",
// "SKU-20F7") is left untouched; a standalone number (price, quantity, date, phone) is not.
const toBanglaDigits = (value: string) =>
    value.replace(/\d+/g, (run, offset: number, full: string) => {
        const before = full[offset - 1] || '';
        const after = full[offset + run.length] || '';
        if (/[A-Za-z]/.test(before) || /[A-Za-z]/.test(after)) return run;
        return run.replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);
    });

const getStoredLanguage = () => {
    try {
        return window.localStorage.getItem('i18nextLng');
    } catch {
        return null;
    }
};

const getCurrentLanguage = () => {
    const cookieLang = new UniversalCookie().get('i18nextLng');
    const storedLang = getStoredLanguage();
    return (cookieLang || storedLang || 'bn').replace('_', '-').split('-')[0];
};

const shouldSkipTextNode = (node: Text) => {
    const parent = node.parentElement;
    return !parent || Boolean(parent.closest(SKIP_SELECTOR));
};

const localizeTextNode = (node: Text) => {
    if (shouldSkipTextNode(node)) return;
    const nextValue = toBanglaDigits(node.nodeValue || '');
    if (nextValue !== node.nodeValue) {
        node.nodeValue = nextValue;
    }
};

const localizeTree = (root: Node) => {
    if (root.nodeType === Node.TEXT_NODE) {
        localizeTextNode(root as Text);
        return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root instanceof Element && root.closest(SKIP_SELECTOR)) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
        localizeTextNode(current as Text);
        current = walker.nextNode();
    }
};

const GlobalDigitLocalizer = () => {
    useEffect(() => {
        if (getCurrentLanguage() !== 'bn') return;

        document.documentElement.lang = 'bn';
        let frame = window.requestAnimationFrame(() => localizeTree(document.body));

        const observer = new MutationObserver((mutations) => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'characterData') {
                        localizeTree(mutation.target);
                        return;
                    }

                    mutation.addedNodes.forEach((node) => localizeTree(node));
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => {
            window.cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, []);

    return null;
};

export default GlobalDigitLocalizer;
