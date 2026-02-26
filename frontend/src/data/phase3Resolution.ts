import type { Conversion } from '../types';

/**
 * Determines whether a Phase-3 validator issue is addressed by the current
 * conversions configuration. Issues that require external actions (GTM install,
 * pixel install) always return false — they are shown as informational tasks.
 */
export function isPhase3IssueResolved(issueId: string, conversions: Conversion[]): boolean {
  const primary = conversions.filter((c) => c.conversionType === 'primary');
  switch (issueId) {
    case 'no_capi':
      // Resolved when any primary conversion sends to Meta CAPI via server
      return primary.some(
        (c) => c.platforms.metaCAPI.enabled && c.trackingMethod !== 'client-only',
      );
    case 'no_enhanced_conversions':
      // Resolved when Enhanced Conversions is enabled on any primary conversion
      return primary.some((c) => c.enhancedConversionsEnabled);
    case 'gclid_dropped':
      // Resolved when server-side tracking is active on any conversion —
      // server-side calls preserve first-party cookies and URL parameters
      return conversions.some(
        (c) => c.trackingMethod === 'both' || c.trackingMethod === 'server-only',
      );
    default:
      // no_gtm, no_ga4, no_meta, no_gads — require external action, never auto-resolved
      return false;
  }
}

/** Issues that can be actioned inside Phase 3 (vs. purely external tasks). */
export const ACTIONABLE_PHASE3_ISSUES = new Set([
  'no_capi',
  'no_enhanced_conversions',
  'gclid_dropped',
]);

/** One-line guidance shown below each unresolved actionable issue. */
export const PHASE3_ACTION_HINT: Record<string, string> = {
  no_capi:
    'Expand any primary conversion card → enable Meta CAPI under Server Platforms',
  no_enhanced_conversions:
    'Expand any primary conversion card → toggle Enhanced Conversions',
  gclid_dropped:
    'Set tracking method to "Both" on your primary conversion to preserve click IDs server-side',
};
