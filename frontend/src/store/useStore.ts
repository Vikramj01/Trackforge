import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Project, AppStore } from '../types';

// ── DB row → Project ──────────────────────────────────────────────────────────
function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    clientId: row.user_id as string,
    clientName: row.client_name as string,
    currentPhase: row.current_phase as Project['currentPhase'],
    status: row.status as Project['status'],
    discovery: row.discovery as Project['discovery'],
    journeys: row.journeys as Project['journeys'],
    conversions: row.conversions as Project['conversions'],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

// ── Project → DB row (partial, for updates) ───────────────────────────────────
function projectToRow(updates: Partial<Project>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.clientName !== undefined) row.client_name = updates.clientName;
  if (updates.currentPhase !== undefined) row.current_phase = updates.currentPhase;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.discovery !== undefined) row.discovery = updates.discovery;
  if (updates.journeys !== undefined) row.journeys = updates.journeys;
  if (updates.conversions !== undefined) row.conversions = updates.conversions;
  return row;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create<AppStore>()((set, get) => ({
  projects: [],
  activeProjectId: null,
  loading: false,
  validatorResults: null,

  loadProjects: async (userId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      set({ projects: data.map(rowToProject), loading: false });
    } else {
      set({ loading: false });
    }
  },

  addProject: async (project: Project) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('projects').insert({
      id: project.id,
      user_id: user.id,
      client_name: project.clientName,
      current_phase: project.currentPhase,
      status: project.status,
      discovery: project.discovery ?? null,
      journeys: project.journeys ?? null,
      conversions: project.conversions ?? null,
    });

    if (!error) {
      set((state) => ({ projects: [project, ...state.projects] }));
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    const dbRow = projectToRow(updates);
    await supabase.from('projects').update(dbRow).eq('id', id);

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    }));
  },

  deleteProject: async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
    }));
  },

  setActiveProject: (id: string | null) => set({ activeProjectId: id }),

  setValidatorResults: (results) => set({ validatorResults: results }),

  getActiveProject: () => {
    const { projects, activeProjectId } = get();
    return projects.find((p) => p.id === activeProjectId);
  },
}));
