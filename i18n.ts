import UniversalCookie from 'universal-cookie';
// Import all locales
import bn from '@/public/locales/bn.json';
import en from '@/public/locales/en.json';

// Mapping locale codes to JSON data
const langObj: Record<string, any> = {
    en,
    bn,
};

// Get current language (server or client)
const getLang = (): string => {
    if (typeof window === 'undefined') {
        // Server-side
        const { cookies } = require('next/headers');
        const langCookie = cookies().get('i18nextLng');
        return langCookie?.value || 'en';
    } else {
        // Client-side
        const cookies = new UniversalCookie();
        return cookies.get('i18nextLng') || 'en';
    }
};

// export const getLang = (): string => {
//     if (typeof window === 'undefined') {
//         const langCookie = cookies().get('i18nextLng');
//         return langCookie?.value || 'en';
//     } else {
//         const cookie = new (require('universal-cookie').default)();
//         return cookie.get('i18nextLng') || 'en';
//     }
// };

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

export const getTranslation = () => {
    const lang = getLang();
    const data: any = langObj[lang];

    // Translation function that supports both flat and nested keys
    const t = (key: string): string => {
        // First try direct access (for flat keys like "hero_title")
        if (key in data) {
            return data[key];
        }

        // Then try nested access (for keys like "footer.brand.name")
        const value = getNestedValue(data, key);

        // Return the value if found, otherwise return the key itself
        return value !== undefined ? value : key;
    };

    // i18n object for language management
    const i18n = {
        language: lang,
        changeLanguage: (newLang: string) => {
            if (typeof window !== 'undefined') {
                const cookies = new UniversalCookie();
                const currentLang = cookies.get('i18nextLng');

                // Only update and reload if the language actually changed
                if (currentLang !== newLang) {
                    cookies.set('i18nextLng', newLang, { path: '/' });
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
