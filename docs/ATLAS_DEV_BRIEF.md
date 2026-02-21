# Atlas - Tracking Architecture Planner (TAP)

**Complete Product Specification with Server-Side GTM Integration**

---

## Product Overview

**Atlas** is a conversion signal orchestration platform that enables marketing teams to design complete, future-proof tracking architectures for modern web apps. Atlas focuses on **business intent, journey-based event design, and dual-tracking (client + server)** to ensure accurate conversion measurement across GA4, Google Ads, and Meta.

**Core Value:**
> Design once, deploy everywhere. Define canonical conversion events and automatically orchestrate consistent signals across client-side and server-side tracking to GA4, Google Ads, and Meta.

**Target Users:** Growth marketers, marketing ops, agencies, startup founders (non-technical)

**Primary Problem Solved:** 
Modern web properties (SPAs, headless ecommerce) break traditional tracking:
- Client-side only tracking loses 20-40% of conversions (ad blockers, ITP, consent)
- Conversions fire inconsistently across platforms
- Developers receive unclear requirements
- Marketers lack confidence in ROAS

**Solution:**
Dual tracking architecture (client + server) with automatic deduplication and conversion signal orchestration.

---

## Strategic Positioning

> **The system of record for conversion truth across GA4, Google Ads & Meta for modern web apps.**

Not a tag manager. Not a scanner. An **analytics infrastructure design and conversion orchestration platform with server-side tracking built-in**.

---

## Why Server-Side Tracking is Critical

### The Problem with Client-Side Only:

❌ **Ad blockers** - 30%+ of users block tracking scripts  
❌ **iOS ITP** - Safari kills cookies after 7 days  
❌ **Browser restrictions** - Privacy features block 3rd party tracking  
❌ **SPA issues** - Page transitions don't reload, events get lost  
❌ **Headless commerce** - Checkout on different domain breaks cookies  
❌ **Data loss** - 20-40% of conversions never reach platforms  

### The Solution: Client + Server Architecture:

✅ **Survives ad blockers** - Server calls can't be blocked  
✅ **First-party data** - Cookies set on your domain  
✅ **100% coverage** - Server captures what client misses  
✅ **Enhanced conversions** - Safely hash PII server-side  
✅ **Meta CAPI** - Required for accurate Meta attribution  
✅ **Google Enhanced Conversions** - Required for Google Ads accuracy  
✅ **Deduplication** - Same event_id prevents double-counting  

---

## What Atlas Does (V1)

✅ Journey-based event design (funnels, not elements)  
✅ Canonical event schema definition  
✅ **Dual tracking architecture** (client + server)  
✅ Conversion orchestration (one event → GA4 + Ads + Meta)  
✅ **Server-side GTM container generation**  
✅ **Meta CAPI integration**  
✅ **Google Enhanced Conversions setup**  
✅ **Server endpoint code generation** (Node.js/Python)  
✅ Data layer specification generation  
✅ Client-side GTM container export  
✅ Developer handover documentation  
✅ Conversion readiness validation  

❌ Does NOT do: Site scanning, DOM tagging, live debugging, BI dashboards

---

## Technology Stack

**Frontend:**
```
React + TypeScript + Vite + Tailwind CSS
State: Zustand
Forms: React Hook Form + Zod
Icons: Lucide React
```

**Backend:**
```
Node.js + Express + PostgreSQL
OR
Python + FastAPI + PostgreSQL
```

**Hosting:**
```
Frontend: Vercel
Backend: Railway / Google Cloud Run
Database: Railway PostgreSQL / Supabase
Auth: Clerk or Supabase Auth
```

**Generated Server Endpoint:**
```
Node.js (Express) - primary
Python (FastAPI) - alternative
Deployment: Railway, Vercel Functions, Google Cloud Run
```

---

## Four-Phase Workflow

### Phase 1: Discovery
Gather business context + server-side tracking preferences
→ Pre-configure journey templates + tracking method

### Phase 2: Journey Designer  
Define business journeys (Checkout Funnel, Signup Flow, Lead Gen)
→ Build canonical event schema

### Phase 3: Conversion Orchestration + Server-Side Routing
Map events to platforms (GA4, Google Ads, Meta)
→ **Configure client vs server routing per event**
→ **Enable Meta CAPI + Enhanced Conversions**
→ Define conversion payloads

### Phase 4: Developer Handover
Export complete dual-tracking implementation package:
→ Client-side GTM container
→ **Server-side GTM container**
→ **Server endpoint code (Node.js/Python)**
→ **Meta CAPI setup guide**
→ **Enhanced Conversions setup guide**
→ Data layer specifications
→ Testing scripts

---

## PHASE 1: Discovery (Enhanced)

### Purpose
Gather business context + server-side tracking configuration

### Input Fields

**Client Information:**
- Client Name (required)
- Industry (dropdown: Ecommerce, SaaS, Lead Gen, Media, Other)
- Website URL (required, validated)
- Property Type: SPA | Headless Ecommerce | Traditional CMS | Web App
- Business Model: Ecommerce | SaaS | Lead Gen | Media | Marketplace
- Primary Objective: Purchase | Subscription | Lead | Trial | Activation

**Current Tech Stack** (multi-select):
- Google Analytics 4
- Google Tag Manager
- Google Ads
- Meta Pixel
- LinkedIn Insight Tag
- Shopify / WooCommerce / Custom
- None/Starting Fresh

**Server-Side Tracking Configuration (NEW):**

```
┌────────────────────────────────────────────────────┐
│ SERVER-SIDE TRACKING                               │
│                                                    │
│ Enable server-side tracking?                      │
│ ● Yes (Recommended for SPAs & headless sites)     │
│ ○ No (Client-side only - not recommended)         │
│                                                    │
│ Server Deployment Method:                         │
│ ○ Self-hosted (you deploy - FREE)                │
│   ├─ Railway (recommended)                        │
│   ├─ Vercel Functions                             │
│   ├─ Google Cloud Run                             │
│   └─ AWS Lambda                                   │
│                                                    │
│ ○ Atlas-hosted (managed service - $49/mo)        │
│   └─ Zero DevOps, instant setup                  │
│                                                    │
│ ○ Google Cloud hosted (official sGTM)            │
│   └─ $50-200/mo, requires GCP account            │
│                                                    │
│ Your Server Endpoint URL (if self-hosted):       │
│ ┌────────────────────────────────────────────┐   │
│ │ https://api.yoursite.com/track             │   │
│ └────────────────────────────────────────────┘   │
│                                                    │
│ ℹ️ Server-side tracking captures 20-40% more     │
│    conversions by bypassing ad blockers & ITP     │
└────────────────────────────────────────────────────┘
```

**Notes:** (textarea for additional context)

### System Output

Based on selections, pre-configure:
- Journey templates (Checkout Funnel for Ecommerce, etc.)
- Recommended events with parameters
- **Tracking method defaults** (Both client + server for conversions)
- Platform mapping suggestions
- **Server-side clients to enable** (GA4 MP, Meta CAPI, Google Ads)

### Actions
- Save Draft
- Continue to Phase 2: Journey Designer

---

## PHASE 2: Journey Designer

**[This phase remains the same as before - no changes needed]**

### Purpose
Define user journeys and canonical events based on business intent

### Journey Templates

**Ecommerce:**
```
Checkout Funnel:
1. view_item → Product page view
2. add_to_cart → Item added to cart
3. view_cart → Cart page viewed
4. begin_checkout → Checkout initiated
5. add_payment_info → Payment details entered
6. add_shipping_info → Shipping details entered
7. purchase → Transaction completed (PRIMARY CONVERSION)
```

**SaaS:**
```
Signup Funnel:
1. view_signup_page → Signup page loaded
2. begin_signup → Form started
3. signup_complete → Account created (PRIMARY CONVERSION)
```

**Lead Gen:**
```
Contact Flow:
1. view_contact_page → Contact page loaded
2. begin_form → Form started
3. lead_submit → Form submitted (PRIMARY CONVERSION)
```

### Event Step Editor

For each event:
- Canonical Event Name: `add_to_cart`
- Display Name: "Add to Cart"
- Description: "Triggered when user adds item to cart"
- Event Type: Page View | User Action | Success | Error
- Route/Context: `/products/:id` (optional)
- Category: Acquisition | Activation | Revenue | Retention
- Is conversion? No | Yes (Primary) | Yes (Secondary)
- Required Parameters (table of name, type, required flag)
- Implementation Notes (for developers)

### Validation

- ✅ At least one journey defined
- ✅ At least one primary conversion
- ✅ All required parameters defined

### Actions
- Save Draft
- Add Another Journey
- Continue to Phase 3: Conversion Orchestration

---

## PHASE 3: Conversion Orchestration + Server-Side Routing (ENHANCED)

### Purpose
Map canonical events to platforms AND configure client vs server routing

---

### 3.1 Conversion Configuration with Tracking Method

For each conversion event:

```
┌──────────────────────────────────────────────────────────┐
│ 💰 purchase                                              │
│    Transaction completed successfully                    │
│                                                          │
│ ──────────────────────────────────────────────────────  │
│                                                          │
│ TRACKING METHOD                                          │
│                                                          │
│ ○ Client-side only (browser GTM)                        │
│   └─ GA4, Meta Pixel in browser only                   │
│   └─ Not recommended (loses 20-40% of conversions)     │
│                                                          │
│ ○ Server-side only (sGTM)                               │
│   └─ All events sent server-side                       │
│   └─ Use for backend conversions (API purchases)       │
│                                                          │
│ ● Both (recommended - automatic deduplication)          │
│   ├─ Browser: Client-side GTM → GA4, Meta Pixel        │
│   ├─ Server: sGTM → GA4 MP, Meta CAPI, Google Ads EC  │
│   └─ Deduplicated by event_id (prevents double-count) │
│                                                          │
│ ──────────────────────────────────────────────────────  │
│                                                          │
│ CONVERSION VALUE                                         │
│ ● Dynamic (from data layer) - recommended               │
│ ○ Fixed value: $______                                  │
│                                                          │
│ Currency: [USD ▼]                                       │
│                                                          │
│ Revenue Event: ● Yes  ○ No                              │
│ Optimize in Paid Media: ● Yes  ○ No                    │
│                                                          │
│ ──────────────────────────────────────────────────────  │
│                                                          │
│ CLIENT-SIDE PLATFORMS                                    │
│ ☑ GA4 (browser event)                                   │
│ ☑ Meta Pixel (browser event)                            │
│                                                          │
│ SERVER-SIDE PLATFORMS                                    │
│ ☑ GA4 Measurement Protocol                              │
│ ☑ Meta Conversions API (CAPI)                           │
│ ☑ Google Ads Enhanced Conversions                       │
│                                                          │
│ ──────────────────────────────────────────────────────  │
│                                                          │
│ EVENT DEDUPLICATION                                      │
│ Method: event_id (UUID v4)                              │
│ ☑ Enable automatic deduplication                        │
│                                                          │
│ ℹ️ Same event_id sent from client + server prevents    │
│    duplicate counting in GA4 and Meta                   │
│                                                          │
│ [Edit Configuration]                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### 3.2 Platform Mapping (Client + Server)

**Ecommerce Event Mappings:**

| Canonical Event | Client-Side         | Server-Side                    |
|-----------------|---------------------|--------------------------------|
| view_item       | GA4: view_item      | GA4 MP: view_item             |
|                 | Meta: ViewContent   | Meta CAPI: ViewContent        |
| add_to_cart     | GA4: add_to_cart    | GA4 MP: add_to_cart           |
|                 | Meta: AddToCart     | Meta CAPI: AddToCart          |
| begin_checkout  | GA4: begin_checkout | GA4 MP: begin_checkout        |
|                 | Meta: InitiateCheckout | Meta CAPI: InitiateCheckout |
| purchase        | GA4: purchase       | GA4 MP: purchase              |
|                 | Meta: Purchase      | Meta CAPI: Purchase           |
|                 | Google Ads: (tracked) | Google Ads: Enhanced Conv   |

**SaaS Event Mappings:**

| Canonical Event | Client-Side      | Server-Side                      |
|-----------------|------------------|----------------------------------|
| signup_complete | GA4: sign_up     | GA4 MP: sign_up                 |
|                 | Meta: CompleteRegistration | Meta CAPI: CompleteRegistration |
|                 | Google Ads: (tracked) | Google Ads: Enhanced Conv  |

**Lead Gen Event Mappings:**

| Canonical Event | Client-Side       | Server-Side              |
|-----------------|-------------------|--------------------------|
| lead_submit     | GA4: generate_lead | GA4 MP: generate_lead   |
|                 | Meta: Lead        | Meta CAPI: Lead          |
|                 | Google Ads: (tracked) | Google Ads: Enhanced Conv |

---

### 3.3 Conversion Payload Schema (Client + Server)

System defines exact data layer structure for dual tracking:

**Example: `purchase` event**

```javascript
// Client-side code (runs in browser)
const trackPurchase = async (orderData) => {
  const event = {
    event: 'purchase',
    event_id: crypto.randomUUID(), // CRITICAL: for deduplication
    
    ecommerce: {
      transaction_id: orderData.orderId,  // Required
      value: orderData.total,              // Required
      currency: 'USD',                     // Required
      tax: orderData.tax,                  // Recommended
      shipping: orderData.shipping,        // Recommended
      items: [{
        item_id: 'SKU_123',
        item_name: 'Blue Widget',
        price: 99.99,
        quantity: 2
      }]
    },
    
    // User data for enhanced conversions (unhashed - server will hash)
    user_data: {
      email: orderData.customerEmail,      // Raw email
      phone: orderData.customerPhone,      // Raw phone
      address: {                            // Optional
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        city: orderData.city,
        country: orderData.country,
        postal_code: orderData.zip
      }
    }
  };
  
  // 1. Send to client-side GTM (browser)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
  
  // 2. Send to server endpoint
  await fetch('https://api.yoursite.com/track', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(event),
    keepalive: true // Ensures send even if page unloads
  });
};
```

**Server processes:**
1. Receives event
2. Hashes PII (email, phone) using SHA-256
3. Adds server context (IP, user-agent)
4. Forwards to sGTM endpoint
5. sGTM sends to GA4 MP, Meta CAPI, Google Ads

**Deduplication:**
- Same `event_id` sent from client + server
- GA4 automatically deduplicates
- Meta automatically deduplicates
- Google Ads uses transaction_id

---

### 3.4 Enhanced Conversions Configuration

```
┌──────────────────────────────────────────────────────────┐
│ ENHANCED CONVERSIONS                                     │
│                                                          │
│ Google Ads Enhanced Conversions                         │
│ ☑ Enable (recommended)                                  │
│                                                          │
│ User data to send:                                      │
│ ☑ Email (hashed SHA-256)                                │
│ ☑ Phone (hashed SHA-256)                                │
│ ☑ First name (hashed)                                   │
│ ☑ Last name (hashed)                                    │
│ ☑ Address (hashed)                                      │
│                                                          │
│ ℹ️ Improves match rate by 20-40%                        │
│                                                          │
│ ──────────────────────────────────────────────────────  │
│                                                          │
│ Meta Conversions API (CAPI)                             │
│ ☑ Enable (required for accurate attribution)           │
│                                                          │
│ Access Token: [Configure in Phase 4]                   │
│                                                          │
│ Event matching:                                         │
│ ☑ Email (hashed SHA-256)                                │
│ ☑ Phone (hashed SHA-256)                                │
│ ☑ IP address                                            │
│ ☑ User agent                                            │
│ ☑ Click ID (fbc, fbp cookies)                          │
│                                                          │
│ ℹ️ Expected match quality: Good to Great                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### 3.5 Conversion Readiness Score

```
┌──────────────────────────────────────────────────────────┐
│ CONVERSION READINESS                                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Overall Score: 95/100                                🟢  │
│                                                          │
│ ✅ Primary conversion defined (purchase)                │
│ ✅ Dual tracking enabled (client + server)              │
│ ✅ Mapped to all platforms (GA4, Ads, Meta)             │
│ ✅ Value and currency configured                         │
│ ✅ Event deduplication enabled (event_id)               │
│ ✅ Required parameters complete                          │
│ ✅ Enhanced conversions enabled                          │
│ ✅ Meta CAPI configured                                  │
│ ✅ Server endpoint defined                               │
│                                                          │
│ ⚠️  WARNINGS (1)                                         │
│                                                          │
│ • Meta Access Token not configured yet                  │
│   (will be configured in Phase 4 deployment)            │
│   [Skip for Now]                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Scoring:**
- Primary conversion: +15
- Dual tracking enabled: +20
- All platforms mapped: +20
- Value configured: +10
- Deduplication enabled: +10
- Parameters complete: +10
- Enhanced conversions: +10
- Meta CAPI configured: +10

### Actions
- Save Draft
- Back to Journey Designer
- Continue to Phase 4: Developer Handover

---

## PHASE 4: Developer Handover (ENHANCED)

### Purpose
Generate complete dual-tracking implementation package

---

### 4.1 Export Package Contents

One-click download generates:

```
ClientName_Atlas_Implementation/
│
├── client-side/
│   ├── GTM_Container_Client.json
│   ├── DataLayer_Client_Spec.md
│   └── Client_Implementation_Guide.md
│
├── server-side/
│   ├── GTM_Container_Server.json          ← NEW
│   ├── server-endpoint-node.js            ← NEW
│   ├── server-endpoint-python.py          ← NEW
│   ├── Server_Deployment_Guide.md         ← NEW
│   ├── Meta_CAPI_Setup.md                 ← NEW
│   ├── Enhanced_Conversions_Setup.md      ← NEW
│   └── Server_Testing_Guide.md            ← NEW
│
├── shared/
│   ├── Event_Dictionary.csv
│   ├── Conversion_Mapping.md
│   ├── Dual_Tracking_Architecture.md      ← NEW
│   ├── Deduplication_Guide.md             ← NEW
│   └── QA_Checklist.md
│
└── verification/
    ├── client-verification.js
    ├── server-verification.js             ← NEW
    └── end-to-end-test.md                 ← NEW
```

---

### 4.2 Client-Side GTM Container

**Generated tags:**

```json
{
  "tag": [
    {
      "name": "GA4 - purchase (client)",
      "type": "gaawe",
      "parameter": [
        {"key": "eventName", "value": "purchase"},
        {"key": "measurementId", "value": "{{GA4 Measurement ID}}"}
      ],
      "firingTriggerId": ["trigger_purchase"]
    },
    {
      "name": "Meta Pixel - Purchase (client)",
      "type": "html",
      "parameter": [{
        "key": "html",
        "value": "<script>fbq('track', 'Purchase', {value: {{DLV - value}}, currency: {{DLV - currency}}, content_ids: {{DLV - product_ids}}, eventID: {{DLV - event_id}}});</script>"
      }],
      "firingTriggerId": ["trigger_purchase"]
    }
  ]
}
```

**Key features:**
- All client-side tags for GA4, Meta Pixel
- Base tracking (page views, sessions)
- Event deduplication via event_id

---

### 4.3 Server-Side GTM Container (NEW)

**Generated clients:**

```json
{
  "client": [
    {
      "name": "GA4 Client",
      "type": "gtag",
      "parameter": [
        {"key": "protocolVersion", "value": "2"}
      ]
    }
  ]
}
```

**Generated tags:**

```json
{
  "tag": [
    {
      "name": "GA4 MP - purchase",
      "type": "gaawe",
      "parameter": [
        {"key": "eventName", "value": "purchase"},
        {"key": "measurementId", "value": "{{GA4 Measurement ID}}"},
        {"key": "apiSecret", "value": "{{GA4 API Secret}}"},
        {"key": "eventParameters", "list": [
          {"map": [
            {"key": "name", "value": "transaction_id"},
            {"key": "value", "value": "{{transaction_id}}"}
          ]},
          {"map": [
            {"key": "name", "value": "value"},
            {"key": "value", "value": "{{value}}"}
          ]},
          {"map": [
            {"key": "name", "value": "event_id"},
            {"key": "value", "value": "{{event_id}}"}
          ]}
        ]},
        {"key": "userProperties", "list": [
          {"map": [
            {"key": "name", "value": "user_data_email_sha256"},
            {"key": "value", "value": "{{user_data.email}}"}
          ]},
          {"map": [
            {"key": "name", "value": "user_data_phone_sha256"},
            {"key": "value", "value": "{{user_data.phone}}"}
          ]}
        ]}
      ],
      "firingTriggerId": ["trigger_purchase_server"]
    },
    {
      "name": "Meta CAPI - Purchase",
      "type": "fbcapi",
      "parameter": [
        {"key": "pixelId", "value": "{{Meta Pixel ID}}"},
        {"key": "accessToken", "value": "{{Meta Access Token}}"},
        {"key": "eventName", "value": "Purchase"},
        {"key": "eventId", "value": "{{event_id}}"},
        {"key": "userData", "map": [
          {"key": "em", "value": "{{user_data.email}}"},
          {"key": "ph", "value": "{{user_data.phone}}"},
          {"key": "client_ip_address", "value": "{{client_ip}}"},
          {"key": "client_user_agent", "value": "{{client_user_agent}}"}
        ]},
        {"key": "customData", "map": [
          {"key": "value", "value": "{{value}}"},
          {"key": "currency", "value": "{{currency}}"},
          {"key": "content_ids", "value": "{{product_ids}}"}
        ]}
      ],
      "firingTriggerId": ["trigger_purchase_server"]
    },
    {
      "name": "Google Ads - Enhanced Conversions",
      "type": "gclidw",
      "parameter": [
        {"key": "conversionId", "value": "AW-123456789"},
        {"key": "conversionLabel", "value": "{{Google Ads Conversion Label}}"},
        {"key": "conversionValue", "value": "{{value}}"},
        {"key": "currencyCode", "value": "{{currency}}"},
        {"key": "transactionId", "value": "{{transaction_id}}"},
        {"key": "enhancedConversionsData", "map": [
          {"key": "email", "value": "{{user_data.email}}"},
          {"key": "phone_number", "value": "{{user_data.phone}}"},
          {"key": "address", "map": [
            {"key": "first_name", "value": "{{user_data.address.first_name}}"},
            {"key": "last_name", "value": "{{user_data.address.last_name}}"},
            {"key": "city", "value": "{{user_data.address.city}}"},
            {"key": "country", "value": "{{user_data.address.country}}"},
            {"key": "postal_code", "value": "{{user_data.address.postal_code}}"}
          ]}
        ]}
      ],
      "firingTriggerId": ["trigger_purchase_server"]
    }
  ]
}
```

**Key features:**
- GA4 Measurement Protocol tags
- Meta Conversions API tags
- Google Ads Enhanced Conversions tags
- All user data pre-hashed
- Event deduplication via event_id

---

### 4.4 Server Endpoint Code (NEW)

**Node.js Implementation:**

```javascript
// atlas-tracking-endpoint.js
// Generated by Atlas for ClientName
// Deploy to: Railway, Vercel Functions, Google Cloud Run, AWS Lambda

const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

const SGTM_ENDPOINT = process.env.SGTM_ENDPOINT || 'https://your-sgtm-server.com';
const ALLOWED_ORIGINS = [
  'https://yoursite.com',
  'https://www.yoursite.com'
];

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()});
});

// Main tracking endpoint
app.post('/track', async (req, res) => {
  try {
    const event = req.body;
    
    // ─────────────────────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────────────────────
    
    if (!event.event) {
      return res.status(400).json({
        error: 'Missing required field: event'
      });
    }
    
    if (!event.event_id) {
      return res.status(400).json({
        error: 'Missing required field: event_id (required for deduplication)'
      });
    }
    
    // Validate conversion events have required fields
    if (event.event === 'purchase') {
      if (!event.ecommerce?.transaction_id) {
        return res.status(400).json({
          error: 'Missing required field: ecommerce.transaction_id'
        });
      }
      if (!event.ecommerce?.value) {
        return res.status(400).json({
          error: 'Missing required field: ecommerce.value'
        });
      }
      if (!event.ecommerce?.currency) {
        return res.status(400).json({
          error: 'Missing required field: ecommerce.currency'
        });
      }
    }
    
    // ─────────────────────────────────────────────────────
    // ENRICH EVENT WITH SERVER CONTEXT
    // ─────────────────────────────────────────────────────
    
    event._server_timestamp = Date.now();
    event._server_processed = true;
    
    // Client IP (handling proxies)
    event.client_ip = req.headers['x-forwarded-for']?.split(',')[0].trim() 
                      || req.ip 
                      || req.connection.remoteAddress;
    
    // User agent
    event.client_user_agent = req.headers['user-agent'];
    
    // ─────────────────────────────────────────────────────
    // HASH PII (EMAIL, PHONE)
    // ─────────────────────────────────────────────────────
    
    if (event.user_data) {
      if (event.user_data.email) {
        event.user_data.email = hashSHA256(event.user_data.email);
      }
      
      if (event.user_data.phone) {
        event.user_data.phone = hashSHA256(event.user_data.phone);
      }
      
      // Hash address fields for enhanced conversions
      if (event.user_data.address) {
        const addr = event.user_data.address;
        if (addr.first_name) addr.first_name = hashSHA256(addr.first_name);
        if (addr.last_name) addr.last_name = hashSHA256(addr.last_name);
        if (addr.city) addr.city = hashSHA256(addr.city);
        if (addr.country) addr.country = hashSHA256(addr.country);
        if (addr.postal_code) addr.postal_code = hashSHA256(addr.postal_code);
      }
    }
    
    // ─────────────────────────────────────────────────────
    // FORWARD TO SERVER-SIDE GTM
    // ─────────────────────────────────────────────────────
    
    const sgtmResponse = await fetch(`${SGTM_ENDPOINT}/gtm.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': event.client_user_agent || 'Atlas-Tracking-Endpoint'
      },
      body: JSON.stringify(event)
    });
    
    if (!sgtmResponse.ok) {
      const errorText = await sgtmResponse.text();
      console.error('sGTM error:', errorText);
      return res.status(500).json({
        error: 'Failed to forward event to sGTM',
        details: errorText
      });
    }
    
    // ─────────────────────────────────────────────────────
    // SUCCESS RESPONSE
    // ─────────────────────────────────────────────────────
    
    res.json({
      success: true,
      event: event.event,
      event_id: event.event_id,
      timestamp: event._server_timestamp
    });
    
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Hash a value using SHA-256
 * Normalizes input (lowercase, trim) before hashing
 */
function hashSHA256(input) {
  if (!input) return null;
  
  const normalized = String(input).toLowerCase().trim();
  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex');
}

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  Atlas Tracking Endpoint                              ║
║  Running on port ${PORT}                                   ║
║  sGTM endpoint: ${SGTM_ENDPOINT}         ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
```

**Python Implementation (FastAPI):**

```python
# atlas_tracking_endpoint.py
# Generated by Atlas for ClientName
# Deploy to: Railway, Google Cloud Run, AWS Lambda

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional, Dict, Any, List
import hashlib
import httpx
import time
import os

app = FastAPI(title="Atlas Tracking Endpoint")

# ═══════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════

SGTM_ENDPOINT = os.getenv("SGTM_ENDPOINT", "https://your-sgtm-server.com")
ALLOWED_ORIGINS = [
    "https://yoursite.com",
    "https://www.yoursite.com"
]

# ═══════════════════════════════════════════════════════════
# MIDDLEWARE
# ═══════════════════════════════════════════════════════════

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# ═══════════════════════════════════════════════════════════
# MODELS
# ═══════════════════════════════════════════════════════════

class TrackingEvent(BaseModel):
    event: str
    event_id: str
    ecommerce: Optional[Dict[str, Any]] = None
    user_data: Optional[Dict[str, Any]] = None
    
    @validator('event')
    def event_not_empty(cls, v):
        if not v:
            raise ValueError('event cannot be empty')
        return v
    
    @validator('event_id')
    def event_id_not_empty(cls, v):
        if not v:
            raise ValueError('event_id required for deduplication')
        return v

# ═══════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": time.time()}

@app.post("/track")
async def track_event(event: TrackingEvent, request: Request):
    try:
        # Convert to dict
        event_data = event.dict()
        
        # ─────────────────────────────────────────────────
        # VALIDATION
        # ─────────────────────────────────────────────────
        
        if event.event == "purchase":
            if not event.ecommerce or not event.ecommerce.get("transaction_id"):
                raise HTTPException(
                    status_code=400,
                    detail="Missing ecommerce.transaction_id for purchase event"
                )
            if not event.ecommerce.get("value"):
                raise HTTPException(
                    status_code=400,
                    detail="Missing ecommerce.value for purchase event"
                )
        
        # ─────────────────────────────────────────────────
        # ENRICH WITH SERVER CONTEXT
        # ─────────────────────────────────────────────────
        
        event_data["_server_timestamp"] = int(time.time() * 1000)
        event_data["_server_processed"] = True
        
        # Client IP
        forwarded_for = request.headers.get("x-forwarded-for")
        event_data["client_ip"] = forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host
        
        # User agent
        event_data["client_user_agent"] = request.headers.get("user-agent", "")
        
        # ─────────────────────────────────────────────────
        # HASH PII
        # ─────────────────────────────────────────────────
        
        if event_data.get("user_data"):
            user_data = event_data["user_data"]
            
            if user_data.get("email"):
                user_data["email"] = hash_sha256(user_data["email"])
            
            if user_data.get("phone"):
                user_data["phone"] = hash_sha256(user_data["phone"])
            
            # Hash address fields
            if user_data.get("address"):
                addr = user_data["address"]
                for field in ["first_name", "last_name", "city", "country", "postal_code"]:
                    if addr.get(field):
                        addr[field] = hash_sha256(addr[field])
        
        # ─────────────────────────────────────────────────
        # FORWARD TO SGTM
        # ─────────────────────────────────────────────────
        
        async with httpx.AsyncClient() as client:
            sgtm_response = await client.post(
                f"{SGTM_ENDPOINT}/gtm.js",
                json=event_data,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": event_data.get("client_user_agent", "Atlas-Tracking-Endpoint")
                }
            )
            
            if sgtm_response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"sGTM error: {sgtm_response.text}"
                )
        
        # ─────────────────────────────────────────────────
        # SUCCESS
        # ─────────────────────────────────────────────────
        
        return {
            "success": True,
            "event": event.event,
            "event_id": event.event_id,
            "timestamp": event_data["_server_timestamp"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════

def hash_sha256(value: str) -> str:
    """Hash a value using SHA-256"""
    if not value:
        return None
    
    normalized = str(value).lower().strip()
    return hashlib.sha256(normalized.encode()).hexdigest()

# ═══════════════════════════════════════════════════════════
# STARTUP
# ═══════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
```

---

### 4.5 Data Layer Specification (Client + Server)

**Complete developer guide:**

```markdown
# Data Layer Implementation Guide - ClientName

## Dual Tracking Architecture

Your tracking uses BOTH client-side and server-side:

**Client-side:** Browser → Client GTM → GA4, Meta Pixel  
**Server-side:** Browser → Your Server → sGTM → GA4 MP, Meta CAPI, Google Ads

**Deduplication:** Same `event_id` prevents double-counting

---

## Base Setup

### 1. Initialize Data Layer (Client)

```html
<script>
  window.dataLayer = window.dataLayer || [];
</script>
```

### 2. Install Client-Side GTM

Import `GTM_Container_Client.json` into your GTM account.

Container ID: GTM-XXXXXXX

### 3. Deploy Server Endpoint

See `server-side/Server_Deployment_Guide.md` for deployment instructions.

Endpoint URL: https://api.yoursite.com/track

### 4. Install Server-Side GTM

See `server-side/Meta_CAPI_Setup.md` and `Enhanced_Conversions_Setup.md`

---

## Event Implementation

### Event: purchase

**Trigger When:** User completes a purchase transaction

**Code:**

```javascript
// After successful checkout
const trackPurchase = async (orderData) => {
  const event = {
    event: 'purchase',
    event_id: crypto.randomUUID(),  // CRITICAL: same ID for client + server
    
    ecommerce: {
      transaction_id: orderData.orderId,   // Required: unique
      value: orderData.total,               // Required: number
      currency: 'USD',                      // Required: ISO 4217
      tax: orderData.tax,                   // Recommended
      shipping: orderData.shipping,         // Recommended
      items: orderData.items.map(item => ({
        item_id: item.sku,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    },
    
    user_data: {
      email: orderData.customerEmail,      // Unhashed - server will hash
      phone: orderData.customerPhone,      // Unhashed - server will hash
      address: {                            // Optional - for enhanced conversions
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        city: orderData.city,
        country: orderData.country,
        postal_code: orderData.zip
      }
    }
  };
  
  // 1. Send to client-side GTM
  window.dataLayer.push(event);
  
  // 2. Send to server endpoint
  await fetch('https://api.yoursite.com/track', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(event),
    keepalive: true
  });
};
```

**CRITICAL Notes:**
- `event_id` must be same for client + server (deduplication)
- `transaction_id` must be unique per order
- Email/phone sent unhashed - server hashes before forwarding
- Use `keepalive: true` to ensure event sends even if page unloads

---

### Event: add_to_cart

```javascript
const trackAddToCart = async (product) => {
  const event = {
    event: 'add_to_cart',
    event_id: crypto.randomUUID(),
    
    ecommerce: {
      currency: 'USD',
      value: product.price * product.quantity,
      items: [{
        item_id: product.sku,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity
      }]
    }
  };
  
  window.dataLayer.push(event);
  await fetch('https://api.yoursite.com/track', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(event),
    keepalive: true
  });
};
```

---

### Event: lead_submit

```javascript
const trackLeadSubmit = async (formData) => {
  const event = {
    event: 'lead_submit',
    event_id: crypto.randomUUID(),
    
    form_name: 'Contact Form',
    form_location: window.location.pathname,
    
    user_data: {
      email: formData.email,
      phone: formData.phone
    }
  };
  
  window.dataLayer.push(event);
  await fetch('https://api.yoursite.com/track', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(event),
    keepalive: true
  });
};
```

---

## Helper Functions

### Generate Event ID

```javascript
function generateEventId() {
  // Modern browsers
  if (window.crypto && window.crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

---

## Testing

### 1. Client-Side

```javascript
// Run in browser console
console.log(window.dataLayer);

// Monitor events
const originalPush = window.dataLayer.push;
window.dataLayer.push = function(...args) {
  console.log('📊 DataLayer Event:', args);
  return originalPush.apply(window.dataLayer, args);
};
```

### 2. Server-Side

```bash
# Test server endpoint
curl -X POST https://api.yoursite.com/track \
  -H "Content-Type: application/json" \
  -d '{
    "event": "purchase",
    "event_id": "test-12345",
    "ecommerce": {
      "transaction_id": "TEST_ORDER",
      "value": 99.99,
      "currency": "USD",
      "items": []
    }
  }'
```

### 3. Verify Deduplication

1. Trigger a purchase
2. Check GA4 DebugView: Should see 1 event (not 2)
3. Check Meta Events Manager: Should see 1 Purchase (not 2)

---

## Common Issues

### Event Counted Twice

**Cause:** Different `event_id` in client vs server

**Fix:** Ensure same UUID is used:
```javascript
const eventId = crypto.randomUUID();
// Use this same eventId in BOTH dataLayer.push() and fetch()
```

### Server Events Not Appearing

**Cause:** Server endpoint not reachable

**Fix:** 
- Check server is running: `curl https://api.yoursite.com/health`
- Check CORS headers allow your domain
- Check browser console for fetch errors

### Low Match Rate (Enhanced Conversions)

**Cause:** Email/phone not being sent or not hashed correctly

**Fix:**
- Verify `user_data.email` is populated
- Server automatically hashes - don't hash client-side
- Use lowercase, trimmed values
```

---

### 4.6 Platform Setup Guides

**Meta CAPI Setup:**

```markdown
# Meta Conversions API (CAPI) Setup

## 1. Generate Access Token

1. Meta Events Manager → https://business.facebook.com/events_manager
2. Select your Pixel
3. Settings → Conversions API → Generate Access Token
4. Copy token (starts with `EAAG...`)
5. **IMPORTANT:** Save this token securely

## 2. Update Server-Side GTM

1. Open server-side GTM container
2. Variables → "Meta Access Token"
3. Paste token from step 1
4. Save

## 3. Enable Event Deduplication

CAPI requires matching `event_id` with browser Pixel events.

Atlas automatically handles this:
- Client: `fbq('track', 'Purchase', {..., eventID: 'uuid'})`
- Server: Sends same `event_id` in CAPI request

## 4. Test in Events Manager

1. Meta Events Manager → Test Events
2. Enter test event code (provided by Meta)
3. Trigger a purchase on your site
4. Verify you see BOTH events:
   - Browser event (Meta Pixel)
   - Server event (CAPI)
5. Check: "Deduplicated Event" = Yes

## 5. Verify Match Quality

After 24-48 hours:
1. Events Manager → Overview → Event Match Quality
2. Target: "Good" or "Great" (>70% match rate)
3. If low: Verify email/phone are being sent in `user_data`

## 6. Common Issues

**Events not appearing:**
- Check access token is valid
- Verify Pixel ID is correct
- Check server logs for errors

**Low match rate:**
- Ensure email/phone are sent
- Verify SHA-256 hashing (Atlas handles this)
- Include IP address and user agent (Atlas handles this)

**Duplicate events:**
- Ensure `event_id` is same for client + server
- Check Atlas deduplication is enabled
```

**Google Ads Enhanced Conversions:**

```markdown
# Google Ads Enhanced Conversions Setup

## 1. Enable Enhanced Conversions

1. Google Ads → Goals → Conversions
2. Select conversion action (e.g., "Purchase")
3. Settings → Enhanced conversions
4. Turn on: "Enhanced conversions"
5. Method: "Google Tag Manager"

## 2. Verify Server-Side GTM Config

Server-side GTM container already includes Enhanced Conversions:
- User data automatically hashed (SHA-256)
- Email, phone, address included
- Deduplication via transaction_id

No additional setup needed.

## 3. Test Enhanced Conversions

After 24-48 hours:
1. Google Ads → Reports → Conversions
2. Columns → "Enhanced conversions"
3. Check match rate: Should be >80%

## 4. Verify Data Quality

1. Google Ads → Tools → Conversions
2. Click conversion action
3. "Event snippet details" → "Enhanced conversions data"
4. Verify: Email, Phone showing "Received"

## 5. Common Issues

**Low match rate (<50%):**
- Verify user_data.email is populated
- Ensure SHA-256 hashing (Atlas handles this)
- Include full address when available

**Enhanced conversions not enabled:**
- Check conversion action settings
- Verify "Method" is set to "Google Tag Manager"
- Wait 24-48 hours for data to appear

**Duplicate conversions:**
- Use unique transaction_id per order
- Same event_id in client + server (Atlas handles this)
```

---

### 4.7 Server Deployment Guide

```markdown
# Server Endpoint Deployment Guide

## Deployment Options

### Option 1: Railway (Recommended - Easiest)

**Cost:** ~$5-10/mo

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Deploy:
```bash
cd server-side/
railway init
railway up
```

4. Set environment variables:
```bash
railway variables set SGTM_ENDPOINT=https://your-sgtm-server.com
```

5. Get URL:
```bash
railway domain
```

---

### Option 2: Vercel Functions

**Cost:** FREE (up to 100k invocations/mo)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Create `vercel.json`:
```json
{
  "functions": {
    "api/track.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

3. Move `server-endpoint-node.js` to `api/track.js`

4. Deploy:
```bash
vercel
```

---

### Option 3: Google Cloud Run

**Cost:** ~$10-20/mo

1. Install gcloud CLI

2. Build container:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/atlas-tracking
```

3. Deploy:
```bash
gcloud run deploy atlas-tracking \
  --image gcr.io/PROJECT_ID/atlas-tracking \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SGTM_ENDPOINT=https://your-sgtm-server.com
```

---

## After Deployment

1. Test endpoint:
```bash
curl https://your-endpoint.com/health
```

2. Update client-side code with your endpoint URL:
```javascript
const ATLAS_SERVER_ENDPOINT = 'https://your-endpoint.com/track';
```

3. Test event tracking

4. Monitor logs for errors
```

---

### 4.8 QA Checklist (Enhanced)

```markdown
# Atlas Dual-Tracking QA Checklist

## Pre-Launch

### Setup
- [ ] Client-side GTM container imported
- [ ] Server-side GTM container imported
- [ ] Server endpoint deployed and accessible
- [ ] All measurement IDs configured (GA4, Ads, Meta)
- [ ] Meta Access Token configured
- [ ] Google Ads conversion labels configured

### Client-Side
- [ ] GTM snippet on all pages
- [ ] dataLayer initialized before GTM
- [ ] All events fire in client GTM Preview

### Server-Side
- [ ] Server endpoint health check passes
- [ ] CORS configured for your domain
- [ ] sGTM endpoint URL configured
- [ ] Server logs show incoming events

---

## Event Testing

### purchase Event

**Client-Side:**
- [ ] Event fires in browser
- [ ] Visible in GTM Preview (client container)
- [ ] transaction_id populated
- [ ] value and currency correct
- [ ] event_id generated (UUID)
- [ ] Appears in GA4 DebugView
- [ ] Appears in Meta Pixel Helper

**Server-Side:**
- [ ] Event received by server endpoint
- [ ] Email/phone hashed correctly (check logs)
- [ ] Forwarded to sGTM
- [ ] Appears in GA4 (Measurement Protocol)
- [ ] Appears in Meta Events Manager (CAPI)
- [ ] Appears in Google Ads conversions

**Deduplication:**
- [ ] GA4 shows 1 purchase (not 2)
- [ ] Meta shows 1 Purchase (not 2)
- [ ] "Deduplicated Event" = Yes in Meta

---

### add_to_cart Event

- [ ] Client: fires in browser
- [ ] Server: received by endpoint
- [ ] GA4: 1 event only
- [ ] Meta: 1 AddToCart only

---

### lead_submit Event

- [ ] Client: fires in browser
- [ ] Server: received by endpoint
- [ ] user_data hashed
- [ ] GA4: 1 generate_lead
- [ ] Meta: 1 Lead
- [ ] Google Ads: 1 Lead conversion

---

## Data Quality

- [ ] Event IDs are unique UUIDs
- [ ] Transaction IDs unique per order
- [ ] No duplicate events (check deduplication)
- [ ] Email hashed correctly (SHA-256 lowercase)
- [ ] Phone hashed correctly (SHA-256 lowercase)
- [ ] Currency in ISO 4217 format (USD, EUR, etc.)

---

## Platform Verification

### Google Analytics 4
- [ ] Events in DebugView
- [ ] Both client and server events appear
- [ ] Deduplicated (event count = 1)
- [ ] Ecommerce data populates correctly

### Google Ads
- [ ] Conversions appear (24-48h delay)
- [ ] Enhanced conversions enabled
- [ ] Match rate >80%
- [ ] Conversion values correct

### Meta Pixel
- [ ] Events in Events Manager (Test Events)
- [ ] Both Browser and Server events appear
- [ ] Deduplicated (count = 1)
- [ ] Match quality: Good/Great

---

## Performance

- [ ] Page load time not impacted
- [ ] Server endpoint responds <500ms
- [ ] No browser console errors
- [ ] No server errors in logs

---

## Cross-Browser

- [ ] Chrome (desktop)
- [ ] Safari (desktop) - test ITP
- [ ] Firefox (desktop)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

---

## Sign-Off

- [ ] Marketing approved
- [ ] Development verified
- [ ] QA signed off

**Go-Live Date:** _______________
```

---

## Data Models (Updated)

### Client (Enhanced)

```typescript
interface Client {
  id: string;
  name: string;
  industry: string;
  website: string;
  propertyType: 'spa' | 'headless' | 'cms' | 'webapp';
  businessModel: 'ecommerce' | 'saas' | 'leadgen' | 'media';
  primaryObjective: string;
  techStack: string[];
  
  // Server-side tracking config
  serverSideTracking: {
    enabled: boolean;
    method: 'self-hosted' | 'atlas-hosted' | 'gcp-hosted';
    serverEndpoint?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Project (Enhanced)

```typescript
interface Project {
  id: string;
  clientId: string;
  currentPhase: 1 | 2 | 3 | 4;
  status: 'draft' | 'in-progress' | 'ready-to-deploy' | 'deployed';
  
  discovery: {...};
  journeys: Journey[];
  conversions: Conversion[];  // Now includes tracking method
  
  deployment: {
    clientSide: {
      gtmContainerId: string;
      ga4MeasurementId: string;
      metaPixelId: string;
    };
    serverSide: {
      gtmServerContainerId?: string;
      serverEndpoint?: string;
      sgtmEndpoint?: string;
      ga4ApiSecret?: string;
      metaAccessToken?: string;
    };
    generatedAssets: {
      clientGTM?: string;
      serverGTM?: string;
      serverEndpointNode?: string;
      serverEndpointPython?: string;
      // ... other docs
    };
    readinessScore: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Conversion (Enhanced)

```typescript
interface Conversion {
  id: string;
  eventName: string;
  conversionType: 'primary' | 'secondary';
  valueLogic: 'dynamic' | 'fixed';
  currency: string;
  
  // Tracking method
  trackingMethod: 'client-only' | 'server-only' | 'both';
  enableDeduplication: boolean;
  
  // Client-side platforms
  clientPlatforms: {
    ga4: {enabled: boolean; eventName: string;};
    metaPixel: {enabled: boolean; eventName: string;};
  };
  
  // Server-side platforms
  serverPlatforms: {
    ga4MP: {enabled: boolean; eventName: string;};
    metaCAPI: {enabled: boolean; eventName: string;};
    googleAdsEnhanced: {enabled: boolean; conversionLabel?: string;};
  };
  
  requiredFields: string[];
  enhancedConversionsEnabled: boolean;
}
```

---

## Backend Services (Enhanced)

### GTM Generator Service

```typescript
class GTMGeneratorService {
  // Generate client-side GTM container
  generateClientContainer(project: Project): GTMContainer {
    // Client-side tags for GA4, Meta Pixel
  }
  
  // Generate server-side GTM container (NEW)
  generateServerContainer(project: Project): GTMContainer {
    // Server-side tags for GA4 MP, Meta CAPI, Google Ads EC
  }
}
```

### Server Endpoint Generator (NEW)

```typescript
class ServerEndpointGenerator {
  // Generate Node.js server code
  generateNodeEndpoint(project: Project): string {
    // Express server with hashing, validation, sGTM forwarding
  }
  
  // Generate Python server code
  generatePythonEndpoint(project: Project): string {
    // FastAPI server with hashing, validation, sGTM forwarding
  }
  
  // Generate deployment configs
  generateDeploymentConfig(method: 'railway' | 'vercel' | 'gcp'): DeploymentConfig {
    // Railway.json, vercel.json, Dockerfile, etc.
  }
}
```

---

## Development Timeline (Updated)

### MVP (Now 8 weeks)

**Week 1-2:** Core app
- Auth, dashboard, clients
- Phase 1: Discovery (+ server-side config)

**Week 3-4:** Journey Designer
- Template library
- Step editor
- Parameter builder

**Week 5:** Conversion Orchestration
- Platform mapping
- **Tracking method selection** (client/server/both)
- Value configuration
- **Enhanced conversions config**
- **Meta CAPI config**
- Readiness scoring

**Week 6:** Client-Side Generation
- Client GTM JSON generator
- Client data layer spec generator

**Week 7:** Server-Side Generation (NEW)
- Server GTM JSON generator
- Server endpoint code generator (Node + Python)
- **Meta CAPI setup guide generator**
- **Enhanced Conversions guide generator**

**Week 8:** Testing & Polish
- End-to-end testing
- Deduplication verification
- Documentation polish
- Deployment guides

---

## Success Metrics (Updated)

**Activation:**
- % users enable server-side tracking
- % users configure Meta CAPI
- % users configure Enhanced Conversions

**Value:**
- Avg conversion improvement (client-only vs dual)
- Enhanced conversions match rate
- Meta CAPI match quality score

**Outcome:**
- Reduction in conversion loss
- Improved ROAS accuracy
- Developer satisfaction with dual-tracking setup

---

## Out of Scope (V1)

❌ Site scanning / DOM tagging  
❌ Live event debugging UI  
❌ Automatic sGTM deployment to GCP  
❌ Built-in A/B testing  
❌ BI dashboards  
❌ Mobile SDKs  
❌ Data warehouse connectors  

---

## Next Steps for Claude Code

```
Building Atlas - tracking architecture planner with SERVER-SIDE GTM.

Read: 
- ATLAS_DEV_BRIEF.md (complete spec with dual-tracking)
- DESIGN_SYSTEM.md (styling)

Tech: React + TypeScript + Vite + Tailwind

Phase 1 tasks:
1. Setup project
2. Layout (Sidebar + Main)
3. Dashboard
4. Phase 1: Discovery form (including server-side config)

Use dark industrial design.
Focus on dual-tracking (client + server) as core feature.
```

---

## Summary

**Atlas** solves modern web tracking problems through:

1. **Journey-based event design** - Business intent, not DOM elements
2. **Dual tracking architecture** - Client + server for 100% coverage
3. **Automatic deduplication** - Same event_id prevents double-counting
4. **Conversion orchestration** - One event → GA4 + Ads + Meta
5. **Enhanced conversions** - Meta CAPI + Google Ads EC built-in
6. **Complete dev handover** - GTM containers + server code + setup guides

**Core Innovation:** 
- Client-side captures what browsers allow
- Server-side captures what ad blockers miss
- Deduplication ensures accuracy
- Platforms get enriched, hashed data

**Result:** 20-40% improvement in conversion accuracy, better ROAS, confident marketing decisions.

---

*Specification complete and ready for development with server-side GTM fully integrated.*
