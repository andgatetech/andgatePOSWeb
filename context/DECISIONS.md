# DECISIONS.md

Records of architectural and design decisions — the "why" behind non-obvious choices.

---

## `getTranslation()` is a plain function, not a React hook

**Decision:** The i18n helper is exported as a regular function rather than a `useTranslation` hook.

**Why:** The system must support both server components (SSR) and client components in Next.js 14 App Router. React hooks cannot be called in server components. A plain function that reads from `next/headers` (server) or `universal-cookie` (client) based on `typeof window` satisfies both environments with one API.

**Trade-off:** Callers must remember to call it at component top level, not inside callbacks. This has caused bugs (getTranslation inside `.map()` or helpers). The rule is enforced by convention and documented in SYSTEM_PROMPT.md.

---

## Bengali as the default language

**Decision:** `'bn'` is the default language when no cookie is set, and Vercel geo detection routes Bangladesh IPs to Bengali automatically.

**Why:** The primary market is Bangladesh. Most users never change their language. Defaulting to Bengali reduces the cognitive load of the initial experience for the target audience.

**Trade-off:** English-speaking developers testing locally see Bengali UI by default. Set the `i18nextLng=en` cookie in the browser to override.

---

## Sidebar menu labels used directly as i18n keys

**Decision:** `ALL_MENU_ITEMS` in `lib/menu-builder.tsx` defines labels as plain strings (e.g., `'Dashboard'`, `'Purchases Order'`). The sidebar renders them via `t(route.label)`, which means these English strings are also the i18n lookup keys.

**Why:** The menu is built dynamically based on permissions. Passing a separate `labelKey` alongside `label` would duplicate data. Using the label itself as the key keeps `menu-builder.tsx` the single source of truth for menu structure.

**Trade-off:** Adding a new menu item requires also adding its exact label string as a key to both `en.json` and `bn.json`. This step is easy to forget. The symptom is the raw label string appearing in the sidebar instead of a translation.

---

## Lead-based subscription upgrade (no direct payment)

**Decision:** Subscription upgrades submit a contact form; the team manually activates new plans.

**Why:** The platform targets Bangladeshi SMBs. Payment gateway integration (bKash, Nagad, cards) has compliance requirements and additional operational overhead. A lead-based model lets the team vet customers, handle custom pricing, and onboard them with support — which reduces churn and increases LTV in this market segment.

**Trade-off:** No self-serve upgrades. Upgrade latency depends on the sales team's response time.

---

## RTK Query cache excluded from redux-persist

**Decision:** `baseApi.reducerPath` is not in the `redux-persist` whitelist.

**Why:** Persisting RTK Query cache causes stale data bugs after deployments (cached responses have old shape) and makes the persisted Redux state very large. Fresh API calls on reload are fast enough and keep the store clean.

**Trade-off:** Every page reload re-fetches data. Mitigated by RTK Query's in-session cache while the tab is open.

---

## POS cart persisted per-store in Redux

**Decision:** The `invoice` slice (POS cart) is persisted to localStorage and keyed per store.

**Why:** Cashiers frequently navigate away from the POS page mid-transaction (to look up a product, check stock). Losing the cart on navigation would cause data loss and frustration. Persistence keeps the cart alive until explicitly cleared or an order is submitted.

**Trade-off:** Stale cart items may persist if a product's price changes or stock runs out between sessions. The POS validates quantities at order submission, not at cart load.

---

## Permission-based menu filtering on the frontend

**Decision:** The backend returns a flat `permissions[]` array at login; the frontend uses this to filter the sidebar menu and protect routes client-side (in addition to server-side middleware).

**Why:** The backend enforces permissions at the API level. The frontend filtering is a UX layer — hiding menu items the user cannot access reduces confusion. The middleware at `middleware.ts` adds a second line of defence for direct URL access.

**Trade-off:** A user who manually inspects their Redux state could see the permission strings. This is acceptable because the API always validates on the server.

---

## SweetAlert2 wrapped behind `lib/toast.ts`

**Decision:** All confirmation and result dialogs go through `showConfirmDialog`, `showSuccessDialog`, `showErrorDialog`, `showMessage` from `lib/toast.ts`.

**Why:** Standardises dialog appearance and button text across 50+ pages. Allows future replacement of SweetAlert2 with a different library by changing one file. Ensures consistent translated text for confirm/cancel buttons (`t('btn_yes_delete')`, `t('btn_cancel')`).
