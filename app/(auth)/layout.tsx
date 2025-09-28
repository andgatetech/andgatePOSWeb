import { Metadata } from 'next';
import React from 'react';
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
        <div className="mt-1 min-h-screen text-black dark:text-white-dark">
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default AuthLayout;
