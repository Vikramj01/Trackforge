/**
 * Node.js built-in test runner tests for phase3Resolution.ts
 * Run with: npm run test:node
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
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
  it('resolves when primary has metaCAPI enabled with both tracking', () => {
    const c = makeConversion({ conversionType: 'primary', trackingMethod: 'both' })
    assert.equal(isPhase3IssueResolved('no_capi', [c]), true)
  })

  it('resolves when tracking method is server-only', () => {
    const c = makeConversion({ conversionType: 'primary', trackingMethod: 'server-only' })
    assert.equal(isPhase3IssueResolved('no_capi', [c]), true)
  })

  it('does not resolve when tracking method is client-only', () => {
    const c = makeConversion({ conversionType: 'primary', trackingMethod: 'client-only' })
    assert.equal(isPhase3IssueResolved('no_capi', [c]), false)
  })

  it('does not resolve when metaCAPI is disabled', () => {
    const c = makeConversion({
      conversionType: 'primary',
      trackingMethod: 'both',
      platforms: {
        ...makeConversion().platforms,
        metaCAPI: { enabled: false, eventName: 'Purchase' },
      },
    })
    assert.equal(isPhase3IssueResolved('no_capi', [c]), false)
  })

  it('does not resolve when only secondary conversions have CAPI', () => {
    const c = makeConversion({ conversionType: 'secondary', trackingMethod: 'both' })
    assert.equal(isPhase3IssueResolved('no_capi', [c]), false)
  })

  it('does not resolve with empty conversions', () => {
    assert.equal(isPhase3IssueResolved('no_capi', []), false)
  })
})

// ─── no_enhanced_conversions ──────────────────────────────────────────────────

describe('isPhase3IssueResolved: no_enhanced_conversions', () => {
  it('resolves when a primary conversion has EC enabled', () => {
    const c = makeConversion({ conversionType: 'primary', enhancedConversionsEnabled: true })
    assert.equal(isPhase3IssueResolved('no_enhanced_conversions', [c]), true)
  })

  it('does not resolve when EC is false', () => {
    const c = makeConversion({ conversionType: 'primary', enhancedConversionsEnabled: false })
    assert.equal(isPhase3IssueResolved('no_enhanced_conversions', [c]), false)
  })

  it('does not resolve when only secondary conversions have EC', () => {
    const c = makeConversion({ conversionType: 'secondary', enhancedConversionsEnabled: true })
    assert.equal(isPhase3IssueResolved('no_enhanced_conversions', [c]), false)
  })

  it('resolves when at least one primary has EC enabled', () => {
    const c1 = makeConversion({ id: 'c1', conversionType: 'primary', enhancedConversionsEnabled: false })
    const c2 = makeConversion({ id: 'c2', conversionType: 'primary', enhancedConversionsEnabled: true })
    assert.equal(isPhase3IssueResolved('no_enhanced_conversions', [c1, c2]), true)
  })

  it('does not resolve with empty conversions', () => {
    assert.equal(isPhase3IssueResolved('no_enhanced_conversions', []), false)
  })
})

// ─── gclid_dropped ────────────────────────────────────────────────────────────

describe('isPhase3IssueResolved: gclid_dropped', () => {
  it('resolves when a conversion uses both tracking', () => {
    assert.equal(isPhase3IssueResolved('gclid_dropped', [makeConversion({ trackingMethod: 'both' })]), true)
  })

  it('resolves when a conversion uses server-only tracking', () => {
    assert.equal(isPhase3IssueResolved('gclid_dropped', [makeConversion({ trackingMethod: 'server-only' })]), true)
  })

  it('does not resolve when all conversions are client-only', () => {
    assert.equal(isPhase3IssueResolved('gclid_dropped', [makeConversion({ trackingMethod: 'client-only' })]), false)
  })

  it('resolves when at least one conversion uses server-side', () => {
    const c1 = makeConversion({ id: 'c1', trackingMethod: 'client-only' })
    const c2 = makeConversion({ id: 'c2', trackingMethod: 'both' })
    assert.equal(isPhase3IssueResolved('gclid_dropped', [c1, c2]), true)
  })

  it('does not resolve with empty conversions', () => {
    assert.equal(isPhase3IssueResolved('gclid_dropped', []), false)
  })
})

// ─── external issues ──────────────────────────────────────────────────────────

describe('external issues: always false', () => {
  const externalIssues = ['no_gtm', 'no_ga4', 'no_meta', 'no_gads', 'unknown_xyz']
  const rich = [makeConversion({ enhancedConversionsEnabled: true, trackingMethod: 'both' })]

  for (const id of externalIssues) {
    it(`${id} returns false with rich conversions`, () => {
      assert.equal(isPhase3IssueResolved(id, rich), false)
    })
    it(`${id} returns false with empty conversions`, () => {
      assert.equal(isPhase3IssueResolved(id, []), false)
    })
  }
})

// ─── ACTIONABLE_PHASE3_ISSUES ─────────────────────────────────────────────────

describe('ACTIONABLE_PHASE3_ISSUES', () => {
  it('contains the three in-app configurable issues', () => {
    assert.equal(ACTIONABLE_PHASE3_ISSUES.has('no_capi'), true)
    assert.equal(ACTIONABLE_PHASE3_ISSUES.has('no_enhanced_conversions'), true)
    assert.equal(ACTIONABLE_PHASE3_ISSUES.has('gclid_dropped'), true)
  })

  it('does not contain external issues', () => {
    for (const id of ['no_gtm', 'no_ga4', 'no_meta', 'no_gads']) {
      assert.equal(ACTIONABLE_PHASE3_ISSUES.has(id), false)
    }
  })
})

// ─── PHASE3_ACTION_HINT ───────────────────────────────────────────────────────

describe('PHASE3_ACTION_HINT', () => {
  it('has a non-empty hint for every actionable issue', () => {
    for (const id of ACTIONABLE_PHASE3_ISSUES) {
      assert.ok(PHASE3_ACTION_HINT[id] && PHASE3_ACTION_HINT[id].length > 0, `missing hint for ${id}`)
    }
  })
})
