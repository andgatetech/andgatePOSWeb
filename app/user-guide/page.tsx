import type { Metadata } from 'next';
import UserGuideClient from './UserGuideClient';

export const metadata: Metadata = {
    title: 'AndgatePOS User Guide | Complete POS Training',
    description: 'Step-by-step AndgatePOS user guide for Bangladeshi SME business owners, managers, cashiers, inventory teams, and accountants.',
};

export default function UserGuidePage() {
    return <UserGuideClient />;
}
