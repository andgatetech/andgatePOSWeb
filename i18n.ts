import UniversalCookie from 'universal-cookie';
// Import all locales
import bn from '@/public/locales/bn.json';
import en from '@/public/locales/en.json';
import { formatLocalizedNumber } from '@/lib/localized-number';

// Mapping locale codes to JSON data
const langObj: Record<string, any> = {
    en,
    bn,
};

const DEFAULT_LANG = 'bn';
const LANGUAGE_COOKIE = 'i18nextLng';
const LANGUAGE_STORAGE_KEY = 'i18nextLng';
const LANGUAGE_MAX_AGE = 60 * 60 * 24 * 365;

// Get current language (server or client)
const getLang = (): string => {
    if (typeof window === 'undefined') {
        return DEFAULT_LANG;
    } else {
        // Client-side
        const cookies = new UniversalCookie();
        const cookieLang = cookies.get(LANGUAGE_COOKIE);
        if (cookieLang) return cookieLang;

        const storedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLang) {
            cookies.set(LANGUAGE_COOKIE, storedLang, {
                path: '/',
                maxAge: LANGUAGE_MAX_AGE,
                sameSite: 'lax',
            });
            return storedLang;
        }

        return DEFAULT_LANG;
    }
};

// Helper function to get nested value from object using dot notation
const getNestedValue = (obj: any, path: string): any => {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }

    return current;
};

const createTranslation = (lang: string) => {
    const data: any = langObj[lang] || langObj[DEFAULT_LANG];
    // Translation function that supports both flat and nested keys
    const t = (key: string, options?: Record<string, string | number | null | undefined>): string => {
        let value: any;

        // First try direct access (for flat keys like "hero_title")
        if (key in data) {
            value = data[key];
        } else {
            // Then try nested access (for keys like "footer.brand.name")
            value = getNestedValue(data, key);
        }

        if (value === undefined) {
            return key;
        }

        if (typeof value !== 'string' || !options) {
            return value;
        }

        return value.replace(/\{\{(\w+)\}\}|\{(\w+)\}/g, (match, doubleBraceKey, singleBraceKey) => {
            const optionKey = doubleBraceKey || singleBraceKey;
            const optionValue = options[optionKey];
            if (optionValue === null || optionValue === undefined) return match;
            if (typeof optionValue === 'number') return formatLocalizedNumber(optionValue, lang);
            if (typeof optionValue === 'string' && /^-?\d+(\.\d+)?$/.test(optionValue.trim())) {
                return formatLocalizedNumber(optionValue, lang);
            }
            return String(optionValue);
        });
    };

    // i18n object for language management
    const i18n = {
        language: lang,
        changeLanguage: (newLang: string) => {
            if (typeof window !== 'undefined') {
                const cookies = new UniversalCookie();
                const currentLang = cookies.get(LANGUAGE_COOKIE) || window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

                // Only update and reload if the language actually changed
                if (currentLang !== newLang) {
                    cookies.set(LANGUAGE_COOKIE, newLang, {
                        path: '/',
                        maxAge: LANGUAGE_MAX_AGE,
                        sameSite: 'lax',
                    });
                    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
                    window.location.reload();
                }
            }
        },
    };

    // Initialize locale with default fallback
    const initLocale = (defaultLocale: string) => {
        i18n.changeLanguage(lang || defaultLocale);
    };

    return { t, i18n, initLocale, data };
};

export const getTranslation = () => createTranslation(getLang());

export const getServerTranslation = async () => {
    if (typeof window !== 'undefined') {
        return getTranslation();
    }

    const { cookies, headers } = await import('next/headers');
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get(LANGUAGE_COOKIE);
    const lang = langCookie?.value || headerStore.get('x-lang') || DEFAULT_LANG;

    return createTranslation(lang);
};
