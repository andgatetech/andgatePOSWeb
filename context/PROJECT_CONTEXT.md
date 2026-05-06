# PROJECT_CONTEXT.md

## What This System Is

**AndgatePOS** is a multi-tenant SaaS POS and store management platform for Bangladeshi retail businesses. A single user account can own multiple stores. All data is scoped to `currentStoreId`. The UI defaults to Bengali; English is the secondary language.

## Business Model

- **Subscription tiers** — monthly or yearly billing. Each plan defines quotas (max stores, max products, max employees) and feature flags (barcode, QR, warranty, etc.). Quota usage is tracked server-side; API returns 403 with `error_type` when a limit is hit.
- **Lead-based upgrade** — users submit a contact form; the sales team manually activates the new plan. There is no direct payment gateway in the frontend.
- **Employees** — store owners grant staff access to specific stores with specific permissions. The same permission array drives both sidebar visibility and API access.

## Module Summary

| Route | What it does |
|---|---|
| `/dashboard` | KPI cards, sales/purchase bar chart, customer pie chart, low-stock alert, recent sales & transactions |
| `/pos` | Full retail checkout — product browse, cart, customer, payment, serial/warranty assignment |
| `/orders` | Order list, order detail/edit, stats |
| `/orders/return/list` | Return & exchange processing |
| `/products` | Product list; tabbed create/edit form (Basic Info → SKU → Pricing → Stock → Variants → Attributes → Serial → Warranty → Images → Tax) |
| `/products/stock/adjustments` | Stock adjustment with reason codes |
| `/products/bulk` | Excel bulk import |
| `/label` | Barcode / QR label print sheet |
| `/purchases/create` | Draft purchase order |
| `/purchases/list` | PO list (New / In-progress / Completed / Drafts tabs) |
| `/purchases/receive/[id]` | Goods receiving |
| `/suppliers/*` | Supplier CRUD |
| `/customers/*` | Customer CRUD; membership tiers (normal / silver / gold / platinum) |
| `/account/ledger-list` | Double-entry ledgers |
| `/account/journal-list` | Journal entries |
| `/expenses/expense-list` | Expense tracking |
| `/store` | Store list |
| `/store/setting` | Per-store config (13 tabs — see ARCHITECTURE.md) |
| `/employees` | Employee CRUD + permission assignment |
| `/category`, `/brand` | Catalogue organisation |
| `/reports/*` | 15 report pages (see below) |
| `/notifications` | In-app notification feed |
| `/feedbacks` | Feedback submission & list |
| `/users/profile` | Profile, subscription status, quota usage, payment history |
| `/subscription` | Plan upgrade lead form |

## Reports (15 pages)

**Sales & Revenue:** Sales, Order Returns, Transactions, Invoices, Sales Items, Customer
**Purchase & Supplier:** Purchase, Purchase Items, Purchase Transactions, Supplier, Supplier Dues
**Inventory:** Stock, Low Stock, Idle Products, Adjustments, Product
**Financial:** Profit & Loss, Expense, Tax

All share the same filter shape: `store_id`, `start_date`, `end_date`, `page`, `per_page`, `sort_field`, `sort_direction`.

## Key Business Rules

- **Membership discounts** auto-apply at POS: normal = 0%, silver = 5%, gold = 7%, platinum = 10%
- **Tax** can be inclusive (`tax_included = true`) or exclusive per product. POS must handle both simultaneously in one cart.
- **Serial numbers** are assigned to specific items at checkout when `has_serial = true` on the product.
- **Warranty** is assigned at checkout when `has_warranty = true`; duration comes from store-configured warranty types.
- **Customer balance** (store credit) and **loyalty points** are both redeemable at POS.
- **Partial payment / due** — orders can be partially paid; outstanding due amount is tracked.
- **Return-to-stock** — each order return reason has a flag controlling whether returned items re-enter inventory.
- **Subscription grace period** — 7 days after `expire_date` before full lockout. Profile shows countdown escalating from normal → orange (≤7 days) → red (≤3 days).
- **Store switching** — POS cart (`invoice` slice) stores items per store in persisted Redux state. Switching store clears the active cart context.
