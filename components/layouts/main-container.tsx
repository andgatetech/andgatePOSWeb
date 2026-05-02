'use client';
import { RootState } from '@/store';
import React from 'react';
import { useSelector } from 'react-redux';

const MainContainer = ({ children }: { children: React.ReactNode }) => {
    const themeConfig = useSelector((state: RootState) => state.themeConfig);
    return (
        <div className={`${themeConfig.menu} ${themeConfig.navbar} ${themeConfig.sidebar ? 'toggle-sidebar' : ''} main-container min-h-screen text-black dark:text-white-dark`}>
            {children}
        </div>
    );
};

export default MainContainer;
