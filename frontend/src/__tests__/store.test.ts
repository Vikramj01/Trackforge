import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStore } from '../store/useStore'
import type { Project, ValidatorResults } from '../types'

// ─── Mock Supabase ────────────────────────────────────────────────────────────
// Each from() call returns a chainable builder; terminal methods resolve as Promises.

vi.mock('../lib/supabase', () => {
  const makeChain = (): Record<string, unknown> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain: any = {}
    chain.select = vi.fn().mockReturnValue(chain)
    chain.insert = vi.fn().mockResolvedValue({ error: null })
    chain.update = vi.fn().mockReturnValue(chain)
    chain.delete = vi.fn().mockReturnValue(chain)
    chain.eq = vi.fn().mockResolvedValue({ data: null, error: null })
    chain.order = vi.fn().mockResolvedValue({ data: [], error: null })
    return chain
  }

  return {
    supabase: {
      from: vi.fn().mockImplementation(() => makeChain()),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    },
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p-1',
    clientId: 'c-1',
    clientName: 'Acme Corp',
    currentPhase: 1,
    status: 'draft',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

const initialState = {
  projects: [],
  activeProjectId: null,
  loading: false,
  validatorResults: null,
}

beforeEach(() => {
  useStore.setState(initialState)
})

// ─── setActiveProject ─────────────────────────────────────────────────────────

describe('setActiveProject', () => {
  it('sets the activeProjectId to the given value', () => {
    useStore.getState().setActiveProject('project-abc')
    expect(useStore.getState().activeProjectId).toBe('project-abc')
  })

  it('clears activeProjectId when set to null', () => {
    useStore.setState({ activeProjectId: 'project-abc' })
    useStore.getState().setActiveProject(null)
    expect(useStore.getState().activeProjectId).toBeNull()
  })
})

// ─── setValidatorResults ──────────────────────────────────────────────────────

describe('setValidatorResults', () => {
  it('stores the provided validator results', () => {
    const results: ValidatorResults = {
      score: 75,
      criticalIssues: [],
      warnings: [{ id: 'no_gtm', title: 'No GTM', impact: 'No tracking', severity: 'warning' }],
      passing: ['Has GA4 tag'],
      detectedSetup: {
        hasGTM: false,
        hasGA4: true,
        hasMetaPixel: false,
        hasGoogleAds: false,
        propertyType: 'cms',
      },
      inputs: {
        landingUrl: 'https://example.com',
        conversionUrl: 'https://example.com/thanks',
        platforms: ['google-ads'],
        conversionType: 'purchase',
      },
    }
    useStore.getState().setValidatorResults(results)
    expect(useStore.getState().validatorResults).toEqual(results)
  })

  it('overwrites previously stored results', () => {
    const first: ValidatorResults = {
      score: 40,
      criticalIssues: [],
      warnings: [],
      passing: [],
      detectedSetup: { hasGTM: false, hasGA4: false, hasMetaPixel: false, hasGoogleAds: false, propertyType: 'spa' },
      inputs: { landingUrl: 'https://a.com', conversionUrl: 'https://a.com/ty', platforms: [], conversionType: 'lead' },
    }
    const second = { ...first, score: 90 }
    useStore.getState().setValidatorResults(first)
    useStore.getState().setValidatorResults(second)
    expect(useStore.getState().validatorResults?.score).toBe(90)
  })
})

// ─── getActiveProject ─────────────────────────────────────────────────────────

describe('getActiveProject', () => {
  it('returns undefined when there are no projects', () => {
    expect(useStore.getState().getActiveProject()).toBeUndefined()
  })

  it('returns undefined when activeProjectId is null', () => {
    useStore.setState({ projects: [makeProject()], activeProjectId: null })
    expect(useStore.getState().getActiveProject()).toBeUndefined()
  })

  it('returns undefined when activeProjectId does not match any project', () => {
    useStore.setState({ projects: [makeProject({ id: 'p-1' })], activeProjectId: 'p-99' })
    expect(useStore.getState().getActiveProject()).toBeUndefined()
  })

  it('returns the matching project when activeProjectId is set', () => {
    const project = makeProject({ id: 'p-1' })
    useStore.setState({ projects: [project], activeProjectId: 'p-1' })
    expect(useStore.getState().getActiveProject()).toEqual(project)
  })

  it('returns the correct project when multiple projects exist', () => {
    const p1 = makeProject({ id: 'p-1', clientName: 'Alpha' })
    const p2 = makeProject({ id: 'p-2', clientName: 'Beta' })
    useStore.setState({ projects: [p1, p2], activeProjectId: 'p-2' })
    expect(useStore.getState().getActiveProject()?.clientName).toBe('Beta')
  })
})

// ─── deleteProject (local state) ─────────────────────────────────────────────

describe('deleteProject', () => {
  it('removes the project from the projects list', async () => {
    useStore.setState({ projects: [makeProject({ id: 'p-1' })] })
    await useStore.getState().deleteProject('p-1')
    expect(useStore.getState().projects).toHaveLength(0)
  })

  it('clears activeProjectId when the active project is deleted', async () => {
    useStore.setState({ projects: [makeProject({ id: 'p-1' })], activeProjectId: 'p-1' })
    await useStore.getState().deleteProject('p-1')
    expect(useStore.getState().activeProjectId).toBeNull()
  })

  it('preserves activeProjectId when a different project is deleted', async () => {
    const p1 = makeProject({ id: 'p-1' })
    const p2 = makeProject({ id: 'p-2' })
    useStore.setState({ projects: [p1, p2], activeProjectId: 'p-1' })
    await useStore.getState().deleteProject('p-2')
    expect(useStore.getState().activeProjectId).toBe('p-1')
    expect(useStore.getState().projects).toHaveLength(1)
  })

  it('leaves other projects intact', async () => {
    const p1 = makeProject({ id: 'p-1', clientName: 'Alpha' })
    const p2 = makeProject({ id: 'p-2', clientName: 'Beta' })
    useStore.setState({ projects: [p1, p2] })
    await useStore.getState().deleteProject('p-1')
    expect(useStore.getState().projects[0].clientName).toBe('Beta')
  })
})

// ─── updateProject (local state) ─────────────────────────────────────────────

describe('updateProject', () => {
  it('applies the given updates to the matching project', async () => {
    useStore.setState({ projects: [makeProject({ id: 'p-1', clientName: 'Old Name' })] })
    await useStore.getState().updateProject('p-1', { clientName: 'New Name', status: 'in-progress' })
    const updated = useStore.getState().projects[0]
    expect(updated.clientName).toBe('New Name')
    expect(updated.status).toBe('in-progress')
  })

  it('refreshes updatedAt on the modified project', async () => {
    const original = makeProject({ id: 'p-1', updatedAt: new Date('2024-01-01') })
    useStore.setState({ projects: [original] })
    await useStore.getState().updateProject('p-1', { clientName: 'Changed' })
    const updated = useStore.getState().projects[0]
    expect(updated.updatedAt.getTime()).toBeGreaterThan(original.updatedAt.getTime())
  })

  it('does not affect other projects', async () => {
    const p1 = makeProject({ id: 'p-1', clientName: 'Alpha' })
    const p2 = makeProject({ id: 'p-2', clientName: 'Beta' })
    useStore.setState({ projects: [p1, p2] })
    await useStore.getState().updateProject('p-1', { clientName: 'Alpha Updated' })
    expect(useStore.getState().projects[1].clientName).toBe('Beta')
  })
})
