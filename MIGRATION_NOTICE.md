# ⚠️ ATLAS PRODUCT APPROACH - READ FIRST

## What is Atlas?

Atlas is a **conversion signal orchestration platform** with **dual-tracking (client + server)** built-in.

**Not:** Tag manager, site scanner, DOM tagger  
**Is:** Analytics infrastructure designer that generates complete tracking implementations

---

## 🎯 Core Value Proposition

### The Problem
Modern web apps (SPAs, headless ecommerce) lose 20-40% of conversions because:
- ❌ Ad blockers kill client-side tracking
- ❌ iOS ITP kills cookies after 7 days
- ❌ Browser privacy features block 3rd party scripts
- ❌ Thank-you pages are unreliable in SPAs

### The Solution: Dual-Tracking
```
User Action (Purchase)
    ↓
    ├──→ CLIENT-SIDE: Browser → GTM → GA4, Meta Pixel
    │
    └──→ SERVER-SIDE: Server → sGTM → GA4 MP, Meta CAPI, Google Ads
             ↓
    Same event_id = Automatic Deduplication
             ↓
    Result: 1 conversion counted (not 2)
```

**Benefits:**
- ✅ 20-40% more conversions captured (server bypasses ad blockers)
- ✅ 100% iOS coverage (server survives ITP)
- ✅ Better attribution (Enhanced Conversions + Meta CAPI)
- ✅ No double-counting (automatic deduplication)
- ✅ First-party data (server sets cookies on your domain)

---

## 🏗️ Product Architecture

### What Atlas Generates

**1. Client-Side GTM Container**
- Tags for GA4, Meta Pixel
- Fires in browser
- Gets blocked by ad blockers (~30% of users)

**2. Server-Side GTM Container** ⭐ NEW
- Tags for GA4 Measurement Protocol, Meta CAPI, Google Ads Enhanced Conversions
- Fires from your server
- Cannot be blocked by ad blockers

**3. Server Endpoint Code** ⭐ NEW
- Production-ready Node.js/Python server
- Receives events from frontend
- Hashes PII (email, phone) using SHA-256
- Adds server context (IP, user-agent)
- Forwards to sGTM endpoint

**4. Complete Documentation**
- Data layer specifications
- Meta CAPI setup guide
- Enhanced Conversions setup guide
- Deployment guides (Railway, Vercel, GCP)
- QA checklist

---

## 🚀 Four-Phase Workflow

### Phase 1: Discovery
Gather business context + **server-side tracking configuration**

**NEW in Phase 1:**
- Enable server-side tracking? (Yes/No)
- Deployment method: Self-hosted | Atlas-hosted | GCP
- Server endpoint URL

### Phase 2: Journey Designer
Define business journeys through templates
- Ecommerce: Checkout Funnel, Product Discovery
- SaaS: Signup Funnel, Activation Journey
- Lead Gen: Contact Flow, Download Flow

**Approach:** Journey-based (business intent), NOT site scanning (DOM elements)

### Phase 3: Conversion Orchestration
Map events to platforms + **configure dual-tracking**

**NEW in Phase 3:**
- Choose tracking method per event:
  - ○ Client-only
  - ○ Server-only
  - ● Both (recommended - automatic deduplication)
- Configure Meta CAPI
- Configure Enhanced Conversions
- Set conversion values, currency

### Phase 4: Developer Handover
Export complete implementation package

**Client-side exports:**
- GTM container JSON
- Data layer specification

**Server-side exports:** ⭐ NEW
- sGTM container JSON
- Server endpoint code (Node.js + Python)
- Meta CAPI setup guide
- Enhanced Conversions setup guide
- Deployment guides

---

## 📋 Key Design Decisions

### ✅ Journey-Based (Not Site Scanning)

**Why NOT site scanning:**
- ❌ Misses dynamic content (SPAs load on interaction)
- ❌ Brittle CSS selectors break when sites update
- ❌ No business context (finding a button ≠ understanding intent)
- ❌ Reactive, not strategic

**Why journey-based:**
- ✅ Start with business intent (checkout funnel, signup flow)
- ✅ Data layer native (not DOM-dependent)
- ✅ Works for SPAs, headless, traditional sites
- ✅ Developer clarity (clear event contracts)
- ✅ Future-proof (scales to server-side, MMM, CDPs)

---

### ✅ Dual-Tracking (Not Client-Only)

**Why NOT client-only:**
- ❌ Loses 20-40% of conversions
- ❌ Ad blockers kill tracking
- ❌ iOS ITP kills cookies
- ❌ Can't safely hash PII in browser

**Why dual-tracking:**
- ✅ Client captures what browsers allow
- ✅ Server captures what ad blockers miss
- ✅ Deduplication prevents double-counting
- ✅ PII safely hashed server-side
- ✅ First-party cookies on your domain

---

## 🎨 Design Aesthetic

**Dark Industrial**
- Deep navy backgrounds (#080B12)
- Atlas teal accents (#0BBFAA)
- Subtle borders (#1A1E28)
- Professional, minimal, clean

**Not:** Bright colors, white backgrounds, consumer-friendly  
**Is:** Enterprise SaaS, technical, sophisticated

---

## 📊 Success Metrics

**What we measure:**
- % users enable server-side tracking
- Avg conversion improvement (client-only vs dual)
- Enhanced Conversions match rate (target: >80%)
- Meta CAPI match quality (target: Good/Great)
- Developer satisfaction with implementation docs

---

## 🔒 What's Out of Scope (V1)

❌ Site scanning / DOM element detection  
❌ Live event debugging UI  
❌ Automatic sGTM deployment to GCP  
❌ Mobile SDKs  
❌ BI dashboards  
❌ Data warehouse connectors  

**Focus:** Generate complete tracking architecture (client + server)

---

## 🎓 Development Approach

### Session 1-2: Core App
- Project setup (Vite + React + TypeScript + Tailwind)
- Layout with Sidebar
- Dashboard (basic)
- **Phase 1 Discovery form (with server-side config)**

### Session 3-4: Journey Designer
- Journey template library
- Step editor
- Parameter builder
- Journey validation

### Session 5: Conversion Orchestration
- Platform mapping interface
- **Tracking method selection (client/server/both)**
- **Meta CAPI configuration**
- **Enhanced Conversions configuration**
- Readiness scoring

### Session 6-7: Export Generation
- Client GTM JSON generator
- **Server GTM JSON generator**
- **Server endpoint code generator**
- Documentation generators

### Session 8: Testing & Polish
- End-to-end dual-tracking testing
- Deduplication verification
- Documentation polish

---

## 💡 Key Differentiators

**vs Traditional Tag Managers:**
- Atlas designs tracking, not just deploys it
- Generates server-side tracking automatically
- Ensures conversion consistency across platforms

**vs Site Scanners:**
- Journey-based (business intent) not DOM-based
- Data layer native, not selector-dependent
- Strategic, not reactive

**vs Manual Setup:**
- Complete code generation (client + server)
- Automatic deduplication
- Meta CAPI + Enhanced Conversions built-in
- Production-ready server endpoint

---

## 🚦 Getting Started

1. Read **docs/ATLAS_DEV_BRIEF.md** (complete specification)
2. Read **CLAUDE_CODE_START.md** (development instructions)
3. Read **docs/DESIGN_SYSTEM.md** (exact styling)
4. Start building Phase 1 Discovery form

**Remember:**
- Server-side tracking is CORE, not optional
- Dual-tracking is THE main value proposition
- Journey-based beats site scanning
- Focus on conversion signal orchestration

---

## 📖 Reference

- **Full Spec:** docs/ATLAS_DEV_BRIEF.md (1,000+ lines)
- **Dev Guide:** CLAUDE_CODE_START.md
- **Design:** docs/DESIGN_SYSTEM.md
- **Vision:** docs/ATLAS_TRANSFORMATION_SUMMARY.md

---

**Built to solve the conversion tracking crisis in modern web apps.**

**Client + Server = 100% Conversion Coverage** 🚀
