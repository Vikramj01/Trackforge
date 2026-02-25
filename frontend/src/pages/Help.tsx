import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Activity,
  Search,
  Server,
  Globe,
  Shield,
  FileDown,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// ─── Phase guide ──────────────────────────────────────────────────────────────

const PHASES = [
  {
    number: 0,
    name: 'Tracking Validator',
    route: '/validator',
    icon: Activity,
    color: '#FBBF24',
    duration: '1 min',
    description:
      'Audit your current tracking setup. Atlas detects GTM, GA4, Meta Pixel, and Google Ads tags and identifies critical gaps — like missing purchase events or blocked GCLID parameters.',
    steps: [
      'Enter your landing and conversion page URLs',
      'Choose detection method (Chrome extension, bookmarklet, or demo)',
      'Review your readiness score and issues',
      'Atlas pre-fills Phase 1 with detected setup',
    ],
  },
  {
    number: 1,
    name: 'Discovery',
    route: '/discovery',
    icon: Search,
    color: '#0BBFAA',
    duration: '5 min',
    description:
      'Enter client context — business model, property type, and tech stack. Then configure server-side tracking: choose self-hosted, Atlas-hosted, or Google Cloud.',
    steps: [
      'Fill in client name, website, and industry',
      'Select property type (SPA, Headless, CMS, Web App)',
      'Choose your business model and primary objective',
      'Enable server-side tracking and pick a deployment method',
    ],
  },
  {
    number: 2,
    name: 'Journey Designer',
    route: '/journey',
    icon: Zap,
    color: '#A855F7',
    duration: '10 min',
    description:
      'Define user journeys as sequences of canonical events. Templates are pre-loaded based on your business model. Customize event names, parameters, and mark which events are conversions.',
    steps: [
      'Review the auto-loaded journey template for your business model',
      'Add or remove events as needed',
      'Mark your primary conversion event (e.g., purchase)',
      'Define required parameters for each event',
    ],
  },
  {
    number: 3,
    name: 'Conversion Orchestration',
    route: '/orchestration',
    icon: Server,
    color: '#F97316',
    duration: '10 min',
    description:
      'Map each conversion to tracking platforms. Configure dual-tracking (client + server), deduplication via event_id, platform-specific event names, and enhanced conversions.',
    steps: [
      'Set tracking method per conversion: client-only, server-only, or both',
      'Enable each platform: GA4, Meta Pixel, Google Ads, Meta CAPI',
      'Turn on deduplication for dual-tracked conversions',
      'Configure enhanced conversions and user data fields',
    ],
  },
  {
    number: 4,
    name: 'Export & Deploy',
    route: '/export',
    icon: FileDown,
    color: '#22C55E',
    duration: '2 min',
    description:
      'Generate your full implementation package: GTM container JSON, data layer spec, Node.js or Python server endpoint, deployment guide, and QA checklist.',
    steps: [
      'Review the readiness checks in the Overview tab',
      'Download the GTM container JSON and import it in GTM',
      'Share the Data Layer Spec with your developer',
      'Deploy the server endpoint code to your backend',
      'Run through the QA Checklist before going live',
    ],
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What is server-side tracking and why does it matter?',
    a: 'Server-side tracking sends conversion signals from your server to ad platforms (Meta CAPI, GA4 Measurement Protocol, Google Ads Enhanced Conversions) rather than relying on browser scripts. This bypasses ad blockers, iOS ITP cookie restrictions, and browser privacy features — recovering 20–40% of conversions that client-side tracking loses.',
  },
  {
    q: 'What is event deduplication and do I need it?',
    a: 'When you use dual-tracking (both client and server), the same conversion fires twice — once from the browser and once from the server. Without deduplication, platforms count it as two conversions. Atlas generates a unique event_id (UUID v4) for each event and sends it on both paths. GA4, Meta CAPI, and Google Ads use this ID to deduplicate automatically. You should always enable it for dual-tracked conversions.',
  },
  {
    q: 'What is a canonical event name?',
    a: 'A canonical event name is the single, consistent name you use for an event across all systems — e.g., "purchase" in GA4, "Purchase" in Meta Pixel, and "purchase" in your GTM data layer. Atlas maps one canonical name to all platform-specific names so your generated code is consistent.',
  },
  {
    q: 'What deployment method should I choose for server-side tracking?',
    a: 'Self-hosted (free) means you deploy the generated Node.js or Python server endpoint to your own infrastructure (e.g., Railway, Render, or Google Cloud Run). Atlas-hosted ($49/mo) means Atlas manages the endpoint for you with zero DevOps. GCP-hosted uses Google\'s official server-side GTM container on Google Cloud, which requires more setup but is the most official approach.',
  },
  {
    q: 'Can I use Atlas without setting up server-side tracking?',
    a: 'Yes — you can set tracking method to "client-only" on each conversion and Atlas will generate a standard GTM container with GA4 and Meta Pixel tags. However, you\'ll miss the core value proposition: recovering conversions blocked by ad blockers and iOS. We recommend at least enabling server-side for your primary conversion.',
  },
  {
    q: 'How do I import the GTM container JSON?',
    a: 'In Google Tag Manager, go to Admin → Import Container. Select the downloaded JSON file, choose "Existing Workspace" → "Merge" (don\'t overwrite). Review the variables, triggers, and tags that get created. You\'ll need to replace placeholder IDs (G-XXXXXXXXXX, AW-XXXXXXXXXX, etc.) with your real measurement IDs.',
  },
  {
    q: 'What is enhanced conversions?',
    a: 'Enhanced conversions (Google Ads) and Meta\'s CAPI use hashed (SHA-256) first-party customer data — like email, phone number, or name — to improve conversion matching. This helps platforms attribute conversions that they would otherwise miss due to ITP or ad blockers. Atlas generates the hashing logic in the server endpoint code.',
  },
  {
    q: 'Can I have multiple journeys in one project?',
    a: 'Yes. In Phase 2 you can add multiple journeys (e.g., "Checkout Funnel" + "Product Discovery"). Each journey has its own event sequence. All conversion events from all journeys are collected in Phase 3 for platform configuration.',
  },
  {
    q: 'What should I do after downloading the export package?',
    a: '1. Import the GTM container and fill in real measurement IDs. 2. Share the Data Layer Spec with your developer — they\'ll implement the dataLayer.push() calls on your site. 3. Deploy the server endpoint (Node.js or Python). 4. Test using GA4 DebugView, Meta Events Testing Tool, and GTM Preview mode. 5. Run through the QA Checklist before going live.',
  },
];

// ─── Accordion FAQ item ───────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid #1A1E28' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-text-primary leading-snug">{q}</span>
        {open ? (
          <ChevronDown size={16} className="text-text-muted shrink-0 mt-0.5" />
        ) : (
          <ChevronRight size={16} className="text-text-muted shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <div className="pb-4 pr-6">
          <p className="text-sm text-text-muted leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function Help() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700,
            fontSize: '32px',
            letterSpacing: '-0.01em',
            color: '#E8ECF2',
            margin: 0,
          }}
        >
          Help &amp; Documentation
        </h1>
        <p className="text-text-muted mt-2 text-sm">
          Learn how Atlas works and get answers to common questions.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: Activity, label: 'Run an audit', sub: 'Phase 0 — Validator', route: '/validator', color: '#FBBF24' },
          { icon: Globe, label: 'New project', sub: 'Start from Discovery', route: '/discovery', color: '#0BBFAA' },
          { icon: Shield, label: 'View templates', sub: 'Browse journey library', route: '/templates', color: '#A855F7' },
        ].map((action) => (
          <Card
            key={action.label}
            hover
            onClick={() => navigate(action.route)}
            className="cursor-pointer flex items-center gap-3"
          >
            <div
              className="shrink-0 flex items-center justify-center rounded-lg"
              style={{
                width: 36,
                height: 36,
                background: `${action.color}15`,
                border: `1px solid ${action.color}25`,
              }}
            >
              <action.icon size={16} style={{ color: action.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">{action.label}</p>
              <p className="text-xs text-text-muted">{action.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Phases guide */}
      <section className="mb-8">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4"
          style={{ letterSpacing: '0.08em' }}
        >
          The 5-Phase Workflow
        </h2>
        <div className="space-y-3">
          {PHASES.map((phase) => (
            <Card key={phase.number} className="p-5">
              <div className="flex items-start gap-4">
                {/* Phase badge */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-lg"
                  style={{
                    width: 36,
                    height: 36,
                    background: `${phase.color}15`,
                    border: `1px solid ${phase.color}25`,
                  }}
                >
                  <phase.icon size={16} style={{ color: phase.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        background: `${phase.color}15`,
                        color: phase.color,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                      }}
                    >
                      Phase {phase.number}
                    </span>
                    <span
                      className="text-base font-semibold text-text-primary"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      {phase.name}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#7A8599', border: '1px solid #1A1E28' }}
                    >
                      ~{phase.duration}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mb-3">{phase.description}</p>
                  <ul className="space-y-1.5">
                    {phase.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
                        <CheckCircle2 size={13} style={{ color: phase.color, flexShrink: 0, marginTop: 1 }} />
                        {step}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate(phase.route)}
                    className="flex items-center gap-1.5 mt-3 text-xs font-medium transition-colors"
                    style={{ color: phase.color }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Open Phase {phase.number}
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4"
          style={{ letterSpacing: '0.08em' }}
        >
          Frequently Asked Questions
        </h2>
        <Card className="divide-y-0 px-5 py-1">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </Card>
      </section>

      {/* Support */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4"
          style={{ letterSpacing: '0.08em' }}
        >
          Need More Help?
        </h2>
        <Card className="flex items-start gap-4">
          <div
            className="shrink-0 flex items-center justify-center rounded-lg"
            style={{
              width: 40,
              height: 40,
              background: 'rgba(11,191,170,0.1)',
              border: '1px solid rgba(11,191,170,0.2)',
            }}
          >
            <HelpCircle size={18} style={{ color: '#0BBFAA' }} />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-semibold text-text-primary mb-1"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Contact Support
            </p>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Our team responds within 24 hours. Include your project name and which phase you're
              stuck on.
            </p>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = 'mailto:support@atlas.app')}
              className="text-xs py-1.5"
            >
              <ExternalLink size={13} />
              support@atlas.app
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
