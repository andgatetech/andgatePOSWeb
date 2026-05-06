# ARCHITECTURE.md

## Stack

Next.js 14 App Router · TypeScript · Redux Toolkit + RTK Query · redux-persist · Tailwind CSS 3

---

## Directory Layout

```
app/
├── (application)/
│   ├── (protected)/     # All auth-required pages; middleware enforces token + permissions
│   ├── (public)/        # login, register, subscription (no auth required)
│   └── layout.tsx
├── promotion/           # Public marketing / landing page
components/
├── layouts/             # sidebar, header, footer, MainLayout, main-container
store/
├── api/baseApi.ts       # RTK Query base — injects Bearer token from state.auth.token
├── features/            # One sub-folder per domain (auth, Order, Product, customer, …)
└── index.tsx            # Store config + redux-persist whitelist
lib/
├── permissions.ts       # ROUTE_PERMISSIONS map + helper functions
├── permissionConfig.ts  # Permission → label, color, sidebar label mappings
├── menu-builder.tsx     # ALL_MENU_ITEMS + buildMenuFromPermissions()
└── toast.ts             # SweetAlert2 wrappers (showConfirmDialog, showSuccessDialog, …)
hooks/                   # useCurrency, useCurrentStore, useSubscriptionError, useUniversalFilter
i18n.ts                  # getTranslation() — reads i18nextLng cookie, returns { t, i18n }
middleware.ts            # Geo language detection + auth + permission enforcement
public/locales/          # en.json (3114 lines), bn.json (2988 lines)
```

---

## Auth & Middleware Flow

```
Request
  └─► middleware.ts
        ├── 1. Geo/cookie → set x-lang header (Bengali default)
        ├── 2. Is public path? → pass through
        ├── 3. No token?  → redirect /login
        └── 4. canAccessRoute(role, permissions, route)?
                  No  → redirect /dashboard
                  Yes → pass through
```

`canAccessRoute` reads `ROUTE_PERMISSIONS` from `lib/permissions.ts` — a map of ~60 routes to required permission arrays. Routes with an empty array (dashboard, pos, notifications) are accessible to all authenticated users.

---

## Redux Store

**Persisted slices** (survive page reload via localStorage):
| Slice | What it holds |
|---|---|
| `auth` | user, token, isAuthenticated, currentStore, currentStoreId |
| `invoice` | POS cart items per store |
| `orderEdit` | order being edited |
| `orderReturn` | return/exchange in progress |

**Not persisted:** RTK Query cache (`baseApi.reducerPath`). All API data re-fetches on reload.

**Key domain slices:**
- `Order/OrderSlice` — cart actions: `addItemRedux`, `updateItemRedux`, `clearItemsRedux`
- `PurchaseOrder/PurchaseOrderSlice` — purchase draft state
- `supplier/supplierSlice` — persisted supplier selection
- `Label/labelSlice` — label print configuration
- `themeConfigSlice` — sidebar open/close, RTL

---

## RTK Query Pattern

All API calls go through `store/api/baseApi.ts`:
- Base URL: `${NEXT_PUBLIC_API_BASE_URL}/api`
- Prepares headers: `Authorization: Bearer <token>` from `state.auth.token`
- 60+ tag types declared on `baseApi`

Domain APIs live at `store/features/<Resource>/<Resource>Api.ts` and use `baseApi.injectEndpoints(...)`. Hooks are exported from there and used directly in components.

**Common API response envelope:**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Subscription error (403):**
```json
{ "error_type": "quota_exhausted", "message": "...", "feature": "products", "used": 45, "limit": 50 }
```
Handled by `useSubscriptionError(error)` hook + `SubscriptionError` component.

---

## i18n Architecture

`getTranslation()` in `i18n.ts` is a plain function (not a React hook). It reads the `i18nextLng` cookie synchronously — on the server via `next/headers cookies()`, on the client via `universal-cookie`.

```
Browser request
  └─► middleware.ts detects language (Vercel geo → cookie → 'bn')
        └─► sets x-lang response header
              └─► SSR components read x-lang via next/headers
                    └─► Client hydration reads i18nextLng cookie
```

Language change calls `cookies.set('i18nextLng', lang) + window.location.reload()`.

Missing key → `t(key)` returns the key string itself (visible on screen as raw key name).

**Sidebar special case:** menu item labels (`'Dashboard'`, `'Orders'`, etc.) are passed directly as i18n keys via `t(route.label)` in `sidebar.tsx`. These exact strings must exist as top-level keys in both locale JSON files.

---

## Permission System

```
Backend login response
  └─► user.permissions: ["products.index", "orders.create", ...]
        stored in auth Redux slice
              │
              ├─► middleware.ts  →  canAccessRoute() blocks/allows pages
              ├─► sidebar.tsx    →  buildMenuFromPermissions() filters menu items
              └─► components     →  hasRoutePermission() / hasAnyPermission() gates UI elements
```

Permission string format: `<category>.<action>` (e.g., `stock.adjustments`, `reports.sales`).

---

## Store Settings Tabs (13 tabs at `/store/setting`)

| Tab | What it configures |
|---|---|
| Basic Info | Name, location, contact, max discount % |
| Operating Hours | Open / close times |
| Loyalty Program | Enable toggle, points-per-currency rate |
| Branding | Logo upload |
| Store Status | Active / inactive toggle |
| Units | Measurement units (piece, kg, litre, …) |
| Attributes | Product attribute types |
| Payment Methods | Tender types used at POS checkout |
| Payment Statuses | Status labels & colours (paid, partial, due, …) |
| Currency | Code, symbol, position, decimal places, separators |
| Warranty Types | Duration presets (months / days) |
| Adjustment Reasons | Reason codes for stock adjustments |
| Order Return Reasons | Reason codes + return-to-stock flag |

---

## Key Third-Party Libraries

| Library | Used for |
|---|---|
| `html5-qrcode` | Camera barcode/QR scanning at POS |
| `jspdf`, `html2canvas`, `pdfmake` | PDF invoice & report export |
| `qrcode.react` | QR code rendering on label print page |
| `ApexCharts` | Dashboard charts |
| `FullCalendar` | Date pickers in some report filters |
| `SweetAlert2` | Dialogs — always use `lib/toast.ts` wrappers, never SweetAlert2 directly |
| `react-hot-toast` | Inline toast notifications |

---

## Tailwind Custom Tokens

```
primary   #046ca9   (andgate blue)
success   #00ab55
danger    #e7515a
warning   #e2a03f
info      #2196f3
secondary #805dca
```

Use semantic class names (`bg-success`, `text-danger`) — never raw hex. Dark mode uses the `class` strategy.
