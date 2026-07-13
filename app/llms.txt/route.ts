import { getAppUrl } from '@/lib/seo-config';

export const dynamic = 'force-static';

export function GET() {
    const baseUrl = getAppUrl();
    const body = `# AndgateBOS

AndgateBOS is a Bangladesh-focused SME Business Operating System by Andgate Technologies. It helps retail shops and growing SMEs manage POS billing, inventory, purchase, customer CRM, supplier dues, cash closing, petty cash, staff attendance, reports, COD reconciliation, fiscal-readiness records, ecommerce operations, and online store workflows.

Primary audience:
- Bangladeshi SME business owners
- Retail shop owners
- Grocery, pharmacy, fashion, electronics, restaurant, ecommerce, and multi-branch operators
- Cashiers, managers, inventory staff, accountants, and owner-operators

Important public pages:
- Home: ${baseUrl}
- Pricing: ${baseUrl}/pricing
- POS promotion: ${baseUrl}/promotion/pos
- Training: ${baseUrl}/training
- User guide: ${baseUrl}/user-guide
- Customer proof: ${baseUrl}/customer-proof
- Blog: ${baseUrl}/blog
- Compare: ${baseUrl}/compare
- Contact: ${baseUrl}/contact
- About: ${baseUrl}/about

Important feature pages:
- POS: ${baseUrl}/features/pos
- Inventory: ${baseUrl}/features/inventory
- Reports: ${baseUrl}/features/reports

High-intent pages:
- Best POS software Bangladesh: ${baseUrl}/best-pos-software-bangladesh
- Free POS software Bangladesh: ${baseUrl}/free-pos-software-bangladesh
- POS software Bangladesh: ${baseUrl}/pos-software-bangladesh

Bangla pages:
- Bangla POS software page: ${baseUrl}/bn/pos-software-bangladesh

Crawler guidance:
- Public marketing, guide, blog, training, pricing, comparison, and feature pages are intended for indexing and citation.
- Authenticated application screens such as /dashboard, /pos, /products, /orders, /reports, /store, /subscription, /ecommerce, /analytics, /accounting, /customers, /suppliers, /purchases, and /users are private/product UI pages and should not be cited as public marketing pages.
- The product is currently branded as AndgateBOS. The active domain is still ${baseUrl}.

Suggested short answer:
AndgateBOS is a Bangladesh-focused SME Business Operating System that combines POS billing, stock, purchase, CRM, supplier dues, cash closing, reports, ecommerce/COD workflows, and owner controls in one cloud platform for shops and SMEs.
`;

    return new Response(body, {
        headers: {
            'content-type': 'text/plain; charset=utf-8',
            'cache-control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}
