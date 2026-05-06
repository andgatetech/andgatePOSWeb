# Frontend Current State

Last saved: 2026-05-05

## Current Priority

Frontend work is currently secondary to SaaS/POS hardening roadmap. Frontend Phase 2 international readiness remains important after backend Phase 1 hardening.

Latest frontend hardening update:

- Normal POS checkout now requests backend quotes after cart/payment changes.
- Payment summary and cash/partial validation use backend-owned subtotal, tax, discount, and grand total when quote data is available.
- Preview and confirm order share the quote payload; confirm refreshes quote immediately before create.
- Added `msg_select_payment_method_status` to English and Bangla locales.
- Loyalty/account balance controls are enabled for existing customers with available values.
- POS quote/create sends explicit `points_to_redeem` and `balance_to_redeem`; summary displays backend quote redemption values.

Recommended next-session start:

1. Finish backend Phase 1 hardening first.
   - backend now ignores arbitrary sale price/tax, normalizes payments, bounds discounts, and awards loyalty points only from store settings;
   - backend exchange/new return items now resolve price/tax/subtotal from locked store stock instead of trusting frontend totals;
   - loyalty/account balance redemption still needs explicit backend fields before frontend should send redemption as a plain discount.
2. Then continue Phase 2 frontend work:
   - locale-aware currency formatting;
   - no hardcoded BDT/Bangla defaults in generic flow;
   - POS/order/report i18n completion;
   - invoice preview template readiness.

Roadmap also saved in:

- Root: `context/SAAS_ROADMAP.md`
- Frontend: `pos-frontend/andgatePOSWeb/context/SAAS_ROADMAP.md`
- Backend: `pos-backend/var/www/andgatePOSBackend/context/SAAS_ROADMAP.md`

## Frontend i18n Progress

Done in current sessions:

- Added `npm run check:i18n`.
- Added `scripts/check-i18n-keys.mjs`.
- Wired i18n key check into `.github/workflows/deploy.yml`.
- Localized POS payment/refund labels.
- Localized POS item titles/tooltips.
- Localized POS invoice preview action buttons, alerts, success messages.
- Localized thermal receipt HTML labels.
- Localized visible invoice preview labels.
- Localized PDF export labels.
- Localized POS pagination `aria-label`.
- Localized company logo `alt` text.
- Added matching keys to `public/locales/en.json` and `public/locales/bn.json`.

Verification:

```bash
npm run check:i18n
npm run lint
```

`npm run lint` exits successfully but still reports existing unrelated warnings, mostly React hook dependency warnings across reports/account/customer/etc.

## Frontend Pending

- `/pos` not marked complete yet. Remaining scan items include SEO metadata, logs, fallback/data labels, and sub-components.
- Orders pages.
- Products pages.
- Purchases pages.
- Reports.
- Remaining modules.
- Placeholder/title/aria audits.
- Replace manual currency formatter with locale-aware `Intl.NumberFormat`.
- Remove BDT/Bangla defaults from generic international flows.
- Make invoice preview/template UI ready for per-store/country/legal settings.

## Frontend Hotspots

- `hooks/useCurrency.ts`
- `public/locales/en.json`
- `public/locales/bn.json`
- `app/(application)/(protected)/pos/*`
- `app/(application)/(protected)/orders/*`
- `app/(application)/(protected)/reports/*`
- `app/(application)/(protected)/store/setting/*`
