# AndgatePOS Pricing and Packaging Strategy

Date: 2026-07-13  
Market: Bangladesh SME retail, wholesale, service, restaurant, and light manufacturing  
Objective: make AndgatePOS the Business Operating System for Bangladeshi SMEs without confusing feature gates.

## 1. Executive Summary

The current package structure is directionally useful but too feature-count driven. Phrases like "5 basic reports" or "20 reports" create mistrust because customers cannot easily understand what business outcome they are buying. The permanent architecture should move from feature quantity to business maturity:

1. **Starter**: run one shop properly.
2. **SME Growth**: control buying, dues, suppliers, online orders, and daily profit.
3. **Professional**: manage teams, branches, accounting, compliance, and performance.
4. **Enterprise**: operate a multi-branch business with automation, executive controls, integrations, and dedicated success.

Recommendation: keep four paid packages plus the 14-day full-access Trial, but reposition and rename the paid tiers in public copy as:

| Current | Recommended public meaning | Keep DB name? |
|---|---|---|
| Starter | Shop Starter | Yes, optional display copy only |
| SME Growth | Growth | Yes |
| Professional | Business Pro | Yes |
| Enterprise | Enterprise | Yes |

The product should not lock core usability. Starter must include POS, product catalog, inventory, customers, barcode/label, due basics, and operational reports. Upgrades should unlock business capabilities: purchasing control, ecommerce, accounting, HR, analytics, branch intelligence, workflow, integrations, and dedicated onboarding.

## 2. Market Analysis

Bangladeshi merchants are price sensitive, support dependent, and often software cautious. They want proof before commitment, so the trial should remain full access. Local competitors often sell either one-time POS licenses or low monthly subscriptions. Recent Bangladesh POS pricing references show entry cloud POS around **৳500-৳2,500/month**, while one-time licenses commonly range **৳10,000-৳50,000+**, and larger enterprise implementations can exceed **৳2,00,000**. Sources: SK Soft notes POS price confusion from ৳500/month to ৳1,00,000+ projects; iBOS cites entry cloud POS around ৳1,000/month per outlet; Pridesys cites ৳10,000 to ৳2,00,000+ for POS software; XiomTech cites subscription models around ৳1,000-৳2,500/month.

International products set the maturity benchmark, not local price expectations. Square wins with low entry cost and easy payments. Shopify POS wins omnichannel. Lightspeed wins advanced retail inventory and analytics. Zoho/Odoo/ERPNext win breadth across accounting, ERP, CRM, and workflow. AndgatePOS can win Bangladesh by combining local workflows, Bangla training/support, MFS/COD awareness, and BOS breadth in a package ladder that feels fair.

## 3. Customer Segments

| Segment | Monthly revenue | Employees | Pain | Best package |
|---|---:|---:|---|---|
| Micro shop | ৳50k-৳3L | 1-2 | billing, stock, due, simple reports | Starter |
| Small retail | ৳3L-৳12L | 2-5 | purchase, supplier, returns, ecommerce start | SME Growth |
| Growing SME | ৳12L-৳50L | 5-20 | team roles, accounting, HR, profit, compliance | Professional |
| Multi-branch | ৳50L+ | 20+ | branches, audit, KPI, API, automation, SLA | Enterprise |

## 4. Feature Audit

### Implemented Or Mostly Implemented

- Dashboard and Business OS
- POS sales, order history, returns, coupons, payment methods
- Products, categories, brands, barcode/label, QR, bulk upload
- Inventory, stock movement, stock adjustments, stock count, stock transfer, thresholds
- Purchases, purchase receive, purchase returns, suppliers, supplier due
- Customers, customer CRM, customer due
- Cash closing, cash drawer, petty cash, service jobs
- Expenses, income, accounting accounts, journals, cash book, financial reports
- Reports: sales, invoices, transactions, customer, supplier, purchase, inventory, stock, tax, profit/loss, operations
- AI/advanced reports: reorder suggestions, anomalies, demand forecast, smart summary, threshold intelligence
- Analytics/BI: custom reports, scheduled reports, dashboard widgets, sales TV, branch benchmarking, cash-flow forecast, break-even
- HR: attendance, payroll, salary advance, festival bonus, leave, holiday, shifts, employee documents
- Store settings, company, branch, roles, users, audit logs, data export
- eCommerce management, orders, products, COD reconciliation, credentials, marketing/pixel
- Notifications, feedback, affiliate
- Fiscal compliance center
- Manual payments/subscription control

### Missing Or Should Exist

- True offline POS sync with conflict handling
- SMS/WhatsApp campaign automation
- Loyalty, membership, gift card, points wallet
- Customer portal and supplier portal
- Approval workflow engine
- Custom fields and document management beyond employee docs
- Two-factor authentication and session/device controls
- Automated backup/restore UI
- API key management and integration marketplace
- Loan/microfinance/inventory finance integrations
- AI assistant for owners
- Restaurant-specific table/KOT/kitchen workflow if restaurants remain a target
- Manufacturing BOM/light production workflow
- Advanced invoice/receipt branding templates
- Import/export governance with rollback

## 5. Package Architecture

### Trial

**Purpose**: remove fear.  
**Offer**: 14 days, all features enabled, no credit card.  
**Limit**: one store, practical demo-scale product/user limits, support through chat/email.  
**Conversion goal**: 18-30% trial-to-paid after onboarding improves.

### Starter: Run One Shop Properly

**Ideal customer**: grocery, cosmetics, small fashion, pharmacy, stationery, gift shop, new mobile shop.  
**Business size**: one owner/cashier, one or two counters.  
**Revenue**: ৳50k-৳3L/month.  
**Pain solved**: faster billing, product/stock discipline, customer dues, low stock, daily view.  
**Why not Professional**: no accountant/team/branch yet.  
**Upgrade trigger**: supplier purchase control, ecommerce, more staff, better profit visibility.  
**Support**: unlimited chat/email during business hours, Bangla onboarding checklist.

Required capability:
- POS, products, categories, brands
- Customers and due basics
- Inventory summary, low stock, stock adjustment
- Barcode/label
- Cash closing and cash drawer
- Basic operational reports: sales, invoice, customer, low stock, daily summary, stock report

Locked capability:
- Purchase/supplier workflow beyond simple supplier list
- Ecommerce/COD
- Full financial accounting
- HR/payroll
- Advanced analytics/AI
- Multi-branch operations
- API/automation

### SME Growth: Control Buying, Dues, and Online Sales

**Ideal customer**: pharmacy, fashion, shoe, mobile/computer, electronics, wholesale starter, bakery/cafe with staff.  
**Business size**: 2-5 staff, one to two outlets.  
**Revenue**: ৳3L-৳12L/month.  
**Pain solved**: purchase discipline, supplier dues, returns, expense tracking, ecommerce orders, daily profit.  
**Why not Professional**: owner still manages operations directly; no full HR/accounting department.  
**Upgrade trigger**: branch comparison, payroll, accountant-level reports, audit controls.  
**Support**: priority chat/phone callback, guided setup session.

Required capability:
- Everything in Starter
- Purchases, suppliers, purchase returns
- Supplier dues and statements
- Order returns and customer due reporting
- Expense tracking and basic profit/loss
- Ecommerce management and COD reconciliation
- Bulk upload and multi-payment workflows
- Inventory analysis reports: product, purchase, supplier, expense, profit/loss, transaction

Locked capability:
- Full accounting suite
- HR/payroll
- Analytics dashboard widgets/custom reports/scheduled reports
- Branch benchmarking and forecast analytics
- Advanced compliance/audit
- API and automation

### Professional: Manage Team, Accounting, and Performance

**Ideal customer**: established retail, distributor, multi-counter shop, small manufacturer, growing restaurant/cafe chain.  
**Business size**: 5-20 employees, 2-8 outlets.  
**Revenue**: ৳12L-৳50L/month.  
**Pain solved**: staff accountability, branch control, accounting, payroll, compliance, analytics, audit trail.  
**Why not Enterprise**: does not need custom SLA, API automation, white label, executive board reporting.  
**Upgrade trigger**: many branches, integration needs, dedicated success, custom reporting/automation.  
**Support**: phone support, onboarding workshop, quarterly business review.

Required capability:
- Everything in Growth
- Multi-store and stock transfer
- Full accounting: chart of accounts, journals, cash book, income, financial reports
- HR, attendance, payroll, leave, shifts, salary advance, employee docs
- Roles and permissions
- Audit logs and activity history
- Fiscal compliance center
- Advanced reports and BI: custom reports, dashboard widgets, branch benchmarking, break-even, cash-flow forecast

Locked capability:
- API and custom integrations
- white label/custom branding
- advanced automation/workflow engine
- dedicated SLA and migration team
- custom executive dashboard

### Enterprise: Scale With Controls and Integrations

**Ideal customer**: chain retail, distributor, large pharmacy/fashion/electronics, multi-branch wholesale, franchise, group company.  
**Business size**: 20+ staff, 8+ branches or complex operations.  
**Revenue**: ৳50L+/month.  
**Pain solved**: standardization, governance, integration, custom workflow, executive visibility.  
**Support**: dedicated account manager, SLA, migration, training, priority engineering path.

Required capability:
- Everything in Professional
- Unlimited or contract-defined stores/products/users
- API access and integration support
- scheduled reports and executive dashboards
- white label/custom branding where commercially justified
- advanced automation
- dedicated training and data migration
- custom analytics and SLA

## 6. Complete Feature Matrix

Legend: `✓` included, `Limited` included with scale/scope limits, `Add-on` commercial add-on, `-` not included.

| Feature area | Starter | SME Growth | Professional | Enterprise | Justification |
|---|---|---|---|---|---|
| POS sales and order history | ✓ | ✓ | ✓ | ✓ | core usability |
| Products/categories/brands | ✓ | ✓ | ✓ | ✓ | core catalog |
| Barcode/label/QR | ✓ | ✓ | ✓ | ✓ | essential for retail |
| Inventory summary/low stock | ✓ | ✓ | ✓ | ✓ | stock discipline |
| Stock adjustment/count | ✓ | ✓ | ✓ | ✓ | inventory correctness |
| Stock transfer | - | Limited | ✓ | ✓ | branch maturity trigger |
| Customers and customer due | ✓ | ✓ | ✓ | ✓ | Bangladesh due workflow |
| Supplier list | Limited | ✓ | ✓ | ✓ | purchase maturity |
| Purchase orders/receive/returns | - | ✓ | ✓ | ✓ | clear Growth unlock |
| Supplier due/statement | - | ✓ | ✓ | ✓ | supplier control |
| Order returns | Limited | ✓ | ✓ | ✓ | small shops need simple returns |
| Coupons/discounts | Limited | ✓ | ✓ | ✓ | promotion maturity |
| Cash closing/cash drawer | ✓ | ✓ | ✓ | ✓ | daily control |
| Petty cash/service jobs | ✓ | ✓ | ✓ | ✓ | operational utility |
| Basic reports | ✓ | ✓ | ✓ | ✓ | never make Starter blind |
| Purchase/supplier reports | - | ✓ | ✓ | ✓ | tied to purchase module |
| Profit/loss and expense reports | - | ✓ | ✓ | ✓ | Growth owner value |
| Tax/VAT/fiscal compliance | - | Limited | ✓ | ✓ | compliance maturity |
| Inventory intelligence | - | Limited | ✓ | ✓ | upgrade to better stock decisions |
| AI reports/forecast/anomalies | - | - | ✓ | ✓ | advanced business insight |
| Custom reports | - | - | ✓ | ✓ | mature reporting |
| Scheduled reports | - | - | Limited | ✓ | management automation |
| Dashboard widgets/Sales TV | - | - | ✓ | ✓ | operations control |
| Branch benchmarking | - | - | ✓ | ✓ | branch maturity |
| Accounting accounts/journals/cash book | - | - | ✓ | ✓ | accountant-level complexity |
| Income manager | - | Limited | ✓ | ✓ | Growth can track simple income if desired |
| Expenses | Limited | ✓ | ✓ | ✓ | cash discipline |
| HR attendance/payroll/leave/shifts | - | - | ✓ | ✓ | team maturity |
| Employee documents | - | - | ✓ | ✓ | HR maturity |
| Users/roles | Limited | Limited | ✓ | ✓ | scale by staff count |
| Multi-store | Limited | Limited | ✓ | ✓ | not just store count, branch process |
| Audit logs/activity | - | - | ✓ | ✓ | control and accountability |
| Data import/export | Limited | ✓ | ✓ | ✓ | onboarding and operations |
| eCommerce/orders/COD | - | ✓ | ✓ | ✓ | strong Growth upgrade trigger |
| Marketing pixel | - | ✓ | ✓ | ✓ | ecommerce linked |
| Notifications | ✓ | ✓ | ✓ | ✓ | product communication |
| SMS/WhatsApp campaigns | - | Add-on | Add-on | ✓ | usage-cost based |
| Loyalty/membership/gift card | - | Add-on | Add-on | ✓ | future monetization |
| Mobile app | ✓ | ✓ | ✓ | ✓ | if available, should support adoption |
| Offline mode | Limited | Limited | ✓ | ✓ | future reliability feature |
| Backup/restore | ✓ | ✓ | ✓ | ✓ | trust requirement |
| Two-factor security | - | - | ✓ | ✓ | maturity/security |
| API/integrations | - | - | Add-on | ✓ | enterprise value |
| Custom fields/workflows | - | - | Add-on | ✓ | future BOS expansion |
| Training | self-serve | guided | workshop | dedicated |
| Support | chat/email | priority chat/callback | phone + priority | dedicated SLA |

## 7. Pricing Position

Current public prices should stay unchanged for now. The immediate fix is packaging clarity, feature entitlement alignment, and better public copy.

Current public prices:

| Package | Monthly | Yearly | Activation/setup | Notes |
|---|---:|---:|---:|---|
| Trial | ৳0 | ৳0 | ৳0 | 14-day full access |
| Starter | ৳499 | ৳4,491 | existing catalog value | one-shop entry package |
| SME Growth | ৳999 | ৳8,991 | existing catalog value | best-value growth package |
| Professional | ৳1,999 | ৳19,990 | existing catalog value | team, branch, accounting, HR and BI |
| Enterprise | Custom | Custom | custom | contract-defined |

Future price tests can be planned later, after the page/training/sales process is stronger. Do not change public package prices as part of this packaging cleanup.

Discount strategy:
- Yearly: 2 months free or 15-17% discount.
- Campaigns: Eid/New Year onboarding fee waiver, not permanent monthly discount.
- Avoid heavy lifetime discounts; Bangladesh merchants remember the lowest price forever.
- Grandfather existing customers for 6-12 months.

Trial:
- Keep 14-day full access.
- Require onboarding checklist completion before trial day 7.
- Use in-app upgrade prompts based on actual behavior, not generic banners.

Freemium:
- Do not launch broad freemium now. Support burden will be high.
- Possible future free "Invoice Lite" only if it feeds paid conversion.

## 8. Upgrade Journey

Starter to Growth:
- Trigger: supplier purchases, more products, ecommerce, expense/profit need.
- Message: "আপনার দোকান এখন কেনা-বেচা দুই দিক থেকেই নিয়ন্ত্রণ দরকার।"

Growth to Professional:
- Trigger: staff accountability, branch growth, payroll, accounting, advanced reports.
- Message: "এখন মালিক একা সব দেখবেন না, সিস্টেম দেখাবে কে কী করছে।"

Professional to Enterprise:
- Trigger: many branches, integrations, custom workflow, executive reporting.
- Message: "আপনার ব্যবসার জন্য এখন standard operating system দরকার।"

## 9. Business Rationale

This architecture avoids "random locked features" and maps upgrades to operational maturity. Starter remains complete enough to trust. Growth monetizes the first real pain expansion: purchase, supplier, due, ecommerce, profit. Professional monetizes management complexity: staff, accounting, branch, compliance, BI. Enterprise monetizes customization, integrations, SLA, and governance.

## 10. Risks

- If Starter is too generous, Growth conversion may slow. Mitigation: keep purchasing/ecommerce/profit depth in Growth.
- If setup fee is too high, trial conversion may drop. Mitigation: waive activation fee in campaigns, not base price.
- If feature gates are inconsistent, trust will fall. Mitigation: use `packages:access-audit --repair`, requiredFeature mapping, and automated tests.
- If support promises exceed capacity, retention will suffer. Mitigation: define support channels by tier while keeping all customers helped.
- If existing customers are forcibly downgraded, churn risk rises. Mitigation: grandfather with clear renewal transition.

## 11. Recommended Final Package Structure

Keep:
- Trial
- Starter
- SME Growth
- Professional
- Enterprise

Change public language:
- Avoid "5 reports", "20 reports".
- Use capability language:
  - Starter: operational reports
  - Growth: purchase, supplier, dues, profit reports
  - Professional: accounting, HR, BI, branch performance
  - Enterprise: executive analytics, automation, API, SLA

## 12. Implementation Roadmap

### Frontend Changes

1. Pricing page copy:
   - Replace report counts with capability labels.
   - Add "Best for" by business maturity.
   - Add "Why upgrade" row per tier.
   - Keep trial all-features note.
2. Subscription page:
   - Show upgrade reason when feature locked.
   - Map feature slug to human module name.
3. Left nav:
   - Continue showing locked features with lock/upgrade state.
   - Group locked advanced features below available core workflows.
4. Training page:
   - Add package-based learning paths: Starter, Growth, Professional, Enterprise.

### Backend Changes

1. Update `SubscriptionSeeder`:
   - Rename visible feature rows.
   - Change report row values from counts to capability labels.
   - Rebalance included slugs according to the matrix.
2. Add feature groups for future modules:
   - `crm_advanced`, `loyalty`, `communications`, `workflow`, `security`, `integrations`, `finance`.
3. Ensure all protected routes have both RBAC and package feature mapping where needed.
4. Keep `packages:access-audit` for drift repair.

### Permission Changes

- Separate RBAC permission from package feature access.
- Every monetized module should have a package slug and a role permission.
- Business admin can have RBAC permission, but package gate still decides entitlement.

### Database Changes

- Keep `pos_plans`, `pos_plan_features`, `pos_user_subscriptions`, `pos_user_subscription_items`.
- Add optional columns later:
  - `pos_plan_features.capability_group`
  - `pos_plan_features.public_label_en/bn`
  - `pos_plan_features.upgrade_reason_en/bn`
  - `pos_plan_features.is_addon`

### Migration Plan

1. Deploy new code and plan seeder.
2. Run:
   ```bash
   php artisan plans:sync
   php artisan packages:access-audit
   ```
3. Review drift.
4. Repair when approved:
   ```bash
   php artisan packages:access-audit --repair
   php artisan optimize:clear
   ```
5. Validate with Starter, Growth, Professional, Enterprise test users.

### Existing Customer Migration

- Grandfather existing active users for 6-12 months if their current access is higher than new package.
- New customers get new package rules immediately.
- On renewal, show transition notice.
- On upgrade/downgrade, apply new package exactly.

### Subscription Transition

- Active package changes must rebuild `pos_user_subscription_items`.
- Manual payment approval should snapshot the selected plan.
- Any admin direct package edit must use the same service path or run audit repair.

### Testing Checklist

- Pricing page shows no misleading counts.
- Trial column shows all features enabled.
- Starter cannot access Growth/Professional locked modules.
- Growth can use purchase/ecommerce/profit basics.
- Professional can use accounting/HR/BI.
- Enterprise can use API/premium slugs.
- Left nav shows locked state, not hidden confusion.
- Direct route access redirects with localized feature message.
- Package upgrade rebuilds snapshots and clears cache.
- Existing customer grandfathering works as decided.

### Deployment Plan

1. Deploy frontend copy and UI.
2. Deploy backend seeder/feature changes.
3. Run dry-run audits.
4. Migrate selected staging accounts.
5. Run live during low traffic.
6. Clear caches.
7. Smoke test all package personas.

### Rollback Plan

1. Keep previous `SubscriptionSeeder` in git.
2. Before repair, export affected subscription snapshots:
   ```sql
   SELECT * FROM pos_user_subscription_items WHERE user_subscription_id IN (...);
   ```
3. If issue appears, restore snapshot export and run `php artisan optimize:clear`.
4. Revert frontend copy if pricing page creates confusion.

## Sources Used

- SK Soft Solutions, "POS Software Price in Bangladesh - What to Expect in 2026"
- Softeko, "Best POS Software in Bangladesh: Compare Top 11 Systems"
- Smart Software Ltd., POS pricing/support page
- Pridesys IT, "Top POS Software in Bangladesh"
- iBOS, "POS Software Price in Bangladesh 2026"
- XiomTech, "POS Software Price in Bangladesh 2026"
- TechRadar POS reviews/guides for Square, Shopify, Lightspeed, Epos Now market positioning
