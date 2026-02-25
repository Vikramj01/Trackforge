import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface IssueCardProps {
  id?: string;
  severity: 'critical' | 'warning';
  title: string;
  impact: string;
  cause?: string;
}

const SEVERITY_CONFIG = {
  critical: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.15)',
    dot: '#EF4444',
  },
  warning: {
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.15)',
    dot: '#F59E0B',
  },
};

const FIX_GUIDES: Record<string, string> = {
  no_gtm:
    'Add the GTM container snippet to your site\'s <head> tag. Get the snippet from Google Tag Manager → Admin → Install Google Tag Manager. Both the <head> and <body> snippets are required.',
  no_ga4:
    'Create a GA4 Configuration tag in GTM. Set the Measurement ID to your G-XXXXXXX ID and add an "All Pages" trigger. Publish the GTM container to activate.',
  no_meta:
    'Add a Custom HTML tag in GTM with your Meta Pixel base code (found in Meta Events Manager → Data Sources). Set an "All Pages" trigger and publish.',
  no_gads:
    'Google Ads conversion tags fire on specific actions (e.g. form submission, thank-you page), not all pages. Verify the trigger condition is met on this page and that your conversion tag is published in GTM.',
  empty_dl:
    'GTM triggers rely on dataLayer events. Push window.dataLayer.push({event: "page_view"}) on page load, or check that your GTM triggers fire on DOM Ready or Window Loaded. Use GTM Preview Mode to debug.',
  gclid_dropped:
    'Preserve GCLID by adding it as a hidden field on your forms, or use Google\'s auto-tagging. Verify that URL parameters are not stripped during redirects to your checkout or thank-you pages.',
  purchase_not_firing:
    'Add a dataLayer.push({event: "purchase", ...}) on your thank-you/confirmation page. Use GTM Preview Mode to confirm the event fires immediately after a test purchase completes.',
  no_capi:
    'Set up Meta Conversions API via your server or a GTM server-side container. This sends purchase events directly from your server, bypassing iOS/browser restrictions that block the pixel.',
  missing_transaction_id:
    'Add a unique transaction_id (e.g. order number) to your purchase dataLayer event. This prevents duplicate conversion counting when both client-side and server-side tracking fire for the same order.',
  no_enhanced_conversions:
    'Enable Enhanced Conversions in Google Ads (Tools → Conversions → Enhanced conversions) and pass hashed customer email or phone in your conversion tags. This improves match rates by 20–30%.',
};

export function IssueCard({ id, severity, title, impact, cause }: IssueCardProps) {
  const [showGuide, setShowGuide] = useState(false);
  const cfg = SEVERITY_CONFIG[severity];
  const fixGuide = id ? FIX_GUIDES[id] : undefined;

  return (
    <div
      className="p-4 rounded-lg"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
          style={{ background: cfg.dot }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary mb-1.5">{title}</p>
          <p className="text-xs text-text-muted mb-1">
            <span className="font-medium" style={{ color: '#7A8599' }}>Impact: </span>
            {impact}
          </p>
          {cause && (
            <p className="text-xs text-text-muted mb-1">
              <span className="font-medium" style={{ color: '#7A8599' }}>Cause: </span>
              {cause}
            </p>
          )}

          {fixGuide ? (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowGuide((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: '#0BBFAA' }}
              >
                {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showGuide ? 'Hide Fix Guide' : 'Show Fix Guide'}
              </button>
              {showGuide && (
                <p
                  className="text-xs mt-2 leading-relaxed p-3 rounded-md"
                  style={{
                    color: '#A8B2C0',
                    background: 'rgba(11,191,170,0.05)',
                    border: '1px solid rgba(11,191,170,0.12)',
                  }}
                >
                  {fixGuide}
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="text-xs mt-2.5 font-medium opacity-40 cursor-not-allowed"
              style={{ color: '#0BBFAA' }}
            >
              Show Fix Guide →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
