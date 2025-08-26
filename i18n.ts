// i18n.ts
import UniversalCookie from 'universal-cookie';

// Import all locales
import en from '@/public/locales/en.json';
import ae from '@/public/locales/ae.json';
import da from '@/public/locales/da.json';
import de from '@/public/locales/de.json';
import el from '@/public/locales/el.json';
import es from '@/public/locales/es.json';
import fr from '@/public/locales/fr.json';
import hu from '@/public/locales/hu.json';
import it from '@/public/locales/it.json';
import ja from '@/public/locales/ja.json';
import pl from '@/public/locales/pl.json';
import pt from '@/public/locales/pt.json';
import ru from '@/public/locales/ru.json';
import sv from '@/public/locales/sv.json';
import tr from '@/public/locales/tr.json';
import zh from '@/public/locales/zh.json';

// Mapping locale codes to JSON data
const langObj: Record<string, Record<string, string>> = {
    en,
    ae,
    da,
    de,
    el,
    es,
    fr,
    hu,
    it,
    ja,
    pl,
    pt,
    ru,
    sv,
    tr,
    zh,
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

export const getTranslation = () => {
    const lang = getLang();
    const data: Record<string, string> = langObj[lang] || langObj['en'];

    // Translation function
    const t = (key: string) => data[key] ?? key;

    // i18n object for language management
    const i18n = {
        language: lang,
        changeLanguage: (newLang: string) => {
            if (typeof window !== 'undefined') {
                const cookies = new UniversalCookie();
                cookies.set('i18nextLng', newLang, { path: '/' });
            }
        },
    };

    // Initialize locale with default fallback
    const initLocale = (defaultLocale: string) => {
        i18n.changeLanguage(lang || defaultLocale);
    };

    return { t, i18n, initLocale };
};