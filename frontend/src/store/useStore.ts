import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, AppStore } from '../types';

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      addProject: (project: Project) =>
        set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (id: string, updates: Partial<Project>) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        })),

      setActiveProject: (id: string | null) =>
        set({ activeProjectId: id }),

      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find((p) => p.id === activeProjectId);
      },
    }),
    {
      name: 'atlas-storage',
    }
  )
);
