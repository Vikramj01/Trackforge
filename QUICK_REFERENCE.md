# Quick Reference Card

## 🚀 Getting Started (Copy-Paste)

### First Time Setup

```bash
# Clone repository
git clone https://github.com/Vikramj01/Trackforge.git
cd Trackforge

# Start Claude Code
claude-code
```

### Initial Prompt for Claude Code

```
Building Atlas - a tracking architecture planner with dual-tracking (client + server).

CRITICAL: Read these files FIRST (in order):
1. MIGRATION_NOTICE.md (product approach - READ THIS!)
2. CLAUDE_CODE_START.md (development instructions)
3. docs/ATLAS_DEV_BRIEF.md (complete specification)
4. docs/DESIGN_SYSTEM.md (exact styling)

Atlas generates:
- Client-side GTM container
- Server-side GTM container (NEW - core feature)
- Server endpoint code (Node.js/Python)
- Meta CAPI + Enhanced Conversions setup

The key innovation: One canonical event → orchestrated signals to client-side 
AND server-side, with automatic deduplication via event_id.

This solves the 20-40% conversion loss problem in SPAs and headless ecommerce.

Tech: React + TypeScript + Vite + Tailwind CSS

Current task: Build Phase 1 Discovery form

Phase 1 now includes server-side tracking configuration:
- Enable server-side? (Yes/No)
- Deployment method (Self-hosted, Atlas-hosted, GCP)
- Server endpoint URL (if self-hosted)

Let's start with:
1. Project setup (Vite + React + TypeScript)
2. Configure Tailwind with design system colors
3. Create Layout with Sidebar (248px fixed width, dark nav)
4. Build Dashboard page (basic with empty state)
5. Build Phase 1 Discovery form (includes server-side config)

Use dark industrial design:
- Deep navy (#080B12) backgrounds
- Atlas teal (#0BBFAA) for primary actions
- Subtle borders, professional aesthetic

Have you read MIGRATION_NOTICE.md? Let's start with project initialization.
```

---

## 📋 Common Commands

### Project Setup
```bash
# Initialize frontend
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install dependencies
npm install zustand react-hook-form zod @hookform/resolvers lucide-react react-router-dom
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Git Workflow
```bash
# After completing a feature
git add .
git commit -m "Completed [feature name]"
git push origin main
```

---

## 🎯 Phase Checklist

### Phase 1: Discovery Form
- [ ] Client Name (text, required)
- [ ] Industry (dropdown)
- [ ] Website URL (text, validated)
- [ ] Property Type (radio: SPA, Headless, CMS, Web App)
- [ ] Business Model (dropdown)
- [ ] Primary Objective (dropdown)
- [ ] Current Tech Stack (multi-select)
- [ ] **Enable Server-Side Tracking? (checkbox)**
- [ ] **Server Deployment Method (dropdown if enabled)**
- [ ] **Server Endpoint URL (text if self-hosted)**
- [ ] Notes (textarea)
- [ ] Form validation (React Hook Form + Zod)
- [ ] "Save Draft" button
- [ ] "Continue to Phase 2" button (teal gradient)

---

## 🎨 Design System Quick Reference

### Colors (CSS Variables)
```css
--deep-navy: #080B12      /* Background */
--atlas-teal: #0BBFAA      /* Primary accent */
--text-primary: #E8ECF2    /* Main text */
--text-muted: #7A8599      /* Secondary text */
--border-color: #1A1E28    /* Borders */
--card-bg: #0D1117         /* Card backgrounds */
--input-bg: #12161E        /* Form inputs */
```

### Tailwind Classes (Common Patterns)
```css
/* Card */
bg-card-bg border border-border rounded-lg p-6

/* Primary Button */
bg-gradient-to-r from-[#14DFC8] via-atlas-teal to-[#085A50] text-deep-navy font-semibold rounded-lg px-6 py-3

/* Secondary Button */
border border-border rounded-lg px-6 py-3 hover:bg-input-bg

/* Input Field */
bg-input-bg border border-border rounded-lg px-4 py-3 focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/20
```

---

## 📖 Key Files to Reference

| File | Purpose | When to Read |
|------|---------|--------------|
| MIGRATION_NOTICE.md | Product approach, why dual-tracking | START HERE |
| CLAUDE_CODE_START.md | Development instructions | Before coding |
| docs/ATLAS_DEV_BRIEF.md | Complete specification | Reference throughout |
| docs/DESIGN_SYSTEM.md | Exact colors, fonts, components | When styling |
| docs/ATLAS_TRANSFORMATION_SUMMARY.md | Product vision | For context |

---

## 🔑 Key Concepts

### Dual-Tracking
- **Client-side:** Browser → GTM → GA4, Meta Pixel (gets blocked 20-40%)
- **Server-side:** Server → sGTM → GA4 MP, Meta CAPI, Ads (100% coverage)
- **Deduplication:** Same event_id prevents double-counting

### Journey-Based (Not Site Scanning)
- Define business funnels: Checkout, Signup, Lead Gen
- Template-based event creation
- Canonical event schema (e.g., `purchase`, `add_to_cart`)

### Conversion Orchestration
- One event → Multiple platform signals
- Automatic mapping (e.g., `purchase` → GA4 purchase, Meta Purchase, Ads Enhanced)
- Consistent signals across all platforms

---

## ⚠️ Common Pitfalls

### ❌ DON'T
- Build site scanning features (out of scope)
- Skip server-side tracking config in Phase 1
- Use bright colors or white backgrounds
- Build Phase 2/3/4 before Phase 1 is complete
- Deviate from design system colors

### ✅ DO
- Read MIGRATION_NOTICE.md first
- Focus on dual-tracking as core feature
- Use exact hex codes from design system
- Build incrementally (layout → dashboard → form)
- Reference docs frequently
- Commit after each feature

---

## 💬 Example Questions for Claude Code

**Good questions:**
- "What fields does Phase 1 Discovery need? Check docs/ATLAS_DEV_BRIEF.md"
- "What's the exact hex code for atlas-teal? Check docs/DESIGN_SYSTEM.md"
- "Should server-side tracking be enabled by default in Phase 1?"
- "What validation rules apply to the Website URL field?"

**Less helpful questions:**
- "Build the entire app" (too broad)
- "Make it look nice" (vague, use design system)
- "Add all the features" (build incrementally)

---

## 🎯 Definition of Done (Phase 1)

Ready to move to Phase 2 when:
- [ ] Vite + React + TypeScript running
- [ ] Tailwind configured with design system
- [ ] Layout with Sidebar works
- [ ] Dashboard page shows
- [ ] Phase 1 form has all fields (including server-side config)
- [ ] Form validation works
- [ ] Design matches design system
- [ ] No TypeScript errors
- [ ] No console errors

---

## 📞 Need Help?

- **Stuck?** Check docs/ATLAS_DEV_BRIEF.md for detailed specs
- **Design question?** Check docs/DESIGN_SYSTEM.md for exact values
- **Concept unclear?** Check MIGRATION_NOTICE.md for product approach
- **Implementation question?** Check CLAUDE_CODE_START.md for code examples

---

**Remember: Server-side tracking is THE core feature. Keep it front and center!** 🚀
