/**
 * Node.js built-in test runner tests for validatorIssueMap.ts
 * Run with: npm run test:node
 *
 * These tests work without vitest using Node.js 18+ built-in test runner.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
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

function getIssue(id: string) {
  const issue = VALIDATOR_ISSUE_MAP.find((m) => m.issueId === id)
  if (!issue) throw new Error(`Issue mapping not found: ${id}`)
  return issue
}

// ─── getMappedIssues ──────────────────────────────────────────────────────────

describe('getMappedIssues', () => {
  it('returns mappings for known issue IDs', () => {
    const result = getMappedIssues(['purchase_not_firing', 'no_capi'])
    assert.equal(result.length, 2)
    assert.equal(result[0].issueId, 'purchase_not_firing')
    assert.equal(result[1].issueId, 'no_capi')
  })

  it('filters out unknown issue IDs', () => {
    const result = getMappedIssues(['unknown_xyz', 'purchase_not_firing'])
    assert.equal(result.length, 1)
    assert.equal(result[0].issueId, 'purchase_not_firing')
  })

  it('returns empty array for empty input', () => {
    assert.equal(getMappedIssues([]).length, 0)
  })

  it('returns empty array when all IDs are unknown', () => {
    assert.equal(getMappedIssues(['foo', 'bar', 'baz']).length, 0)
  })
})

// ─── purchase_not_firing ─────────────────────────────────────────────────────

describe('isResolved: purchase_not_firing', () => {
  it('resolves when a purchase event exists', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'purchase' })])]
    assert.equal(getIssue('purchase_not_firing').isResolved(journeys), true)
  })

  it('resolves when any primary conversion event exists', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'signup', conversionType: 'primary' })])]
    assert.equal(getIssue('purchase_not_firing').isResolved(journeys), true)
  })

  it('does not resolve with empty journeys', () => {
    assert.equal(getIssue('purchase_not_firing').isResolved([]), false)
  })

  it('does not resolve with no purchase or primary conversion', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'view_item', conversionType: 'none' })])]
    assert.equal(getIssue('purchase_not_firing').isResolved(journeys), false)
  })

  it('does not resolve with only secondary conversion', () => {
    const journeys = [makeJourney([makeEvent({ conversionType: 'secondary' })])]
    assert.equal(getIssue('purchase_not_firing').isResolved(journeys), false)
  })
})

// ─── missing_transaction_id ──────────────────────────────────────────────────

describe('isResolved: missing_transaction_id', () => {
  it('resolves when purchase has transaction_id parameter', () => {
    const journeys = [
      makeJourney([
        makeEvent({
          canonicalName: 'purchase',
          parameters: [{ id: 'p1', name: 'transaction_id', type: 'string', required: true }],
        }),
      ]),
    ]
    assert.equal(getIssue('missing_transaction_id').isResolved(journeys), true)
  })

  it('does not resolve when purchase lacks transaction_id', () => {
    const journeys = [
      makeJourney([
        makeEvent({
          canonicalName: 'purchase',
          parameters: [{ id: 'p1', name: 'value', type: 'number', required: true }],
        }),
      ]),
    ]
    assert.equal(getIssue('missing_transaction_id').isResolved(journeys), false)
  })

  it('does not resolve with no purchase event', () => {
    assert.equal(getIssue('missing_transaction_id').isResolved([]), false)
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
    assert.equal(getIssue('missing_transaction_id').isResolved(journeys), false)
  })
})

// ─── gclid_dropped ────────────────────────────────────────────────────────────

describe('isResolved: gclid_dropped', () => {
  it('resolves when an acquisition-category event exists', () => {
    const journeys = [makeJourney([makeEvent({ category: 'acquisition' })])]
    assert.equal(getIssue('gclid_dropped').isResolved(journeys), true)
  })

  it('does not resolve with only revenue events', () => {
    const journeys = [makeJourney([makeEvent({ category: 'revenue' })])]
    assert.equal(getIssue('gclid_dropped').isResolved(journeys), false)
  })

  it('does not resolve with empty journeys', () => {
    assert.equal(getIssue('gclid_dropped').isResolved([]), false)
  })
})

// ─── empty_dl ────────────────────────────────────────────────────────────────

describe('isResolved: empty_dl', () => {
  it('resolves when a page_view event exists', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'page_view', eventType: 'page_view' })])]
    assert.equal(getIssue('empty_dl').isResolved(journeys), true)
  })

  it('does not resolve with no page_view event', () => {
    assert.equal(getIssue('empty_dl').isResolved([]), false)
  })

  it('does not resolve with other event types only', () => {
    const journeys = [makeJourney([makeEvent({ canonicalName: 'purchase', eventType: 'success' })])]
    assert.equal(getIssue('empty_dl').isResolved(journeys), false)
  })
})

// ─── phase-3-only issues ─────────────────────────────────────────────────────

describe('phase-3 issues always return false', () => {
  const phase3Issues = ['no_capi', 'no_enhanced_conversions', 'no_gtm', 'no_ga4', 'no_meta', 'no_gads']

  for (const issueId of phase3Issues) {
    it(`${issueId} never resolves`, () => {
      const journeys = [makeJourney([makeEvent({ canonicalName: 'purchase', conversionType: 'primary' })])]
      assert.equal(getIssue(issueId).isResolved(journeys), false)
      assert.equal(getIssue(issueId).isResolved([]), false)
    })
  }
})

// ─── eventTemplate factories ─────────────────────────────────────────────────

describe('eventTemplate factories', () => {
  it('purchase_not_firing creates a valid purchase event', () => {
    const factory = getIssue('purchase_not_firing').eventTemplate!
    const event = factory()
    assert.equal(event.canonicalName, 'purchase')
    assert.equal(event.conversionType, 'primary')
    assert.equal(event.eventType, 'success')
    assert.equal(event.category, 'revenue')
    assert.ok(event.parameters.some((p) => p.name === 'transaction_id' && p.required))
  })

  it('purchase_not_firing factory generates unique IDs on each call', () => {
    const factory = getIssue('purchase_not_firing').eventTemplate!
    assert.notEqual(factory().id, factory().id)
  })

  it('empty_dl creates a page_view event', () => {
    const factory = getIssue('empty_dl').eventTemplate!
    const event = factory()
    assert.equal(event.canonicalName, 'page_view')
    assert.equal(event.eventType, 'page_view')
    assert.equal(event.category, 'acquisition')
  })

  it('missing_transaction_id has no eventTemplate', () => {
    assert.equal(getIssue('missing_transaction_id').eventTemplate, undefined)
  })
})

// ─── VALIDATOR_ISSUE_MAP completeness ────────────────────────────────────────

describe('VALIDATOR_ISSUE_MAP structure', () => {
  it('every mapping has required fields', () => {
    for (const mapping of VALIDATOR_ISSUE_MAP) {
      assert.ok(mapping.issueId, 'missing issueId')
      assert.ok(mapping.title, 'missing title')
      assert.ok(mapping.fixSummary, 'missing fixSummary')
      assert.ok(mapping.fixPhase === 2 || mapping.fixPhase === 3, 'invalid fixPhase')
      assert.equal(typeof mapping.isResolved, 'function')
    }
  })

  it('phase-2 issues with eventTemplate are callable and return valid events', () => {
    const phase2WithTemplate = VALIDATOR_ISSUE_MAP.filter(
      (m) => m.fixPhase === 2 && m.eventTemplate !== undefined,
    )
    assert.ok(phase2WithTemplate.length > 0, 'expected at least one phase-2 template')
    for (const mapping of phase2WithTemplate) {
      const event = mapping.eventTemplate!()
      assert.ok(event.id, 'event missing id')
      assert.ok(event.canonicalName, 'event missing canonicalName')
    }
  })
})
