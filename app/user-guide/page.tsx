import type { Metadata } from 'next';
import UserGuideClient from './UserGuideClient';

export const metadata: Metadata = {
    title: 'AndgatePOS User Guide | Complete Business OS Training',
    description: 'Step-by-step AndgatePOS Business OS guide for Bangladeshi SME business owners, managers, cashiers, inventory teams, HR teams, ecommerce operators, and accountants.',
};

export default function UserGuidePage() {
    return <UserGuideClient />;
}
