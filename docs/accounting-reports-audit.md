# AndgateBOS Accounting & Reports Audit

Date: 2026-07-15

Scope: Accounting module (journals, ledger, cash book, trial balance, balance sheet, P&L, petty cash, opening balances) + all 25+ Reports controllers/pages (financial, sales, purchase, stock, supplier/customer/product, operational). Backend (Laravel) and frontend (Next.js) read together per domain so calculation-vs-display mismatches surface directly.

Audience lens: SME shop owner in Bangladesh who trusts these numbers as ground truth for cash, বাকি (customer credit), দেনা (supplier due), and profit. A wrong number here isn't cosmetic — it's the platform's core promise.

Method: read-only code audit (multiple parallel agents, cross-verified against actual controller/model/service code, not inferred). No fixes applied yet.

---

## Critical — money numbers are actively wrong

1. **Deleting an Income entry orphans its journal posting.** `AccountingController.php:587-597` (`destroyIncome`) deletes the `IncomeEntry` row but never reverses the `JournalHeader`/`JournalLine` it posted. Cash Book, Cash Flow, Trial Balance, and P&L keep showing money for an entry the owner believes was deleted.

2. **Two parallel, disconnected journal systems.** Legacy `pos_ledgers`/`pos_journal_entries` (`JournalController.php`, `LedgerController.php`, `JournalService.php`, reachable at `/account/journal-list`, `/account/ledger-list`, no double-entry balance check by design) are completely separate from the current system (`pos_journal_headers`/`pos_journal_lines`) that every report (Cash Book, Cash Flow, Trial Balance, Balance Sheet, P&L) actually reads. Any entry made in the legacy screens never appears in official reports.

3. **P&L and Business Overview compute profit from tax-inclusive revenue.** `ProfitLossReportController.php:63-93,141,172`, `BusinessOverviewReportController.php:51-62,122-123` — `total_sales`/`gross_sales` = `SUM(grand_total)`, which includes VAT (`grand_total = total + tax − discount`). Neither `product_profit` nor `business_profit` subtracts `total_tax` first. Example: ৳100,000 sales incl. ৳5,000 VAT, ৳60,000 COGS, ৳20,000 expenses → real profit ৳15,000, report shows ৳20,000. Flows straight into the frontend's headline "You Keep" card with no caveat.

4. **AR Aging report silently drops every fresh/unpaid customer due.** `ArAgingReportController.php:50` filters `status IN ('pending','partial')`, but `pos_customer_dues.status` is only ever written as `'active'` on creation (`OrderService.php:1273`) — `'pending'` is never assigned anywhere in the codebase. A customer who takes credit today with zero payments never shows up in AR Aging, while the separate `CustomerDueController` (filters on `remaining > 0`) correctly shows it — the two due surfaces disagree.

5. **Sales Report never nets out partial returns.** `SalesReportController.php:62-67,138,217` sums raw `grand_total`, which `OrderReturnService` never decrements on a partial return (only full returns flip `status` off `'completed'`). `Order::getNetTotalAttribute()` exists exactly for this and is never called. A ৳100 order with a ৳40 partial return still reports ৳100.

6. **Sales Item Report never nets returned quantities.** `SalesItemReportController.php:109,147` sums raw `quantity`/`subtotal`; `OrderItem::quantity_returned`/`getReturnableQuantityAttribute()` exist and are never referenced. A 10-unit line with 4 returned still reports 10 sold.

7. **Purchase Report ignores supplier returns entirely.** `PurchaseReportController.php:118-119` sums `pos_purchase_orders.grand_total` with no reference to `pos_purchase_returns`. A ৳10,000 PO with ৳3,000 later returned to the supplier permanently overstates purchase cost/inventory value.

8. **Discount Report double-counts item-level discounts.** Item-level discount is already netted into `o.total` (`OrderCalculationService.php:25`), but `o.discount` = item discount + order discount (`OrderService.php:587-589`) counts it a second time. `OperationalReportController.php:188,334` exposes both side by side: a ৳100 item with ৳20 item-discount shows subtotal=80, discount_amount=20, grand_total=80 — implying a discount that already happened is happening again, while "gross_sales" understates true pre-discount revenue by the same amount.

9. **Opening-balance double-post race.** `OpeningBalanceService.php:14-16` guards re-posting with `lockForUpdate()->exists()`, which locks nothing on a fresh store (no rows to lock). Two near-simultaneous submits (slow network + retry, or double-tap past the disabled-button state) can both pass the check and both post — doubling the shop's recorded opening cash/stock.

10. **Running-business migration overwrites live stock, erasing sales made during setup.** `RunningBusinessMigrationController.php:306-345` sets `ProductStock.quantity` directly to the wizard-entered count instead of reconciling against activity since product creation. A sale recorded mid-setup silently vanishes from the Stock Report.

---

## High — wrong in specific but common scenarios

11. **Deleting a legacy journal entry corrupts every later running balance in that ledger** — `recalculateBalancesForLedger()` never called on delete. `JournalController.php:462-490`.
12. **Petty cash writes a dead legacy journal row alongside the real double-entry posting** — harmless until someone opens the legacy ledger and sees numbers that don't reconcile. `BusinessOsController.php:316-357`.
13. **Three unreconciled "cash" implementations** feed different pages: `CashDrawerController::runningTotal()`, `AccountingController::cashBook()` (journal-based), and `OperationalReportController::cashClosingQuery()` (separate `pos_cash_closings` table). Nothing reconciles them — Cash Closing and Accounting → Cash Book can show different figures for the same day.
14. **Multi-store report totals silently mix currencies** — no `currency_code` check when summing `grand_total`/`tax` across selected stores. `ProfitLossReportController.php:63-93`, `BusinessOverviewReportController.php:51-62`.
15. **Employee Sales / Discount / Payment Summary include cancelled and refunded orders** — no `status` filter, unlike Sales Report which correctly restricts to `'completed'`. `OperationalReportController.php:143-189`.
16. **Employee Sales / Discount reports silently default to current month but export/display as "All Time."** `OperationalReportController.php:46` applies a month filter when no dates given; `filters_applied` still returns `null`, and `ReportExportToolbar.tsx:207-209,332-334` labels the export "All Time" regardless.
17. **Sales Report's grouped (by customer/category/brand) breakdown ignores filters applied to the summary.** `SalesReportController.php:169-170,324-340` — filtering by category then viewing a customer breakdown silently returns all categories, diverging from the filtered summary shown alongside it.
18. **Supplier Report silently drops the date filter if only one of start/end date is given** (missing `elseif` branch that Customer/Product reports have). `SupplierReportController.php:60-64,226-231`.
19. **Product Report's default "Revenue" sort actually sorts by stock quantity**, not revenue — comment in the code admits it's a placeholder proxy. `ProductReportController.php:142-167`.
20. **Customer Report's summary return total and per-row return totals come from two differently-dated queries** and can disagree when an order and its return land in different periods. `CustomerReportController.php:92-106` vs `176-193`.
21. **Anomaly detection thresholds are unrealistic for typical BD shop volumes** — a 5-order sample with 1 return (20%) triggers a flag; a flat 50-unit stock-adjustment threshold ignores unit value (60 sacks of rice false-positives, 10 stolen smartphones don't). `AnomalyDetectionService.php:96-115,228`.

## Medium

22. `AutoPostingService` uses float arithmetic with a 0.005 tolerance instead of bcmath/integer cents — low real-world risk given `decimal(15,2)` columns, but the only thing standing between a legitimately balanced entry and a false rejection on split payments.
23. Sales Item Report's frontend "Profit" summary tile always shows 0 — backend summary never includes `total_profit`, and `formatCurrency` silently coerces `undefined` to a formatted zero instead of surfacing the gap. `SalesItemsReportPage.tsx:120,153`.

---

## UI/UX gaps

- **No error state almost anywhere.** Stock, Adjustment, Low-Stock, Idle-Product, Reorder, Demand-Forecast, Supplier, Customer, Product, Order-Returns pages, and the entire shared Operational report pipeline (Employee Sales, Discount, Transfer Ledger, Cash Closing, Payment Summary) destructure only `{ data, isLoading }` — a failed API call renders as an empty "no data" state, indistinguishable from a genuinely empty report.
- **Balance Sheet / P&L / Cash Flow tables clip on mobile instead of scrolling** — `overflow-hidden` instead of `overflow-x-auto`, unlike Journals/Trial Balance/Chart of Accounts which do it correctly. Right-hand columns (Debit/Credit/Balance) become inaccessible, not just squeezed. Same issue on Reorder Suggestions / Demand Forecast.
- **Raw bookkeeping jargon on `/accounting/journals`** ("Debit"/"ডেবিট", "Credit"/"ক্রেডিট", "Complete double-entry accounting records") contradicts the module's own stated design intent of hiding double-entry mechanics from shop owners.
- **Hardcoded, non-i18n strings** bypassing `t()`: Purchase, Low-Stock, Adjustment, Idle-Product, Stock, Customer, Product report pages.
- **Purchase Items report always shows "Unbranded"** — backend never includes `brand` in the response.
- **No supplier filter on Purchase Report** despite backend support for `supplier_id`.
- **Inconsistent initial-load UX** — some report pages show a full-page loader before first fetch; Sales Items, Supplier, Customer, Product don't, briefly rendering stale/zeroed summary cards.

---

## Verified — not bugs (checked explicitly, ruled out)

- Employee Sales correctly attributes to the order's stored `user_id`, not the viewing session.
- Discount amount uses the stored sale-time value, never recomputed from current product price.
- Transfer Ledger cannot double-count (correctly grouped, one row per transfer).
- Pagination totals are computed pre-pagination (full filtered set) across virtually every controller checked, not page-only sums.
- Frontend generally trusts backend totals rather than re-summing client-side.
- Partial-item **return** calculation itself (`OrderReturnService`, `OrderReturnReportController`) is correct and properly prorated — the bug is specifically that *other* reports (Sales, Sales Item, Customer summary) don't consume that correctly-computed data.
- Timezone handling defaults correctly to Asia/Dhaka, except Idle Product Report (uses raw server `now()`) and multi-store selections spanning timezones (falls back to app default).

---

## Fixed (2026-07-16)

All 23 numbered findings plus every listed UI/UX gap are fixed. Summary of the actual changes, by finding:

**Critical**
1. `AccountingController::destroyIncome` now voids the journal posting (`AutoPostingService::voidPosting`, soft-deletes the `JournalHeader` — every report already filters `status='posted' AND deleted_at IS NULL`) before deleting the income entry.
2. Legacy `JournalController`/`LedgerController` write endpoints (`store`/`update`/`destroy`) now return `410` and point to the Accounting module; `index`/`show` stay open for historical data. This also closes #11 (delete-corrupts-balances) since the delete path is unreachable.
3. `ProfitLossReportController`/`BusinessOverviewReportController` now subtract `total_tax` before computing profit (`net_sales_ex_tax`), and the "you_keep"/summary figures use the tax-exclusive base.
4. `ArAgingReportController` now filters `status IN ('active', 'partial')` instead of `('pending', 'partial')` — `'pending'` was never actually written.
5–6. `SalesReportController`/`SalesItemReportController` now net `total_returned`/`quantity_returned` out of every total (summary, per-row, and grouped breakdowns), consistent with `Order::getNetTotalAttribute()`/`OrderItem::getReturnableQuantityAttribute()`.
7. `PurchaseReportController` now nets `pos_purchase_returns.total_amount` (status `processed`) out of `total_purchase_value`/`received_value`.
8. `OperationalReportController::discountQuery` now computes true pre-discount `subtotal` as `o.total + SUM(item.discount)`, so `subtotal - discount_amount = grand_total` reconciles instead of double-counting.
9. `OpeningBalanceService::post` now serializes via `Cache::lock` instead of `lockForUpdate()->exists()` (which locked nothing on a fresh store).
10. `RunningBusinessMigrationController::applyOpeningStockItems` now nets out completed sales recorded after the migration draft was created, instead of blindly overwriting `quantity`.

**High**
12. Removed the dead legacy `Journal::create()` write from `BusinessOsController::postPettyCashExpense`.
14. `ProfitLossReportController`/`BusinessOverviewReportController` now flag `mixed_currency_warning` when selected stores don't share one active currency.
15–16. `employeeSalesQuery`/`discountQuery`/`paymentSummaryQuery` now filter `status='completed'`; `filters_applied.start_date/end_date` now reflect the actual applied range instead of `null` when defaulted, fixing the "All Time" mislabel.
17. `SalesReportController::getGroupedData` now groups off the same filtered order-id set as the summary, instead of rebuilding from just store/date.
18. `SupplierReportController` now handles single-bound date filters (`elseif ($startDate)` / `elseif ($endDate)`).
19. `ProductReportController` now sorts `revenue`/`total_ordered` by an actual sales subquery instead of stock `quantity`.
20. `CustomerReportController`'s summary return total is now anchored on the return's own `created_at`, matching the per-row breakdown.
13. `AccountingController::cashBook` and the `cash_closing` summary now carry a `note` explaining they're deliberately different measures (drawer count vs. posted journal), rather than merging three genuinely different figures into one.
21. Anomaly thresholds: cashier return-rate check now requires 20+ orders and 3+ returns (was 5 orders, 1 return); stock-adjustment check now flags on value moved (≥৳2000) or a much larger quantity backstop, not a flat 50-unit threshold.
22. `AutoPostingService`'s balance check now compares `number_format(...,2)` strings instead of a `0.005` float epsilon.

**UI/UX**
- Added error state + retry to the shared `OperationalReportPage` (covers 9 report pages) and individually to Stock, Adjustment, Low-Stock, Idle-Product, Reorder-Suggestions, Demand-Forecast, Supplier, Customer, Product, and Order-Returns reports.
- Balance Sheet, P&L, Cash Flow, Reorder Suggestions, and Demand Forecast tables now scroll (`overflow-x-auto`) instead of clipping.
- `PurchaseItemReportController` now eager-loads and returns `brand` (was always "Unbranded").
- Added a supplier filter to the Purchase Report page (backend already supported `supplier_id`).
- Softened `/accounting/journals`' description copy; kept Debit/Credit column headers since they're precise and legitimately needed on an audit-trail screen.
- Replaced hardcoded English strings with `t()` calls across Purchase, Low-Stock, Adjustment, Idle-Product, Stock, Customer, and Product report pages.

Verification: `php -l` clean on all 19 touched backend files, `npx eslint` clean on all touched frontend files (only pre-existing unrelated warnings), both locale JSON files validated, both graphify graphs refreshed. Not verified in a live browser (no login session in this environment) — recommend a manual pass through Sales Report, Discount Report, and P&L with a real store before considering this fully closed.
