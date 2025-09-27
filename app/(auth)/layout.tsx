import React from 'react';
import { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
    title: {
        template: '%s | AndgatePOS System',
        default: 'Authentication - AndgatePOS System',
    },
    description: 'Sign in to your AndgatePOS account to access your point of sale system and manage your business operations.',
    robots: {
        index: false,
        follow: false,
    },
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen text-black mt-1 dark:text-white-dark">
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default AuthLayout;
