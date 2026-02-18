# Atlas TrackForge - Development Brief

## Project Overview
**Atlas** is a comprehensive toolkit for agencies to design and deploy tracking infrastructure for clients. The system provides a guided 4-phase workflow from client discovery through deployment, with automated site scanning and template libraries.

**Target Users:** Digital marketing agencies managing tracking infrastructure for multiple clients

**Tech Stack Decision Needed:**
- Frontend: React (TypeScript recommended)
- Backend: Node.js / Python (your choice)
- Database: PostgreSQL / MongoDB (your choice)
- Hosting: Vercel + Railway (or alternative)

---

## Design System

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
- **Primary Font:** Bricolage Grotesque (700 weight for headings/nav)
- **Body Font:** Inter (400/500/600 weights)
- **Code/Mono:** JetBrains Mono (for GTM containers, script tags)

### Logo
- Logo asset: `logoimage.svg` (embedded in prototype)
- Lockup: [Mark] ATLAS wordmark
- Mark size ratio: 1.25x cap height
- Gap: 0.25x cap height

### Component Patterns
- **Dark Industrial Aesthetic:** Deep navy backgrounds, teal accents, subtle borders
- **Cards:** Rounded corners (8px), subtle borders, hover states
- **Inputs:** Dark backgrounds, teal focus rings, clean placeholder text
- **Buttons:** Primary (teal gradient), Secondary (outline), Ghost (text only)
- **Icons:** Lucide React icons throughout

---

## Application Structure

### Navigation & Layout
```
┌─────────────────────────────────────────┐
│ Sidebar (248px fixed)                   │ Main Content Area
│ ├─ Logo                                 │
│ ├─ Dashboard                            │
│ ├─ Templates                            │
│ ├─ Clients                              │
│ ├─ Settings                             │
│ └─ Help                                 │
└─────────────────────────────────────────┘
```

### Four-Phase Wizard Workflow

**Phase 1: Discovery (Client Profile)**
- Input Fields:
  - Client Name (required)
  - Industry (dropdown/text)
  - Website URL (required, validated)
  - Primary Goals (checkboxes: Ecommerce, Lead Gen, Content, Branding)
  - Current Tech Stack (multi-select: Shopify, WooCommerce, WordPress, Custom, etc)
  - Notes (textarea)
- Actions: Save Draft, Continue to Phase 2

**Phase 2: Site Scan (Automated Analysis & Element Detection)**

*Objective:* Scan the website and generate a comprehensive list of all trackable elements (buttons, forms, links, etc.) that the user can review and select for tracking implementation.

**Scanning Capabilities:**

*Platform & Tech Detection:*
- Platform identification (Shopify, WordPress, WooCommerce, Custom)
- Existing tracking code (GA, GTM, Meta Pixel, LinkedIn Insight)
- Ecommerce capabilities (cart, checkout, product pages)
- CMS identification (WordPress, Contentful, etc.)

*Interactive Elements Detection:*
- **Buttons & CTAs:** All `<button>`, `<input type="submit">`, `[role="button"]`, and styled links
  - Extract: text content, CSS selector, classes, IDs, position
  - Infer purpose from text: "Add to Cart", "Buy Now", "Sign Up", etc.
  
- **Forms:** All `<form>` elements
  - Capture: form ID, input fields (names, types, labels), submit button text
  - Detect purpose: contact form, newsletter signup, checkout, lead gen
  - Extract: action URL, field validation requirements
  
- **Links:** Navigation, downloads, external links
  - Main navigation items
  - Footer links  
  - File downloads (PDFs, docs)
  - External links (social media, partners)
  - Phone/email links (tel:, mailto:)
  
- **E-commerce Specific:**
  - "Add to Cart" buttons (with associated product info)
  - "Checkout" / "Proceed to Checkout" flows
  - Product category links
  - Search functionality
  - Wishlist/Save for later buttons
  
- **Other Interactive Elements:**
  - Video players (YouTube, Vimeo embeds)
  - Accordions/Tabs
  - Modals/Popups  
  - Carousels/Sliders
  - Search bars
  - Chat widgets

**Scan Output & User Interface:**

After scanning, display categorized results:

```
┌─────────────────────────────────────────────────┐
│ Site Scan Results - clientwebsite.com           │
├─────────────────────────────────────────────────┤
│ ✓ Platform: Shopify                             │
│ ✓ 47 trackable elements found                   │
│ ✓ Existing tracking: Google Analytics (UA)      │
│                                                  │
│ HIGH PRIORITY (Auto-selected)                    │
│ ☑ Add to Cart button (12 instances)             │
│ ☑ Proceed to Checkout                           │
│ ☑ Contact Form submission                       │
│ ☑ Newsletter signup                             │
│                                                  │
│ MEDIUM PRIORITY                                  │
│ ☐ "Get Started" CTA (homepage)                  │
│ ☐ "View Product" links (24 instances)           │
│ ☐ PDF download links (3 instances)              │
│ ☐ Social share buttons (4 types)                │
│                                                  │
│ LOW PRIORITY                                     │
│ ☐ Footer navigation (12 links)                  │
│ ☐ Header navigation (8 links)                   │
│ ☐ Social media links (4 links)                  │
│                                                  │
│ [Select All] [Deselect All] [Continue] ─────────│
└─────────────────────────────────────────────────┘
```

**For Each Selected Element, Capture:**
```json
{
  "elementId": "btn_add_cart_001",
  "type": "button",
  "label": "Add to Cart",
  "selector": "#product-form button.btn-add-cart",
  "textContent": "Add to Cart",
  "instances": 12,
  "priority": "high",
  "suggestedEventName": "add_to_cart",
  "suggestedEventParams": {
    "button_text": "Add to Cart",
    "button_location": "product_page",
    "product_id": "{{Product ID}}"
  },
  "gtmTrigger": {
    "type": "click",
    "selector": "#product-form button.btn-add-cart"
  }
}
```

**User Actions:**
- Review auto-categorized elements
- Select/deselect elements to track
- Edit suggested event names (optional)
- Preview GTM trigger configuration
- Group similar elements (e.g., all "Add to Cart" buttons)
- Re-scan if needed
- Manual override for missed elements
- Continue to Phase 3 with selected elements

**Phase 3: Template Selection**
- Filter Templates by:
  - Platform (Shopify, WooCommerce, WordPress, Custom)
  - Use Case (Ecommerce, Lead Gen, Content, SaaS)
  - Channels (Google Ads, Meta, LinkedIn, etc)
- Template Cards showing:
  - Template name
  - Description
  - Platforms supported
  - Channels included
  - Tags (GA4, GTM, Enhanced Ecommerce, etc)
- Actions: Preview Template, Select Template, Customize, Continue to Phase 4

**Phase 4: Deployment (Generate & Deploy)**
- Display:
  - Selected template details
  - Customization options (GTM Container ID, GA4 Property ID, Meta Pixel ID, etc)
  - Preview of generated code
  - Deployment checklist
- Generate:
  - GTM container JSON (download)
  - Installation instructions (step-by-step)
  - Verification script
  - Documentation
- Actions: Download Assets, Copy Code, Mark as Complete, Deploy to Client

---

## Key Features to Build

### 0. Site Scan Element Selection Interface (Phase 2 Enhancement)

**Purpose:** Allow users to review and select which elements should be tracked

**Component Structure:**
```jsx
<ScanResults>
  <ScanSummary>
    <PlatformDetected />
    <ExistingTracking />
    <ElementCount />
  </ScanSummary>
  
  <ElementCategories>
    <CategorySection priority="high" autoSelected={true}>
      <ElementCard 
        type="button"
        text="Add to Cart"
        instances={12}
        selected={true}
        eventName="add_to_cart"
        editable={true}
      />
    </CategorySection>
    
    <CategorySection priority="medium">
      <ElementCard />
    </CategorySection>
    
    <CategorySection priority="low">
      <ElementCard />
    </CategorySection>
  </ElementCategories>
  
  <ActionBar>
    <Button>Select All</Button>
    <Button>Deselect All</Button>
    <Button>Re-scan</Button>
    <Button primary>Continue to Templates</Button>
  </ActionBar>
</ScanResults>
```

**Element Card Details:**
```jsx
// Each element card shows:
┌─────────────────────────────────────────────┐
│ ☑ Add to Cart Button                12x     │
│                                             │
│ Type: Button                                │
│ Event: add_to_cart          [Edit]         │
│ Selector: #product-form .btn-add-cart      │
│                                             │
│ Found on: Product pages                    │
│ Priority: HIGH                              │
│                                             │
│ [Preview GTM Trigger] [Advanced Settings]  │
└─────────────────────────────────────────────┘
```

**Interactions:**
- **Checkbox:** Select/deselect element for tracking
- **Edit Icon:** Open modal to customize event name and parameters
- **Preview GTM Trigger:** Show what GTM trigger will be generated
- **Advanced Settings:** Configure additional event parameters, conditions

**Bulk Actions:**
- Select all in category
- Deselect all in category  
- Apply event naming pattern to similar elements
- Group similar elements (e.g., all "View Product" links)

**Preview Modal:**
```jsx
<PreviewModal>
  <h3>GTM Trigger Preview</h3>
  <CodeBlock language="json">
    {
      "name": "Click - Add to Cart",
      "type": "CLICK",
      "filter": [{
        "type": "MATCHES_CSS_SELECTOR",
        "parameter": [{
          "key": "selector",
          "value": "#product-form button.btn-add-cart"
        }]
      }]
    }
  </CodeBlock>
  
  <h3>GA4 Event Configuration</h3>
  <CodeBlock language="json">
    {
      "eventName": "add_to_cart",
      "eventParameters": {
        "button_text": "Add to Cart",
        "button_location": "product_page"
      }
    }
  </CodeBlock>
</PreviewModal>
```

**Data Model:**
```typescript
interface ScannedElement {
  id: string;
  type: 'button' | 'form' | 'link' | 'video';
  text: string;
  selector: string;
  instances: number;
  priority: 'high' | 'medium' | 'low';
  suggestedEventName: string;
  eventParams?: Record<string, string>;
  selected: boolean;
  customizations?: {
    eventName?: string;
    eventParams?: Record<string, string>;
    conditions?: any[];
  };
}

interface ScanResults {
  platform: string;
  existingTracking: TrackingDetection[];
  elements: {
    highPriority: ScannedElement[];
    mediumPriority: ScannedElement[];
    lowPriority: ScannedElement[];
  };
  selectedCount: number;
  totalCount: number;
}
```

**User Flow:**
1. Scan completes → Results categorized by priority
2. High priority items auto-selected
3. User reviews each category
4. User can:
   - Check/uncheck elements
   - Edit event names
   - Preview GTM configuration
   - Add custom parameters
   - Group similar elements
5. Click "Continue" → Selected elements passed to Phase 3
6. Template in Phase 3 includes base configuration + selected element tracking

---

### 1. Dashboard (Home View)
```
Components:
- Stats Cards (Total Clients, Active Projects, Templates Used, Avg Deploy Time)
- Recent Activity Feed (last 10 actions)
- Quick Actions (New Client, Browse Templates, View All Clients)
- Active Projects Table (Client, Phase, Last Updated, Actions)
```

### 2. Templates Library
```
Components:
- Search/Filter Bar
- Template Grid/List View
- Template Detail Modal
- Template Editor (for custom templates)

Data Model:
{
  id: string
  name: string
  description: string
  platform: string[]  // ['shopify', 'woocommerce', etc]
  useCase: string[]   // ['ecommerce', 'leadgen', etc]
  channels: string[]  // ['google-ads', 'meta', etc]
  tags: string[]
  gtmJson: object     // GTM container configuration
  instructions: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3. Clients List & Management
```
Components:
- Client Cards/Table with search/filter
- Client Detail View
- Project History per Client
- Notes/Communication Log

Data Model:
{
  id: string
  name: string
  industry: string
  website: string
  goals: string[]
  techStack: string[]
  projects: Project[]
  notes: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 4. Project Workflow (4-Phase Wizard)
```
Data Model:
{
  id: string
  clientId: string
  currentPhase: 1 | 2 | 3 | 4
  status: 'draft' | 'in-progress' | 'deployed' | 'archived'
  
  // Phase 1 data
  discovery: {
    clientName: string
    industry: string
    website: string
    goals: string[]
    techStack: string[]
    notes: string
  }
  
  // Phase 2 data
  siteScan: {
    scanDate: timestamp
    platform: string
    existingTracking: {
      type: string        // 'Google Analytics (UA)', 'GA4', 'GTM', 'Meta Pixel', etc
      found: boolean
      details?: object    // Container ID, Property ID, etc
    }[]
    elements: {
      highPriority: ScannedElement[]
      mediumPriority: ScannedElement[]
      lowPriority: ScannedElement[]
    }
    selectedElements: string[]  // Array of element IDs that user selected
    customizations: {
      [elementId: string]: {
        eventName?: string
        eventParams?: Record<string, string>
        conditions?: any[]
      }
    }
  }
  
  // Phase 3 data
  templateSelection: {
    templateId: string
    templateName: string
    customizations: object
  }
  
  // Phase 4 data
  deployment: {
    gtmContainerId: string
    ga4PropertyId: string
    metaPixelId?: string
    linkedInPartnerId?: string
    generatedAssets: {
      containerJson: string      // S3/storage URL
      installGuide: string       // S3/storage URL
      verificationScript: string // S3/storage URL
      testingChecklist: string   // S3/storage URL
    }
    deployedAt?: timestamp
    verificationStatus: 'pending' | 'verified' | 'failed'
    verificationResults?: object
  }
  
  createdAt: timestamp
  updatedAt: timestamp
}

// ScannedElement type (referenced above)
{
  id: string
  type: 'button' | 'form' | 'link' | 'video'
  text: string
  selector: string
  instances: number
  priority: 'high' | 'medium' | 'low'
  suggestedEventName: string
  eventParams?: Record<string, string>
  selected: boolean
}
```

---

## Technical Requirements

### Authentication
- User login/signup (email + password)
- Session management
- Role-based access (if multi-user agencies)

### Site Scanning (Phase 2)

**Recommended Approach: Server-side headless browser (Puppeteer/Playwright)**

**Pros:**
- Can execute JavaScript and detect dynamically loaded content
- Access to full DOM after page load
- Can interact with site (scroll, click) to reveal hidden elements
- Can handle SPAs (Single Page Applications)
- More accurate tracking detection

**Cons:**
- More resource intensive
- Slower scan times
- Requires backend infrastructure

**Implementation Strategy:**

```javascript
// Scan service pseudocode
const scanWebsite = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  // 1. Detect Platform
  const platform = await detectPlatform(page);
  
  // 2. Detect Existing Tracking
  const existingTracking = await detectTracking(page);
  
  // 3. Extract All Interactive Elements
  const elements = await extractElements(page);
  
  // 4. Categorize Elements by Priority
  const categorized = categorizeElements(elements);
  
  await browser.close();
  
  return {
    platform,
    existingTracking,
    elements: categorized,
    scanDate: new Date()
  };
};

// Platform Detection
const detectPlatform = async (page) => {
  return await page.evaluate(() => {
    // Check meta tags
    const generator = document.querySelector('meta[name="generator"]');
    if (generator) {
      const content = generator.getAttribute('content').toLowerCase();
      if (content.includes('shopify')) return 'shopify';
      if (content.includes('wordpress')) return 'wordpress';
      if (content.includes('woocommerce')) return 'woocommerce';
    }
    
    // Check script sources
    const scripts = Array.from(document.scripts).map(s => s.src);
    if (scripts.some(s => s.includes('shopify.com'))) return 'shopify';
    if (scripts.some(s => s.includes('wp-includes'))) return 'wordpress';
    
    // Check DOM patterns
    if (document.querySelector('[data-shopify]')) return 'shopify';
    if (document.querySelector('.woocommerce')) return 'woocommerce';
    
    return 'custom';
  });
};

// Tracking Detection
const detectTracking = async (page) => {
  return await page.evaluate(() => {
    const tracking = [];
    
    // Google Analytics (UA)
    if (window.ga || window._gaq) {
      tracking.push({ type: 'Google Analytics (UA)', found: true });
    }
    
    // Google Analytics 4
    const ga4Scripts = Array.from(document.scripts)
      .filter(s => s.src.includes('gtag/js') || s.src.includes('googletagmanager.com/gtag'));
    if (ga4Scripts.length > 0 || window.gtag) {
      tracking.push({ type: 'Google Analytics 4 (GA4)', found: true });
    }
    
    // Google Tag Manager
    const gtmScripts = Array.from(document.scripts)
      .filter(s => s.src.includes('googletagmanager.com/gtm.js'));
    if (gtmScripts.length > 0 || window.google_tag_manager) {
      const containerId = gtmScripts[0]?.src.match(/id=(GTM-[A-Z0-9]+)/)?.[1];
      tracking.push({ 
        type: 'Google Tag Manager', 
        found: true, 
        containerId 
      });
    }
    
    // Meta Pixel
    if (window.fbq || document.querySelector('script[src*="connect.facebook.net"]')) {
      tracking.push({ type: 'Meta Pixel', found: true });
    }
    
    // LinkedIn Insight Tag
    if (window._linkedin_data_partner_ids) {
      tracking.push({ type: 'LinkedIn Insight Tag', found: true });
    }
    
    return tracking;
  });
};

// Extract Interactive Elements
const extractElements = async (page) => {
  return await page.evaluate(() => {
    const elements = [];
    
    // Helper: Generate unique CSS selector for element
    const generateSelector = (el) => {
      if (el.id) return `#${el.id}`;
      
      let path = [];
      while (el.parentElement) {
        let selector = el.tagName.toLowerCase();
        if (el.className) {
          const classes = el.className.split(' ').filter(c => c).slice(0, 2);
          selector += '.' + classes.join('.');
        }
        path.unshift(selector);
        el = el.parentElement;
        if (path.length > 3) break; // Keep selectors reasonable
      }
      return path.join(' > ');
    };
    
    // Helper: Infer event name from button text
    const inferEventName = (text) => {
      const lower = text.toLowerCase().trim();
      if (lower.includes('add to cart') || lower.includes('add cart')) return 'add_to_cart';
      if (lower.includes('checkout') || lower.includes('check out')) return 'begin_checkout';
      if (lower.includes('buy now') || lower.includes('purchase')) return 'purchase_intent';
      if (lower.includes('sign up') || lower.includes('signup')) return 'sign_up';
      if (lower.includes('subscribe')) return 'subscribe';
      if (lower.includes('download')) return 'file_download';
      if (lower.includes('contact') || lower.includes('get in touch')) return 'contact_click';
      if (lower.includes('learn more')) return 'cta_learn_more';
      return 'button_click';
    };
    
    // 1. Extract Buttons
    const buttons = document.querySelectorAll(
      'button, input[type="submit"], input[type="button"], [role="button"], a.btn, a.button, a[class*="btn"]'
    );
    
    buttons.forEach((btn, index) => {
      const text = btn.innerText.trim() || btn.value || btn.getAttribute('aria-label') || '';
      if (!text) return; // Skip empty buttons
      
      elements.push({
        type: 'button',
        id: `btn_${index}`,
        text: text,
        selector: generateSelector(btn),
        classes: btn.className,
        elementId: btn.id,
        suggestedEventName: inferEventName(text),
        position: {
          x: btn.getBoundingClientRect().x,
          y: btn.getBoundingClientRect().y
        }
      });
    });
    
    // 2. Extract Forms
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form, index) => {
      const fields = Array.from(form.elements)
        .filter(el => el.name)
        .map(el => ({
          name: el.name,
          type: el.type,
          label: el.labels?.[0]?.innerText || el.placeholder || el.name
        }));
      
      const submitBtn = form.querySelector('[type="submit"]');
      const submitText = submitBtn?.innerText || submitBtn?.value || '';
      
      // Infer form purpose
      let purpose = 'generic';
      const formText = form.innerText.toLowerCase();
      if (formText.includes('contact') || fields.some(f => f.name.includes('message'))) {
        purpose = 'contact';
      } else if (formText.includes('newsletter') || formText.includes('subscribe')) {
        purpose = 'newsletter';
      } else if (formText.includes('checkout') || formText.includes('billing')) {
        purpose = 'checkout';
      } else if (fields.some(f => f.type === 'email') && fields.length <= 3) {
        purpose = 'newsletter';
      }
      
      elements.push({
        type: 'form',
        id: `form_${index}`,
        formId: form.id,
        fields: fields,
        submitText: submitText,
        action: form.action,
        method: form.method,
        purpose: purpose,
        suggestedEventName: `${purpose}_form_submit`,
        selector: generateSelector(form)
      });
    });
    
    // 3. Extract Important Links
    const links = document.querySelectorAll('a[href]');
    
    links.forEach((link, index) => {
      const href = link.getAttribute('href');
      const text = link.innerText.trim();
      
      if (!text || !href) return;
      
      // Categorize link
      let category = 'navigation';
      if (href.startsWith('tel:')) category = 'phone';
      else if (href.startsWith('mailto:')) category = 'email';
      else if (href.match(/\.(pdf|doc|docx|zip|xls|xlsx)$/i)) category = 'download';
      else if (href.includes('facebook.com') || href.includes('twitter.com') || 
               href.includes('linkedin.com') || href.includes('instagram.com')) {
        category = 'social';
      }
      
      // Only track certain types
      if (['phone', 'email', 'download', 'social'].includes(category)) {
        elements.push({
          type: 'link',
          id: `link_${index}`,
          text: text,
          href: href,
          category: category,
          selector: generateSelector(link),
          suggestedEventName: category === 'download' ? 'file_download' : `${category}_click`
        });
      }
    });
    
    // 4. Extract Video Players
    const videos = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="vimeo.com"], video');
    
    videos.forEach((video, index) => {
      elements.push({
        type: 'video',
        id: `video_${index}`,
        src: video.src || video.querySelector('source')?.src || '',
        selector: generateSelector(video),
        suggestedEventName: 'video_play'
      });
    });
    
    return elements;
  });
};

// Categorize Elements by Priority
const categorizeElements = (elements) => {
  const highPriority = [];
  const mediumPriority = [];
  const lowPriority = [];
  
  elements.forEach(el => {
    // High priority: conversion actions
    if (el.suggestedEventName === 'add_to_cart' ||
        el.suggestedEventName === 'begin_checkout' ||
        el.suggestedEventName === 'purchase_intent' ||
        el.purpose === 'checkout' ||
        el.purpose === 'contact') {
      highPriority.push(el);
    }
    // Medium priority: engagement actions
    else if (el.suggestedEventName === 'sign_up' ||
             el.suggestedEventName === 'subscribe' ||
             el.purpose === 'newsletter' ||
             el.suggestedEventName === 'file_download' ||
             el.type === 'video') {
      mediumPriority.push(el);
    }
    // Low priority: navigation & social
    else {
      lowPriority.push(el);
    }
  });
  
  // Group similar elements (e.g., multiple "Add to Cart" buttons)
  const groupSimilar = (items) => {
    const grouped = {};
    items.forEach(item => {
      const key = `${item.type}_${item.suggestedEventName}`;
      if (!grouped[key]) {
        grouped[key] = { ...item, instances: 1, selectors: [item.selector] };
      } else {
        grouped[key].instances++;
        grouped[key].selectors.push(item.selector);
      }
    });
    return Object.values(grouped);
  };
  
  return {
    highPriority: groupSimilar(highPriority),
    mediumPriority: groupSimilar(mediumPriority),
    lowPriority: groupSimilar(lowPriority)
  };
};
```

**Data Storage:**
```javascript
// Store scan results in project record
{
  siteScan: {
    url: 'https://clientwebsite.com',
    scanDate: '2026-02-17T19:30:00Z',
    platform: 'shopify',
    existingTracking: [
      { type: 'Google Analytics (UA)', found: true },
      { type: 'Meta Pixel', found: true }
    ],
    elements: {
      highPriority: [
        {
          type: 'button',
          text: 'Add to Cart',
          selector: '#product-form button.btn-add-cart',
          suggestedEventName: 'add_to_cart',
          instances: 12,
          selected: true // Auto-selected
        }
      ],
      mediumPriority: [...],
      lowPriority: [...]
    },
    selectedElements: ['btn_0', 'btn_3', 'form_0'] // IDs of user-selected elements
  }
}
```

**Scan Performance Optimization:**
- Cache scan results for 24 hours
- Implement scan queue for multiple simultaneous scans
- Set timeout limits (30 seconds per page)
- Rate limiting to prevent abuse
- Option for "quick scan" (homepage only) vs "deep scan" (multiple pages)

### Template System
- Templates stored as JSON (GTM container export format)
- Variable substitution for client-specific values
- Version control for templates
- Clone/edit/save as new template

### Code Generation (Phase 4)

**Input:** Selected elements from Phase 2 + Template from Phase 3 + Client-specific IDs

**Output Generation Process:**

```javascript
// Generate GTM container from selected elements
const generateGTMContainer = (selectedElements, template, clientConfig) => {
  const container = {
    exportFormatVersion: 2,
    exportTime: new Date().toISOString(),
    containerVersion: {
      name: `${clientConfig.clientName} - Atlas Generated`,
      container: {
        name: clientConfig.clientName,
        publicId: clientConfig.gtmContainerId || 'GTM-XXXXXXX'
      },
      tag: [],
      trigger: [],
      variable: []
    }
  };
  
  // Add base template tags/triggers/variables
  container.containerVersion.tag.push(...template.tags);
  container.containerVersion.trigger.push(...template.triggers);
  container.containerVersion.variable.push(...template.variables);
  
  // Generate tags and triggers for each selected element
  selectedElements.forEach((element, index) => {
    // Create trigger for this element
    const trigger = {
      accountId: clientConfig.accountId,
      containerId: clientConfig.gtmContainerId,
      triggerId: `trigger_${element.id}`,
      name: `Click - ${element.text}`,
      type: element.type === 'form' ? 'FORM_SUBMISSION' : 'CLICK',
      filter: []
    };
    
    if (element.type === 'button' || element.type === 'link') {
      // Click trigger with CSS selector
      trigger.filter.push({
        type: 'MATCHES_CSS_SELECTOR',
        parameter: [{
          type: 'TEMPLATE',
          key: 'selector',
          value: element.selector
        }]
      });
    } else if (element.type === 'form') {
      // Form submission trigger
      trigger.filter.push({
        type: 'EQUALS',
        parameter: [
          { type: 'TEMPLATE', key: 'arg0', value: '{{Form ID}}' },
          { type: 'TEMPLATE', key: 'arg1', value: element.formId }
        ]
      });
    }
    
    container.containerVersion.trigger.push(trigger);
    
    // Create GA4 event tag for this element
    const tag = {
      accountId: clientConfig.accountId,
      containerId: clientConfig.gtmContainerId,
      tagId: `tag_${element.id}`,
      name: `GA4 - ${element.suggestedEventName}`,
      type: 'gaawe', // GA4 Event tag
      parameter: [
        {
          type: 'TEMPLATE',
          key: 'eventName',
          value: element.suggestedEventName
        },
        {
          type: 'LIST',
          key: 'eventParameters',
          list: [
            {
              type: 'MAP',
              map: [
                { type: 'TEMPLATE', key: 'name', value: 'button_text' },
                { type: 'TEMPLATE', key: 'value', value: element.text }
              ]
            },
            {
              type: 'MAP',
              map: [
                { type: 'TEMPLATE', key: 'name', value: 'element_selector' },
                { type: 'TEMPLATE', key: 'value', value: element.selector }
              ]
            }
          ]
        },
        {
          type: 'TEMPLATE',
          key: 'measurementId',
          value: clientConfig.ga4PropertyId || '{{GA4 Measurement ID}}'
        }
      ],
      firingTriggerId: [`trigger_${element.id}`]
    };
    
    container.containerVersion.tag.push(tag);
  });
  
  return container;
};
```

**Generated Outputs:**

1. **GTM Container JSON** (ready to import)
   - Full container configuration
   - All tags, triggers, and variables
   - Client-specific measurement IDs
   - Download as `${clientName}_GTM_Container.json`

2. **Installation Instructions** (Markdown/HTML)
   ```markdown
   # Atlas Tracking Setup - [Client Name]
   
   ## Step 1: Import GTM Container
   1. Log into Google Tag Manager
   2. Select your container (GTM-XXXXXXX)
   3. Go to Admin > Import Container
   4. Upload `ClientName_GTM_Container.json`
   5. Choose "Merge" and "Rename conflicting tags"
   6. Click Confirm
   
   ## Step 2: Configure Measurement IDs
   1. Go to Variables
   2. Update "GA4 Measurement ID" with your GA4 property ID
   3. Update "Meta Pixel ID" if applicable
   
   ## Step 3: Preview & Test
   1. Click "Preview" in GTM
   2. Visit your website
   3. Test each tracked element:
      ✓ Add to Cart button
      ✓ Checkout button
      ✓ Contact form submission
   4. Verify events appear in GA4 DebugView
   
   ## Step 4: Publish
   1. Click "Submit" in GTM
   2. Add version name: "Atlas Tracking Setup"
   3. Publish the container
   
   ## Tracked Elements
   - [Button] Add to Cart (12 instances) → Event: add_to_cart
   - [Button] Proceed to Checkout → Event: begin_checkout
   - [Form] Contact Form → Event: contact_form_submit
   - [Form] Newsletter Signup → Event: subscribe
   
   ## Verification
   Run this script in browser console to verify:
   ```javascript
   // Check GTM is loaded
   console.log('GTM Container:', window.google_tag_manager);
   
   // Check dataLayer
   console.log('dataLayer:', window.dataLayer);
   ```
   ```

3. **Verification Script** (JavaScript)
   ```javascript
   // Atlas Tracking Verification Script
   const verifyTracking = () => {
     const results = {
       gtmLoaded: false,
       ga4Loaded: false,
       elementsCovered: [],
       issues: []
     };
     
     // Check GTM
     if (window.google_tag_manager) {
       results.gtmLoaded = true;
     } else {
       results.issues.push('GTM not detected');
     }
     
     // Check GA4
     if (window.gtag || window.dataLayer?.some(e => e.event === 'gtm.js')) {
       results.ga4Loaded = true;
     } else {
       results.issues.push('GA4 not detected');
     }
     
     // Check if tracked elements exist on page
     const trackedSelectors = [
       '#product-form button.btn-add-cart',
       'form#contact-form',
       // ... all selected selectors
     ];
     
     trackedSelectors.forEach(selector => {
       const element = document.querySelector(selector);
       if (element) {
         results.elementsCovered.push(selector);
       } else {
         results.issues.push(`Element not found: ${selector}`);
       }
     });
     
     console.table(results);
     return results;
   };
   
   verifyTracking();
   ```

4. **Testing Checklist** (Markdown)
   ```markdown
   ## Testing Checklist
   
   ### Pre-Launch
   - [ ] GTM container imported successfully
   - [ ] All measurement IDs configured
   - [ ] GTM Preview mode activated
   - [ ] DebugView enabled in GA4
   
   ### Element Testing
   - [ ] Add to Cart button fires add_to_cart event
   - [ ] Checkout button fires begin_checkout event
   - [ ] Contact form fires contact_form_submit event
   - [ ] Newsletter signup fires subscribe event
   - [ ] All events visible in GA4 DebugView
   
   ### Data Validation
   - [ ] Event parameters populated correctly
   - [ ] User properties set (if applicable)
   - [ ] Ecommerce data structured properly
   - [ ] No duplicate events firing
   
   ### Cross-Browser Testing
   - [ ] Chrome
   - [ ] Safari
   - [ ] Firefox
   - [ ] Mobile Safari (iOS)
   - [ ] Chrome Mobile (Android)
   
   ### Performance
   - [ ] Page load time not impacted
   - [ ] No console errors
   - [ ] GTM loads asynchronously
   ```

5. **Documentation Package** (PDF/HTML)
   - Complete setup guide with screenshots
   - Event naming reference
   - Troubleshooting guide
   - Contact info for support

**File Delivery:**
```
ClientName_Tracking_Package/
├── GTM_Container.json
├── Installation_Guide.md
├── Installation_Guide.pdf
├── Verification_Script.js
├── Testing_Checklist.md
└── Event_Reference.csv
```

**Variable Substitution:**
Replace placeholders in template with actual values:
- `{{GA4 Measurement ID}}` → `G-XXXXXXXXXX`
- `{{GTM Container ID}}` → `GTM-XXXXXXX`
- `{{Meta Pixel ID}}` → `123456789012345`
- `{{Client Name}}` → Actual client name
- `{{Website URL}}` → Client website URL

---

## Development Phases

### MVP (Phase 1)
- [ ] Authentication system
- [ ] Dashboard with basic stats
- [ ] Client CRUD operations
- [ ] Templates library (read-only, pre-built templates)
- [ ] 4-phase wizard (simplified, manual site scan)
- [ ] Basic GTM container generation

### Phase 2 (Enhanced)
- [ ] Automated site scanning with Puppeteer
- [ ] Template editor (create/edit custom templates)
- [ ] Multi-user agency accounts
- [ ] Export reports (PDF deployment guides)
- [ ] Client portal (view-only access for clients)

### Phase 3 (Advanced)
- [ ] API integrations (GTM API for auto-deploy)
- [ ] Webhook listeners for deployment verification
- [ ] Analytics dashboard (track deployed containers)
- [ ] Template marketplace (share/sell templates)
- [ ] AI-powered recommendations

---

## File Structure Suggestion

```
atlas-trackforge/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── wizard/
│   │   │   │   ├── Phase1Discovery.tsx
│   │   │   │   ├── Phase2SiteScan.tsx
│   │   │   │   ├── Phase3Template.tsx
│   │   │   │   └── Phase4Deploy.tsx
│   │   │   ├── clients/
│   │   │   │   ├── ClientList.tsx
│   │   │   │   ├── ClientCard.tsx
│   │   │   │   └── ClientDetail.tsx
│   │   │   └── templates/
│   │   │       ├── TemplateGrid.tsx
│   │   │       ├── TemplateCard.tsx
│   │   │       └── TemplateDetail.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Templates.tsx
│   │   │   ├── Clients.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Wizard.tsx
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── theme.css
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   │   └── logo.svg
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── siteScanService.ts
│   │   │   ├── templateService.ts
│   │   │   └── gtmGeneratorService.ts
│   │   └── server.ts
│   └── package.json
├── database/
│   ├── migrations/
│   └── seeds/
└── README.md
```

---

## Assets Provided

1. **Design Prototype:** `atlas-final.jsx` - Full React prototype with all screens
2. **Logo Asset:** `logoimage.svg` - Embedded in prototype
3. **This Brief:** Complete specification document

---

## Next Steps for Claude Code

### To start building:

```bash
# In your project directory
claude-code

# Then tell Claude Code:
"Build Atlas TrackForge according to the ATLAS_DEV_BRIEF.md specification. 
Start with:
1. Set up a React + TypeScript frontend with Vite
2. Create the layout with Sidebar and main content area
3. Implement the design system (colors, fonts, components)
4. Build the Dashboard page first
5. Use the design from atlas-final.jsx as reference

Tech stack:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- State: React Context or Zustand
- Routing: React Router
- Forms: React Hook Form + Zod validation
- Icons: Lucide React

Start with authentication system and basic layout."
```

### Questions to Answer Before Starting:

1. **Database:** PostgreSQL or MongoDB? (I recommend PostgreSQL)
2. **Backend:** Express.js, Fastify, or Python Flask/FastAPI?
3. **Deployment:** Vercel + Railway, or alternative?
4. **Auth:** Build custom or use Clerk/Auth0/Supabase Auth?
5. **GTM Container Generation:** Will you use Google Tag Manager API or generate JSON files?

---

## Site Scanning Approach: Benefits & Capabilities

### Why Element Detection vs. Visual Selection?

**Element Detection Approach (Recommended):**
✅ **Scalable:** Can scan entire site automatically  
✅ **Educational:** Shows users what should be tracked  
✅ **Bulk Actions:** Select all "Add to Cart" buttons at once  
✅ **Simpler Implementation:** No iframe/cross-origin issues  
✅ **Smart Defaults:** Auto-select high-priority conversion actions  
✅ **Exportable:** Generate direct GTM configuration  
✅ **Reusable:** Save scan results for future reference  
✅ **Multi-page:** Can scan multiple pages sequentially  

**Visual Selection (Not Recommended):**
❌ **Complex:** Requires iframe rendering, cross-origin handling  
❌ **Manual:** User must click every element individually  
❌ **Tedious:** No bulk selection of similar elements  
❌ **Limited:** Only works for pages user can access  
❌ **Security:** CORS issues with many websites  
❌ **Maintenance:** Fragile, breaks with site changes  

### Advanced Capabilities

**Multi-Page Scanning:**
```javascript
// Scan key pages in sequence
const pages = [
  '/products/category',
  '/products/product-detail',
  '/checkout',
  '/contact'
];

const fullScan = await scanMultiplePages(baseUrl, pages);
// Combines results from all pages
```

**Deep Product Analysis (E-commerce):**
```javascript
// For Shopify/WooCommerce sites
- Detect product JSON-LD schema
- Extract product IDs, prices, categories
- Map product data to dataLayer structure
- Generate enhanced ecommerce tracking
```

**Form Field Analysis:**
```javascript
// Intelligent form detection
- Identify PII fields (email, phone, name)
- Auto-configure PII scrubbing
- Detect multi-step forms
- Track form abandonment points
```

**Competitive Analysis:**
```javascript
// Compare tracking implementations
- Show what competitors are tracking
- Identify gaps in current setup
- Benchmark against industry standards
```

### Sample Scan Output

**Real-world Example: E-commerce Site**
```
Platform: Shopify
Existing Tracking: GA4, Meta Pixel
47 Trackable Elements Found

HIGH PRIORITY (8 elements):
✓ Add to Cart (12 instances) → add_to_cart
✓ Proceed to Checkout → begin_checkout  
✓ Complete Purchase → purchase
✓ Newsletter Signup Form → subscribe
✓ Product Quick View → view_item
✓ Wishlist Button → add_to_wishlist
✓ Contact Form → contact_form_submit
✓ Size/Color Selector → select_item_variant

MEDIUM PRIORITY (15 elements):
○ "Learn More" CTA (homepage)
○ Product Category Links (24 instances)
○ Search Bar
○ Product Image Zoom
○ Size Guide Modal
○ Share Product buttons
...

LOW PRIORITY (24 elements):
○ Header Navigation (8 links)
○ Footer Links (12 links)
○ Social Media Links (4 links)
...

Recommendations:
→ Enable Enhanced Ecommerce for product tracking
→ Set up purchase funnel: view_item → add_to_cart → begin_checkout → purchase
→ Configure PII scrubbing for form submissions
→ Add server-side tracking for checkout (optional)
```

---

## Reference Materials

- **GTM Container Format:** https://developers.google.com/tag-platform/tag-manager/api/v2
- **GA4 Setup Guide:** https://developers.google.com/analytics/devguides/collection/ga4
- **Meta Pixel Documentation:** https://developers.facebook.com/docs/meta-pixel
- **Shopify Script Tag API:** https://shopify.dev/api/admin-rest/current/resources/scripttag

---

*This brief compiled from design prototype session on 2026-02-17*
*Ready for handoff to Claude Code for implementation*
