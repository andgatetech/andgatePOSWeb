import type { Metadata } from 'next';
import UserGuideClient from './UserGuideClient';

export const metadata: Metadata = {
    title: 'AndgateBOS User Guide | Complete Business OS Training',
    description: 'Step-by-step AndgateBOS Business OS guide for Bangladeshi SME business owners, managers, cashiers, inventory teams, HR teams, ecommerce operators, and accountants.',
};

export default function UserGuidePage() {
    return <UserGuideClient />;
}
