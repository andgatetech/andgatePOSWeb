# AndgatePOS SaaS Roadmap

Last saved: 2026-05-05

## Current Handoff

Recent full reaudit says backend improved, but product is not yet international SaaS ready.

Important closed items:

- Login throttled.
- `leads/all` protected.
- Staff create now checks store access.
- Permission read/update checks shared store access.
- Order actor `user_id` now comes from authenticated user.
- Store locale/timezone/currency/tax/invoice groundwork exists.
- Some report timezone helpers and frontend i18n checks exist.
- Subscription missing-feature now denies all HTTP methods by default.
- Permission middleware resolves `store_ids` and many route `{id}` resources to store ownership.
- Ecommerce homepage request routes have explicit permission middleware.
- Order payment due/change amounts are backend-normalized from grand total.
- Order item price/tax now comes from locked stock row, with retail/wholesale selection only.
- Sale tax is now summed from backend line tax, not client order tax.
- Discounts now cannot exceed item total or store `max_discount` percent.

Important still open:

- Tenant isolation still needs real API feature tests and broader policy/controller coverage.
- POS money is not fully backend-authoritative.
- Loyalty redemption and full quote endpoint still need backend authority.
- Return flow still mutates original sale lines.
- Raw exception/message/trace leaks remain in many controllers.
- Currency/tax/invoice support is groundwork only, not full international engine.

Recommended next session start:

1. Finish Phase 1 hardening before deeper Phase 2.
2. Start with strict subscription enforcement and global tenant/resource ownership guard.
3. Then continue Phase 2 currency/tax/timezone work.

## Phase 1: Must-Fix Foundation

Goal: protect money, tenant trust, and core SaaS revenue before more growth.

| Item | Why matters | Files likely affected | Risk | Complexity | Acceptance criteria |
|---|---|---|---|---|---|
| Finish tenant isolation | Stop cross-store data access | `CheckPermission.php`, `StoreAccessService.php`, POS controllers, policies | Critical | High | No API can read/write resource outside authorized store, including route `{id}` resources |
| Strict subscription enforcement | Stop paid feature leakage | `CheckPermission.php`, subscription models/services | Critical | Medium | Missing feature denies by default; quota counts only after successful create |
| Backend quote/money engine | Prevent wrong totals | `OrderService.php`, `OrderCalculationService.php`, new `MoneyService` | Critical | High | Client sends cart only; backend owns subtotal, tax, discount, total, due, change |
| Immutable returns | Keep invoice/audit true | `OrderReturnService.php`, return models, journal/transaction logic | Critical | High | Original sale lines never mutate; returns/exchanges create separate auditable records |
| Safe errors/logs | Prevent PII/internal leaks | Controllers/services using `getMessage()`, `Log::error` | High | Medium | API returns safe error codes; logs redact payloads/traces in production |
| Permission guard cleanup | Close unguarded financial/admin routes | `routes/api.php`, ledger/journal/ecommerce/feedback/notification controllers | High | Low | All sensitive routes have permission middleware or policy |
| Critical POS tests | Prevent regression | `tests/Feature/POS/*` | High | Medium | Tests cover tenant denial, order totals, stock lock, returns, subscription quota |

## Phase 2: International SaaS Readiness

Goal: sell in different countries without later rewrite.

| Item | Why matters | Files likely affected | Risk | Complexity | Acceptance criteria |
|---|---|---|---|---|---|
| Currency engine | Symbol is not enough for SaaS | `StoreCurrencyController.php`, `StoreCurrency`, `OrderService.php`, purchase/order tables | High | Medium | ISO code, decimal places, rounding mode, cash rounding; sale stores currency snapshot |
| Tax profile engine | VAT/GST/sales tax differ by country | new tax tables/services/controllers, `OrderCalculationService.php`, reports | High | High | Inclusive/exclusive tax, tax labels, registration number, tax breakdown per invoice |
| Timezone correctness | Reports/invoices depend on local business day | `DateTimeFormatter.php`, order/report/dashboard controllers | High | Medium | Filters convert store-local day to UTC DB range; dashboard uses store timezone |
| Invoice template system | Legal invoices differ per country | invoice views/PDF/mail, store settings, frontend invoice preview | Medium | High | Per-store logo, prefix, footer, tax ID, language labels, numbering rules |
| Locale-aware frontend | International UX | `useCurrency.ts`, i18n files, POS/order/report screens | Medium | Medium | Uses `Intl.NumberFormat`; no hardcoded BDT/Bangla defaults in generic flow |
| Phone/address normalization | Needed for customers/suppliers | `CustomerController.php`, `SupplierController.php`, models/migrations | Medium | Medium | Phone stored normalized; address fields support country formats |
| API i18n messages | Better support and UX | `ApiResponse.php`, lang files, controllers | Medium | Medium | Errors return `error_code`, translation key, localized message |

## Phase 3: Enterprise-Grade Improvements

Goal: bigger customers, branch ops, compliance, scale.

| Item | Why matters | Files likely affected | Risk | Complexity | Acceptance criteria |
|---|---|---|---|---|---|
| Company/branch model | Enterprise needs company billing, branch stock/sales | store/user/subscription schema, `UserStore`, controllers | High | High | Users belong to company and branches; billing company-level, stock branch-level |
| Role/policy system | JSON permissions become brittle | `User.php`, policies, permission controllers | High | High | Reusable tenant roles; policies enforce ownership; cache invalidates |
| Audit log framework | Fraud/compliance/staff accountability | observers, POS services, audit tables | High | Medium | Critical actions log actor, store, IP, before/after, entity IDs |
| Export/backup controls | Customer trust/data ownership | export jobs/controllers, backup config | Medium | Medium | Tenant can export products/customers/orders/reports; backup status visible |
| Report performance | Large tenants need speed | migrations, report query services | Medium | Medium | Composite indexes; large exports async; query plans acceptable |
| Background jobs | Keep POS API fast | jobs, queues, PDF/export/email/notification flows | Medium | Medium | Heavy work returns job ID/status |
| Upload hardening | Reduce attack surface | product/category/feedback upload controllers | High | Medium | MIME sniffing, unique filenames, size/dimension limits, private storage where needed |

## Phase 4: Automation And AI Features

Goal: add differentiation after core is safe.

| Item | Why matters | Files likely affected | Risk | Complexity | Acceptance criteria |
|---|---|---|---|---|---|
| Smart reorder suggestions | Prevent stockouts | stock reports, purchase drafts, recommendation job | Medium | Medium | Suggest qty using sales velocity, lead time, threshold |
| Anomaly detection | Catch fraud/mistakes | order/return/audit/report services | Medium | High | Flags unusual discounts, refunds, voids, stock adjustments, cashier patterns |
| AI report summaries | Save owner time | dashboard/report jobs/APIs | Low | Medium | Daily/weekly summary tied to real metrics |
| Invoice/payment drafts | Faster follow-up | invoice/order/customer notification services | Low | Medium | Generates localized draft; user approves before send |
| Demand forecasting | Enterprise value | analytics jobs, order/product tables | Medium | High | Forecast by product/branch with confidence and stockout warning |
| AI import mapping | Easier onboarding | bulk upload service/UI | Low | Medium | Maps messy CSV columns, previews errors, detects duplicates |

## Audit Reference Hotspots

- `app/Http/Middleware/CheckPermission.php`
- `app/Services/StoreAccessService.php`
- `app/Services/OrderService.php`
- `app/Services/OrderCalculationService.php`
- `app/Services/OrderReturnService.php`
- `app/Http/Controllers/POS/StoreCurrencyController.php`
- `app/Traits/DateTimeFormatter.php`
- `routes/api.php`
- `pos-frontend/andgatePOSWeb/hooks/useCurrency.ts`
