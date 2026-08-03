'use client';

import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import Footer from '../terms-of-service/Footer';
import AppsClient from './AppsClient';

export default function AppsPage() {
    return (
        <MainLayout>
            <AppsClient />
            <Footer />
        </MainLayout>
    );
}
