# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js 14)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint via next lint
```

No test framework is configured. The backend API runs separately; point `NEXT_PUBLIC_API_BASE_URL` at it (default: `http://127.0.0.1:8080`).

## Architecture Overview

**Stack:** Next.js 14 App Router · TypeScript · Redux Toolkit (RTK + RTK Query) · Tailwind CSS · `redux-persist`

### Route Layout

```
app/
├── (application)/
│   ├── (protected)/   # Auth-gated pages (dashboard, products, orders, pos, reports, …)
│   └── (public)/      # Login, register, subscription
└── promotion/         # Public marketing/landing page
```

All auth-gated pages live under `(protected)`. The Next.js middleware at `middleware.ts` enforces token presence and permission checks before allowing access, using `lib/permissions.ts` → `ROUTE_PERMISSIONS` map (~60 routes).

### State Management

- **`store/index.tsx`** — Redux store with redux-persist. Persisted slices: `auth`, `invoice`, `orderEdit`, `orderReturn`. RTK Query cache (`baseApi.reducerPath`) is **not** persisted.
- **`store/api/baseApi.ts`** — RTK Query base; reads `NEXT_PUBLIC_API_BASE_URL`, injects `Authorization: Bearer <token>` from `state.auth.token`. All domain API files use `baseApi.injectEndpoints`.
- **Domain slices** live at `store/features/<Resource>/<Resource>Api.ts` (RTK Query) and `store/features/<Resource>/<Resource>Slice.ts` (plain Redux). The POS cart is `store/features/Order/OrderSlice.ts` — use `addItemRedux`, `updateItemRedux`, `clearItemsRedux` for cart mutations.

### Auth & Multi-Store

`store/features/auth/authSlice.ts` holds `user`, `token`, `isAuthenticated`, `currentStore`, `currentStoreId`. The `user` object contains `permissions[]` (backend-provided strings like `'products.index'`, `'reports.sales'`) and `stores[]` (all stores the user can access). `setCurrentStore()` / `setCurrentStoreById()` switch the active store, which scopes all API calls.

`lib/permissions.ts` exports helpers (`hasRoutePermission`, `hasAnyPermission`, `canAccessRoute`). `lib/permissionConfig.ts` maps permissions to sidebar labels, colors, and action names. `lib/menu-builder.tsx` defines `ALL_MENU_ITEMS` — the full sidebar tree filtered at render time by `buildMenuFromPermissions(user.permissions)`.

### i18n System — Critical Rules

**`getTranslation()`** is a regular function exported from `i18n.ts`, **not a React hook**. It reads the active language from the `i18nextLng` cookie (default `'bn'`).

```typescript
const { t, i18n } = getTranslation();
t('hero_title')         // flat key → looks up public/locales/{lang}.json
t('footer.brand.name')  // dot notation → nested lookup
i18n.language           // 'en' | 'bn'
i18n.changeLanguage('en') // sets cookie + reloads page
```

**Rules that must never be broken:**
1. Call `const { t } = getTranslation()` **at the top of the component function body** — never inside `.map()`, `useCallback`, `useMemo`, or any other callback/helper. This is a plain function (not a hook), but calling it inside a loop re-reads cookies on every iteration, which is both wasteful and a known source of bugs found during i18n work.
2. When a key is missing from the JSON, `t()` returns the key string itself — so missing keys appear verbatim on screen.
3. Add new keys to **both** `public/locales/en.json` and `public/locales/bn.json`. Validate JSON with `python3 -c "import json; json.load(open('public/locales/en.json'))"`.
4. Sidebar menu item labels (e.g. `'Dashboard'`, `'Orders'`) are used **directly as i18n keys** via `t(route.label)` in `components/layouts/sidebar.tsx`. Add the exact label string as a key in both locale files when adding menu items.

### Adding API Endpoints

1. Create or extend `store/features/<Resource>/<Resource>Api.ts`.
2. Use `baseApi.injectEndpoints({ endpoints: (builder) => ({ … }) })`.
3. Add tag strings to `baseApi.tagTypes` (e.g. `'Products'`, `'Orders'`).
4. `invalidatesTags` / `providesTags` patterns are already established — follow existing examples.

### POS-Specific Complexity

`app/(application)/(protected)/pos/` contains the most complex logic. Items support a `tax_included` boolean; POS calculations handle both inclusive and exclusive tax. When changing pricing logic, update both the display calculation and the `createOrder` payload simultaneously. The API payload expects: `user_id`, `store_id`, `items[]` with `product_id`, `quantity`, `unit_price`, `tax`, `tax_included`, `subtotal`.

### Tailwind Custom Tokens

Brand colors: `primary (#046ca9)`, `success (#00ab55)`, `danger (#e7515a)`, `warning (#e2a03f)`. Use `bg-success`, `text-danger`, etc. — not raw hex values. Dark mode uses the `class` strategy.

### Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | RTK Query base URL (e.g. `http://127.0.0.1:8080`) |
| `NEXT_PUBLIC_BASE_PATH` | Yes | Image/storage base URL |
| `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID` | No | Analytics |
