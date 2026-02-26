/**
 * Node.js built-in test runner tests for serverGTMGenerator.ts
 * Run with: npm run test:node
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateServerGTMContainer } from '../data/serverGTMGenerator'
import type { Project, Conversion } from '../types'

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
      googleAds: { enabled: false, conversionLabel: '' },
    },
    enableDeduplication: true,
    enhancedConversionsEnabled: false,
    userData: {
      email: true, phone: true, firstName: false,
      lastName: false, city: false, country: false, postalCode: false,
    },
    ...overrides,
  }
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    clientId: 'client-1',
    clientName: 'Acme',
    currentPhase: 4,
    status: 'in-progress',
    discovery: {
      clientName: 'Acme',
      industry: 'ecommerce',
      website: 'https://acme.com',
      propertyType: 'spa',
      businessModel: 'ecommerce',
      primaryObjective: 'purchase',
      techStack: ['Next.js'],
      serverSideTracking: { enabled: true, method: 'self-hosted', serverEndpoint: '/api/track' },
    },
    journeys: [],
    conversions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function parse(project: Project) {
  return JSON.parse(generateServerGTMContainer(project))
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('generateServerGTMContainer', () => {

  describe('container shape', () => {
    it('outputs valid JSON', () => {
      const raw = generateServerGTMContainer(makeProject())
      assert.doesNotThrow(() => JSON.parse(raw))
    })

    it('has exportFormatVersion: 2', () => {
      const out = parse(makeProject())
      assert.equal(out.exportFormatVersion, 2)
    })

    it('usageContext is SERVER not WEB', () => {
      const out = parse(makeProject())
      const { usageContext } = out.containerVersion.container
      assert.deepEqual(usageContext, ['SERVER'])
    })

    it('container name includes client name', () => {
      const project = makeProject()
      const out = parse(project)
      assert.ok(out.containerVersion.container.name.includes('Acme'))
    })

    it('has a GA4 Client entry', () => {
      const out = parse(makeProject({ conversions: [makeConversion()] }))
      const clients: Array<{ type: string }> = out.containerVersion.client
      assert.ok(clients.some((c) => c.type === 'gtag'))
    })
  })

  describe('empty / no server conversions', () => {
    it('returns empty tags and triggers when no conversions', () => {
      const out = parse(makeProject({ conversions: [] }))
      assert.equal(out.containerVersion.tag.length, 0)
      assert.equal(out.containerVersion.trigger.length, 0)
    })

    it('excludes client-only conversions from tags', () => {
      const clientOnly = makeConversion({ trackingMethod: 'client-only' })
      const out = parse(makeProject({ conversions: [clientOnly] }))
      assert.equal(out.containerVersion.tag.length, 0)
      assert.equal(out.containerVersion.trigger.length, 0)
    })
  })

  describe('triggers', () => {
    it('creates one trigger per server conversion', () => {
      const conv1 = makeConversion({ id: 'c1', canonicalName: 'purchase' })
      const conv2 = makeConversion({ id: 'c2', canonicalName: 'sign_up', trackingMethod: 'server-only' })
      const out = parse(makeProject({ conversions: [conv1, conv2] }))
      assert.equal(out.containerVersion.trigger.length, 2)
    })

    it('trigger uses canonical event name', () => {
      const conv = makeConversion({ canonicalName: 'trial_started' })
      const out = parse(makeProject({ conversions: [conv] }))
      const trigger = out.containerVersion.trigger[0]
      const nameParam = trigger.customEventFilter[0].parameter.find((p: { key: string }) => p.key === 'arg1')
      assert.equal(nameParam.value, 'trial_started')
    })

    it('trigger type is CUSTOM_EVENT', () => {
      const conv = makeConversion()
      const out = parse(makeProject({ conversions: [conv] }))
      assert.equal(out.containerVersion.trigger[0].type, 'CUSTOM_EVENT')
    })
  })

  describe('GA4 MP tag (gaawe)', () => {
    it('emits a gaawe tag for ga4Server enabled conversions', () => {
      const conv = makeConversion()
      const out = parse(makeProject({ conversions: [conv] }))
      const tags: Array<{ type: string }> = out.containerVersion.tag
      assert.ok(tags.some((t) => t.type === 'gaawe'))
    })

    it('gaawe tag includes measurementId and apiSecret parameters', () => {
      const conv = makeConversion()
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'gaawe')
      const paramKeys = tag.parameter.map((p: { key: string }) => p.key)
      assert.ok(paramKeys.includes('measurementId'))
      assert.ok(paramKeys.includes('apiSecret'))
    })

    it('gaawe tag measurementId references GA4 Measurement ID variable', () => {
      const conv = makeConversion()
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'gaawe')
      const mid = tag.parameter.find((p: { key: string }) => p.key === 'measurementId')
      assert.equal(mid.value, '{{GA4 Measurement ID}}')
    })

    it('omits gaawe tag when ga4Server is disabled', () => {
      const conv = makeConversion({
        platforms: {
          ga4Client: { enabled: true, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: false, eventName: '' },
          metaCAPI: { enabled: true, eventName: 'Purchase' },
          googleAds: { enabled: false, conversionLabel: '' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      assert.ok(!out.containerVersion.tag.some((t: { type: string }) => t.type === 'gaawe'))
    })

    it('gaawe includes transaction_id param for revenue events', () => {
      const conv = makeConversion({ isRevenueEvent: true })
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'gaawe')
      const epList = tag.parameter.find((p: { key: string }) => p.key === 'eventParameters').list
      const names: string[] = epList.map((item: { map: Array<{ key: string; value: string }> }) =>
        item.map.find((m) => m.key === 'name')?.value,
      )
      assert.ok(names.includes('transaction_id'))
    })

    it('gaawe includes userProperties with email and phone sha256', () => {
      const conv = makeConversion()
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'gaawe')
      const upList = tag.parameter.find((p: { key: string }) => p.key === 'userProperties').list
      const propNames: string[] = upList.map((item: { map: Array<{ key: string; value: string }> }) =>
        item.map.find((m) => m.key === 'name')?.value,
      )
      assert.ok(propNames.includes('user_data_email_sha256'))
      assert.ok(propNames.includes('user_data_phone_sha256'))
    })
  })

  describe('Meta CAPI tag (fbcapi)', () => {
    it('emits an fbcapi tag for metaCAPI enabled conversions', () => {
      const conv = makeConversion()
      const out = parse(makeProject({ conversions: [conv] }))
      assert.ok(out.containerVersion.tag.some((t: { type: string }) => t.type === 'fbcapi'))
    })

    it('fbcapi tag includes pixelId and accessToken parameters', () => {
      const conv = makeConversion()
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'fbcapi')
      const paramKeys = tag.parameter.map((p: { key: string }) => p.key)
      assert.ok(paramKeys.includes('pixelId'))
      assert.ok(paramKeys.includes('accessToken'))
    })

    it('fbcapi pixelId references Meta Pixel ID variable', () => {
      const conv = makeConversion()
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'fbcapi')
      const pid = tag.parameter.find((p: { key: string }) => p.key === 'pixelId')
      assert.equal(pid.value, '{{Meta Pixel ID}}')
    })

    it('fbcapi userData includes client IP and user-agent', () => {
      const conv = makeConversion()
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'fbcapi')
      const udMap = tag.parameter.find((p: { key: string }) => p.key === 'userData').map
      const udKeys: string[] = udMap.map((m: { key: string }) => m.key)
      assert.ok(udKeys.includes('client_ip_address'))
      assert.ok(udKeys.includes('client_user_agent'))
    })

    it('omits fbcapi tag when metaCAPI is disabled', () => {
      const conv = makeConversion({
        platforms: {
          ga4Client: { enabled: true, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: true, eventName: 'purchase' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: false, conversionLabel: '' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      assert.ok(!out.containerVersion.tag.some((t: { type: string }) => t.type === 'fbcapi'))
    })
  })

  describe('Google Ads Enhanced tag (gclidw)', () => {
    it('emits a gclidw tag when googleAds enabled AND enhancedConversionsEnabled', () => {
      const conv = makeConversion({
        enhancedConversionsEnabled: true,
        platforms: {
          ga4Client: { enabled: true, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: true, eventName: 'purchase' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: true, conversionLabel: 'abc123' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      assert.ok(out.containerVersion.tag.some((t: { type: string }) => t.type === 'gclidw'))
    })

    it('omits gclidw tag when googleAds enabled but enhancedConversionsEnabled is false', () => {
      const conv = makeConversion({
        enhancedConversionsEnabled: false,
        platforms: {
          ga4Client: { enabled: true, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: true, eventName: 'purchase' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: true, conversionLabel: 'abc123' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      assert.ok(!out.containerVersion.tag.some((t: { type: string }) => t.type === 'gclidw'))
    })

    it('gclidw tag includes conversionId, conversionLabel, transactionId', () => {
      const conv = makeConversion({
        enhancedConversionsEnabled: true,
        platforms: {
          ga4Client: { enabled: false, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: false, eventName: '' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: true, conversionLabel: 'myLabel' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'gclidw')
      const paramKeys = tag.parameter.map((p: { key: string }) => p.key)
      assert.ok(paramKeys.includes('conversionId'))
      assert.ok(paramKeys.includes('conversionLabel'))
      assert.ok(paramKeys.includes('transactionId'))
    })

    it('gclidw enhancedConversionsData includes address sub-map', () => {
      const conv = makeConversion({
        enhancedConversionsEnabled: true,
        platforms: {
          ga4Client: { enabled: false, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: false, eventName: '' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: true, conversionLabel: 'X' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'gclidw')
      const ecdParam = tag.parameter.find((p: { key: string }) => p.key === 'enhancedConversionsData')
      const ecdKeys: string[] = ecdParam.map.map((m: { key: string }) => m.key)
      assert.ok(ecdKeys.includes('address'))
      assert.ok(ecdKeys.includes('email'))
      assert.ok(ecdKeys.includes('phone_number'))
    })

    it('gclidw uses fixed value when valueLogic is fixed', () => {
      const conv = makeConversion({
        enhancedConversionsEnabled: true,
        valueLogic: 'fixed',
        fixedValue: 99,
        platforms: {
          ga4Client: { enabled: false, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: false, eventName: '' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: true, conversionLabel: 'X' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      const tag = out.containerVersion.tag.find((t: { type: string }) => t.type === 'gclidw')
      const valParam = tag.parameter.find((p: { key: string }) => p.key === 'conversionValue')
      assert.equal(valParam.value, '99')
    })
  })

  describe('variables', () => {
    it('emits GA4 credential variables when ga4Server is enabled', () => {
      const conv = makeConversion({
        platforms: {
          ga4Client: { enabled: false, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: true, eventName: 'purchase' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: false, conversionLabel: '' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      const varNames: string[] = out.containerVersion.variable.map((v: { name: string }) => v.name)
      assert.ok(varNames.includes('GA4 Measurement ID'))
      assert.ok(varNames.includes('GA4 API Secret'))
    })

    it('emits Meta credential variables when metaCAPI is enabled', () => {
      const out = parse(makeProject({ conversions: [makeConversion()] }))
      const varNames: string[] = out.containerVersion.variable.map((v: { name: string }) => v.name)
      assert.ok(varNames.includes('Meta Pixel ID'))
      assert.ok(varNames.includes('Meta Access Token'))
    })

    it('emits ED (Event Data) variable for event_id', () => {
      const out = parse(makeProject({ conversions: [makeConversion()] }))
      const varNames: string[] = out.containerVersion.variable.map((v: { name: string }) => v.name)
      assert.ok(varNames.includes('ED - event_id'))
    })

    it('emits HTTP variables for IP and user-agent when meta enabled', () => {
      const out = parse(makeProject({ conversions: [makeConversion()] }))
      const varNames: string[] = out.containerVersion.variable.map((v: { name: string }) => v.name)
      assert.ok(varNames.includes('HTTP - Client IP'))
      assert.ok(varNames.includes('HTTP - User Agent'))
    })

    it('omits HTTP variables when no meta CAPI conversions', () => {
      const conv = makeConversion({
        platforms: {
          ga4Client: { enabled: false, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: true, eventName: 'purchase' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: false, conversionLabel: '' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      const varNames: string[] = out.containerVersion.variable.map((v: { name: string }) => v.name)
      assert.ok(!varNames.includes('HTTP - Client IP'))
      assert.ok(!varNames.includes('HTTP - User Agent'))
    })

    it('emits address ED variables when google ads enhanced is enabled', () => {
      const conv = makeConversion({
        enhancedConversionsEnabled: true,
        platforms: {
          ga4Client: { enabled: false, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: false, eventName: '' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: true, conversionLabel: 'X' },
        },
      })
      const out = parse(makeProject({ conversions: [conv] }))
      const varNames: string[] = out.containerVersion.variable.map((v: { name: string }) => v.name)
      assert.ok(varNames.includes('ED - user_data.address.first_name'))
      assert.ok(varNames.includes('ED - user_data.address.postal_code'))
    })
  })

  describe('multi-conversion project', () => {
    it('creates correct number of tags for mixed platform setup', () => {
      const ga4Only = makeConversion({
        id: 'c1', canonicalName: 'sign_up', displayName: 'Sign Up',
        trackingMethod: 'server-only', isRevenueEvent: false,
        platforms: {
          ga4Client: { enabled: false, eventName: '' },
          metaPixel: { enabled: false, eventName: '' },
          ga4Server: { enabled: true, eventName: 'sign_up' },
          metaCAPI: { enabled: false, eventName: '' },
          googleAds: { enabled: false, conversionLabel: '' },
        },
      })
      const bothPlatforms = makeConversion({
        id: 'c2', canonicalName: 'purchase', displayName: 'Purchase',
        trackingMethod: 'both',
        platforms: {
          ga4Client: { enabled: true, eventName: 'purchase' },
          metaPixel: { enabled: true, eventName: 'Purchase' },
          ga4Server: { enabled: true, eventName: 'purchase' },
          metaCAPI: { enabled: true, eventName: 'Purchase' },
          googleAds: { enabled: false, conversionLabel: '' },
        },
      })
      const out = parse(makeProject({ conversions: [ga4Only, bothPlatforms] }))
      // sign_up: 1 gaawe; purchase: 1 gaawe + 1 fbcapi
      assert.equal(out.containerVersion.tag.length, 3)
      assert.equal(out.containerVersion.trigger.length, 2)
    })
  })
})
