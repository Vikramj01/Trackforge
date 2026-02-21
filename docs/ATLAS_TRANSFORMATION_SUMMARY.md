# Atlas Transformation Summary - Site Scan → Journey-Based TAP

## Complete Product Vision Change

### ❌ OLD APPROACH (Removed)
- **Phase 2:** Site scanning with Puppeteer
- **Method:** Detect buttons/forms via DOM inspection
- **Problem:** Misses dynamic content, brittle selectors, no business context

### ✅ NEW APPROACH (TAP Vision)
- **Phase 2:** Journey Designer (template-based)
- **Method:** Define business funnels and canonical events
- **Advantage:** Business intent first, data layer native, conversion orchestration

---

## New Product Positioning

**Atlas = Tracking Architecture Planner (TAP)**

> "The system of record for conversion truth across GA4, Google Ads & Meta for modern web apps."

**Not:** Tag manager, site scanner, DOM tagger  
**Is:** Analytics infrastructure design & conversion orchestration platform

---

## Updated Four-Phase Workflow

### Phase 1: Discovery (Mostly Unchanged)
**Purpose:** Gather business context

**Inputs:**
- Client name, industry, website URL
- Property type (SPA, headless, CMS, webapp)
- Business model (ecommerce, SaaS, lead gen)
- Primary objective (purchase, signup, lead)
- Current tech stack

**Output:** Pre-configured journey templates based on business model

---

### Phase 2: Journey Designer (COMPLETELY NEW)

**Purpose:** Define user journeys based on business intent

**Key Concept:** Instead of scanning elements, define **business journeys**:
- Checkout Funnel
- Signup Funnel
- Lead Generation Flow
- Product Activation Journey

**Journey Templates (Industry-Based):**

**Ecommerce:**
```
Checkout Funnel:
1. view_item → Product page view
2. add_to_cart → Item added
3. view_cart → Cart viewed
4. begin_checkout → Checkout started
5. add_payment_info → Payment entered
6. purchase → Transaction complete (PRIMARY CONVERSION)
```

**SaaS:**
```
Signup Funnel:
1. view_signup_page → Signup page loaded
2. begin_signup → Form started
3. signup_complete → Account created (PRIMARY CONVERSION)

Activation Journey:
1. first_login → First login
2. profile_complete → Profile completed
3. feature_discovery → Key feature used
4. activation_milestone → Activated (CONVERSION)
```

**Lead Gen:**
```
Contact Flow:
1. view_contact_page → Contact page loaded
2. begin_form → Form interaction started
3. lead_submit → Form submitted (PRIMARY CONVERSION)
```

**UI Components:**
- Template selector (dropdown of pre-built journeys)
- Journey card (collapsible, shows all steps)
- Step editor (event name, parameters, conversion flag)
- Parameter builder (name, type, required/optional)
- Visual context link (optional browser extension capture)

**Event Definition:**
Each step includes:
- Canonical event name (e.g., `add_to_cart`)
- Display name (e.g., "Add to Cart")
- Description (for developers)
- Event type (pageview, action, success, error)
- Category (acquisition, activation, revenue, retention)
- Route/context (optional, e.g., `/checkout`)
- Is conversion? (yes - primary/secondary, no)
- Required parameters (item_id, price, quantity, etc.)
- Implementation notes (for dev team)

**Visual Context Helper (Browser Extension - OPTIONAL):**
- Chrome/Edge extension
- User navigates to page, clicks element
- Captures URL, element label, advisory selector, screenshot
- Links context to event (for dev reference only)
- **CRITICAL:** This is advisory only, NOT used for actual GTM triggers
- Actual tracking = data layer events, not DOM selectors

---

### Phase 3: Conversion Orchestration (ENHANCED)

**Purpose:** Map canonical events to platform-specific conversions

**Core Feature:** Conversion Signal Orchestration
- One canonical event → GA4 + Google Ads + Meta
- Consistent signals across all platforms
- No manual configuration per platform

**Conversion Configuration:**

For each conversion (from Phase 2):

**Value Logic:**
- Dynamic (from data layer) - recommended
- Fixed value (e.g., $50 per lead)

**Currency:** ISO 4217 (USD, EUR, GBP)

**Revenue Event:** Yes/No

**Optimize in Paid Media:** Yes/No

**Platform Mapping:**

| Canonical Event | GA4 Event     | Google Ads    | Meta Event           |
|-----------------|---------------|---------------|----------------------|
| purchase        | purchase      | Purchase      | Purchase             |
| add_to_cart     | add_to_cart   | (tracked)     | AddToCart            |
| begin_checkout  | begin_checkout| Init Checkout | InitiateCheckout     |
| lead_submit     | generate_lead | Lead          | Lead                 |
| signup_complete | sign_up       | Sign Up       | CompleteRegistration |

**Payload Schema Enforcement:**

System defines exact data layer structure:

```javascript
// Example: purchase event
dataLayer.push({
  event: "purchase",
  ecommerce: {
    transaction_id: "ORD_12345",  // Required
    value: 199.99,                 // Required
    currency: "USD",               // Required
    items: [...]                   // Required
  },
  event_id: "uuid-v4",            // Required (deduplication)
  user_data: {                    // Optional (enhanced conversions)
    email: "hashed_email",
    phone: "hashed_phone"
  }
});
```

**Conversion Readiness Score:**

System validates and scores (0-100):
- ✅ Primary conversion defined (+20)
- ✅ Mapped to all 3 platforms (+25)
- ✅ Value/currency configured (+15)
- ✅ Deduplication ID included (+10)
- ✅ Required parameters complete (+10)
- ⚠️ Warns if conversion label missing
- ⚠️ Warns if PII not hashed

---

### Phase 4: Developer Handover (ENHANCED)

**Purpose:** Generate production-ready implementation package

**Export Package:**

```
ClientName_Atlas_Implementation/
├── 1_GTM_Container.json         ← Import into GTM
├── 2_DataLayer_Specification.md ← Dev implementation guide
├── 3_Event_Dictionary.csv       ← All events reference
├── 4_Conversion_Mapping.md      ← Platform mapping doc
├── 5_Implementation_Guide.md    ← Step-by-step setup
├── 6_Verification_Scripts.js    ← Testing code
├── 7_QA_Checklist.md           ← Testing checklist
└── 8_Platform_Setup_Guide.md   ← GA4/Ads/Meta setup
```

**GTM Container JSON:**

Automatically generates:
- Variables (GA4 ID, Ads labels, Meta Pixel ID)
- Triggers (custom events for each canonical event)
- Tags:
  - GA4 event tags (one per conversion)
  - Google Ads conversion tags (one per conversion)
  - Meta Pixel standard event tags (one per conversion)
  - Base tracking tags (GA4 config, Meta base code)

**Example Generated Tag:**

```json
{
  "name": "GA4 - purchase",
  "type": "gaawe",
  "parameter": [
    { "key": "eventName", "value": "purchase" },
    { "key": "measurementId", "value": "{{GA4 Measurement ID}}" }
  ],
  "firingTriggerId": ["trigger_purchase"]
}

{
  "name": "Google Ads - Purchase",
  "type": "awct",
  "parameter": [
    { "key": "conversionId", "value": "AW-123456789" },
    { "key": "conversionLabel", "value": "AbC-dEfGhIj" },
    { "key": "conversionValue", "value": "{{DLV - value}}" },
    { "key": "transactionId", "value": "{{DLV - transaction_id}}" }
  ],
  "firingTriggerId": ["trigger_purchase"]
}

{
  "name": "Meta Pixel - Purchase",
  "type": "html",
  "html": "fbq('track', 'Purchase', {...})",
  "firingTriggerId": ["trigger_purchase"]
}
```

**Data Layer Specification:**

Complete developer guide with:
- Event-by-event implementation instructions
- Required parameters per event
- Code examples (copy-paste ready)
- Helper functions (UUID generation, SHA-256 hashing)
- Testing instructions
- Common issues & solutions

**Example:**

```markdown
### Event: purchase

**Trigger When:** User completes a purchase transaction

**Required Parameters:**

```javascript
dataLayer.push({
  event: "purchase",
  ecommerce: {
    transaction_id: "ORD_12345",  // Unique order ID
    value: 199.99,                 // Total purchase value
    currency: "USD",               // ISO 4217 currency
    items: [{...}]                 // Purchased items
  },
  event_id: generateEventId()     // UUID for deduplication
});
```

**Implementation Notes:**
- Fire on order confirmation page load
- Ensure transaction_id is unique per order
- Generate event_id using crypto.randomUUID()
```

**Platform Setup Guides:**

Step-by-step for:
- GA4: Import container, configure measurement ID, mark key events
- Google Ads: Create conversion actions, update labels, import from GTM
- Meta: Get pixel ID, update GTM variable, verify with Pixel Helper

**Verification Scripts:**

Browser console script to test:
- GTM loaded?
- Data layer initialized?
- GA4/Meta detected?
- Monitor events in real-time
- Validate required fields

**QA Checklist:**

Pre-launch checklist:
- [ ] GTM container imported
- [ ] All measurement IDs configured
- [ ] Events fire correctly
- [ ] Parameters populated
- [ ] Visible in GA4 DebugView
- [ ] Visible in Google Ads (24-48h delay)
- [ ] Visible in Meta Events Manager
- [ ] Cross-browser tested
- [ ] No console errors

---

## Key Architectural Changes

### Data Models

**Journey (NEW):**
```typescript
interface Journey {
  id: string;
  projectId: string;
  name: string;           // "Checkout Funnel"
  type: 'template' | 'custom';
  steps: JourneyStep[];   // Events in sequence
}

interface JourneyStep {
  id: string;
  order: number;
  eventName: string;      // Canonical: add_to_cart
  displayName: string;    // "Add to Cart"
  eventType: 'pageview' | 'action' | 'success' | 'error';
  category: 'acquisition' | 'activation' | 'revenue' | 'retention';
  isConversion: boolean;
  parameters: EventParameter[];
  visualContext?: {...}   // From browser extension
}
```

**Conversion (NEW):**
```typescript
interface Conversion {
  id: string;
  eventName: string;
  conversionType: 'primary' | 'secondary';
  valueLogic: 'dynamic' | 'fixed';
  currency: string;
  
  platforms: {
    ga4: { enabled: boolean; eventName: string; };
    googleAds: { enabled: boolean; conversionLabel: string; };
    meta: { enabled: boolean; standardEvent: string; };
  };
  
  requiredFields: string[];
}
```

**Project (UPDATED):**
```typescript
interface Project {
  // Phase 1: Same
  discovery: {...};
  
  // Phase 2: NEW - Journeys instead of site scan
  journeys: Journey[];
  
  // Phase 3: NEW - Conversion orchestration
  conversions: Conversion[];
  
  // Phase 4: Enhanced export
  deployment: {
    gtmContainerId: string;
    ga4MeasurementId: string;
    generatedAssets: {...};
    readinessScore: number;
  };
}
```

### Backend Services (NEW)

**GTM Generation Service:**
- Converts journeys → GTM container JSON
- Creates triggers for each event
- Creates tags for GA4/Ads/Meta per conversion
- Includes variables for measurement IDs

**Documentation Generator:**
- Converts journeys → Markdown spec
- Generates code examples per event
- Creates platform setup guides
- Exports CSV event dictionary

**Validation Service:**
- Checks journey completeness
- Validates conversion configuration
- Calculates readiness score
- Generates warnings/recommendations

### Browser Extension (OPTIONAL)

**Not a requirement for MVP, but nice-to-have:**

Captures:
- URL/route
- Element label/text
- Advisory CSS selector
- Page screenshot
- User notes

Links to events in Journey Designer for developer reference.

**Critical:** Extension output is NOT used for GTM triggers. Only for documentation.

---

## Technical Stack (Unchanged)

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + PostgreSQL
- State: Zustand
- Forms: React Hook Form + Zod
- Icons: Lucide React
- Hosting: Vercel + Railway
- Auth: Clerk or Supabase

---

## Development Timeline

### MVP (6 weeks)

**Week 1-2:** Core app (auth, dashboard, clients, Phase 1)  
**Week 3-4:** Journey Designer (templates, step editor, parameters)  
**Week 5:** Conversion Orchestration (platform mapping, readiness score)  
**Week 6:** Export system (GTM JSON, docs, downloads)

**Total:** 6 weeks for fully functional V1

---

## What's Out of Scope (V1)

❌ Site scanning (intentionally removed)  
❌ DOM-based element detection  
❌ Puppeteer/headless browser  
❌ Live event debugging  
❌ Server-side GTM deployment  
❌ Meta CAPI auto-setup  
❌ Mobile SDKs  
❌ BI dashboards  

---

## Why This Approach Wins

### ✅ Solves Real Problem
- **Old:** Tag elements reactively
- **New:** Design tracking strategically

### ✅ Works for Modern Web
- **Old:** Breaks on SPAs, dynamic content
- **New:** Data layer native, platform-agnostic

### ✅ Conversion Consistency
- **Old:** Different signals per platform
- **New:** One event → orchestrated signals

### ✅ Developer Clarity
- **Old:** "Tag this button" (breaks when button changes)
- **New:** "Push this event with these parameters" (durable)

### ✅ Business Context
- **Old:** Found button labeled "Buy Now"
- **New:** Defined "purchase" conversion in checkout journey

---

## Product Positioning

**Atlas is NOT:**
- A tag manager (use GTM for that)
- A site scanner (intentionally avoided)
- An analytics platform (use GA4 for that)
- A dashboard (use Looker/Tableau for that)

**Atlas IS:**
- A tracking architecture designer
- A conversion signal orchestrator
- A developer handover generator
- The system of record for conversion truth

**Market Position:**
> "The Figma for analytics tracking"

Design the tracking, export the implementation, let developers build it.

---

## Success Criteria

**V1 is successful if:**

1. A marketer can define journeys/conversions without dev help
2. The exported GTM container sends correct conversions to all 3 platforms
3. The dev handover doc is sufficient for implementation without back-and-forth
4. The solution works for SPAs and headless ecommerce sites
5. Conversions are consistent across GA4, Google Ads, and Meta

**Metrics:**
- % users who define at least one conversion
- Average conversions mapped per project
- Time to first GTM export
- Developer clarity rating (survey)
- Reduction in dev ↔ marketing iterations

---

## Files to Update

### Remove Entirely:
- All site scanning code (Puppeteer, element detection)
- PHASE2_UI_MOCKUP.md (old scan results UI)
- Site scanning methodology sections

### Update:
- ATLAS_DEV_BRIEF.md (this document)
- QUICK_START.md (Phase 2 description)
- UPDATE_LOG.md (document the pivot)

### Keep:
- DESIGN_SYSTEM.md (unchanged)
- atlas-final.jsx (reference for UI patterns, ignore Phase 2)
- atlas-logo.svg (unchanged)

---

## Next Step: Rewrite Dev Brief

The full dev brief needs to be completely rewritten with:

1. ✅ Product overview (TAP positioning)
2. ✅ Phase 1: Discovery (mostly unchanged)
3. ✅ Phase 2: Journey Designer (complete replacement)
   - Journey templates
   - Step editor UI
   - Parameter builder
   - Visual context helper (optional)
   - AI suggestions (industry templates)
4. ✅ Phase 3: Conversion Orchestration (new)
   - Platform mapping
   - Value configuration
   - Payload schema
   - Readiness scoring
5. ✅ Phase 4: Developer Handover (enhanced)
   - GTM generation
   - Data layer specs
   - Platform setup guides
   - Verification scripts
6. ✅ Data models (updated)
7. ✅ Technical architecture (GTM/docs generators)
8. ✅ File structure
9. ✅ Development timeline

---

**This transformation turns Atlas from a reactive element tagger into a strategic conversion orchestration platform.**

The new approach is superior because it:
- Starts with business intent
- Works for modern web architectures
- Ensures conversion consistency
- Provides developer clarity
- Scales to complex tracking needs

Ready to build? 🚀
