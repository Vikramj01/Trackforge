# Atlas — Product Status Document

**Last updated:** 2026-02-26
**Branch:** `claude/continue-trackforge-build-ZasZo`

---

## What Atlas Is

Atlas is a **tracking architecture design and conversion signal orchestration platform**. It is not a tag manager, site scanner, or analytics dashboard.

The core problem it solves: modern web apps (SPAs, headless ecommerce) lose 20–40% of conversions because client-side tracking is blocked by ad blockers, iOS ITP, and browser privacy features. Atlas solves this by guiding a marketer through designing a **dual-tracking architecture** — every conversion fires both from the browser (client-side GTM) and from a server (server-side GTM / Measurement Protocol) with automatic deduplication via `event_id`.

**Who it's for:** Growth marketers, marketing ops, agencies, startup founders — non-technical users who need to hand complete, production-ready tracking specifications to developers.

**What it produces:**
One canonical event definition (e.g. `purchase`) → automatically generates:
- Client-side GTM container JSON (GA4 tags, Meta Pixel tags, Google Ads tags)
- Server-side GTM container JSON (GA4 MP tags, Meta CAPI tags, Google Ads Enhanced Conversion tags)
- Server endpoint code (Node.js/Express and Python/FastAPI)
- Data Layer Specification (markdown, for developers)
- Deployment Guide (markdown)
- QA Checklist (markdown)

---

## Five-Phase Workflow

| Phase | Name | Purpose |
|---|---|---|
| 0 | Validator | Scan a live page to detect existing tracking gaps before designing |
| 1 | Discovery | Capture business context and server-side tracking preferences |
| 2 | Journey Designer | Define conversion funnels as canonical events (not DOM elements) |
| 3 | Conversion Orchestration | Map events to platforms, configure client vs server routing |
| 4 | Export | Generate the full implementation package for developers |

---

## What Is Currently Built

### Infrastructure

| Feature | Status | Notes |
|---|---|---|
| React + TypeScript + Vite frontend | ✅ Complete | |
| Tailwind CSS with design system | ✅ Complete | Custom color palette, Bricolage Grotesque / Inter / JetBrains Mono |
| Zustand state management | ✅ Complete | Full project state persisted |
| Supabase Auth (email/password) | ✅ Complete | Login, Signup, ProtectedRoute, session handling |
| Supabase database persistence | ✅ Complete | All project data (discovery, journeys, conversions) saved per user |
| React Router navigation | ✅ Complete | |
| TypeScript types for all models | ✅ Complete | `Project`, `Journey`, `Conversion`, `ValidatorResults`, etc. |

---

### Phase 0 — Validator

| Feature | Status | Notes |
|---|---|---|
| Method picker screen | ✅ Complete | Chrome Extension / Bookmarklet / Demo Mode |
| Chrome Extension install instructions | ✅ Complete | UI only — walks user through sideloading the extension |
| Bookmarklet generation | ✅ Complete | Generates and copies real JavaScript bookmark that runs on any page |
| Bookmarklet real scan | ✅ Complete | Detects GTM, GA4, Meta Pixel, Google Ads tags, empty dataLayer |
| Demo Mode form | ✅ Complete | Collects URLs and platform selections |
| Demo Mode scan | ⚠️ Fake | Animated progress bar (no real fetch). Always returns the same 5 hardcoded issues regardless of URL entered |
| Deep conversion scan | ❌ Missing | `purchase_not_firing`, `gclid_dropped`, `no_capi`, `no_enhanced_conversions`, `missing_transaction_id` cannot be detected by the bookmarklet — requires cross-page navigation and network inspection (would need a headless browser / backend) |
| Results stored in project | ✅ Complete | Validator scan saved to `project.discovery.validatorScan` and used in Phases 2 & 3 |

**Issue IDs the bookmarklet can detect:** `no_gtm`, `no_ga4`, `no_meta`, `no_gads`, `empty_dl`
**Issue IDs only in demo mock data:** `purchase_not_firing`, `gclid_dropped`, `no_capi`, `missing_transaction_id`, `no_enhanced_conversions`

---

### Phase 1 — Discovery

| Feature | Status | Notes |
|---|---|---|
| Client Name, Industry, Website | ✅ Complete | |
| Property Type (SPA / Headless / CMS / Web App) | ✅ Complete | |
| Business Model (Ecommerce / SaaS / Lead Gen / Media / Marketplace) | ✅ Complete | |
| Primary Objective | ✅ Complete | |
| Tech Stack multi-select | ✅ Complete | |
| Server-side tracking toggle | ✅ Complete | |
| Server deployment method (self-hosted / atlas-hosted / GCP) | ✅ Complete | |
| Server endpoint URL field | ✅ Complete | |
| Notes field | ✅ Complete | |
| Zod form validation | ✅ Complete | |
| Saves to Supabase | ✅ Complete | |
| Pre-populates journey templates based on business model | ✅ Complete | Feeds into Phase 2 |

---

### Phase 2 — Journey Designer

| Feature | Status | Notes |
|---|---|---|
| Journey template library | ✅ Complete | Ecommerce checkout, SaaS signup, Lead gen contact, + 3 more |
| Template-based journey creation | ✅ Complete | One click creates a pre-populated journey |
| Custom journey creation | ✅ Complete | |
| Event step editor | ✅ Complete | Canonical name, display name, event type, category, conversion type, route, description, implementation notes |
| Parameter builder | ✅ Complete | Name, type, required flag per parameter |
| Journey re-ordering / deletion | ✅ Complete | |
| TrackingGapsPanel (Phase 2 context) | ✅ Complete | Shows validator issues, auto-injects fix events, marks as resolved when event added |
| Saves to Supabase | ✅ Complete | |

---

### Phase 3 — Conversion Orchestration

| Feature | Status | Notes |
|---|---|---|
| Auto-creates conversion cards from Phase 2 primary/secondary events | ✅ Complete | |
| Tracking method selection (client-only / server-only / both) | ✅ Complete | |
| Client platform toggles (GA4, Meta Pixel) | ✅ Complete | |
| Server platform toggles (GA4 MP, Meta CAPI, Google Ads Enhanced) | ✅ Complete | |
| Custom event name per platform | ✅ Complete | |
| Google Ads conversion label field | ✅ Complete | |
| Value logic (dynamic vs fixed) | ✅ Complete | |
| Currency selection | ✅ Complete | |
| Enhanced Conversions toggle | ✅ Complete | |
| User data fields selection (email, phone, name, address) | ✅ Complete | |
| Deduplication toggle | ✅ Complete | |
| Readiness score (0–100) | ✅ Complete | |
| TrackingGapsPanel (Phase 3 context) | ✅ Complete | Actionable in-app issues (CAPI, Enhanced Conversions, GCLID) vs external tasks (install GTM/GA4/Meta/GAds) |
| Saves to Supabase | ✅ Complete | |

---

### Phase 4 — Export

| Artifact | Status | Notes |
|---|---|---|
| Client-side GTM container JSON | ✅ Complete | GA4 Event tags, Meta Pixel HTML tags, Google Ads Conversion tags, triggers, variables |
| Server-side GTM container JSON | ✅ Complete | GA4 MP (gaawe), Meta CAPI (fbcapi), Google Ads Enhanced (gclidw), Event Data variables, HTTP Request variables, GA4 Client |
| Data Layer Specification (markdown) | ✅ Complete | Per-event `dataLayer.push()` code and parameter tables |
| Server endpoint — Node.js/Express | ✅ Complete | SHA-256 hashing, GA4 MP calls, Meta CAPI calls, switch-case per conversion |
| Server endpoint — Python/FastAPI | ✅ Complete | Equivalent Python implementation |
| Deployment Guide (markdown) | ✅ Complete | Step-by-step GTM import, dataLayer setup, server deploy, Meta CAPI, GA4 validation |
| QA Checklist (markdown) | ✅ Complete | Verification items for GTM, dataLayer, server endpoint, deduplication, Meta, Google Ads |
| "Download All" (7 files when server enabled) | ✅ Complete | |
| Meta CAPI Setup guide (standalone) | ❌ Missing | Spec lists `Meta_CAPI_Setup.md` as a separate export file |
| Enhanced Conversions Setup guide (standalone) | ❌ Missing | Spec lists `Enhanced_Conversions_Setup.md` as a separate export file |
| Event Dictionary CSV | ❌ Missing | Spec lists `Event_Dictionary.csv` — tabular export of all events |
| White-label exports | ❌ Missing | Agency plan feature, not implemented |

---

### Auth & Accounts

| Feature | Status | Notes |
|---|---|---|
| Email/password signup | ✅ Complete | |
| Email/password login | ✅ Complete | |
| Session persistence | ✅ Complete | |
| Sign out | ✅ Complete | |
| Profile stored in Supabase `profiles` table | ✅ Complete | Includes `plan`, `stripe_customer_id`, `plan_status` |
| Account deletion | ✅ Complete | Settings page, deletes from Supabase |

---

### Billing & Stripe

| Feature | Status | Notes |
|---|---|---|
| Plans UI (Free / Pro $49 / Agency $149) | ✅ Complete | Pricing cards with feature lists |
| Stripe Checkout session creation | ✅ Complete | Supabase Edge Function `create-checkout` exists and is wired up |
| Stripe Webhook handler | ✅ Complete | `stripe-webhook` Edge Function handles `customer.subscription.created/updated/deleted` and updates `profiles.plan` |
| Stripe Customer Portal (manage/cancel) | ⚠️ Partial | `Billing.tsx` calls `supabase.functions.invoke('create-portal')` but **no `create-portal` Edge Function exists** in `supabase/functions/` — this will fail at runtime |
| Plan enforcement in the app | ❌ Missing | Free users can create unlimited projects and access all export features. Plan limits (3 projects for free) are defined in the UI copy but never checked in code |
| Pro/Agency gating on export features | ❌ Missing | Server-side exports described as Pro+ features but no gate exists |
| Team seats (Agency) | ❌ Missing | Mentioned in Agency plan features, not built |

---

### Dashboard & Navigation

| Feature | Status | Notes |
|---|---|---|
| Project list with stats | ✅ Complete | Active projects, dual-tracking rate, coverage gain, export count |
| Create new project | ✅ Complete | |
| Delete project | ✅ Complete | |
| Rename project | ✅ Complete | Inline edit |
| Continue project (resume phase) | ✅ Complete | |
| Sidebar navigation | ✅ Complete | |
| Clients page | ⚠️ Stub | Page exists, no functionality |
| Templates page | ⚠️ Stub | Page exists, no functionality |
| Help page | ⚠️ Stub | Page exists, no functionality |
| Settings page | ✅ Functional | Profile display, plan badge, account deletion |

---

### Testing

| Feature | Status | Notes |
|---|---|---|
| Vitest config | ✅ Ready | Config written, waiting for npm registry to be available to install packages |
| node:test runner (works today) | ✅ Complete | 110 tests, all passing |
| Journey template tests | ✅ Complete | 14 tests |
| Validator issue map tests | ✅ Complete | 30 tests |
| Zustand store tests | ✅ Complete (Vitest only) | 18 tests — mocks Supabase with `vi.mock` |
| Phase 3 resolution logic tests | ✅ Complete | 29 tests |
| Server GTM generator tests | ✅ Complete | 33 tests |

---

## What Is Still Missing / Not Complete

### High priority (core product gaps)

1. **`create-portal` Edge Function** — The billing "Manage billing →" button will throw a runtime error because the Supabase Edge Function it calls doesn't exist. Needs a `supabase/functions/create-portal/index.ts` that creates a Stripe Billing Portal session.

2. **Plan enforcement** — No code anywhere checks `profile.plan` before allowing actions. A free user gets identical functionality to a Pro user. This needs gates at project creation (limit 3 for free) and at the Phase 4 export tab (server-side exports are described as Pro+).

3. **Stripe environment variables** — `VITE_STRIPE_PRICE_PRO` and `VITE_STRIPE_PRICE_AGENCY` must be set in the frontend `.env`, and `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_AGENCY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL` must be set as Supabase secrets before billing works end-to-end.

4. **Validator deep scan** — The most valuable issues (`purchase_not_firing`, `gclid_dropped`, etc.) are only available in demo mode with hardcoded fake results. A real scan would require a backend service running a headless browser (Playwright) to navigate the funnel.

### Medium priority (spec completeness)

5. **`Meta_CAPI_Setup.md` export** — The spec calls for a dedicated standalone guide for configuring Meta CAPI in sGTM. Currently the deployment guide contains some Meta steps inline but there is no standalone file.

6. **`Enhanced_Conversions_Setup.md` export** — Same as above for Google Ads Enhanced Conversions.

7. **`Event_Dictionary.csv` export** — A tabular CSV of all events across all journeys. Mentioned in the spec, not generated.

### Low priority (future features)

8. **Team seats** — The Agency plan advertises "Up to 5 team seats" but there is no concept of team membership, invitations, or shared project access.

9. **White-label exports** — Agency plan feature. Currently all exports include "Atlas v1.0" branding in the generated files.

10. **Clients / Templates / Help pages** — These sidebar items exist as empty stubs. Clients could show a client CRM view; Templates could let users save custom journey templates; Help could host documentation.

11. **Real backend** — There is no Express/FastAPI server for Atlas itself (only the generated server code for clients). The app is fully frontend + Supabase. The "Atlas-hosted" server deployment option in Phase 1 implies Atlas would host the tracking endpoint for clients, which would need actual infrastructure.

---

## Environment Variables Required to Run

```env
# Frontend (.env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PRICE_PRO=price_xxx
VITE_STRIPE_PRICE_AGENCY=price_xxx

# Supabase Edge Function secrets (supabase secrets set KEY=value)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_AGENCY=price_xxx
SITE_URL=https://your-atlas-domain.com
```

---

## Tech Stack (Actual)

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS (custom design system) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Routing | React Router v6 |
| Database & Auth | Supabase (PostgreSQL + Supabase Auth) |
| Serverless functions | Supabase Edge Functions (Deno) |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| Testing | Vitest (config ready) + Node.js `node:test` (110 tests running) |
| Code in repo | ~34 TypeScript/TSX files, ~6,500 lines of application code |
