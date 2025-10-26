import { createSlice } from '@reduxjs/toolkit';
import themeConfig from '@/theme.config';

const initialState = {
    isDarkMode: false,
    sidebar: false,
    theme: themeConfig.theme,
    menu: themeConfig.menu,
    layout: themeConfig.layout,
    rtlClass: themeConfig.rtlClass,
    animation: themeConfig.animation,
    navbar: themeConfig.navbar,
    locale: themeConfig.locale,
    semidark: themeConfig.semidark,
    // languageList: [
    //     { code: 'zh', name: 'Chinese' },
    //     { code: 'bn', name: 'Bengali' },
    //     { code: 'da', name: 'Danish' },
    //     { code: 'en', name: 'English' },
    //     { code: 'fr', name: 'French' },
    //     { code: 'de', name: 'German' },
    //     { code: 'el', name: 'Greek' },
    //     { code: 'hu', name: 'Hungarian' },
    //     { code: 'it', name: 'Italian' },
    //     { code: 'ja', name: 'Japanese' },
    //     { code: 'pl', name: 'Polish' },
    //     { code: 'pt', name: 'Portuguese' },
    //     { code: 'ru', name: 'Russian' },
    //     { code: 'es', name: 'Spanish' },
    //     { code: 'sv', name: 'Swedish' },
    //     { code: 'tr', name: 'Turkish' },
    //     { code: 'ae', name: 'Arabic' },
    // ],
    languageList: [
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
        { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
        { code: 'da', name: 'Danish', flag: '🇩🇰' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'el', name: 'Greek', flag: '🇬🇷' },
        { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
        { code: 'it', name: 'Italian', flag: '🇮🇹' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'pl', name: 'Polish', flag: '🇵🇱' },
        { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
        { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
        { code: 'ae', name: 'Arabic', flag: '🇦🇪' },
    ],
};

const themeConfigSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        toggleTheme(state, { payload }) {
            payload = payload || state.theme; // light | dark | system
            localStorage.setItem('theme', payload);
            state.theme = payload;
            if (payload === 'light') {
                state.isDarkMode = false;
            } else if (payload === 'dark') {
                state.isDarkMode = true;
            } else if (payload === 'system') {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    state.isDarkMode = true;
                } else {
                    state.isDarkMode = false;
                }
            }

            if (state.isDarkMode) {
                document.querySelector('body')?.classList.add('dark');
            } else {
                document.querySelector('body')?.classList.remove('dark');
            }
        },
        toggleMenu(state, { payload }) {
            payload = payload || state.menu; // vertical, collapsible-vertical, horizontal
            localStorage.setItem('menu', payload);
            state.menu = payload;
        },
        toggleLayout(state, { payload }) {
            payload = payload || state.layout; // full, boxed-layout
            localStorage.setItem('layout', payload);
            state.layout = payload;
        },
        toggleRTL(state, { payload }) {
            payload = payload || state.rtlClass; // rtl, ltr
            localStorage.setItem('rtlClass', payload);
            state.rtlClass = payload;
            document.querySelector('html')?.setAttribute('dir', state.rtlClass || 'ltr');
        },
        toggleAnimation(state, { payload }) {
            payload = payload || state.animation; // animate__fadeIn, animate__fadeInDown, animate__fadeInUp, animate__fadeInLeft, animate__fadeInRight, animate__slideInDown, animate__slideInLeft, animate__slideInRight, animate__zoomIn
            payload = payload?.trim();
            localStorage.setItem('animation', payload);
            state.animation = payload;
        },
        toggleNavbar(state, { payload }) {
            payload = payload || state.navbar; // navbar-sticky, navbar-floating, navbar-static
            localStorage.setItem('navbar', payload);
            state.navbar = payload;
        },
        toggleSemidark(state, { payload }) {
            payload = payload === true || payload === 'true' ? true : false;
            localStorage.setItem('semidark', payload);
            state.semidark = payload;
        },
        toggleSidebar(state) {
            state.sidebar = !state.sidebar;
        },
        resetToggleSidebar(state) {
            state.sidebar = false;
        },
    },
});

export const { toggleTheme, toggleMenu, toggleLayout, toggleRTL, toggleAnimation, toggleNavbar, toggleSemidark, toggleSidebar, resetToggleSidebar } = themeConfigSlice.actions;

export default themeConfigSlice.reducer;
