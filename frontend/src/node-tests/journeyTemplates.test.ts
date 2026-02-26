/**
 * Node.js built-in test runner tests for journeyTemplates.ts
 * Run with: npm run test:node
 *
 * These tests work without vitest using Node.js 18+ built-in test runner.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  JOURNEY_TEMPLATES,
  getDefaultJourneysForBusinessModel,
} from '../data/journeyTemplates'

describe('JOURNEY_TEMPLATES', () => {
  it('contains 6 templates', () => {
    assert.equal(JOURNEY_TEMPLATES.length, 6)
  })

  it('each template eventCount matches actual events in created journey', () => {
    for (const template of JOURNEY_TEMPLATES) {
      const journey = template.createJourney()
      assert.equal(
        journey.events.length,
        template.eventCount,
        `${template.id}: expected ${template.eventCount} events, got ${journey.events.length}`,
      )
    }
  })

  it('each created journey has unique event IDs', () => {
    for (const template of JOURNEY_TEMPLATES) {
      const journey = template.createJourney()
      const ids = journey.events.map((e) => e.id)
      assert.equal(new Set(ids).size, ids.length, `${template.id} has duplicate event IDs`)
    }
  })

  it('each created journey has templateId set to the template id', () => {
    for (const template of JOURNEY_TEMPLATES) {
      const journey = template.createJourney()
      assert.equal(journey.templateId, template.id)
    }
  })

  it('calling createJourney twice produces journeys with different IDs', () => {
    const template = JOURNEY_TEMPLATES[0]
    const j1 = template.createJourney()
    const j2 = template.createJourney()
    assert.notEqual(j1.id, j2.id)
  })

  describe('ecommerce-checkout', () => {
    const template = JOURNEY_TEMPLATES.find((t) => t.id === 'ecommerce-checkout')!

    it('has a purchase event marked as primary conversion', () => {
      const journey = template.createJourney()
      const purchase = journey.events.find((e) => e.canonicalName === 'purchase')
      assert.ok(purchase, 'purchase event not found')
      assert.equal(purchase.conversionType, 'primary')
      assert.equal(purchase.eventType, 'success')
      assert.equal(purchase.category, 'revenue')
    })

    it('purchase event has required transaction_id parameter', () => {
      const journey = template.createJourney()
      const purchase = journey.events.find((e) => e.canonicalName === 'purchase')!
      const txId = purchase.parameters.find((p) => p.name === 'transaction_id')
      assert.ok(txId, 'transaction_id param not found')
      assert.equal(txId.required, true)
      assert.equal(txId.type, 'string')
    })

    it('first event is a view_item page_view', () => {
      const journey = template.createJourney()
      assert.equal(journey.events[0].canonicalName, 'view_item')
      assert.equal(journey.events[0].eventType, 'page_view')
    })
  })

  describe('saas-signup', () => {
    const template = JOURNEY_TEMPLATES.find((t) => t.id === 'saas-signup')!

    it('has signup_complete as primary conversion', () => {
      const journey = template.createJourney()
      const signupComplete = journey.events.find((e) => e.canonicalName === 'signup_complete')
      assert.ok(signupComplete, 'signup_complete event not found')
      assert.equal(signupComplete.conversionType, 'primary')
    })

    it('all events have non-empty canonicalName and displayName', () => {
      const journey = template.createJourney()
      for (const event of journey.events) {
        assert.ok(event.canonicalName.length > 0, `empty canonicalName`)
        assert.ok(event.displayName.length > 0, `empty displayName`)
      }
    })
  })

  describe('leadgen-contact', () => {
    const template = JOURNEY_TEMPLATES.find((t) => t.id === 'leadgen-contact')!

    it('has lead_submit as primary conversion', () => {
      const journey = template.createJourney()
      const leadSubmit = journey.events.find((e) => e.canonicalName === 'lead_submit')
      assert.ok(leadSubmit, 'lead_submit event not found')
      assert.equal(leadSubmit.conversionType, 'primary')
    })
  })
})

describe('getDefaultJourneysForBusinessModel', () => {
  it('returns a journey for ecommerce', () => {
    const journeys = getDefaultJourneysForBusinessModel('ecommerce')
    assert.equal(journeys.length, 1)
    assert.ok(journeys[0].events.length > 0)
  })

  it('returns a journey for saas', () => {
    const journeys = getDefaultJourneysForBusinessModel('saas')
    assert.equal(journeys.length, 1)
  })

  it('returns a journey for leadgen', () => {
    const journeys = getDefaultJourneysForBusinessModel('leadgen')
    assert.equal(journeys.length, 1)
  })

  it('returns empty array for unknown business model', () => {
    assert.equal(getDefaultJourneysForBusinessModel('unknown-model').length, 0)
  })

  it('returns empty array for undefined', () => {
    assert.equal(getDefaultJourneysForBusinessModel(undefined).length, 0)
  })

  it('returned journey has required structural properties', () => {
    const [journey] = getDefaultJourneysForBusinessModel('ecommerce')
    assert.ok('id' in journey)
    assert.ok('name' in journey)
    assert.ok('events' in journey)
    assert.ok('templateId' in journey)
    assert.ok(Array.isArray(journey.events))
  })
})
