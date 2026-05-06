# SYSTEM_PROMPT.md

Rules and constraints for AI assistants working in this repository. These override general coding conventions.

---

## i18n — Non-negotiable Rules

1. **`getTranslation()` must be called at the top of the component function body** — never inside `.map()`, `useCallback`, `useMemo`, callbacks, or helper functions. It reads a cookie synchronously; calling it inside a loop re-reads it on every iteration and has caused production bugs.

   ```typescript
   // CORRECT
   const MyComponent = () => {
       const { t } = getTranslation();   // ← top of component body
       return <p>{t('some_key')}</p>;
   };

   // WRONG — causes bug
   items.map((item) => {
       const { t } = getTranslation();   // ← never here
       return t('some_key');
   });
   ```

2. **Always add keys to both locale files** — `public/locales/en.json` AND `public/locales/bn.json`. A missing key shows the raw key string on screen in production.

3. **Validate JSON after editing locale files:**
   ```bash
   python3 -c "import json; json.load(open('public/locales/en.json'))"
   python3 -c "import json; json.load(open('public/locales/bn.json'))"
   ```

4. **Sidebar menu label keys** — the exact label strings from `lib/menu-builder.tsx` (e.g., `'Dashboard'`, `'Orders'`, `'Purchases Order'`) must exist as top-level keys in both JSON files. The sidebar uses `t(route.label)` directly.

5. **Missing-key detection** — always grep the component for `t('` calls and verify every key exists before reporting a translation task complete.

---

## Dialog / Toast Rules

Always use the wrappers from `lib/toast.ts`. Never call SweetAlert2 directly.

```typescript
import { showConfirmDialog, showSuccessDialog, showErrorDialog, showMessage } from '@/lib/toast';

// Delete confirmation pattern:
showConfirmDialog(
    t('msg_delete_x_title'),
    `${t('msg_confirm_delete_name')} "${name}"? ${t('msg_cannot_be_undone')}`,
    t('btn_yes_delete'),
    t('btn_cancel')
)
```

---

## State & API Rules

- **Cart mutations** — use `addItemRedux`, `updateItemRedux`, `clearItemsRedux` from `store/features/Order/OrderSlice.ts`. Do not mutate invoice state directly.
- **New API endpoints** — add to `store/features/<Resource>/<Resource>Api.ts` via `baseApi.injectEndpoints`. Add tag strings to `baseApi.tagTypes` in `store/api/baseApi.ts`. Follow existing `providesTags` / `invalidatesTags` patterns.
- **Never add RTK Query cache to redux-persist whitelist** — `baseApi.reducerPath` must remain excluded.
- **`currentStoreId`** — all store-scoped API calls must include the active store ID. Read it from `useCurrentStore()` or `state.auth.currentStoreId`; never hardcode.
- **Auth token** — injected automatically by `baseApi.prepareHeaders`; never pass it manually in endpoint definitions.

---

## POS Tax Rule

Products can be `tax_included` (true) or not. A single cart may contain both types simultaneously. When modifying pricing or totals in `PosRightSide.tsx`, update **both** the display calculation and the `createOrder` payload together.

---

## Currency Formatting

Never format currency values manually. Use the `useCurrency()` hook:
```typescript
const { formatCurrency, symbol } = useCurrency();
formatCurrency(1234.5); // → "৳1,234.50" (respects store's separator/decimal/position config)
```

---

## Subscription Errors

When an RTK Query call might hit a quota or plan limit, wrap the error with `useSubscriptionError(error)`. Do not write custom 403 handling — the hook + `SubscriptionError` component handle all subscription error types consistently.

---

## Code Style

- Components in `(protected)/` are `'use client'` unless they only render static markup.
- Prefer editing existing files over creating new ones. New utility components go in `components/`; new page-specific components go alongside their page file.
- TypeScript interfaces for API responses go in the same file as their RTK Query endpoint.
- Do not add comments explaining what code does. Only add comments for non-obvious WHY (workaround, constraint, subtle invariant).
- Do not create documentation or planning files inside `app/`, `components/`, or `store/` — use the `context/` directory.
