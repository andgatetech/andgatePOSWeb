'use client';
import GlobalDigitLocalizer from '@/components/i18n/GlobalDigitLocalizer';
import { getTranslation } from '@/i18n';
import type { RootState } from '@/store';
import { toggleAnimation, toggleLayout, toggleMenu, toggleNavbar, toggleRTL, toggleSemidark, toggleTheme } from '@/store/themeConfigSlice';
import { PropsWithChildren, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const safeLocalStorageGet = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

function App({ children }: PropsWithChildren) {
    const themeConfig = useSelector((state: RootState) => state.themeConfig);
    const dispatch = useDispatch();
    const { initLocale } = getTranslation();
    useEffect(() => {
        dispatch(toggleTheme(safeLocalStorageGet('theme') || themeConfig.theme));
        dispatch(toggleMenu(safeLocalStorageGet('menu') || themeConfig.menu));
        dispatch(toggleLayout(safeLocalStorageGet('layout') || themeConfig.layout));
        dispatch(toggleRTL(safeLocalStorageGet('rtlClass') || themeConfig.rtlClass));
        dispatch(toggleAnimation(safeLocalStorageGet('animation') || themeConfig.animation));
        dispatch(toggleNavbar(safeLocalStorageGet('navbar') || themeConfig.navbar));
        dispatch(toggleSemidark(safeLocalStorageGet('semidark') || themeConfig.semidark));
        initLocale(themeConfig.locale);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className={`${(themeConfig.sidebar && 'toggle-sidebar') || ''} ${themeConfig.menu} ${themeConfig.layout} ${
                themeConfig.rtlClass
            } main-section relative font-nunito text-sm font-normal antialiased`}
        >
            <GlobalDigitLocalizer />
            {children}
        </div>
    );
}

export default App;
