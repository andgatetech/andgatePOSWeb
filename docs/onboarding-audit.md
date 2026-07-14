# AndgateBOS Onboarding Audit

Date: 2026-07-15

## Critical

- Current onboarding needed durable backend progress.
  - Current behavior before this patch: `/onboarding` and dashboard checklist inferred progress from existing records and kept no server-side step drafts/status.
  - User impact: refresh/device change could not reliably resume an in-progress wizard.
  - Business impact: support team had to help users recover unclear setup state.
  - Implemented improvement: added `pos_onboarding_workflows`, store/user scoped model, service and API for draft JSON, current step, status, completion timestamps and version.
  - Remaining improvement: add analytics events and deeper step-level audit rows if funnel reporting needs every field error.
  - Technical impact: migration/model/service/controller/API/frontend synchronization.
  - Risk level: Resolved for draft/resume; Low remaining for analytics detail.

- Opening stock is linked to stock adjustment page, not a guided safe opening-stock flow.
  - Current behavior: checklist links to `/products/stock/adjustments`.
  - User impact: users may not understand cost basis, warehouse, stock ledger impact.
  - Business impact: wrong inventory valuation and reports.
  - Recommended improvement: create dedicated opening stock draft/post flow using stock movement records, warehouse scope, duplicate prevention and audit.
  - Technical impact: backend service and tests before exposing automated onboarding posting.
  - Risk level: Critical.

- Existing business migration is separate from onboarding.
  - Current behavior: `/accounting/running-business-migration` exists as a separate route.
  - User impact: user sees onboarding and migration as different tasks.
  - Business impact: incomplete opening position before first live sale.
  - Recommended improvement: keep route but present it inside onboarding as Step 4A with plain Bangla guidance and warnings.
  - Technical impact: frontend navigation + later backend workflow link.
  - Risk level: Critical.

## High

- Registration creates defaults but not with explicit onboarding state.
  - Current behavior: registration creates store, template currencies, payment statuses, methods, reasons, ledgers, units, warranties and subscription.
  - User impact: user cannot see what was already prepared.
  - Business impact: repeated support questions and setup duplication risk.
  - Recommended improvement: expose default-readiness checklist and backend idempotency audit.
  - Technical impact: service extraction from large auth controller.
  - Risk level: High.

- Business segmentation is missing.
  - Current behavior: onboarding shows new shop and existing shop cards only.
  - User impact: first-time users receive same tasks as migrated businesses.
  - Business impact: slower activation and lower first-sale conversion.
  - Recommended improvement: ask business status and category first; drive recommended steps from that.
  - Technical impact: frontend state now; backend workflow later.
  - Risk level: High.

- Employee setup exposes destination but not simplified role guidance.
  - Current behavior: checklist has no employee/access step.
  - User impact: owner may over-grant permissions or skip staff setup.
  - Business impact: permission and accountability risk.
  - Recommended improvement: simple role choices in onboarding, advanced permission matrix later.
  - Technical impact: integrate package employee limits and role templates.
  - Risk level: High.

## Medium

- Bangla helper copy exists but is not wizard-style.
  - Current behavior: checklist labels are translated but limited.
  - User impact: non-technical users may not understand why a value matters.
  - Business impact: incomplete setup and support load.
  - Recommended improvement: short field explanations, examples, "can change later" copy.
  - Technical impact: locale additions and component copy review.
  - Risk level: Medium.

- Mobile flow is checklist-first, not one-primary-action wizard.
  - Current behavior: many cards/links shown together.
  - User impact: small-screen cognitive load.
  - Business impact: lower completion on Android/PWA.
  - Recommended improvement: stepper layout with large tap targets and one primary action.
  - Technical impact: frontend redesign.
  - Risk level: Medium.

## Low

- Analytics funnel events are not wired for onboarding steps.
  - Current behavior: dashboard progress endpoint exists, no step event tracking observed.
  - User impact: none directly.
  - Business impact: no measurable drop-off data.
  - Recommended improvement: add non-sensitive onboarding events.
  - Technical impact: analytics service integration.
  - Risk level: Low.
