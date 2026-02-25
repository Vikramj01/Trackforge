import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Puzzle, Bookmark, FlaskConical, ChevronRight, ArrowLeft, Copy, Check, Download } from 'lucide-react';
import { ValidatorForm } from '../validator/ValidatorForm';
import { ValidatorProgress } from '../validator/ValidatorProgress';
import { ValidatorResults } from '../validator/ValidatorResults';
import { Card } from '../ui/Card';
import { useStore } from '../../store/useStore';
import type { ValidatorInputs, ValidatorResults as ValidatorResultsType, PropertyType } from '../../types';

// ─── Mock results (Demo mode) ─────────────────────────────────────────────────

const MOCK_RESULTS: Omit<ValidatorResultsType, 'inputs'> = {
  score: 45,
  criticalIssues: [
    {
      id: 'gclid_dropped',
      title: 'GCLID Parameter Dropped',
      impact: "Google Ads can't track 40% of conversions",
      cause: 'Parameter lost after redirect to checkout',
      severity: 'critical',
    },
    {
      id: 'purchase_not_firing',
      title: 'Purchase Event Not Firing',
      impact: '0 conversions tracked',
      cause: 'No dataLayer.push() on /thank-you page',
      severity: 'critical',
    },
  ],
  warnings: [
    {
      id: 'no_capi',
      title: 'No Meta CAPI Configured',
      impact: 'Losing 35% of iOS conversions',
      severity: 'warning',
    },
    {
      id: 'missing_transaction_id',
      title: 'Missing transaction_id',
      impact: 'Risk of duplicate conversion counting',
      severity: 'warning',
    },
    {
      id: 'no_enhanced_conversions',
      title: 'No Enhanced Conversions',
      impact: '20-30% lower match rate',
      severity: 'warning',
    },
  ],
  passing: [
    'Meta Pixel installed correctly',
    'Google Ads tag present on landing page',
  ],
  detectedSetup: {
    hasGTM: true,
    hasGA4: true,
    hasMetaPixel: true,
    hasGoogleAds: true,
    propertyType: 'spa',
  },
};

// ─── Map raw extension / bookmarklet scan to ValidatorResults type ─────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapScanResults(raw: Record<string, any>): ValidatorResultsType {
  const propertyType: PropertyType =
    raw.propertyType === 'spa' ? 'spa' : 'webapp';

  return {
    score: typeof raw.score === 'number' ? raw.score : 50,
    criticalIssues: Array.isArray(raw.issues) ? raw.issues : [],
    warnings: Array.isArray(raw.warnings) ? raw.warnings : [],
    passing: Array.isArray(raw.passing) ? raw.passing : [],
    detectedSetup: {
      hasGTM: !!raw.hasGTM,
      hasGA4: !!raw.hasGA4,
      hasMetaPixel: !!raw.hasMetaPixel,
      hasGoogleAds: !!raw.hasGoogleAds,
      propertyType,
    },
    inputs: {
      landingUrl: typeof raw.url === 'string' ? raw.url : '',
      conversionUrl: '',
      platforms: ['google-ads', 'meta-ads'],
      conversionType: 'purchase',
    },
  };
}

// ─── Bookmarklet code generator ───────────────────────────────────────────────
// The returned string is placed directly in an <a href> — it runs on the
// client's site and opens Atlas with base64-encoded results in the URL.

function buildBookmarklet(atlasOrigin: string): string {
  return `javascript:(function(){var r={url:location.href,hasGTM:!!window.google_tag_manager,hasGA4:false,hasMetaPixel:!!window.fbq,hasGoogleAds:false,dataLayerEvents:[],propertyType:'webapp',issues:[],warnings:[],passing:[]};if(!r.hasGTM){var s=document.querySelector('script[src*="googletagmanager.com/gtm.js"]');r.hasGTM=!!s;}var sc=[].slice.call(document.querySelectorAll('script'));var tx=sc.map(function(x){return x.textContent||''}).join(' ');var g4=tx.match(/G-[A-Z0-9]{5,}/);if(g4){r.hasGA4=true;}var aw=tx.match(/AW-[0-9]{8,}/);if(aw){r.hasGoogleAds=true;}var fb=tx.match(/fbq\\s*\\(\\s*['"]init['"]\\s*,\\s*['"]?(\\d{10,})/);if(fb){r.hasMetaPixel=true;}if(!r.hasMetaPixel){var fbs=document.querySelector('script[src*="connect.facebook.net"]');r.hasMetaPixel=!!fbs;}if(window.dataLayer&&Array.isArray(window.dataLayer)){r.dataLayerEvents=window.dataLayer.map(function(e){return e&&e.event;}).filter(Boolean).slice(0,10);}r.propertyType=(window.__NEXT_DATA__||document.getElementById('__next')||document.getElementById('root'))?'spa':'webapp';if(!r.hasGTM)r.issues.push({id:'no_gtm',title:'No GTM Found',impact:'No tag management container detected',cause:'GTM script not found on this page',severity:'critical'});else r.passing.push('Google Tag Manager detected');if(!r.hasGA4)r.issues.push({id:'no_ga4',title:'No GA4 Tag',impact:'No Google Analytics 4 tracking active',cause:'G-XXXXXXX measurement ID not found',severity:'critical'});else r.passing.push('GA4 detected');if(!r.hasMetaPixel)r.warnings.push({id:'no_meta',title:'No Meta Pixel',impact:'Missing Facebook conversion tracking',cause:'fbq() or connect.facebook.net not found',severity:'warning'});else r.passing.push('Meta Pixel detected');if(!r.hasGoogleAds)r.warnings.push({id:'no_gads',title:'No Google Ads Tag',impact:'Google Ads conversion tracking inactive',cause:'AW-XXXXXXXXX not found on this page',severity:'warning'});else r.passing.push('Google Ads tag detected');if(r.hasGTM&&r.dataLayerEvents.length===0)r.warnings.push({id:'empty_dl',title:'dataLayer Empty',impact:'GTM may not be firing any tags',cause:'No events pushed to dataLayer on load',severity:'warning'});var score=100;score-=r.issues.length*22;score-=r.warnings.length*8;r.score=Math.max(0,Math.min(100,score));try{var enc=encodeURIComponent(btoa(encodeURIComponent(JSON.stringify(r))));window.open('${atlasOrigin}/validator?results='+enc,'_blank');}catch(e){alert('Atlas Validator: Could not encode results. Try again.');}})();`;
}

// ─── View type ────────────────────────────────────────────────────────────────

type View = 'method' | 'ext-install' | 'bookmarklet' | 'form' | 'progress' | 'results';

// ─── Component ────────────────────────────────────────────────────────────────

export function Phase0Validator() {
  const navigate = useNavigate();
  const { setValidatorResults, validatorResults } = useStore();
  const [view, setView] = useState<View>('method');
  const [inputs, setInputs] = useState<ValidatorInputs | null>(null);
  const [copied, setCopied] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // Read ?results= URL param written by the extension / bookmarklet.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('results');
    if (encoded) {
      try {
        const raw = JSON.parse(decodeURIComponent(atob(encoded)));
        setValidatorResults(mapScanResults(raw));
        setView('results');
        window.history.replaceState({}, '', '/validator');
      } catch (e) {
        // Show a visible error instead of silently failing.
        setDecodeError(
          `Failed to read scan results from URL. ${e instanceof Error ? e.message : String(e)}`
        );
        window.history.replaceState({}, '', '/validator');
      }
    } else if (validatorResults) {
      setView('results');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const atlasOrigin = window.location.origin;
  const bookmarkletHref = buildBookmarklet(atlasOrigin);

  // ─ Demo mode handlers ─
  function handleFormSubmit(data: ValidatorInputs) {
    setInputs(data);
    setView('progress');
  }

  function handleProgressComplete() {
    setValidatorResults({ ...MOCK_RESULTS, inputs: inputs! });
    setView('results');
  }

  function handleRunAgain() {
    setInputs(null);
    setView('method');
  }

  function handleFixAll() {
    navigate('/discovery');
  }

  function copyBookmarklet() {
    navigator.clipboard.writeText(bookmarkletHref).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // View: method picker (initial landing)
  // ─────────────────────────────────────────────────────────────────────────────
  if (view === 'method') {
    const methods = [
      {
        id: 'ext-install' as View,
        icon: <Puzzle size={20} color="#0BBFAA" />,
        iconBg: '#0BBFAA',
        title: 'Chrome Extension',
        desc: 'One-click scan on any page. Most accurate detection.',
        sub: 'Chrome · Edge · Brave · Opera',
        badge: 'Recommended',
      },
      {
        id: 'bookmarklet' as View,
        icon: <Bookmark size={20} color="#7C3AED" />,
        iconBg: '#7C3AED',
        title: 'Bookmarklet',
        desc: 'Drag to your bookmarks bar — zero install required.',
        sub: 'Works on any browser including Safari & Firefox',
        badge: null,
      },
      {
        id: 'form' as View,
        icon: <FlaskConical size={20} color="#7A8599" />,
        iconBg: '#7A8599',
        title: 'Demo Mode',
        desc: 'See a simulated scan with example tracking issues.',
        sub: 'No real page access — uses sample data',
        badge: null,
      },
    ];

    return (
      <div className="p-8 max-w-2xl">
        {decodeError && (
          <div
            className="mb-6 p-4 rounded-lg text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}
          >
            <p className="font-semibold mb-1">Could not read scan results</p>
            <p className="text-xs opacity-80">{decodeError}</p>
          </div>
        )}
        <div className="mb-8">
          <div className="mb-3">
            <span
              className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-md"
              style={{
                background: 'rgba(11,191,170,0.1)',
                color: '#0BBFAA',
                border: '1px solid rgba(11,191,170,0.2)',
              }}
            >
              Phase 0
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '28px',
              letterSpacing: '-0.01em',
              color: '#E8ECF2',
              margin: 0,
            }}
          >
            Tracking Validator
          </h1>
          <p className="text-text-muted text-sm mt-2">
            Scan a live page to detect tracking gaps before building a new architecture.
          </p>
        </div>

        <div className="space-y-3">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setView(m.id)}
              className="w-full text-left group"
            >
              <Card>
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${m.iconBg}12`,
                      border: `1px solid ${m.iconBg}25`,
                    }}
                  >
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: '#E8ECF2', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {m.title}
                      </span>
                      {m.badge && (
                        <span
                          className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(11,191,170,0.12)',
                            color: '#0BBFAA',
                            border: '1px solid rgba(11,191,170,0.25)',
                          }}
                        >
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mb-0.5">{m.desc}</p>
                    <p className="text-[11px]" style={{ color: '#3A3F4E' }}>{m.sub}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: '#3A3F4E' }}
                  />
                </div>
              </Card>
            </button>
          ))}
        </div>

        {/* What happens next */}
        <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A1E28' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            What happens next
          </p>
          <div className="flex items-start gap-0">
            {[
              { step: '1', label: 'Choose a scan method above' },
              { step: '2', label: 'Scan your page — takes ~5 seconds' },
              { step: '3', label: 'Review your results with issue explanations' },
              { step: '4', label: 'Fix issues guided by Atlas' },
            ].map((s, i, arr) => (
              <div key={s.step} className="flex-1 flex flex-col items-center text-center">
                <div className="flex items-center w-full mb-2">
                  {i > 0 && <div className="flex-1 h-px" style={{ background: '#1A1E28' }} />}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'rgba(11,191,170,0.1)', border: '1px solid rgba(11,191,170,0.25)', color: '#0BBFAA' }}
                  >
                    {s.step}
                  </div>
                  {i < arr.length - 1 && <div className="flex-1 h-px" style={{ background: '#1A1E28' }} />}
                </div>
                <p className="text-[10px] text-text-muted leading-tight px-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/discovery')}
          className="text-sm text-text-muted hover:text-text-primary transition-colors mt-5 flex items-center gap-1.5"
        >
          Skip to Discovery
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // View: Chrome extension install instructions
  // ─────────────────────────────────────────────────────────────────────────────
  if (view === 'ext-install') {
    return (
      <div className="p-8 max-w-2xl">
        <button
          type="button"
          onClick={() => setView('method')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Puzzle size={18} color="#0BBFAA" />
            <h2
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 700,
                fontSize: '22px',
                color: '#E8ECF2',
              }}
            >
              Chrome Extension
            </h2>
          </div>
          <p className="text-sm text-text-muted">
            Works on Chrome, Edge, Brave, and Opera. Scans the active tab and sends results here with one click.
          </p>
        </div>

        <div className="space-y-3 mb-4">
          {[
            {
              n: '1',
              title: 'Download the extension',
              body: (
                <div className="mt-2">
                  <a
                    href="/atlas-validator-extension.zip"
                    download="atlas-validator-extension.zip"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, #14DFC8 0%, #0BBFAA 60%, #085A50 100%)',
                      color: '#080B12',
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={14} />
                    Download atlas-validator-extension.zip
                  </a>
                  <p className="text-xs text-text-muted mt-2">
                    Then unzip the file — you'll load the resulting folder in the next step.
                  </p>
                </div>
              ),
            },
            {
              n: '2',
              title: 'Load as unpacked extension',
              body: (
                <ol className="text-sm text-text-muted mt-1 space-y-1 list-none">
                  {[
                    <>Open <code style={{ color: '#0BBFAA' }}>chrome://extensions</code></>,
                    'Enable Developer mode (top-right toggle)',
                    'Click "Load unpacked"',
                    <>Select the <code style={{ color: '#0BBFAA' }}>extension/</code> folder</>,
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: '#3A3F4E' }}>{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ),
            },
            {
              n: '3',
              title: "Scan your client's site",
              body: (
                <p className="text-sm text-text-muted mt-1">
                  Navigate to any landing page and click the{' '}
                  <strong style={{ color: '#E8ECF2' }}>Atlas Validator</strong> icon in your toolbar.
                  Click <em>"Fix All Issues in Atlas"</em> — results open here automatically.
                </p>
              ),
            },
          ].map((s) => (
            <Card key={s.n}>
              <div className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                  style={{
                    background: 'rgba(11,191,170,0.12)',
                    color: '#0BBFAA',
                    border: '1px solid rgba(11,191,170,0.25)',
                  }}
                >
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#E8ECF2' }}>{s.title}</p>
                  {s.body}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div
          className="p-3 rounded-lg text-xs"
          style={{
            background: 'rgba(11,191,170,0.05)',
            border: '1px solid rgba(11,191,170,0.15)',
            color: '#7A8599',
          }}
        >
          <strong style={{ color: '#0BBFAA' }}>Waiting for results —</strong>{' '}
          Click <em>"Fix All Issues in Atlas"</em> in the extension popup, or use the manual paste option below.
        </div>

        {/* Manual paste fallback */}
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
            Or paste results code manually
          </p>
          <p className="text-xs text-text-muted mb-3">
            In the extension popup, click <strong style={{ color: '#E8ECF2' }}>Copy results code</strong>, then paste it below.
          </p>
          <div className="flex gap-2">
            <input
              id="paste-code-input"
              type="text"
              placeholder="Paste code here…"
              className="flex-1 text-xs rounded-lg px-3 py-2 outline-none"
              style={{
                background: '#0D1017',
                border: '1px solid #1A1E28',
                color: '#E8ECF2',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') document.getElementById('paste-code-btn')?.click();
              }}
            />
            <button
              id="paste-code-btn"
              type="button"
              className="text-xs font-semibold px-4 py-2 rounded-lg shrink-0"
              style={{ background: '#0BBFAA', color: '#080B12' }}
              onClick={() => {
                const input = document.getElementById('paste-code-input') as HTMLInputElement;
                const code = input?.value?.trim();
                if (!code) return;
                try {
                  const raw = JSON.parse(decodeURIComponent(atob(code)));
                  setValidatorResults(mapScanResults(raw));
                  setView('results');
                } catch {
                  input.style.borderColor = '#EF4444';
                  setTimeout(() => { input.style.borderColor = '#1A1E28'; }, 2000);
                }
              }}
            >
              Load
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // View: bookmarklet
  // ─────────────────────────────────────────────────────────────────────────────
  if (view === 'bookmarklet') {
    return (
      <div className="p-8 max-w-2xl">
        <button
          type="button"
          onClick={() => setView('method')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark size={18} color="#7C3AED" />
            <h2
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 700,
                fontSize: '22px',
                color: '#E8ECF2',
              }}
            >
              Bookmarklet Scanner
            </h2>
          </div>
          <p className="text-sm text-text-muted">
            No install required. Works on any browser — Chrome, Firefox, Safari, Edge, Brave, Opera.
          </p>
        </div>

        <div className="space-y-3 mb-4">
          {/* Step 1: drag to bookmarks */}
          <Card>
            <div className="flex gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                style={{
                  background: 'rgba(124,58,237,0.12)',
                  color: '#7C3AED',
                  border: '1px solid rgba(124,58,237,0.25)',
                }}
              >
                1
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-2" style={{ color: '#E8ECF2' }}>
                  Add to your bookmarks bar
                </p>
                <p className="text-sm text-text-muted mb-3">
                  Drag the button below to your bookmarks bar, or right-click it and choose{' '}
                  <em>"Bookmark this link"</em>.
                </p>

                {/* Draggable bookmarklet anchor */}
                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    href={bookmarkletHref}
                    draggable={true}
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-grab active:cursor-grabbing select-none"
                    style={{
                      background: 'rgba(124,58,237,0.12)',
                      border: '1px solid rgba(124,58,237,0.35)',
                      color: '#A78BFA',
                    }}
                    title="Drag this to your bookmarks bar"
                  >
                    <Bookmark size={14} />
                    Scan with Atlas
                  </a>
                  <button
                    type="button"
                    onClick={copyBookmarklet}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                  >
                    {copied ? (
                      <Check size={13} color="#10B981" />
                    ) : (
                      <Copy size={13} />
                    )}
                    {copied ? 'Copied!' : 'Copy code'}
                  </button>
                </div>

                <p className="text-[11px] mt-2" style={{ color: '#3A3F4E' }}>
                  Show bookmarks bar:{' '}
                  <kbd
                    className="px-1 py-0.5 rounded text-[10px]"
                    style={{ background: '#12161E', border: '1px solid #1A1E28', color: '#7A8599' }}
                  >
                    Ctrl+Shift+B
                  </kbd>
                  {' '}/ Mac:{' '}
                  <kbd
                    className="px-1 py-0.5 rounded text-[10px]"
                    style={{ background: '#12161E', border: '1px solid #1A1E28', color: '#7A8599' }}
                  >
                    ⌘+Shift+B
                  </kbd>
                </p>
              </div>
            </div>
          </Card>

          {/* Step 2: use it */}
          <Card>
            <div className="flex gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                style={{
                  background: 'rgba(124,58,237,0.12)',
                  color: '#7C3AED',
                  border: '1px solid rgba(124,58,237,0.25)',
                }}
              >
                2
              </span>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#E8ECF2' }}>
                  Scan your client's landing page
                </p>
                <p className="text-sm text-text-muted">
                  Navigate to any page you want to audit, then click{' '}
                  <strong style={{ color: '#E8ECF2' }}>Scan with Atlas</strong> in your bookmarks.
                  A new tab will open here with your real results automatically.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div
          className="p-3 rounded-lg text-xs"
          style={{
            background: 'rgba(124,58,237,0.05)',
            border: '1px solid rgba(124,58,237,0.15)',
            color: '#7A8599',
          }}
        >
          <strong style={{ color: '#A78BFA' }}>What it detects —</strong>{' '}
          GTM container ID, GA4 measurement ID, Meta Pixel, Google Ads conversion tag, and dataLayer activity.
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Views: demo mode — form → progress → results
  // ─────────────────────────────────────────────────────────────────────────────

  const headerVisible = view !== 'results';

  return (
    <div className="p-8 max-w-2xl">
      {headerVisible && (
        <>
          {view === 'form' && (
            <button
              type="button"
              onClick={() => setView('method')}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-5"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}
          <div className="mb-8">
            <div className="mb-3">
              <span
                className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-md"
                style={{
                  background: 'rgba(11,191,170,0.1)',
                  color: '#0BBFAA',
                  border: '1px solid rgba(11,191,170,0.2)',
                }}
              >
                Phase 0 · Demo
              </span>
            </div>
            <h1
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 700,
                fontSize: '28px',
                letterSpacing: '-0.01em',
                color: '#E8ECF2',
                margin: 0,
              }}
            >
              Tracking Validator
            </h1>
            <p className="text-text-muted text-sm mt-2">
              Simulated scan — sample data only. Use the Extension or Bookmarklet for real results.
            </p>
          </div>
        </>
      )}

      {view === 'form' && (
        <ValidatorForm
          onSubmit={handleFormSubmit}
          onSkip={() => navigate('/discovery')}
        />
      )}

      {view === 'progress' && (
        <ValidatorProgress onComplete={handleProgressComplete} />
      )}

      {view === 'results' && validatorResults && (
        <ValidatorResults
          results={validatorResults}
          onFixAll={handleFixAll}
          onRunAgain={handleRunAgain}
        />
      )}
    </div>
  );
}
