import { describe, it, expect } from 'vitest'
import {
  JOURNEY_TEMPLATES,
  getDefaultJourneysForBusinessModel,
} from '../data/journeyTemplates'

describe('JOURNEY_TEMPLATES', () => {
  it('contains 6 templates', () => {
    expect(JOURNEY_TEMPLATES).toHaveLength(6)
  })

  it('each template eventCount matches actual events in created journey', () => {
    for (const template of JOURNEY_TEMPLATES) {
      const journey = template.createJourney()
      expect(journey.events, `${template.id} event count mismatch`).toHaveLength(
        template.eventCount,
      )
    }
  })

  it('each created journey has unique event IDs', () => {
    for (const template of JOURNEY_TEMPLATES) {
      const journey = template.createJourney()
      const ids = journey.events.map((e) => e.id)
      expect(new Set(ids).size, `${template.id} has duplicate event IDs`).toBe(ids.length)
    }
  })

  it('each created journey has templateId set to the template id', () => {
    for (const template of JOURNEY_TEMPLATES) {
      const journey = template.createJourney()
      expect(journey.templateId).toBe(template.id)
    }
  })

  it('calling createJourney twice produces journeys with different IDs', () => {
    const template = JOURNEY_TEMPLATES[0]
    const j1 = template.createJourney()
    const j2 = template.createJourney()
    expect(j1.id).not.toBe(j2.id)
  })

  describe('ecommerce-checkout template', () => {
    const template = JOURNEY_TEMPLATES.find((t) => t.id === 'ecommerce-checkout')!

    it('has a purchase event marked as primary conversion', () => {
      const journey = template.createJourney()
      const purchase = journey.events.find((e) => e.canonicalName === 'purchase')
      expect(purchase).toBeDefined()
      expect(purchase?.conversionType).toBe('primary')
      expect(purchase?.eventType).toBe('success')
      expect(purchase?.category).toBe('revenue')
    })

    it('purchase event has required transaction_id parameter', () => {
      const journey = template.createJourney()
      const purchase = journey.events.find((e) => e.canonicalName === 'purchase')!
      const txId = purchase.parameters.find((p) => p.name === 'transaction_id')
      expect(txId).toBeDefined()
      expect(txId?.required).toBe(true)
      expect(txId?.type).toBe('string')
    })

    it('has a view_item page_view event at the start', () => {
      const journey = template.createJourney()
      expect(journey.events[0].canonicalName).toBe('view_item')
      expect(journey.events[0].eventType).toBe('page_view')
    })
  })

  describe('saas-signup template', () => {
    const template = JOURNEY_TEMPLATES.find((t) => t.id === 'saas-signup')!

    it('has signup_complete as primary conversion', () => {
      const journey = template.createJourney()
      const signupComplete = journey.events.find((e) => e.canonicalName === 'signup_complete')
      expect(signupComplete).toBeDefined()
      expect(signupComplete?.conversionType).toBe('primary')
    })

    it('all events have non-empty canonicalName and displayName', () => {
      const journey = template.createJourney()
      for (const event of journey.events) {
        expect(event.canonicalName.length).toBeGreaterThan(0)
        expect(event.displayName.length).toBeGreaterThan(0)
      }
    })
  })

  describe('leadgen-contact template', () => {
    const template = JOURNEY_TEMPLATES.find((t) => t.id === 'leadgen-contact')!

    it('has lead_submit as primary conversion', () => {
      const journey = template.createJourney()
      const leadSubmit = journey.events.find((e) => e.canonicalName === 'lead_submit')
      expect(leadSubmit).toBeDefined()
      expect(leadSubmit?.conversionType).toBe('primary')
    })
  })
})

describe('getDefaultJourneysForBusinessModel', () => {
  it('returns a journey array for ecommerce', () => {
    const journeys = getDefaultJourneysForBusinessModel('ecommerce')
    expect(journeys).toHaveLength(1)
    expect(journeys[0].events.length).toBeGreaterThan(0)
  })

  it('returns a journey array for saas', () => {
    const journeys = getDefaultJourneysForBusinessModel('saas')
    expect(journeys).toHaveLength(1)
  })

  it('returns a journey array for leadgen', () => {
    const journeys = getDefaultJourneysForBusinessModel('leadgen')
    expect(journeys).toHaveLength(1)
  })

  it('returns empty array for unknown business model', () => {
    expect(getDefaultJourneysForBusinessModel('unknown-model')).toHaveLength(0)
  })

  it('returns empty array when called with undefined', () => {
    expect(getDefaultJourneysForBusinessModel(undefined)).toHaveLength(0)
  })

  it('returned journey has valid structure', () => {
    const [journey] = getDefaultJourneysForBusinessModel('ecommerce')
    expect(journey).toHaveProperty('id')
    expect(journey).toHaveProperty('name')
    expect(journey).toHaveProperty('events')
    expect(journey).toHaveProperty('templateId')
    expect(Array.isArray(journey.events)).toBe(true)
  })
})
