# Atlas Validator - Phase 0 Integration Brief

## 🎯 Objective

Add **Phase 0: Validator** to Atlas as the entry point before Discovery.

**Purpose:** Test existing tracking setup, detect issues, pre-fill Discovery form with findings.

---

## 📋 What You're Adding

### New Phase Structure

```
Phase 0: Validator (NEW) → Test existing setup
    ↓ Pre-fills data
Phase 1: Discovery → Business context
    ↓
Phase 2: Journey Designer → Define events
    ↓
Phase 3: Conversion Orchestration → Map to platforms
    ↓
Phase 4: Developer Handover → Export implementation
```

---

## 🎨 User Flow

### Entry Point (Updated Dashboard)

User arrives at Atlas Dashboard, sees two options:

```
┌──────────────────────────────────────────────┐
│ Get Started with Atlas                       │
├──────────────────────────────────────────────┤
│                                              │
│ [Option 1] Test My Existing Tracking        │
│ Run a free audit of your current setup      │
│ Takes 60 seconds • Detects common issues    │
│                                              │
│ [Option 2] Start From Scratch               │
│ Design new tracking architecture             │
│ Best for new websites or complete rebuild   │
│                                              │
└──────────────────────────────────────────────┘
```

**[Option 1]** → Phase 0: Validator  
**[Option 2]** → Phase 1: Discovery (existing flow)

---

## 🔧 Phase 0: Validator UI

### Step 1: Input Form

```
┌────────────────────────────────────────────────┐
│ TEST YOUR TRACKING SETUP                       │
├────────────────────────────────────────────────┤
│                                                │
│ What platform are you testing?                 │
│ ☑ Google Ads  ☑ Meta Ads  ☐ LinkedIn Ads      │
│                                                │
│ Landing Page URL *                             │
│ ┌────────────────────────────────────────────┐ │
│ │ https://mystore.com/landing                │ │
│ └────────────────────────────────────────────┘ │
│ Where your ads send visitors                  │
│                                                │
│ Conversion Page URL *                          │
│ ┌────────────────────────────────────────────┐ │
│ │ https://mystore.com/thank-you              │ │
│ └────────────────────────────────────────────┘ │
│ Where conversions happen                       │
│                                                │
│ Conversion Type *                              │
│ ○ Purchase                                     │
│ ○ Lead/Form Submit                             │
│ ○ Sign Up                                      │
│ ○ Add to Cart                                  │
│                                                │
│ [🔍 Run Test] [Skip to Discovery →]           │
│                                                │
└────────────────────────────────────────────────┘
```

**Form Validation:**
- Landing URL: Required, must be valid URL
- Conversion URL: Required, must be valid URL
- At least one platform selected
- Conversion type selected

---

### Step 2: Testing Progress

```
┌────────────────────────────────────────────────┐
│ 🔄 TESTING YOUR TRACKING...                   │
├────────────────────────────────────────────────┤
│                                                │
│ ✓ Loading landing page with ad parameters     │
│ ✓ Checking pixel installation                 │
│ → Navigating to conversion page                │
│ ⏳ Analyzing conversion events                 │
│ ⏳ Validating data quality                     │
│                                                │
│ Estimated time: 45 seconds                     │
│                                                │
│ ████████████░░░░░░░░  60%                     │
│                                                │
└────────────────────────────────────────────────┘
```

**Implementation Note:** For MVP, simulate the test (don't actually run browser automation). Show progress for 3-5 seconds, then show mock results.

---

### Step 3: Results Dashboard

```
┌──────────────────────────────────────────────────────┐
│ TRACKING HEALTH SCORE                                │
│                                                      │
│ 45/100  🔴                                           │
│                                                      │
│ You're losing 35-45% of conversions                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ ❌ CRITICAL ISSUES (2)                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🔴 GCLID Parameter Dropped                          │
│ Impact: Google Ads can't track 40% of conversions   │
│ Cause: Parameter lost after redirect to checkout    │
│ [Show Fix Guide]                                    │
│                                                      │
│ 🔴 Purchase Event Not Firing                        │
│ Impact: 0 conversions tracked                       │
│ Cause: No dataLayer.push() on /thank-you page       │
│ [Show Fix Guide]                                    │
│                                                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ ⚠️  WARNINGS (3)                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🟡 No Meta CAPI Configured                          │
│ Impact: Losing 35% of iOS conversions               │
│                                                      │
│ 🟡 Missing transaction_id                           │
│ Impact: Risk of duplicate conversion counting       │
│                                                      │
│ 🟡 No Enhanced Conversions                          │
│ Impact: 20-30% lower match rate                     │
│                                                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ ✅ WORKING (2)                                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ✓ Meta Pixel installed correctly                    │
│ ✓ Google Ads tag present on landing page            │
│                                                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ [Fix All Issues with Atlas →]                       │
│ [Download Report]  [Run Another Test]               │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Integration with Existing Phases

### Data Flow: Validator → Discovery

When user clicks **"Fix All Issues with Atlas"**, automatically:

**1. Pre-fill Discovery form:**
```typescript
const discovery = {
  // Auto-filled from validator
  website: validatorResults.landingUrl,
  propertyType: validatorResults.detectedType, // "spa" | "headless" | "cms"
  
  techStack: [
    validatorResults.hasGTM && "Google Tag Manager",
    validatorResults.hasGA4 && "Google Analytics 4",
    validatorResults.hasMetaPixel && "Meta Pixel",
    validatorResults.hasGoogleAds && "Google Ads"
  ].filter(Boolean),
  
  // Auto-enable server-side if critical issues found
  enableServerSide: validatorResults.hasCriticalIssues,
  
  // User still needs to fill
  clientName: "",
  industry: "",
  businessModel: "",
  primaryObjective: ""
};
```

**2. Carry forward issue data:**
```typescript
const issueContext = {
  validatorScore: 45,
  criticalIssues: [
    "gclid_dropped",
    "purchase_event_not_firing"
  ],
  warnings: [
    "no_meta_capi",
    "missing_transaction_id",
    "no_enhanced_conversions"
  ]
};
```

**3. Show issues in later phases:**
- Phase 2 (Journey Designer): Highlight missing events
- Phase 3 (Conversion Orchestration): Auto-enable fixes (CAPI, Enhanced Conversions)

---

## 📊 Mock Data for MVP

**For initial implementation, use simulated test results:**

```typescript
// Simulated validator results (no actual testing yet)
const mockValidatorResults = {
  score: 45,
  
  criticalIssues: [
    {
      id: "gclid_dropped",
      title: "GCLID Parameter Dropped",
      impact: "Google Ads can't track 40% of conversions",
      cause: "Parameter lost after redirect to checkout",
      severity: "critical"
    },
    {
      id: "purchase_not_firing",
      title: "Purchase Event Not Firing",
      impact: "0 conversions tracked",
      cause: "No dataLayer.push() on /thank-you page",
      severity: "critical"
    }
  ],
  
  warnings: [
    {
      id: "no_capi",
      title: "No Meta CAPI Configured",
      impact: "Losing 35% of iOS conversions",
      severity: "warning"
    },
    {
      id: "missing_transaction_id",
      title: "Missing transaction_id",
      impact: "Risk of duplicate conversion counting",
      severity: "warning"
    },
    {
      id: "no_enhanced_conversions",
      title: "No Enhanced Conversions",
      impact: "20-30% lower match rate",
      severity: "warning"
    }
  ],
  
  passing: [
    "Meta Pixel installed correctly",
    "Google Ads tag present on landing page"
  ],
  
  detectedSetup: {
    hasGTM: true,
    hasGA4: true,
    hasMetaPixel: true,
    hasGoogleAds: true,
    propertyType: "spa"
  }
};
```

**Note:** Actual browser automation testing comes later. For now, just show this mock data to validate the UX flow.

---

## 🎨 Design Guidelines

**Use existing Atlas design system:**
- Deep navy (#080B12) background
- Atlas teal (#0BBFAA) for primary actions
- Red (#EF4444) for critical issues
- Yellow (#F59E0B) for warnings
- Green (#10B981) for passing checks

**Issue Severity Indicators:**
```
🔴 Critical (red background, urgent)
🟡 Warning (yellow/orange background, important)
✅ Passing (green checkmark, good news)
```

**Score Visualization:**
```
0-40:   🔴 Critical  (red)
41-70:  🟡 Needs Work (yellow)
71-85:  🟢 Good (green)
86-100: 🟢 Excellent (bright green)
```

---

## 📋 Components Needed

### 1. ValidatorForm Component
- Platform checkboxes (Google Ads, Meta Ads, LinkedIn Ads)
- Landing URL input
- Conversion URL input
- Conversion type radio buttons
- "Run Test" button
- "Skip to Discovery" link

### 2. ValidatorProgress Component
- Progress bar (0-100%)
- Status messages (5 steps)
- Loading animation

### 3. ValidatorResults Component
- Score card (0-100 with color coding)
- Critical issues list (expandable cards)
- Warnings list (expandable cards)
- Passing checks list
- "Fix with Atlas" CTA button
- "Download Report" button
- "Run Another Test" button

### 4. IssueCard Component
```tsx
<IssueCard
  severity="critical" | "warning" | "passing"
  title="GCLID Parameter Dropped"
  impact="Google Ads can't track 40% of conversions"
  cause="Parameter lost after redirect"
  onShowFix={() => {}}
/>
```

---

## 🗂️ File Structure

```
src/
├── components/
│   ├── validator/
│   │   ├── ValidatorForm.tsx         (NEW)
│   │   ├── ValidatorProgress.tsx     (NEW)
│   │   ├── ValidatorResults.tsx      (NEW)
│   │   ├── IssueCard.tsx             (NEW)
│   │   └── ScoreIndicator.tsx        (NEW)
│   └── wizard/
│       ├── Phase0Validator.tsx       (NEW - wraps validator components)
│       ├── Phase1Discovery.tsx       (UPDATED - accepts pre-filled data)
│       ├── Phase2JourneyDesigner.tsx
│       ├── Phase3ConversionOrch.tsx
│       └── Phase4DeveloperHandover.tsx
├── types/
│   └── validator.ts                   (NEW)
└── store/
    └── useStore.ts                    (UPDATED - add validator state)
```

---

## 🔧 State Management

**Add to Zustand store:**

```typescript
interface Store {
  // Existing
  currentPhase: 0 | 1 | 2 | 3 | 4;  // Add 0 for validator
  discovery: DiscoveryData;
  
  // New - Validator state
  validatorResults: ValidatorResults | null;
  validatorInputs: {
    landingUrl: string;
    conversionUrl: string;
    platforms: string[];
    conversionType: string;
  };
  
  setValidatorResults: (results: ValidatorResults) => void;
  setCurrentPhase: (phase: 0 | 1 | 2 | 3 | 4) => void;
}
```

---

## 🎯 Success Criteria (Phase 0 Complete)

- [ ] Dashboard shows two entry options
- [ ] Validator form accepts URLs and conversion type
- [ ] Mock test runs with progress animation
- [ ] Results show score + issues (using mock data)
- [ ] "Fix with Atlas" button pre-fills Discovery form
- [ ] Discovery form loads with validator findings
- [ ] Design matches existing Atlas aesthetic
- [ ] No TypeScript errors
- [ ] Navigation flow works (Phase 0 → Phase 1)

---

## ⚠️ What NOT to Build Yet

❌ Actual browser automation (Puppeteer/Playwright)
❌ Real network request interception
❌ Actual issue detection logic
❌ API integrations with Google/Meta
❌ "Download Report" functionality
❌ "Show Fix Guide" modals

**For now:** Focus on UI/UX flow with mock data.

**Later:** Add real testing backend.

---

## 🚀 Implementation Order

**Session 1:**
1. Update Dashboard with two entry options
2. Create ValidatorForm component
3. Create ValidatorProgress component (mock 3-5 sec delay)
4. Basic routing (Dashboard → Validator → Discovery)

**Session 2:**
5. Create ValidatorResults component
6. Create IssueCard component
7. Create ScoreIndicator component
8. Wire up mock data

**Session 3:**
9. Pre-fill Discovery form from validator results
10. Add validator state to Zustand store
11. Test full flow (Phase 0 → Phase 1)
12. Polish and styling

---

## 📝 Example Prompt for Claude Code

```
We're adding Phase 0: Validator to Atlas as the entry point.

Read this brief: [paste this file]

Start with Session 1:
1. Update Dashboard to show two options:
   - "Test My Existing Tracking" (→ Phase 0)
   - "Start From Scratch" (→ Phase 1)
2. Create ValidatorForm component with:
   - Platform checkboxes
   - Landing URL input
   - Conversion URL input
   - Conversion type radio
   - "Run Test" button
3. Create ValidatorProgress component (simulate 5-second test)
4. Set up routing

Use the existing design system (deep navy, atlas teal, same card styles).

For now, use mock data (no real testing). Just validate the UX flow.

Let's build Session 1 first.
```

---

**This brief gives Claude Code everything needed to add Phase 0 without overwhelming detail.** 🚀
