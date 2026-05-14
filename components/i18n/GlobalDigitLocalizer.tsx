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

const toBanglaDigits = (value: string) => value.replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);

const getCurrentLanguage = () => {
    const cookieLang = new UniversalCookie().get('i18nextLng');
    const storedLang = window.localStorage.getItem('i18nextLng');
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
