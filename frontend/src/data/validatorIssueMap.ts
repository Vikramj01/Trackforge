import type { Journey, JourneyEvent, EventParameter, EventType, EventCategory, ConversionType } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mkParam(name: string, type: EventParameter['type'], required: boolean): EventParameter {
  return { id: crypto.randomUUID(), name, type, required };
}

function mkEvent(
  canonicalName: string,
  displayName: string,
  description: string,
  eventType: EventType,
  category: EventCategory,
  conversionType: ConversionType,
  parameters: EventParameter[],
  implementationNotes?: string,
): JourneyEvent {
  return {
    id: crypto.randomUUID(),
    canonicalName,
    displayName,
    description,
    eventType,
    category,
    conversionType,
    parameters,
    implementationNotes: implementationNotes ?? '',
  };
}

// ─── Issue mapping type ────────────────────────────────────────────────────────

export type IssueFixPhase = 2 | 3;

export interface IssueMapping {
  /** Matches ValidatorIssue.id from the scan */
  issueId: string;
  /** Short label shown in the gap panel */
  title: string;
  /** One-line explanation of what needs to happen */
  fixSummary: string;
  /** Which phase resolves this issue */
  fixPhase: IssueFixPhase;
  /** For phase-2 fixes: the pre-configured event to inject into a journey */
  eventTemplate?: () => JourneyEvent;
  /**
   * Return true when the issue is already addressed by the current journeys.
   * Called reactively as the user edits journeys.
   */
  isResolved: (journeys: Journey[]) => boolean;
}

// ─── Helpers for resolution checks ────────────────────────────────────────────

function hasEventWithName(journeys: Journey[], name: string): boolean {
  return journeys.some((j) => j.events.some((e) => e.canonicalName === name));
}

function hasEventWithConversion(journeys: Journey[], type: 'primary' | 'secondary'): boolean {
  return journeys.some((j) => j.events.some((e) => e.conversionType === type));
}

function hasPurchaseWithParam(journeys: Journey[], paramName: string): boolean {
  return journeys.some((j) =>
    j.events.some(
      (e) => e.canonicalName === 'purchase' && e.parameters.some((p) => p.name === paramName),
    ),
  );
}

// ─── The mapping ──────────────────────────────────────────────────────────────

export const VALIDATOR_ISSUE_MAP: IssueMapping[] = [
  // ── Critical: purchase / conversion events not firing ─────────────────────
  {
    issueId: 'purchase_not_firing',
    title: 'Purchase Event Not Firing',
    fixSummary: 'Add a purchase event marked as your primary conversion',
    fixPhase: 2,
    eventTemplate: () =>
      mkEvent(
        'purchase',
        'Purchase',
        'Transaction completed successfully on the thank-you page',
        'success',
        'revenue',
        'primary',
        [
          mkParam('transaction_id', 'string', true),
          mkParam('value', 'number', true),
          mkParam('currency', 'string', true),
          mkParam('tax', 'number', false),
          mkParam('shipping', 'number', false),
          mkParam('items', 'array', true),
        ],
        'Fire on /thank-you or order-confirmation page. transaction_id must be unique per order to prevent duplicate conversions.',
      ),
    isResolved: (journeys) =>
      hasEventWithName(journeys, 'purchase') || hasEventWithConversion(journeys, 'primary'),
  },

  // ── Warning: missing transaction_id on purchase ───────────────────────────
  {
    issueId: 'missing_transaction_id',
    title: 'Missing transaction_id',
    fixSummary: 'Ensure your purchase event includes a transaction_id parameter',
    fixPhase: 2,
    // No auto-add event — this is a parameter gap on an existing event.
    // Resolution: purchase event exists AND has transaction_id param.
    isResolved: (journeys) =>
      hasPurchaseWithParam(journeys, 'transaction_id'),
  },

  // ── Critical: GCLID parameter dropped ────────────────────────────────────
  {
    issueId: 'gclid_dropped',
    title: 'GCLID Parameter Dropped',
    fixSummary: 'Add acquisition events that preserve URL params; configure in Phase 3',
    fixPhase: 3,
    isResolved: (journeys) =>
      journeys.some((j) =>
        j.events.some((e) => e.category === 'acquisition'),
      ),
  },

  // ── Warning: no Meta CAPI ─────────────────────────────────────────────────
  {
    issueId: 'no_capi',
    title: 'No Meta CAPI Configured',
    fixSummary: 'Enable server-side tracking — configure Meta CAPI in Phase 3',
    fixPhase: 3,
    isResolved: () => false, // Phase 3 config — can't resolve in Phase 2
  },

  // ── Warning: no enhanced conversions ─────────────────────────────────────
  {
    issueId: 'no_enhanced_conversions',
    title: 'No Enhanced Conversions',
    fixSummary: 'Configure Enhanced Conversions in Phase 3 (Orchestration)',
    fixPhase: 3,
    isResolved: () => false,
  },

  // ── Bookmarklet: no GTM found ─────────────────────────────────────────────
  {
    issueId: 'no_gtm',
    title: 'No Google Tag Manager Found',
    fixSummary: 'Install GTM on your site — required before any journey events can fire',
    fixPhase: 3,
    isResolved: () => false,
  },

  // ── Bookmarklet: no GA4 ───────────────────────────────────────────────────
  {
    issueId: 'no_ga4',
    title: 'No GA4 Tag',
    fixSummary: 'Add GA4 measurement ID to GTM — configure in Phase 3',
    fixPhase: 3,
    isResolved: () => false,
  },

  // ── Bookmarklet: no Meta Pixel ────────────────────────────────────────────
  {
    issueId: 'no_meta',
    title: 'No Meta Pixel',
    fixSummary: 'Install Meta Pixel via GTM — configure pixel events in Phase 3',
    fixPhase: 3,
    isResolved: () => false,
  },

  // ── Bookmarklet: no Google Ads tag ────────────────────────────────────────
  {
    issueId: 'no_gads',
    title: 'No Google Ads Tag',
    fixSummary: 'Add Google Ads conversion tag via GTM — configure in Phase 3',
    fixPhase: 3,
    isResolved: () => false,
  },

  // ── Bookmarklet: dataLayer empty ──────────────────────────────────────────
  {
    issueId: 'empty_dl',
    title: 'dataLayer Empty on Load',
    fixSummary: 'Add a page_view event to push to dataLayer on every page',
    fixPhase: 2,
    eventTemplate: () =>
      mkEvent(
        'page_view',
        'Page View',
        'Fired on every page load / route change to populate the dataLayer',
        'page_view',
        'acquisition',
        'none',
        [
          mkParam('page_location', 'string', false),
          mkParam('page_title', 'string', false),
        ],
        'For SPAs: push this event on every route change, not just the initial load. Include page_location (full URL) and page_title.',
      ),
    isResolved: (journeys) => hasEventWithName(journeys, 'page_view'),
  },
];

// ─── Lookup helper ────────────────────────────────────────────────────────────

export function getMappedIssues(issueIds: string[]): IssueMapping[] {
  return issueIds
    .map((id) => VALIDATOR_ISSUE_MAP.find((m) => m.issueId === id))
    .filter((m): m is IssueMapping => m !== undefined);
}
