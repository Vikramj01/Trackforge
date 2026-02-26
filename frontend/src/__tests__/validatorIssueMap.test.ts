import { describe, it, expect } from 'vitest'
import { VALIDATOR_ISSUE_MAP, getMappedIssues } from '../data/validatorIssueMap'
import type { Journey, JourneyEvent } from '../types'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<JourneyEvent>): JourneyEvent {
  return {
    id: 'evt-1',
    canonicalName: 'view_item',
    displayName: 'View Item',
    description: '',
    eventType: 'page_view',
    category: 'acquisition',
    conversionType: 'none',
    parameters: [],
    ...overrides,
  }
}

function makeJourney(events: JourneyEvent[]): Journey {
  return { id: 'j-1', name: 'Test Journey', events }
}

const getIssue = (id: string) => {
  const issue = VALIDATOR_ISSUE_MAP.find((m) => m.issueId === id)
  if (!issue) throw new Error(`Issue mapping not found: ${id}`)
  return issue
}

// ─── getMappedIssues ──────────────────────────────────────────────────────────

describe('getMappedIssues', () => {
  it('returns mappings for known issue IDs in order', () => {
    const result = getMappedIssues(['purchase_not_firing', 'no_capi'])
    expect(result).toHaveLength(2)
    expect(result[0].issueId).toBe('purchase_not_firing')
    expect(result[1].issueId).toBe('no_capi')
  })

  it('filters out unknown issue IDs silently', () => {
    const result = getMappedIssues(['unknown_xyz', 'purchase_not_firing'])
    expect(result).toHaveLength(1)
    expect(result[0].issueId).toBe('purchase_not_firing')
  })

  it('returns empty array for empty input', () => {
    expect(getMappedIssues([])).toHaveLength(0)
  })

  it('returns empty array when all IDs are unknown', () => {
    expect(getMappedIssues(['foo', 'bar', 'baz'])).toHaveLength(0)
  })
})

// ─── isResolved: purchase_not_firing ─────────────────────────────────────────

describe('isResolved: purchase_not_firing', () => {
  it('resolves when a purchase event exists', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'purchase' })])]
    expect(getIssue('purchase_not_firing').isResolved(journeys)).toBe(true)
  })

  it('resolves when any primary conversion event exists (not necessarily named purchase)', () => {
    const journeys = [
      makeJourney([makeEvent({ canonicalName: 'signup_complete', conversionType: 'primary' })]),
    ]
    expect(getIssue('purchase_not_firing').isResolved(journeys)).toBe(true)
  })

  it('does not resolve with empty journeys', () => {
    expect(getIssue('purchase_not_firing').isResolved([])).toBe(false)
  })

  it('does not resolve when no purchase or primary conversion', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'view_item', conversionType: 'none' })])]
    expect(getIssue('purchase_not_firing').isResolved(journeys)).toBe(false)
  })

  it('does not resolve with secondary conversion only', () => {
    const journeys = [makeJourney([makeEvent({ conversionType: 'secondary' })])]
    expect(getIssue('purchase_not_firing').isResolved(journeys)).toBe(false)
  })
})

// ─── isResolved: missing_transaction_id ──────────────────────────────────────

describe('isResolved: missing_transaction_id', () => {
  it('resolves when purchase event has transaction_id parameter', () => {
    const journeys = [
      makeJourney([
        makeEvent({
          canonicalName: 'purchase',
          parameters: [{ id: 'p1', name: 'transaction_id', type: 'string', required: true }],
        }),
      ]),
    ]
    expect(getIssue('missing_transaction_id').isResolved(journeys)).toBe(true)
  })

  it('does not resolve when purchase event is missing transaction_id', () => {
    const journeys = [
      makeJourney([
        makeEvent({
          canonicalName: 'purchase',
          parameters: [{ id: 'p1', name: 'value', type: 'number', required: true }],
        }),
      ]),
    ]
    expect(getIssue('missing_transaction_id').isResolved(journeys)).toBe(false)
  })

  it('does not resolve when no purchase event exists at all', () => {
    expect(getIssue('missing_transaction_id').isResolved([])).toBe(false)
  })

  it('does not resolve when non-purchase event has transaction_id', () => {
    const journeys = [
      makeJourney([
        makeEvent({
          canonicalName: 'checkout',
          parameters: [{ id: 'p1', name: 'transaction_id', type: 'string', required: true }],
        }),
      ]),
    ]
    expect(getIssue('missing_transaction_id').isResolved(journeys)).toBe(false)
  })
})

// ─── isResolved: gclid_dropped ────────────────────────────────────────────────

describe('isResolved: gclid_dropped', () => {
  it('resolves when at least one acquisition-category event exists', () => {
    const journeys = [makeJourney([makeEvent({ category: 'acquisition' })])]
    expect(getIssue('gclid_dropped').isResolved(journeys)).toBe(true)
  })

  it('does not resolve with only revenue events', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'purchase', category: 'revenue' })])]
    expect(getIssue('gclid_dropped').isResolved(journeys)).toBe(false)
  })

  it('does not resolve with empty journeys', () => {
    expect(getIssue('gclid_dropped').isResolved([])).toBe(false)
  })
})

// ─── isResolved: empty_dl ────────────────────────────────────────────────────

describe('isResolved: empty_dl', () => {
  it('resolves when a page_view event exists', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'page_view', eventType: 'page_view' })])]
    expect(getIssue('empty_dl').isResolved(journeys)).toBe(true)
  })

  it('does not resolve when no page_view event', () => {
    expect(getIssue('empty_dl').isResolved([])).toBe(false)
  })

  it('does not resolve with other event types only', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'purchase', eventType: 'success' })])]
    expect(getIssue('empty_dl').isResolved(journeys)).toBe(false)
  })
})

// ─── isResolved: phase-3-only issues (never resolve in Phase 2) ───────────────

describe('phase-3 issues always return false from isResolved', () => {
  const phase3Issues = ['no_capi', 'no_enhanced_conversions', 'no_gtm', 'no_ga4', 'no_meta', 'no_gads']

  for (const issueId of phase3Issues) {
    it(`${issueId} never resolves regardless of journey state`, () => {
      const withPurchase = [makeJourney([makeEvent({ canonicalName: 'purchase', conversionType: 'primary' })])]
      expect(getIssue(issueId).isResolved(withPurchase)).toBe(false)
      expect(getIssue(issueId).isResolved([])).toBe(false)
    })
  }
})

// ─── eventTemplate factories ─────────────────────────────────────────────────

describe('eventTemplate factories', () => {
  it('purchase_not_firing creates a valid purchase event', () => {
    const factory = getIssue('purchase_not_firing').eventTemplate!
    const event = factory()
    expect(event.canonicalName).toBe('purchase')
    expect(event.conversionType).toBe('primary')
    expect(event.eventType).toBe('success')
    expect(event.category).toBe('revenue')
    expect(event.parameters.some((p) => p.name === 'transaction_id' && p.required)).toBe(true)
    expect(event.parameters.some((p) => p.name === 'value' && p.required)).toBe(true)
    expect(event.parameters.some((p) => p.name === 'currency' && p.required)).toBe(true)
  })

  it('purchase_not_firing factory generates unique event IDs on each call', () => {
    const factory = getIssue('purchase_not_firing').eventTemplate!
    expect(factory().id).not.toBe(factory().id)
  })

  it('empty_dl creates a page_view event', () => {
    const factory = getIssue('empty_dl').eventTemplate!
    const event = factory()
    expect(event.canonicalName).toBe('page_view')
    expect(event.eventType).toBe('page_view')
    expect(event.category).toBe('acquisition')
    expect(event.conversionType).toBe('none')
  })

  it('missing_transaction_id has no eventTemplate (it is a parameter fix)', () => {
    expect(getIssue('missing_transaction_id').eventTemplate).toBeUndefined()
  })

  it('phase-3 issues have no eventTemplate', () => {
    const phase3Issues = ['no_capi', 'no_enhanced_conversions', 'no_gtm', 'no_ga4', 'no_meta', 'no_gads']
    for (const id of phase3Issues) {
      expect(getIssue(id).eventTemplate).toBeUndefined()
    }
  })
})

// ─── VALIDATOR_ISSUE_MAP completeness ────────────────────────────────────────

describe('VALIDATOR_ISSUE_MAP structure', () => {
  it('every mapping has required fields', () => {
    for (const mapping of VALIDATOR_ISSUE_MAP) {
      expect(mapping.issueId).toBeTruthy()
      expect(mapping.title).toBeTruthy()
      expect(mapping.fixSummary).toBeTruthy()
      expect([2, 3]).toContain(mapping.fixPhase)
      expect(typeof mapping.isResolved).toBe('function')
    }
  })

  it('phase-2 issues with eventTemplate are callable', () => {
    const phase2WithTemplate = VALIDATOR_ISSUE_MAP.filter(
      (m) => m.fixPhase === 2 && m.eventTemplate !== undefined,
    )
    expect(phase2WithTemplate.length).toBeGreaterThan(0)
    for (const mapping of phase2WithTemplate) {
      const event = mapping.eventTemplate!()
      expect(event.id).toBeTruthy()
      expect(event.canonicalName).toBeTruthy()
    }
  })
})
