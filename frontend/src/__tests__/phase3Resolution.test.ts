import { describe, it, expect } from 'vitest'
import {
  isPhase3IssueResolved,
  ACTIONABLE_PHASE3_ISSUES,
  PHASE3_ACTION_HINT,
} from '../data/phase3Resolution'
import type { Conversion } from '../types'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeConversion(overrides: Partial<Conversion> = {}): Conversion {
  return {
    id: 'conv-1',
    eventId: 'evt-1',
    canonicalName: 'purchase',
    displayName: 'Purchase',
    conversionType: 'primary',
    trackingMethod: 'both',
    valueLogic: 'dynamic',
    fixedValue: 0,
    currency: 'USD',
    isRevenueEvent: true,
    isPaidMediaOptimization: true,
    platforms: {
      ga4Client: { enabled: true, eventName: 'purchase' },
      metaPixel: { enabled: true, eventName: 'Purchase' },
      ga4Server: { enabled: true, eventName: 'purchase' },
      metaCAPI: { enabled: true, eventName: 'Purchase' },
      googleAds: { enabled: true, conversionLabel: '' },
    },
    enableDeduplication: true,
    enhancedConversionsEnabled: false,
    userData: {
      email: true,
      phone: false,
      firstName: false,
      lastName: false,
      city: false,
      country: false,
      postalCode: false,
    },
    ...overrides,
  }
}

// ─── no_capi ──────────────────────────────────────────────────────────────────

describe('isPhase3IssueResolved: no_capi', () => {
  it('resolves when a primary conversion has metaCAPI enabled and tracking method is both', () => {
    const conversions = [
      makeConversion({
        conversionType: 'primary',
        trackingMethod: 'both',
        platforms: { ...makeConversion().platforms, metaCAPI: { enabled: true, eventName: 'Purchase' } },
      }),
    ]
    expect(isPhase3IssueResolved('no_capi', conversions)).toBe(true)
  })

  it('resolves when tracking method is server-only with metaCAPI enabled', () => {
    const conversions = [
      makeConversion({
        conversionType: 'primary',
        trackingMethod: 'server-only',
        platforms: { ...makeConversion().platforms, metaCAPI: { enabled: true, eventName: 'Purchase' } },
      }),
    ]
    expect(isPhase3IssueResolved('no_capi', conversions)).toBe(true)
  })

  it('does not resolve when tracking method is client-only (no server path)', () => {
    const conversions = [
      makeConversion({
        conversionType: 'primary',
        trackingMethod: 'client-only',
        platforms: { ...makeConversion().platforms, metaCAPI: { enabled: true, eventName: 'Purchase' } },
      }),
    ]
    expect(isPhase3IssueResolved('no_capi', conversions)).toBe(false)
  })

  it('does not resolve when metaCAPI is disabled', () => {
    const conversions = [
      makeConversion({
        conversionType: 'primary',
        trackingMethod: 'both',
        platforms: { ...makeConversion().platforms, metaCAPI: { enabled: false, eventName: 'Purchase' } },
      }),
    ]
    expect(isPhase3IssueResolved('no_capi', conversions)).toBe(false)
  })

  it('does not resolve when only secondary conversions have CAPI enabled', () => {
    const conversions = [
      makeConversion({
        conversionType: 'secondary',
        trackingMethod: 'both',
        platforms: { ...makeConversion().platforms, metaCAPI: { enabled: true, eventName: 'Purchase' } },
      }),
    ]
    expect(isPhase3IssueResolved('no_capi', conversions)).toBe(false)
  })

  it('does not resolve with empty conversions', () => {
    expect(isPhase3IssueResolved('no_capi', [])).toBe(false)
  })
})

// ─── no_enhanced_conversions ──────────────────────────────────────────────────

describe('isPhase3IssueResolved: no_enhanced_conversions', () => {
  it('resolves when any primary conversion has enhancedConversionsEnabled', () => {
    const conversions = [makeConversion({ conversionType: 'primary', enhancedConversionsEnabled: true })]
    expect(isPhase3IssueResolved('no_enhanced_conversions', conversions)).toBe(true)
  })

  it('does not resolve when enhancedConversionsEnabled is false', () => {
    const conversions = [makeConversion({ conversionType: 'primary', enhancedConversionsEnabled: false })]
    expect(isPhase3IssueResolved('no_enhanced_conversions', conversions)).toBe(false)
  })

  it('does not resolve when only secondary conversions have EC enabled', () => {
    const conversions = [makeConversion({ conversionType: 'secondary', enhancedConversionsEnabled: true })]
    expect(isPhase3IssueResolved('no_enhanced_conversions', conversions)).toBe(false)
  })

  it('does not resolve with empty conversions', () => {
    expect(isPhase3IssueResolved('no_enhanced_conversions', [])).toBe(false)
  })

  it('resolves when at least one of multiple primaries has EC enabled', () => {
    const conversions = [
      makeConversion({ id: 'c1', conversionType: 'primary', enhancedConversionsEnabled: false }),
      makeConversion({ id: 'c2', conversionType: 'primary', enhancedConversionsEnabled: true }),
    ]
    expect(isPhase3IssueResolved('no_enhanced_conversions', conversions)).toBe(true)
  })
})

// ─── gclid_dropped ────────────────────────────────────────────────────────────

describe('isPhase3IssueResolved: gclid_dropped', () => {
  it('resolves when any conversion uses both tracking method', () => {
    const conversions = [makeConversion({ trackingMethod: 'both' })]
    expect(isPhase3IssueResolved('gclid_dropped', conversions)).toBe(true)
  })

  it('resolves when any conversion uses server-only tracking', () => {
    const conversions = [makeConversion({ trackingMethod: 'server-only' })]
    expect(isPhase3IssueResolved('gclid_dropped', conversions)).toBe(true)
  })

  it('does not resolve when all conversions are client-only', () => {
    const conversions = [makeConversion({ trackingMethod: 'client-only' })]
    expect(isPhase3IssueResolved('gclid_dropped', conversions)).toBe(false)
  })

  it('does not resolve with empty conversions', () => {
    expect(isPhase3IssueResolved('gclid_dropped', [])).toBe(false)
  })

  it('resolves when at least one of multiple conversions uses server-side', () => {
    const conversions = [
      makeConversion({ id: 'c1', trackingMethod: 'client-only' }),
      makeConversion({ id: 'c2', trackingMethod: 'both' }),
    ]
    expect(isPhase3IssueResolved('gclid_dropped', conversions)).toBe(true)
  })
})

// ─── external-only issues (never resolvable in app) ──────────────────────────

describe('isPhase3IssueResolved: external issues always return false', () => {
  const externalIssues = ['no_gtm', 'no_ga4', 'no_meta', 'no_gads']
  const richConversions = [makeConversion({ enhancedConversionsEnabled: true, trackingMethod: 'both' })]

  for (const issueId of externalIssues) {
    it(`${issueId} returns false regardless of conversion state`, () => {
      expect(isPhase3IssueResolved(issueId, richConversions)).toBe(false)
      expect(isPhase3IssueResolved(issueId, [])).toBe(false)
    })
  }

  it('returns false for completely unknown issue IDs', () => {
    expect(isPhase3IssueResolved('unknown_xyz', richConversions)).toBe(false)
  })
})

// ─── ACTIONABLE_PHASE3_ISSUES set ─────────────────────────────────────────────

describe('ACTIONABLE_PHASE3_ISSUES', () => {
  it('contains exactly the three in-app configurable issues', () => {
    expect(ACTIONABLE_PHASE3_ISSUES.has('no_capi')).toBe(true)
    expect(ACTIONABLE_PHASE3_ISSUES.has('no_enhanced_conversions')).toBe(true)
    expect(ACTIONABLE_PHASE3_ISSUES.has('gclid_dropped')).toBe(true)
    expect(ACTIONABLE_PHASE3_ISSUES.has('no_gtm')).toBe(false)
    expect(ACTIONABLE_PHASE3_ISSUES.has('no_ga4')).toBe(false)
    expect(ACTIONABLE_PHASE3_ISSUES.has('no_meta')).toBe(false)
    expect(ACTIONABLE_PHASE3_ISSUES.has('no_gads')).toBe(false)
  })
})

// ─── PHASE3_ACTION_HINT ───────────────────────────────────────────────────────

describe('PHASE3_ACTION_HINT', () => {
  it('has a hint for every actionable issue', () => {
    for (const issueId of ACTIONABLE_PHASE3_ISSUES) {
      expect(PHASE3_ACTION_HINT[issueId]).toBeTruthy()
    }
  })
})
