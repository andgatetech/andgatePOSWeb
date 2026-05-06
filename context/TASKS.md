# TASKS.md

Current work, pending tasks, and backlog. Update this file as tasks are completed.

---

## Active Initiative: Full i18n Translation

Translating all hardcoded English strings to `t('key')` calls across the entire dashboard application. Both `public/locales/en.json` and `public/locales/bn.json` are updated in parallel.

### Completed ✅

**Layouts & Global UI**
- [x] `components/layouts/header.tsx` — Profile, Sign Out, Fullscreen toggle tooltips
- [x] `components/layouts/sidebar.tsx` — Store switcher, switching state, inactive/disabled badges, subscription footer, Upgrade button
- [x] `lib/menu-builder.tsx` (locale keys) — All 63 sidebar menu label keys added to both JSON files

**Store Settings (`/store/setting`)**
- [x] `StoreSetting.tsx` — All handler dialogs (delete, toggle, create, update error/success messages), logo validation, form submit, loading/error/no-store UI states
- [x] `tabs/BasicInfoTab.tsx`
- [x] `tabs/OperatingHoursTab.tsx`
- [x] `tabs/LoyaltyProgramTab.tsx`
- [x] `tabs/BrandingTab.tsx`
- [x] `tabs/StoreStatusTab.tsx`
- [x] `tabs/UnitsTab.tsx`
- [x] `tabs/AttributesTab.tsx`
- [x] `tabs/PaymentStatusTab.tsx` — also fixed `getTranslation()` placement bug (was inside `.map()`)
- [x] `tabs/PaymentMethodsTab.tsx` — also fixed `getTranslation()` placement bug
- [x] `tabs/CurrencyTab.tsx` — also fixed `getTranslation()` placement bug (was in `formatPreview` helper)
- [x] `tabs/WarrantyTypesTab.tsx`
- [x] `tabs/AdjustmentReasonsTab.tsx`
- [x] `tabs/OrderReturnReasonsTab.tsx`

**Other Pages**
- [x] `subscription/page.tsx` — full page including PlanCard sub-component, billing toggle, form, contact panel, success modal
- [x] Dashboard — added 4 missing keys (`supplier_title`, `customer_title`, `order_title`, `purchase_title`)
- [x] `/dashboard` components — verified Analytics, DashboardSections, SectionFour, SectionsFive, Summary translation keys; fixed two report links

---

### Pending ⏳

**High Priority — Frequently Visited**
- [ ] `/pos` — PosLeftSide.tsx, PosRightSide.tsx, all sub-components (CategoryPanel, BrandPanel, CustomerSection, PaymentSummarySection, CashPaymentSection, PosInvoicePreview, ItemPreviewModal, CameraScanner)
- [ ] `/orders/page.tsx` and all order components (OrdersTable, OrderStats, OrderDetailsModal, OrderReturnList, OrderReturnDetailsModal, OrderEditRightSide)
- [ ] `/orders/return/*` — return processing pages

**Products**
- [ ] `/products/page.tsx` and ProductTable
- [ ] `/products/create/page.tsx` and all tab components (BasicInfoTab, PricingTab, StockTab, VariantsTab, AttributesTab, SerialTab, WarrantyTab, ImagesTab, TaxTab)
- [ ] `/products/edit/[id]/page.tsx`
- [ ] `/products/stock/adjustments/page.tsx` and AdjustmentHeader
- [ ] `/products/bulk/page.tsx`
- [ ] `/label/page.tsx`

**Purchases**
- [ ] `/purchases/create/page.tsx` and PurchaseOrderRightSide
- [ ] `/purchases/list/page.tsx` (PurchaseNewTable, PurchaseProgressTable, PurchaseCompletedTable, DraftsTable)
- [ ] `/purchases/receive/[id]/page.tsx` and ReceiveItemsModal
- [ ] `/purchases/edit/[id]/page.tsx`

**Reports (15 pages)**
- [ ] `/reports/sales/page.tsx`
- [ ] `/reports/order-returns/page.tsx`
- [ ] `/reports/transaction/page.tsx`
- [ ] `/reports/invoice/page.tsx`
- [ ] `/reports/sales-items/page.tsx`
- [ ] `/reports/customer/page.tsx`
- [ ] `/reports/purchase/page.tsx`
- [ ] `/reports/purchase-items/page.tsx`
- [ ] `/reports/purchase-transaction/page.tsx`
- [ ] `/reports/supplier/page.tsx`
- [ ] `/reports/supplier-due/page.tsx`
- [ ] `/reports/stock/page.tsx`
- [ ] `/reports/low-stock/page.tsx`
- [ ] `/reports/idle-product/page.tsx`
- [ ] `/reports/adjustment/page.tsx`
- [ ] `/reports/product/page.tsx`
- [ ] `/reports/profit-loss/page.tsx`
- [ ] `/reports/expense/page.tsx`
- [ ] `/reports/tax/page.tsx`

**Remaining Modules**
- [ ] `/customers/*` — list, create, edit
- [ ] `/suppliers/*` — list, create, edit
- [ ] `/employees/*` — list, create
- [ ] `/category/page.tsx`
- [ ] `/brand/page.tsx`
- [ ] `/account/ledger-list/page.tsx`
- [ ] `/account/journal-list/page.tsx`
- [ ] `/expenses/expense-list/page.tsx`
- [ ] `/store/page.tsx`
- [ ] `/notifications/*`
- [ ] `/feedbacks/*`
- [ ] `/users/profile/page.tsx`
- [ ] `/users/user-account-settings/page.tsx`

---

## Bugs Found During i18n Work

| Bug | Location | Status |
|---|---|---|
| `getTranslation()` called inside `.map()` callback | `PaymentStatusTab.tsx` | Fixed ✅ |
| `getTranslation()` called inside `.map()` callback | `PaymentMethodsTab.tsx` | Fixed ✅ |
| `getTranslation()` called inside `formatPreview()` helper | `CurrencyTab.tsx` | Fixed ✅ |
| `lbl_warranty_name` key missing from both locale files | `WarrantyTypesTab.tsx` | Fixed ✅ |
| `supplier_title`, `customer_title`, `order_title`, `purchase_title` missing | Dashboard components | Fixed ✅ |

---

## Backlog (Post-Translation)

- [ ] Audit all `placeholder` attributes in forms — many are still English text strings
- [ ] Audit `title` attributes on icon buttons across all modules
- [ ] Verify `aria-label` attributes are translated where user-visible
- [x] Add automated check: script to grep all `t('key')` calls and verify keys exist in en.json
