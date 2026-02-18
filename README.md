# Atlas TrackForge

A comprehensive toolkit for agencies to design and deploy analytics tracking infrastructure for clients.

## What It Does

Atlas TrackForge provides a guided 4-phase workflow:

1. **Discovery** – Capture client profile (name, industry, website, goals, tech stack)
2. **Site Scan** – Automatically detect trackable elements (buttons, forms, links, videos) and categorise by priority
3. **Template Selection** – Choose from pre-built GTM tracking configurations for common platforms
4. **Deploy** – Generate GTM container JSON, installation guides, and verification scripts ready to download

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **State:** Zustand (with localStorage persistence)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Backend:** Express.js + TypeScript
- **Scanning:** Server-side heuristic element detection (Puppeteer-ready architecture)

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev        # Development server on http://localhost:5173
npm run build      # Production build
```

### Backend

```bash
cd backend
npm install
npm run dev        # API server on http://localhost:3001
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/scan | Scan a website for trackable elements |
| POST | /api/generate/gtm-container | Generate GTM container JSON |

## Project Structure

```
atlas-trackforge/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/        # Sidebar, Layout
│       │   └── wizard/        # Phase1–Phase4 components
│       ├── pages/             # Dashboard, Clients, Templates, Wizard, Settings
│       ├── store/             # Zustand store with localStorage persistence
│       ├── types/             # TypeScript interfaces
│       └── data/              # Mock data for development
└── backend/
    └── src/
        ├── routes/            # /scan and /generate endpoints
        ├── services/          # scanService (site element detection)
        └── server.ts          # Express app entry point
```

## Design System

| Token | Value |
|-------|-------|
| Background | `#080B12` |
| Card background | `#0D1117` |
| Input background | `#12161E` |
| Border | `#1A1E28` |
| Accent (teal) | `#0BBFAA` |
| Text primary | `#E8ECF2` |
| Text muted | `#7A8599` |

Fonts: **Bricolage Grotesque** (headings) · **Inter** (body) · **JetBrains Mono** (code)
