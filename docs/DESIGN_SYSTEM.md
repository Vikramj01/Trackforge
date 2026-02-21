# Atlas Design System Reference

Extracted from `atlas-final.jsx` prototype - use these exact values in implementation.

---

## Color Palette

### Primary Colors
```css
/* Deep Navy - Primary background */
--deep-navy: #080B12;

/* Atlas Teal - Primary accent, CTAs, focus states */
--atlas-teal: #0BBFAA;
```

### Text Colors
```css
/* Primary text - main headings and body */
--text-primary: #E8ECF2;

/* Muted text - secondary info, labels */
--text-muted: #7A8599;
```

### UI Colors
```css
/* Borders and dividers */
--border-color: #1A1E28;

/* Card backgrounds */
--card-bg: #0D1117;

/* Form input backgrounds */
--input-bg: #12161E;

/* Hover states (slightly lighter) */
--hover-bg: #1A1E28;
```

### Gradients
```css
/* Teal gradient for buttons/accents */
background: linear-gradient(135deg, #14DFC8 0%, #0BBFAA 60%, #085A50 100%);

/* Silver gradient for logo compass spikes */
background: linear-gradient(180deg, #F0F4FF 0%, #C8D2E8 40%, #8892AA 100%);
```

---

## Typography

### Font Families
```css
/* Primary - Headings, Navigation, Buttons */
--font-primary: 'Bricolage Grotesque', sans-serif;
font-weight: 700;

/* Body - Paragraph text, form labels */
--font-body: 'Inter', sans-serif;
font-weight: 400 | 500 | 600;

/* Monospace - Code, GTM containers */
--font-mono: 'JetBrains Mono', monospace;
```

### Font Imports
```html
<!-- In your index.html or global CSS -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

### Typography Scale
```css
/* Page titles */
.title-large {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 46px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Section headings */
.title-medium {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

/* Card headings */
.title-small {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
}

/* Body large */
.body-large {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
}

/* Body regular */
.body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
}

/* Body small */
.body-small {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
}

/* Labels */
.label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## Spacing Scale

```css
/* Use 8px base unit */
--spacing-xs: 4px;   /* 0.5 units */
--spacing-sm: 8px;   /* 1 unit */
--spacing-md: 16px;  /* 2 units */
--spacing-lg: 24px;  /* 3 units */
--spacing-xl: 32px;  /* 4 units */
--spacing-2xl: 48px; /* 6 units */
--spacing-3xl: 64px; /* 8 units */
```

---

## Layout Dimensions

### Sidebar
```css
--sidebar-width: 248px;
--sidebar-padding: 24px;
```

### Content Area
```css
--content-max-width: 1400px;
--content-padding: 32px;
--content-padding-mobile: 16px;
```

### Grid System
```css
/* Card grids */
--grid-gap: 16px;
--card-min-width: 280px;

/* Responsive columns */
@media (min-width: 640px) { /* 1 column */ }
@media (min-width: 768px) { /* 2 columns */ }
@media (min-width: 1024px) { /* 3 columns */ }
@media (min-width: 1280px) { /* 4 columns */ }
```

---

## Component Patterns

### Cards
```css
.card {
  background: #0D1117;
  border: 1px solid #1A1E28;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
}

.card:hover {
  border-color: #0BBFAA;
  transform: translateY(-2px);
}
```

### Buttons

#### Primary Button (Teal)
```css
.btn-primary {
  background: linear-gradient(135deg, #14DFC8 0%, #0BBFAA 60%, #085A50 100%);
  color: #080B12;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
```

#### Secondary Button (Outline)
```css
.btn-secondary {
  background: transparent;
  color: #E8ECF2;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 11px 23px; /* -1px to account for border */
  border-radius: 6px;
  border: 1px solid #1A1E28;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: #0BBFAA;
  background: rgba(11, 191, 170, 0.05);
}
```

#### Ghost Button (Text only)
```css
.btn-ghost {
  background: transparent;
  color: #0BBFAA;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: rgba(11, 191, 170, 0.1);
}
```

### Form Inputs
```css
.input {
  background: #12161E;
  border: 1px solid #1A1E28;
  border-radius: 6px;
  color: #E8ECF2;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  padding: 12px 16px;
  width: 100%;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #0BBFAA;
  box-shadow: 0 0 0 3px rgba(11, 191, 170, 0.1);
}

.input::placeholder {
  color: #7A8599;
}

.input-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #E8ECF2;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: block;
}
```

### Dropdowns / Select
```css
.select {
  background: #12161E;
  border: 1px solid #1A1E28;
  border-radius: 6px;
  color: #E8ECF2;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  padding: 12px 16px;
  padding-right: 40px; /* Space for dropdown arrow */
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* Custom arrow */
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.select:focus {
  outline: none;
  border-color: #0BBFAA;
  box-shadow: 0 0 0 3px rgba(11, 191, 170, 0.1);
}
```

### Checkboxes
```css
.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #1A1E28;
  border-radius: 4px;
  background: #12161E;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox:checked {
  background: #0BBFAA;
  border-color: #0BBFAA;
}
```

### Tags / Badges
```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(11, 191, 170, 0.1);
  color: #0BBFAA;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid rgba(11, 191, 170, 0.2);
}
```

### Progress Indicators
```css
.progress-bar {
  width: 100%;
  height: 4px;
  background: #1A1E28;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #14DFC8, #0BBFAA);
  transition: width 0.3s ease;
}
```

### Stat Cards
```css
.stat-card {
  background: #0D1117;
  border: 1px solid #1A1E28;
  border-radius: 8px;
  padding: 20px;
}

.stat-value {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #E8ECF2;
  line-height: 1;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #7A8599;
  margin-top: 8px;
}

.stat-change {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
}

.stat-change.positive {
  color: #0BBFAA;
}

.stat-change.negative {
  color: #EF4444;
}
```

---

## Logo Usage

### Logo Lockup
```jsx
// [Mark] ATLAS wordmark
<div style={{ display: 'flex', alignItems: 'center', gap: capHeight * 0.25 }}>
  <img src="atlas-logo.svg" width={markSize} height={markSize} />
  <span style={{ 
    fontFamily: 'Bricolage Grotesque',
    fontWeight: 700,
    fontSize: capHeight,
    letterSpacing: capHeight * 0.05,
    textTransform: 'uppercase'
  }}>
    ATLAS
  </span>
</div>
```

### Logo Sizes
- **Small** (Sidebar): 22px cap height
- **Medium** (Login form): 22px cap height
- **Large** (Login hero): 46px cap height
- **Extra Large** (Landing page): 64px cap height

### Mark Size Ratio
- Mark size = Cap height × 1.25
- Gap between mark and wordmark = Cap height × 0.25

---

## Icons

Use **Lucide React** for all icons:

```bash
npm install lucide-react
```

Common icons used:
```jsx
import { 
  LayoutDashboard,  // Dashboard
  FileText,         // Templates
  Users,            // Clients
  Settings,         // Settings
  HelpCircle,       // Help
  Plus,             // Add new
  Search,           // Search
  Filter,           // Filters
  Download,         // Export/Download
  Copy,             // Copy to clipboard
  Check,            // Checkmark
  ChevronRight,     // Navigation
  AlertCircle,      // Warnings
  CheckCircle,      // Success
  XCircle,          // Error
} from 'lucide-react';
```

Icon sizing:
```jsx
<Icon size={16} /> // Small (inline with text)
<Icon size={20} /> // Medium (buttons, nav)
<Icon size={24} /> // Large (headings, features)
```

---

## Shadows

Use subtle shadows sparingly:

```css
/* Hover elevation */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);

/* Modal/Dialog */
--shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.5);
```

---

## Transitions

Standard easing and timing:

```css
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;
```

---

## Breakpoints

```css
/* Mobile first */
--mobile: 640px;    /* sm */
--tablet: 768px;    /* md */
--desktop: 1024px;  /* lg */
--wide: 1280px;     /* xl */
--ultra: 1536px;    /* 2xl */
```

---

## Z-Index Scale

```css
--z-base: 1;
--z-dropdown: 10;
--z-sticky: 20;
--z-overlay: 30;
--z-modal: 40;
--z-toast: 50;
```

---

## Example Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
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
      spacing: {
        'sidebar': '248px',
      },
    },
  },
  plugins: [],
}
```

---

Use these exact values to match the design prototype perfectly.
