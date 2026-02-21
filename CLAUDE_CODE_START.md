# Claude Code Development Instructions

## 🎯 Project Overview

Building **Atlas** - a tracking architecture planner with **DUAL-TRACKING** (client + server) that solves the 20-40% conversion loss problem in modern web apps.

**Core Innovation:**
One canonical event (e.g., `purchase`) → Automatically generates:
- Client-side tracking (Browser → GTM → GA4, Meta Pixel)
- Server-side tracking (Server → sGTM → GA4 MP, Meta CAPI, Google Ads)
- Automatic deduplication via event_id

**Not:** Tag manager, site scanner, DOM tagger  
**Is:** Analytics infrastructure designer + conversion signal orchestrator

---

## 🔥 CRITICAL: Server-Side is Not Optional

Server-side tracking is THE core value proposition, not an add-on.

**Why clients need it:**
- Ad blockers kill 30%+ of client-side tracking
- iOS ITP kills cookies after 7 days
- SPAs and headless ecommerce break page-based tracking
- Browser privacy features block 3rd party scripts

**What Atlas does differently:**
- Generates BOTH client and server GTM containers
- Generates production-ready server endpoint code
- Configures Meta CAPI + Enhanced Conversions automatically
- Handles deduplication (same event_id, no double-counting)

---

## 📖 Required Reading (IN ORDER)

Before writing ANY code:

1. **docs/ATLAS_DEV_BRIEF.md** (CRITICAL - 1,000+ line specification)
   - Complete product specification
   - All four phases detailed
   - Server-side architecture explained
   - Data models, API structure, export formats

2. **docs/DESIGN_SYSTEM.md** (exact colors, fonts, components)
   - Color palette (deep navy, atlas teal)
   - Typography (Bricolage Grotesque, Inter, JetBrains Mono)
   - Component patterns (cards, buttons, forms)
   - Spacing, layouts, responsive breakpoints

3. **docs/ATLAS_TRANSFORMATION_SUMMARY.md** (product vision)
   - Why journey-based > site scanning
   - Why dual-tracking > client-only
   - Product positioning and market differentiation

---

## 🏗️ Tech Stack

### Frontend
```
Framework: React 18 + TypeScript
Build Tool: Vite
Styling: Tailwind CSS (custom config with design system)
State: Zustand
Forms: React Hook Form + Zod validation
Icons: Lucide React
Routing: React Router v6
```

### Backend (Phase 2+ development)
```
Runtime: Node.js 18+ 
Framework: Express
Database: PostgreSQL 14+
ORM: Prisma (recommended) or TypeORM
Validation: Zod
```

### Deployment
```
Frontend: Vercel
Backend: Railway / Google Cloud Run
Database: Railway PostgreSQL / Supabase
Auth: Clerk (recommended) or Supabase Auth
```

---

## 🎯 Four-Phase Product Workflow

### Phase 1: Discovery (Enhanced with Server Config)

**Purpose:** Gather business context + server-side tracking preferences

**Form Fields:**
- Client Name (text, required)
- Industry (dropdown: Ecommerce, SaaS, Lead Gen, Media, Other)
- Website URL (text, required, validated)
- Property Type (radio: SPA | Headless Ecommerce | Traditional CMS | Web App)
- Business Model (dropdown: Ecommerce | SaaS | Lead Gen | Media | Marketplace)
- Primary Objective (dropdown: Purchase | Subscription | Lead | Trial | Activation)
- Current Tech Stack (multi-select checkboxes: GA4, GTM, Google Ads, Meta, etc.)
- Notes (textarea)

**NEW - Server-Side Tracking Configuration:**

```
┌────────────────────────────────────────────────┐
│ SERVER-SIDE TRACKING                           │
│                                                │
│ Enable server-side tracking?                  │
│ ● Yes (Recommended for SPAs & headless)       │
│ ○ No (Client-side only - not recommended)     │
│                                                │
│ Server Deployment Method:                     │
│ ○ Self-hosted (you deploy - FREE)            │
│ ○ Atlas-hosted (managed - $49/mo)            │
│ ○ Google Cloud hosted (official sGTM)        │
│                                                │
│ Server Endpoint URL (if self-hosted):         │
│ [https://api.yoursite.com/track]              │
└────────────────────────────────────────────────┘
```

**System Output:**
Based on selections, pre-populate:
- Journey templates (e.g., "Checkout Funnel" for Ecommerce)
- Recommended events (e.g., `add_to_cart`, `purchase`)
- Default tracking method (Both client + server)

---

### Phase 2: Journey Designer (Template-Based)

**Purpose:** Define business journeys, not DOM elements

**Journey Templates by Business Model:**

**If Ecommerce:**
```
Checkout Funnel:
1. view_item → Product page viewed
2. add_to_cart → Item added to cart
3. view_cart → Cart page viewed
4. begin_checkout → Checkout started
5. add_payment_info → Payment entered
6. add_shipping_info → Shipping entered
7. purchase → Transaction complete (PRIMARY CONVERSION)
```

**If SaaS:**
```
Signup Funnel:
1. view_signup_page → Signup page loaded
2. begin_signup → Form started
3. signup_complete → Account created (PRIMARY CONVERSION)
```

**If Lead Gen:**
```
Contact Flow:
1. view_contact_page → Contact page loaded
2. begin_form → Form interaction started
3. lead_submit → Form submitted (PRIMARY CONVERSION)
```

**Event Step Editor:**
For each event:
- Canonical Event Name: `add_to_cart`
- Display Name: "Add to Cart"
- Description: "Triggered when user adds item to cart"
- Event Type: Page View | User Action | Success | Error
- Route/Context: `/products/:id` (optional)
- Category: Acquisition | Activation | Revenue | Retention
- **Is conversion?** No | Yes (Primary) | Yes (Secondary)
- **Required Parameters:** Table of (name, type, required)
- Implementation Notes: For developers

---

### Phase 3: Conversion Orchestration + Server Routing

**Purpose:** Map events to platforms + configure dual-tracking

**For each conversion, configure:**

```
┌──────────────────────────────────────────────┐
│ TRACKING METHOD                              │
│                                              │
│ ○ Client-side only (browser GTM)            │
│ ○ Server-side only (sGTM)                   │
│ ● Both (recommended - auto-deduplication)   │
│                                              │
│ CLIENT PLATFORMS                             │
│ ☑ GA4 (browser)                              │
│ ☑ Meta Pixel (browser)                      │
│                                              │
│ SERVER PLATFORMS                             │
│ ☑ GA4 Measurement Protocol                  │
│ ☑ Meta Conversions API (CAPI)               │
│ ☑ Google Ads Enhanced Conversions           │
│                                              │
│ DEDUPLICATION                                │
│ ☑ Enable (same event_id prevents double)    │
└──────────────────────────────────────────────┘
```

**Platform Mappings:**

| Canonical | Client GA4 | Server GA4 MP | Client Meta | Server CAPI | Google Ads |
|-----------|------------|---------------|-------------|-------------|------------|
| purchase  | purchase   | purchase      | Purchase    | Purchase    | Enhanced   |
| add_to_cart | add_to_cart | add_to_cart | AddToCart  | AddToCart   | (tracked)  |
| lead_submit | generate_lead | generate_lead | Lead     | Lead        | Enhanced   |

**Conversion Value:**
- Dynamic (from data layer) - recommended
- Fixed value: $____

**Readiness Score:** 0-100 based on completeness

---

### Phase 4: Developer Handover (Export Package)

**Generate complete implementation package:**

```
ClientName_Atlas_Implementation/
├── client-side/
│   ├── GTM_Container_Client.json
│   ├── DataLayer_Client_Spec.md
│   └── Client_Implementation_Guide.md
│
├── server-side/
│   ├── GTM_Container_Server.json
│   ├── server-endpoint-node.js
│   ├── server-endpoint-python.py
│   ├── Server_Deployment_Guide.md
│   ├── Meta_CAPI_Setup.md
│   └── Enhanced_Conversions_Setup.md
│
└── shared/
    ├── Event_Dictionary.csv
    ├── Dual_Tracking_Architecture.md
    └── QA_Checklist.md
```

**Key Generated Files:**
- **Client GTM Container:** Tags for GA4, Meta Pixel
- **Server GTM Container:** Tags for GA4 MP, Meta CAPI, Google Ads Enhanced
- **Server Endpoint (Node.js):** Express server that hashes PII, forwards to sGTM
- **Server Endpoint (Python):** FastAPI alternative
- **Setup Guides:** Step-by-step Meta CAPI and Enhanced Conversions config

---

## 🚀 Getting Started

### Step 1: Initialize Project

```bash
# Create frontend
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install UI libraries
npm install zustand react-hook-form zod @hookform/resolvers
npm install lucide-react react-router-dom
```

---

### Step 2: Configure Tailwind

**Create `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#080B12',
        'atlas-teal': '#0BBFAA',
        'text-primary': '#E8ECF2',
        'text-muted': '#7A8599',
        'border': '#1A1E28',
        'card-bg': '#0D1117',
        'input-bg': '#12161E',
      },
      fontFamily: {
        'primary': ['Bricolage Grotesque', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

**Update `src/index.css`:**

```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-deep-navy text-text-primary font-body;
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

### Step 3: Create Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        // 248px fixed width
│   │   ├── Header.tsx         // Optional
│   │   └── Layout.tsx         // Main wrapper
│   ├── wizard/
│   │   ├── Phase1Discovery.tsx
│   │   ├── Phase2JourneyDesigner.tsx
│   │   ├── Phase3ConversionOrch.tsx
│   │   └── Phase4DeveloperHandover.tsx
│   └── ui/                    // Reusable components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Card.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Clients.tsx
│   ├── Projects.tsx
│   └── Wizard.tsx
├── store/
│   └── useStore.ts            // Zustand store
├── types/
│   └── index.ts               // TypeScript types
└── App.tsx
```

---

### Step 4: Build Layout First

**Sidebar component:**
```tsx
// src/components/layout/Sidebar.tsx
import { LayoutDashboard, Users, FileText, Settings, HelpCircle } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Clients', icon: Users, href: '/clients' },
  { name: 'Templates', icon: FileText, href: '/templates' },
  { name: 'Settings', icon: Settings, href: '/settings' },
  { name: 'Help', icon: HelpCircle, href: '/help' },
];

export function Sidebar() {
  return (
    <div className="w-[248px] h-screen bg-card-bg border-r border-border flex flex-col fixed">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="w-8 h-8 bg-atlas-teal rounded" />
          <span className="font-primary text-xl tracking-wide">ATLAS</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:text-text-primary hover:bg-deep-navy transition-colors"
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
```

---

### Step 5: Build Phase 1 Discovery Form

**CRITICAL:** This form now includes server-side tracking configuration!

```tsx
// src/components/wizard/Phase1Discovery.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const discoverySchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  industry: z.string().min(1, 'Industry is required'),
  website: z.string().url('Must be a valid URL'),
  propertyType: z.enum(['spa', 'headless', 'cms', 'webapp']),
  businessModel: z.enum(['ecommerce', 'saas', 'leadgen', 'media', 'marketplace']),
  primaryObjective: z.string(),
  techStack: z.array(z.string()),
  
  // Server-side tracking config
  enableServerSide: z.boolean(),
  serverMethod: z.enum(['self-hosted', 'atlas-hosted', 'gcp-hosted']).optional(),
  serverEndpoint: z.string().url().optional(),
  
  notes: z.string().optional(),
});

type DiscoveryForm = z.infer<typeof discoverySchema>;

export function Phase1Discovery() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<DiscoveryForm>({
    resolver: zodResolver(discoverySchema),
    defaultValues: {
      enableServerSide: true, // Default to enabled
    }
  });
  
  const enableServerSide = watch('enableServerSide');
  const serverMethod = watch('serverMethod');
  
  const onSubmit = (data: DiscoveryForm) => {
    console.log('Discovery data:', data);
    // Save to store and proceed to Phase 2
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto p-8">
      <h1 className="font-primary text-3xl mb-8">Discovery</h1>
      
      {/* Client Info Section */}
      <div className="bg-card-bg border border-border rounded-lg p-6 mb-6">
        <h2 className="font-primary text-xl mb-4">Client Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2">
              Client Name *
            </label>
            <input
              {...register('clientName')}
              className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-text-primary focus:border-atlas-teal focus:outline-none focus:ring-2 focus:ring-atlas-teal/20"
              placeholder="Acme Corp"
            />
            {errors.clientName && (
              <p className="text-red-400 text-sm mt-1">{errors.clientName.message}</p>
            )}
          </div>
          
          {/* Add other fields similarly */}
        </div>
      </div>
      
      {/* Server-Side Tracking Section */}
      <div className="bg-card-bg border border-border rounded-lg p-6 mb-6">
        <h2 className="font-primary text-xl mb-4">Server-Side Tracking</h2>
        
        <div className="mb-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('enableServerSide')}
              className="w-5 h-5 rounded border-2 border-border bg-input-bg checked:bg-atlas-teal"
            />
            <span className="font-medium">Enable server-side tracking (Recommended)</span>
          </label>
          <p className="text-text-muted text-sm mt-2 ml-8">
            Captures 20-40% more conversions by bypassing ad blockers and browser restrictions
          </p>
        </div>
        
        {enableServerSide && (
          <div className="ml-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-2">
                Deployment Method
              </label>
              <select
                {...register('serverMethod')}
                className="w-full bg-input-bg border border-border rounded-lg px-4 py-3"
              >
                <option value="self-hosted">Self-hosted (FREE)</option>
                <option value="atlas-hosted">Atlas-hosted ($49/mo)</option>
                <option value="gcp-hosted">Google Cloud hosted</option>
              </select>
            </div>
            
            {serverMethod === 'self-hosted' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2">
                  Server Endpoint URL
                </label>
                <input
                  {...register('serverEndpoint')}
                  className="w-full bg-input-bg border border-border rounded-lg px-4 py-3"
                  placeholder="https://api.yoursite.com/track"
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          className="px-6 py-3 border border-border rounded-lg hover:bg-input-bg transition"
        >
          Save Draft
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-[#14DFC8] via-atlas-teal to-[#085A50] text-deep-navy font-semibold rounded-lg hover:opacity-90 transition"
        >
          Continue to Journey Designer →
        </button>
      </div>
    </form>
  );
}
```

---

## 🎨 Design Guidelines

### Colors
Use EXACT hex codes from design system:
- Background: `#080B12` (deep-navy)
- Primary action: `#0BBFAA` (atlas-teal)
- Text: `#E8ECF2` (text-primary)
- Muted: `#7A8599` (text-muted)

### Typography
- Headings: `font-primary` (Bricolage Grotesque 700)
- Body: `font-body` (Inter 400/500/600)
- Code: `font-mono` (JetBrains Mono)

### Components
- Cards: `bg-card-bg border border-border rounded-lg p-6`
- Buttons (primary): Teal gradient
- Buttons (secondary): `border border-border`
- Inputs: `bg-input-bg border border-border focus:border-atlas-teal`

---

## ⚠️ What NOT to Build (Phase 1)

- Backend API (not yet)
- Phase 2/3/4 UI (not yet)
- Authentication (can be placeholder)
- Database (not yet)
- GTM generation logic (not yet)

**Focus ONLY on:**
1. ✅ Project setup (Vite + React + TypeScript + Tailwind)
2. ✅ Layout with Sidebar
3. ✅ Dashboard (basic, empty state)
4. ✅ Phase 1 Discovery form (WITH server-side config section)

---

## 📋 Definition of Done (Phase 1)

Phase 1 is complete when:
- [ ] Vite + React + TypeScript project running (`npm run dev` works)
- [ ] Tailwind configured with design system colors
- [ ] Layout component with Sidebar (248px, fixed, dark)
- [ ] Dashboard page with "Create New Project" button
- [ ] Phase 1 Discovery form with ALL fields (including server-side config)
- [ ] Form validation works (React Hook Form + Zod)
- [ ] Design matches DESIGN_SYSTEM.md (dark industrial aesthetic)
- [ ] Can navigate between Dashboard and Discovery form

---

## 🚦 Start Command

```bash
# After project setup
npm run dev

# Should open: http://localhost:5173
```

---

## 💡 Tips for Working with Claude Code

### ✅ DO:
- Reference docs frequently: "Check docs/ATLAS_DEV_BRIEF.md for Phase 1 fields"
- Build incrementally: layout → dashboard → form
- Test after each component
- Ask for clarification if spec is unclear
- Commit after each completed feature

### ❌ DON'T:
- Try to build everything at once
- Deviate from design system colors
- Build Phase 2/3/4 yet (out of scope)
- Skip form validation
- Ignore TypeScript errors

---

## 📖 Reference Materials

- **Complete Spec:** docs/ATLAS_DEV_BRIEF.md
- **Design System:** docs/DESIGN_SYSTEM.md
- **Product Vision:** docs/ATLAS_TRANSFORMATION_SUMMARY.md
- **UI Reference:** reference/atlas-final.jsx (ignore Phase 2)

---

## 🎯 Key Reminder

**Server-side tracking is THE core feature, not an afterthought.**

Every conversion in Atlas will have:
- Client-side tracking (browser)
- Server-side tracking (sGTM)
- Automatic deduplication

This is what makes Atlas special. Keep this front and center in all design decisions.

---

**Ready to build the future of conversion tracking!** 🚀

Start with: Project setup → Layout → Dashboard → Phase 1 Discovery form
