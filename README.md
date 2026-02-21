# Atlas - Tracking Architecture Planner

> The system of record for conversion truth across GA4, Google Ads & Meta for modern web apps.

![Atlas Logo](assets/atlas-logo.svg)

## 🎯 What is Atlas?

Atlas is a **conversion signal orchestration platform** that enables marketing teams to design complete tracking architectures through journey-based event design. Unlike traditional tag managers, Atlas focuses on **business intent** and **dual-tracking (client + server)** to ensure accurate conversion measurement.

### The Problem

Modern web properties (SPAs, headless ecommerce) break traditional tracking:
- ❌ Client-side only loses 20-40% of conversions (ad blockers, iOS ITP)
- ❌ Conversions fire inconsistently across GA4, Google Ads, and Meta
- ❌ Developers receive unclear requirements
- ❌ Marketers lack confidence in ROAS

### The Solution

**Atlas generates:**
- ✅ Client-side GTM container (browser tracking)
- ✅ **Server-side GTM container** (bypasses ad blockers)
- ✅ **Server endpoint code** (Node.js/Python - production-ready)
- ✅ **Meta CAPI + Enhanced Conversions setup** (automatic)
- ✅ Complete data layer specifications
- ✅ Testing & deployment guides

**One canonical event → Orchestrated signals to ALL platforms with automatic deduplication.**

---

## 🚀 Core Innovation: Dual-Tracking Architecture

```
User Action (e.g., Purchase)
    ↓
Frontend sends event with unique event_id
    ↓                           ↓
    ↓                           ↓
CLIENT-SIDE                 SERVER-SIDE
    ↓                           ↓
Browser GTM                 Server Endpoint
    ↓                      (Hashes PII, adds IP/UA)
    ↓                           ↓
GA4 (browser)              Server GTM (sGTM)
Meta Pixel                      ↓
    ↓                      ┌────┴────┬────────┐
    ↓                      ↓         ↓        ↓
Same event_id          GA4 MP   Meta CAPI  Google Ads
    ↓                                         (Enhanced)
    └──────────────────────┴──────────────────┘
              DEDUPLICATION
           (event_id matches)
                  ↓
         COUNT = 1 (not 2!)
```

**Result:** 20-40% improvement in conversion accuracy.

---

## 📚 Documentation

### Core Documentation
- **[ATLAS_DEV_BRIEF.md](docs/ATLAS_DEV_BRIEF.md)** - Complete technical specification (1,000+ lines)
- **[ATLAS_TRANSFORMATION_SUMMARY.md](docs/ATLAS_TRANSFORMATION_SUMMARY.md)** - Product vision & approach
- **[DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** - Design system reference
- **[CLAUDE_CODE_START.md](CLAUDE_CODE_START.md)** - Getting started with development

### Reference
- **[reference/atlas-final.jsx](reference/atlas-final.jsx)** - Full UI prototype (for reference only, ignore Phase 2)
- **[assets/atlas-logo.svg](assets/atlas-logo.svg)** - Logo asset

---

## 🏗️ Product Phases

### Phase 1: Discovery
Gather business context + server-side tracking configuration
- Client info (name, industry, website, business model)
- Primary objective (purchase, signup, lead, etc.)
- **Server-side tracking:** Enable? Deployment method? Endpoint URL?

### Phase 2: Journey Designer
Define business journeys through template-based event creation
- **Ecommerce:** Checkout Funnel, Product Discovery
- **SaaS:** Signup Funnel, Activation Journey, Subscription Flow
- **Lead Gen:** Contact Flow, Download Flow
- Each journey = sequence of canonical events

### Phase 3: Conversion Orchestration
Map events to platforms + configure dual-tracking
- **Tracking method per event:** Client-only | Server-only | Both (recommended)
- **Client platforms:** GA4, Meta Pixel
- **Server platforms:** GA4 Measurement Protocol, Meta CAPI, Google Ads Enhanced Conversions
- Conversion value logic, currency, deduplication settings

### Phase 4: Developer Handover
Export complete implementation package
- Client-side GTM container
- **Server-side GTM container**
- **Server endpoint code** (Node.js + Python)
- **Meta CAPI setup guide**
- **Enhanced Conversions setup guide**
- Data layer specifications
- Testing scripts & QA checklist

---

## 🛠️ Tech Stack

### Frontend
```
React + TypeScript + Vite + Tailwind CSS
State: Zustand
Forms: React Hook Form + Zod validation
Icons: Lucide React
Routing: React Router
```

### Backend
```
Node.js + Express + PostgreSQL
OR
Python + FastAPI + PostgreSQL
```

### Hosting
```
Frontend: Vercel
Backend: Railway / Google Cloud Run
Database: Railway PostgreSQL / Supabase
Auth: Clerk or Supabase Auth
```

### Generated Server Endpoint
```
Node.js (Express) - primary
Python (FastAPI) - alternative
Deployment: Railway, Vercel Functions, Google Cloud Run, AWS Lambda
```

---

## 🚀 Getting Started with Claude Code

### Prerequisites
- Node.js 18+ installed
- Claude Code CLI installed: `npm install -g @anthropic-ai/claude-code`
- Git configured

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Vikramj01/Trackforge.git
cd Trackforge

# Start Claude Code
claude-code
```

### Initial Prompt for Claude Code

```
Building Atlas - a tracking architecture planner with dual-tracking (client + server).

Read these files in order:
1. CLAUDE_CODE_START.md (development instructions)
2. docs/ATLAS_DEV_BRIEF.md (complete specification)
3. docs/DESIGN_SYSTEM.md (exact styling)

Atlas generates:
- Client-side GTM container
- Server-side GTM container
- Server endpoint code (Node.js/Python)
- Meta CAPI + Enhanced Conversions setup

The key innovation: One canonical event → orchestrated signals to client-side 
AND server-side, with automatic deduplication via event_id.

Tech: React + TypeScript + Vite + Tailwind CSS

Start with:
1. Project setup (Vite + React + TypeScript)
2. Configure Tailwind with design system colors
3. Create Layout with Sidebar (248px fixed width)
4. Build Dashboard page (basic)
5. Build Phase 1 Discovery form (includes server-side tracking config)

Use dark industrial design from DESIGN_SYSTEM.md:
- Deep navy (#080B12) backgrounds
- Atlas teal (#0BBFAA) for primary actions
- Subtle borders, professional aesthetic

Let's start with project initialization and Tailwind configuration.
```

---

## 📋 Development Timeline

### MVP: 8 weeks

**Week 1-2:** Core app
- Authentication, Dashboard, Client CRUD
- Phase 1: Discovery (with server-side config)

**Week 3-4:** Journey Designer
- Template library (Ecommerce, SaaS, Lead Gen)
- Step editor, Parameter builder
- Journey validation

**Week 5:** Conversion Orchestration
- Platform mapping interface
- Tracking method selection (client/server/both)
- Meta CAPI + Enhanced Conversions config
- Readiness scoring

**Week 6:** Client-Side Generation
- Client GTM container JSON generator
- Client data layer spec generator

**Week 7:** Server-Side Generation
- Server GTM container JSON generator
- Server endpoint code generator (Node.js + Python)
- Meta CAPI setup guide generator
- Enhanced Conversions guide generator

**Week 8:** Testing & Polish
- End-to-end dual-tracking testing
- Deduplication verification
- Documentation polish
- Deployment guides

---

## 🎨 Design System

### Colors
```css
--deep-navy: #080B12      /* Primary background */
--atlas-teal: #0BBFAA      /* Primary accent, CTAs */
--text-primary: #E8ECF2    /* Main text */
--text-muted: #7A8599      /* Secondary text */
--border-color: #1A1E28    /* Borders, dividers */
--card-bg: #0D1117         /* Card backgrounds */
--input-bg: #12161E        /* Form inputs */
```

### Typography
- **Headings:** Bricolage Grotesque 700
- **Body:** Inter 400/500/600
- **Code:** JetBrains Mono

### Aesthetic
Dark industrial - deep navy backgrounds, teal accents, subtle borders, professional and minimal.

---

## 📊 Success Metrics

**Activation:**
- % users enable server-side tracking
- % users configure Meta CAPI
- % users configure Enhanced Conversions

**Value:**
- Avg conversion improvement (client-only vs dual)
- Enhanced conversions match rate (target: >80%)
- Meta CAPI match quality (target: Good/Great)

**Outcome:**
- Reduction in conversion loss
- Improved ROAS accuracy
- Developer satisfaction with implementation docs

---

## 🎯 Product Positioning

**Not:** Tag manager, site scanner, analytics dashboard

**Is:** Analytics infrastructure design & conversion orchestration platform

**Market Analogy:** "The Figma for analytics tracking"
- Design the tracking architecture
- Export the implementation
- Developers build it

---

## 🔒 What's Out of Scope (V1)

❌ Site scanning / DOM element detection  
❌ Live event debugging UI  
❌ Automatic sGTM deployment to GCP  
❌ Mobile SDKs  
❌ BI dashboards  
❌ Data warehouse connectors  

---

## 📖 Key Features

### Journey-Based Event Design
Define business funnels (Checkout, Signup, Lead Gen) instead of tagging elements. Start with business intent, not DOM.

### Dual-Tracking Architecture
Client + server tracking with automatic deduplication. Capture 100% of conversions by bypassing ad blockers and browser restrictions.

### Conversion Orchestration
One canonical event automatically generates:
- Client-side: GA4 browser event, Meta Pixel event
- Server-side: GA4 Measurement Protocol, Meta CAPI, Google Ads Enhanced Conversions

### Complete Code Generation
Export production-ready:
- GTM containers (client + server)
- Server endpoint code (Node.js/Python)
- Data layer specifications
- Platform setup guides
- Testing scripts

### Meta CAPI + Enhanced Conversions
Automatic setup with:
- Email/phone hashing (SHA-256)
- IP address and user agent enrichment
- Event deduplication
- Match rate optimization

---

## 🤝 Contributing

This is a commercial product under active development. Contributions are not currently accepted.

---

## 📝 License

Proprietary - All rights reserved

---

## 📧 Contact

For questions or support: [Your contact info]

---

## 🎓 Learn More

- **Full Specification:** [docs/ATLAS_DEV_BRIEF.md](docs/ATLAS_DEV_BRIEF.md)
- **Product Vision:** [docs/ATLAS_TRANSFORMATION_SUMMARY.md](docs/ATLAS_TRANSFORMATION_SUMMARY.md)
- **Design System:** [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)

---

**Built to solve the conversion tracking crisis in modern web apps.**

**Client + Server = 100% Conversion Coverage** 🚀
