# AndgateBOS Onboarding Audit

Date: 2026-07-15 (re-audit)

Audience lens: SME shop owner in Bangladesh — thinks in cash/stock/বাকি (customer credit)/দেনা (supplier due), not double-entry bookkeeping. Cheap Android, flaky data, Bangla-first.

## Resolved since last pass

- Durable backend progress (`pos_onboarding_workflows`, draft/resume API) — confirmed live in `/onboarding`.
- Migration presented inside onboarding as Step 4 ("opening"), not a separate route.
- Business segmentation (existing/new/assisted + category) now drives step 4 and product presets.
- Analytics funnel events (`onboarding_started/resumed/step_viewed/step_completed/step_skipped`) wired.
- Mobile stepper layout structurally in place (aside stepper + one primary action per step).

## Fixed this pass

- **Critical — opening stock still routed to raw stock-adjustment screen.** Dashboard checklist widget's `opening_stock` step hardcoded `href: '/products/stock/adjustments'` while the wizard's own "opening" step already used the guided `/accounting/running-business-migration` flow. Two quality tiers for the same task, and the checklist (first thing shown post-signup) had the worse one.
  Fix: `WidgetsController.php` `opening_stock` step now points to `/accounting/running-business-migration`.

- **High — steps marked "complete" on click, not on completion.** `Link onClick={() => markStepComplete()}` ticked a step green the instant the action link was clicked, before the linked task was actually done (e.g. back button on migration page = false-positive complete).
  Fix: removed the premature `onClick`; steps now only complete via the explicit "Save & Next" button.

- **High — dashboard's own "Resume onboarding" link could dead-end at a paywall.** `/onboarding` was missing from `SubscriptionGate`'s bypass list (unlike `/dashboard`), so a lapsed trial mid-setup blocked the wizard itself.
  Fix: added `/onboarding` to `SUBSCRIPTION_BYPASS_PATHS`.

- **High — two unreconciled progress counters** (wizard's self-reported count vs. dashboard's real DB-detected count) shown with no explanation of why they differ.
  Fix: added `onboarding_launch_counts_note` copy on the launch step clarifying the two numbers and which one to trust (the detected one).

- **Medium — accounting jargon in the one warning that matters most.** `onboarding_opening_warning` used "balanced entries" / "stock movements" (ব্যালেন্সড এন্ট্রি / স্টক মুভমেন্ট) — bookkeeping terms, not shopkeeper language.
  Fix: rewritten in plain Bangla/English in both locale files.

- **Medium — full app chrome around a first-run wizard.** Sidebar auto-closes on mobile nav already (existing behavior), but `Footer` and `MobileBottomNav` still rendered during onboarding, adding clickable distractions/clutter on the audience's primary device.
  Fix: `(protected)/layout.tsx` now suppresses `Footer` and `MobileBottomNav` on `/onboarding`. Desktop sidebar margin CSS left untouched — that rule (`main-container .main-content` `ml-[260px]`) is shared by every protected route and not safely verifiable without a live login session; changing it blind risked breaking layout repo-wide.

- **Low — silent autosave failures.** `saveWorkflow(...).catch(() => {})` swallowed errors with zero UI feedback; on flaky mobile data, progress silently fell back to localStorage-only with the user believing it was saved server-side.
  Fix: added `onboarding_save_failed` toast (react-hot-toast, deduped by id) on save failure, dismissed on next successful save.

- **Low/polish — step-1 icon/content mismatch.** "Welcome" step used a `Languages` icon but contained no language control or language-related content (real language switch lives only in the global header dropdown).
  Fix: swapped step icon to `Sparkles`.

## Still open

- **High — employee role guidance still decorative.** Role chips (cashier/salesperson/manager/accountant/storekeeper/custom) are shown but not selectable; toggling "has employees" still just redirects to `/employees/create` with no inline role assignment. Needs a real component, not a copy/icon fix — out of scope for this pass.
- **Unverified — mobile stepper layout.** Structurally a stepper, but not visually confirmed on a real small viewport; `/onboarding` is auth-gated and this session has no login credentials to screenshot it live.

## Verification

- `npx eslint` clean on all touched frontend files (1 pre-existing-pattern warning: missing `t` in a `useEffect` dep array — intentionally left out since `getTranslation()` isn't a memoized hook and adding it risks re-running the debounced autosave effect every render).
- `php -l` clean on `WidgetsController.php`.
- Not visually verified in-browser (no onboarding login session available in this environment).
