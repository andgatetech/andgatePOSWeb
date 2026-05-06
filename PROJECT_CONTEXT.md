# PROJECT_CONTEXT.md

**AndgatePOS** is a multi-tenant, subscription-based SaaS POS and store management system targeting Bangladeshi retail businesses. The frontend is Next.js 14 (App Router) in TypeScript; the backend is Laravel (MySQL) served at `NEXT_PUBLIC_API_BASE_URL/api`. The default UI language is Bengali; English is also supported.

---

## Business Model

- **Subscription tiers** — monthly or yearly billing; each plan defines quotas (max stores, max products, max employees) and feature flags (barcode generation, QR codes, warranty management, etc.).
- **Multi-store** — one user account can own and switch between multiple stores. Every API call is scoped to `currentStoreId`.
- **Role-based access** — the backend returns a `permissions[]` string array per user (e.g. `"products.index"`, `"orders.create"`). The frontend builds the sidebar and protects routes entirely from this array; there is no client-side role enum.
- **Lead-based upgrade** — upgrading a subscription submits a lead form; the sales team manually activates the new plan.

---

## Module Map

| Route | Feature | Key Permission |
|---|---|---|
| `/dashboard` | KPI cards, sales/purchase chart, customer overview, low-stock alert, recent sales & transactions | none (all authenticated) |
| `/pos` | POS terminal — full retail checkout flow | none |
| `/orders` | Order list, order details, edit orders | `orders.index` |
| `/orders/return/list` | Return & exchange processing | `orders.index` |
| `/products` | Product list | `products.index` |
| `/products/create` | Create product (tabbed form) | `products.create` |
| `/products/stock/adjustments` | Stock adjustment | `stock.adjustments` |
| `/products/bulk` | Excel bulk import | `products.bulk-upload` |
| `/label` | Barcode / QR label printing | `barcode.generate` |
| `/purchases/create` | Draft purchase order | `purchase-orders.create` |
| `/purchases/list` | Purchase order list (New / In-progress / Completed / Drafts) | `purchase-orders.index` |
| `/purchases/receive/[id]` | Goods receiving | `purchase-orders.edit` |
| `/suppliers/create` | Add supplier | `suppliers.create` |
| `/suppliers/list` | Supplier list | `suppliers.index` |
| `/customers/create` | Add customer | `customers.create` |
| `/customers/list` | Customer directory | `customers.index` |
| `/account/ledger-list` | Double-entry ledgers | `ledgers.index` |
| `/account/journal-list` | Journal entries | `journals.index` |
| `/expenses/expense-list` | Expense tracking | `expenses.index` |
| `/store` | Store list | `stores.view` |
| `/store/setting` | Per-store configuration | `stores.edit` |
| `/employees` | Employee management | `users.view` |
| `/category` | Category list | `categories.index` |
| `/brand` | Brand list | `brands.index` |
| `/reports/*` | 15+ report pages | various `reports.*` |
| `/notifications` | In-app notifications | none |
| `/feedbacks` | Feedback submission & list | none |
| `/users/profile` | Profile, subscription status, payment history | none |
| `/subscription` | Plan upgrade (lead form) | none |

---

## POS Terminal (`/pos`)

The most complex module. Split into `PosLeftSide` (product browsing) and `PosRightSide` (cart + checkout).

**Left side:** category/brand filter panels, search bar, paginated product grid, camera barcode/QR scanner.

**Right side cart state (Redux `invoice` slice, persisted):**
```typescript
interface Item {
    id: number;
    productId?: number;
    stockId?: number;          // variant stock record
    title: string;
    variantName?: string;      // e.g. "Red - M - Cotton"
    rate: number;
    regularPrice?: number;
    wholesalePrice?: number;
    quantity: number;
    amount: number;
    tax_rate?: number;
    tax_included?: boolean;    // true = tax already in price
    isWholesale?: boolean;
    serials?: Serial[];
    warranty?: Warranty | null;
    has_serial?: boolean;
    has_warranty?: boolean;
}
```

**Checkout features:**
- Customer selection / quick-create
- Membership discount (auto-applied: silver 5%, gold 7%, platinum 10%)
- Manual discount override
- Loyalty points redemption
- Customer balance (credit) usage
- Wholesale pricing toggle
- Multiple payment methods per order
- Payment status: paid / partial / due
- Change amount calculation
- Serial number assignment at checkout
- Warranty assignment at checkout

**`createOrder` API payload shape:**
```
{ user_id, store_id, items: [{ product_id, quantity, unit_price, tax, tax_included, subtotal }], ... }
```
Tax calculation must handle both `tax_included` (inclusive) and `!tax_included` (exclusive) modes. When changing pricing logic, update both the display calculation and the payload simultaneously.

---

## Product Creation (Tabbed Form)

Tabs: **Basic Info → SKU → Pricing → Stock → Variants → Attributes → Serial → Warranty → Images → Tax**

Key fields that affect POS behavior:
- `has_serial` — triggers serial number collection at checkout
- `has_warranty` — triggers warranty assignment at checkout
- `tax_included` — determines POS tax calculation mode
- Variants create separate `stockId` records; each variant has its own price and stock

---

## Purchase Order Flow

```
Draft (save)  →  Purchase Order (submit)  →  Goods Receiving (/purchases/receive/[id])  →  Completed
```

Suppliers are linked at PO creation. Payment/transaction tracking records partial payments. `TransactionTrackingModal` handles installment payments.

---

## Reports (15+ pages under `/reports`)

All reports share the same filter pattern: `store_id`, `start_date`, `end_date`, `page`, `per_page`, `sort_field`, `sort_direction`. Results are never cached between filter changes — always fresh RTK Query calls with `providesTags`.

| Group | Reports |
|---|---|
| Sales & Revenue | Sales, Order Returns, Transactions, Invoices, Sales Items, Customer Report |
| Purchase & Supplier | Purchase, Purchase Items, Purchase Transactions, Supplier, Supplier Dues |
| Inventory | Stock, Low Stock, Idle Products, Adjustments, Product |
| Financial | Profit & Loss, Expense, Tax |

---

## Key Data Models

### Auth State (`store/features/auth/authSlice.ts`)
```typescript
{
    user: {
        id, name, email, phone, role, status,
        stores: Store[],
        subscription_user: SubscriptionUser,
        permissions: string[]       // ["products.index", "orders.create", ...]
    },
    token: string,
    isAuthenticated: boolean,
    currentStore: Store,
    currentStoreId: number
}
```

### Subscription
```typescript
SubscriptionUser {
    plan_name_en, billing_cycle: 'trial'|'monthly'|'yearly',
    status: 'active'|'pending'|'expired'|'blocked'|'hold',
    start_date, expire_date,
    items: [{ title_en, value, used, remaining }]  // quotas
}
```
Grace period: 7 days after `expire_date` before full lockout. Profile page shows countdown with color escalation (normal → orange ≤7 days → red ≤3 days → critical).

### Customer Membership
```typescript
membership: 'normal'|'silver'|'gold'|'platinum'
// Auto-discount at POS: normal=0%, silver=5%, gold=7%, platinum=10%
// Fields: points (loyalty), balance (store credit)
```

### Store Currency
```typescript
{
    currency_code, currency_name, currency_symbol,
    currency_position: 'before'|'after',
    decimal_places, thousand_separator, decimal_separator
}
```
Use `useCurrency()` hook — never format currency manually.

### Payment Methods & Statuses
Configured per store in Store Settings. Retrieved via RTK Query and stored on the `currentStore` object. POS reads these at checkout.

---

## Permissions & Route Protection

`middleware.ts` runs on every request:
1. Language detection (geo → cookie → default `'bn'`)
2. Auth check (no token → redirect `/login`)
3. Permission check via `canAccessRoute(role, permissions, route)` from `lib/permissions.ts`

`lib/permissions.ts` exports:
- `ROUTE_PERMISSIONS` — maps ~60 routes to required permission arrays
- `hasRoutePermission(user, route)` — single route check
- `hasAnyPermission(user, permissions[])` — OR logic
- `hasAllPermissions(user, permissions[])` — AND logic
- `buildMenuFromPermissions(permissions[])` — generates sidebar `MenuItem[]`

`lib/permissionConfig.ts` maps each permission string to human labels, sidebar menu labels, and Tailwind color classes (used in Employees Management UI).

**Routes with no permission requirement:** `/dashboard`, `/pos`, `/notifications`, `/feedbacks`, `/users/profile`, `/subscription`

---

## Subscription Error Handling

Backend returns `403` with body:
```json
{ "error_type": "quota_exhausted", "message": "...", "feature": "products", "used": 45, "limit": 50 }
```

Error types: `no_active_subscription`, `subscription_expired`, `quota_exhausted`, `feature_unavailable`, `limit_reached`, `subscription_required`.

The `useSubscriptionError(error)` hook detects these, the `SubscriptionError` component displays the banner, and pages redirect to `/subscription?error_type=...` with encoded details.

---

## Custom Hooks

| Hook | Purpose |
|---|---|
| `useCurrency()` | `formatCurrency(amount)`, currency symbol, store's currency config |
| `useCurrentStore()` | Current store object, `hasMultipleStores`, `hasStores` flags |
| `useSubscriptionError(error)` | Detect + parse 403 subscription errors from RTK Query |
| `useUniversalFilter(options)` | Manage filter state (search, store, dates), builds API query params |

---

## RTK Query Conventions

- Base: `store/api/baseApi.ts` — injects `Authorization: Bearer <token>` automatically
- New domain API: `store/features/<Resource>/<Resource>Api.ts` → `baseApi.injectEndpoints(...)`
- Tag types (60+) are declared on `baseApi`. Notable: `'Dashboard'`, `'Products'`, `'Orders'`, `'Purchases'`, `'WarrantyTypes'`, `'ProductSerials'`, `'Notifications'`, `'Plans'`
- **Not persisted** — RTK Query cache is excluded from `redux-persist`. Only `auth`, `invoice`, `orderEdit`, `orderReturn` slices are persisted

---

## Store Settings (per store, via `/store/setting`)

Tabs and what they control:

| Tab | Configures |
|---|---|
| Basic Info | Store name, location, contact, max discount % |
| Operating Hours | Opening/closing times |
| Loyalty Program | Enable/disable, points-per-currency rate |
| Branding | Store logo upload |
| Store Status | Active/inactive toggle |
| Units | Product measurement units (piece, kg, litre, …) |
| Attributes | Product attribute types |
| Payment Methods | Tender types for POS checkout |
| Payment Statuses | Order payment status labels & colours |
| Currency | Code, symbol, position, decimals, separators |
| Warranty Types | Duration presets (months/days) |
| Adjustment Reasons | Stock adjustment reason codes |
| Order Return Reasons | Return reason codes + return-to-stock toggle |

---

## Third-Party Integrations

| Library | Used For |
|---|---|
| `html5-qrcode` | Camera barcode/QR scanning at POS |
| `jspdf`, `html2canvas`, `pdfmake` | Invoice/report PDF export |
| `qrcode.react` | QR code rendering on label print page |
| `ApexCharts` | Dashboard charts (bar, pie, line) |
| `FullCalendar` | Date selection in some report filters |
| `SweetAlert2` | Confirmation/success/error dialogs (via `lib/toast.ts` wrappers: `showConfirmDialog`, `showSuccessDialog`, `showErrorDialog`) |
| `react-hot-toast` | Inline toast notifications |
| `Mantine` | Some UI primitives |

**Dialog wrappers (always use these, never call SweetAlert2 directly):**
```typescript
import { showConfirmDialog, showSuccessDialog, showErrorDialog, showMessage } from '@/lib/toast';
```

---

## Notification System

Unread count polled every 5 minutes (`pollingInterval: 300000`) via `useGetUnreadCountQuery`. Badge shown in sidebar. `NotificationDropdown` in header renders the feed.

---

## Environment Variables

| Variable | Required | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `http://127.0.0.1:8080` |
| `NEXT_PUBLIC_BASE_PATH` | Yes | Image/storage base URL |
| `NEXT_PUBLIC_GTM_ID` | No | — |
| `NEXT_PUBLIC_GA_ID` | No | — |
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | No | — |
