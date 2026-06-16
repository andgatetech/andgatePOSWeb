import { redirect } from 'next/navigation';

export default function AffiliateAdminLoginRedirectPage() {
    redirect('/login?redirect=/affiliate/admin');
}
