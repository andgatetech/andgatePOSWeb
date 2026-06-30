'use client';

import { createTranslation, getTranslation } from '@/i18n';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export interface TranslationContextValue {
    t: ReturnType<typeof createTranslation>['t'];
    i18n: ReturnType<typeof createTranslation>['i18n'];
    data: ReturnType<typeof createTranslation>['data'];
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({ initialLang, children }: { initialLang: string; children: ReactNode }) {
    const [language, setLanguage] = useState(initialLang);

    const value = useMemo(() => {
        const { t, i18n, data } = createTranslation(language);
        return {
            t,
            data,
            i18n: {
                ...i18n,
                changeLanguage: (newLang: string) => {
                    i18n.changeLanguage(newLang);
                    setLanguage(newLang);
                },
            },
        };
    }, [language]);

    return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation(): TranslationContextValue {
    const context = useContext(TranslationContext);
    if (context) {
        return context;
    }
    return getTranslation() as TranslationContextValue;
}
