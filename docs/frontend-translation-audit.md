# Frontend Translation Audit

Date: 2026-07-13

## Automated Checks

- Locale JSON parse: passed.
- Duplicate locale keys: 0 in `en.json`, 0 in `bn.json`.
- Flattened locale parity: `en` and `bn` both expose 6428 keys.
- Static `t('key')` usage scan: 5318 keys.
- Missing static keys in English: 0.
- Missing static keys in Bangla: 0.

## Fixed In This Pass

Added missing Bangla translations for purchase returns:

- Purchase return create page labels and messages
- Purchase returns list labels
- Purchase action button
- Pagination fallback key `btn_prev`

Translated stock adjustment UI:

- Header
- Empty state
- Summary footer
- Global reason/settings panel
- Stock adjustment item controls
- Serial adjustment modal

## Remaining Hardcoded Text Candidates

The scan still finds hardcoded English JSX text. Some are intentional or lower priority, such as technical API examples, receipt print templates, brand names, admin-only pages, or SEO/public English content.

Highest remaining modules by candidate count:

- `app/(application)/(protected)/affiliate/admin/page.tsx`
- `app/(application)/(protected)/products/component/Image Modal/ImageModal2.tsx`
- `app/(application)/(protected)/orders/Orders.tsx`
- `app/(application)/(protected)/store/StoreComponent.tsx`
- `app/(application)/(protected)/accounting/cash-flow/page.tsx`
- `app/(application)/(protected)/hr/attendance/page.tsx`
- `app/(application)/(protected)/purchases/create/PurchaseOrderRightSide.tsx`

## Recommended Next Pass

Translate in this order:

1. Product image/details modal.
2. Store management page.
3. Purchase order create/edit side panels.
4. Notifications pages.
5. Affiliate admin if platform admins need Bangla.
6. Receipt/PDF templates only if printed Bangla receipts are required.

Avoid translating:

- API endpoint examples.
- SKU/HTTP/CSV/PDF technical acronyms.
- Brand names such as WhatsApp, OpenStreetMap, AndgatePOS.
- SEO English pages intended for English search traffic.
