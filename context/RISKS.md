# RISKS.md

Known risks, failure modes, and technical debt. Updated as new issues are discovered.

---

## Active Risks

### R1 — `getTranslation()` placement bug (recurring)
**Severity:** High  
**Likelihood:** High (already occurred 3 times in store/setting tabs)  
**Description:** Calling `getTranslation()` inside `.map()`, `useCallback`, `useMemo`, or helper functions causes repeated cookie reads per iteration and has broken production in PaymentStatusTab, PaymentMethodsTab, and CurrencyTab.  
**Detection:** Grep: `grep -rn "getTranslation" --include="*.tsx" | grep -v "= getTranslation"` — flags any call not at top-level assignment.  
**Mitigation:** SYSTEM_PROMPT.md rule #1. Code review gate before merge.

---

### R2 — Missing i18n keys shipping to production
**Severity:** Medium  
**Likelihood:** High (active i18n migration in progress)  
**Description:** When a `t('key')` call references a key absent from en.json/bn.json, the raw key string renders on screen (e.g., `purchase_title` appeared literally in the dashboard).  
**Detection:** Python script — compare all `t('...')` calls in components against en.json keys.  
**Mitigation:** SYSTEM_PROMPT.md rule #5. Run validate script after every translation batch.

---

### R3 — Sidebar menu item without i18n key
**Severity:** Medium  
**Likelihood:** Medium  
**Description:** When a new menu item is added to `lib/menu-builder.tsx`, its exact label string must also be added as a key to both locale files. Missing = raw label renders instead of translation.  
**Detection:** Diff ALL_MENU_ITEMS labels against en.json top-level keys.  
**Mitigation:** DECISIONS.md documents this pattern. CLAUDE.md includes the rule.

---

### R4 — Stale POS cart after price/stock change
**Severity:** Medium  
**Likelihood:** Low  
**Description:** The `invoice` Redux slice is persisted to localStorage. If a product's price changes or goes out of stock between sessions, the cart still holds the old data. Validation only happens at order submission.  
**Detection:** Manual — compare cart item prices against current product API response.  
**Mitigation:** POS validates quantities at submission. Accepted trade-off (see DECISIONS.md).

---

### R5 — Redux-persist schema mismatch after deployment
**Severity:** High  
**Likelihood:** Low  
**Description:** If the shape of a persisted slice changes (e.g., a new required field added to `auth`), old localStorage data hydrates an invalid state, potentially breaking auth or POS.  
**Detection:** TypeScript compile errors when accessing new required fields on persisted state.  
**Mitigation:** Increment `redux-persist` `version` and write a migration function in `store/index.tsx` whenever a persisted slice schema changes.

---

### R6 — Locale JSON corruption breaking entire app
**Severity:** Critical  
**Likelihood:** Low  
**Description:** An invalid JSON edit to en.json or bn.json causes a parse error. Since `getTranslation()` is called in every component, the app becomes non-functional.  
**Detection:** `python3 -c "import json; json.load(open('public/locales/en.json'))"` — run after every edit.  
**Mitigation:** SYSTEM_PROMPT.md rule #3. CI should validate JSON on push.

---

### R7 — Permission check only on frontend
**Severity:** Low (API enforces server-side)  
**Likelihood:** N/A  
**Description:** Frontend permission filtering (sidebar, route protection) is a UX layer only. A determined user can inspect Redux state and see permission strings.  
**Accepted:** API validates all requests server-side. Frontend filtering is for UX only.

---

### R8 — Subscription expiry not blocking API calls
**Severity:** Medium  
**Likelihood:** Low  
**Description:** The 7-day grace period is tracked client-side in the profile UI. Expired subscriptions rely on server-side 403 responses — if quota checks are misconfigured on the backend, users may exceed limits silently.  
**Mitigation:** Always wrap potentially quota-limited API calls with `useSubscriptionError(error)`.

---

## Technical Debt

| Item | Location | Priority |
|---|---|---|
| Many `placeholder` attributes still use raw English strings | All form components | Medium |
| `title` attributes on icon buttons mostly untranslated | Global | Low |
| `aria-label` attributes not audited for translation | Global | Low |
| No automated CI check for missing i18n keys | CI pipeline | Medium |
| No `redux-persist` version/migration strategy documented | `store/index.tsx` | Medium |
| SweetAlert2 called directly in some older components (not through `lib/toast.ts`) | Scattered | Low |
| No test coverage — zero test files in repo | Global | High |
