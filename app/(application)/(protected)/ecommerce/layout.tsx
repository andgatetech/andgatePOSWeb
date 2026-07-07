'use client';

import { PackageGate } from '@/components/packages/PackageGate';

/**
 * Gates every /ecommerce/* page behind the ecommerce.manage subscription feature.
 * Rendered inside the normal sidebar/header layout (unlike the reactive 403 →
 * redirect-to-/subscription flow), so a Starter account sees an inline upgrade
 * prompt right where they navigated, instead of being bounced to a standalone page.
 */
export default function EcommerceLayout({ children }: { children: React.ReactNode }) {
    return <PackageGate featureSlug="ecommerce.manage">{children}</PackageGate>;
}
