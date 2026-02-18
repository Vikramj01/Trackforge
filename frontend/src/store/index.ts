import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Client, Project, Template, ActivityItem, ScanResults, ScannedElement } from '../types';
import { mockClients, mockProjects, mockTemplates, mockActivity } from '../data/mockData';

interface AppState {
  clients: Client[];
  projects: Project[];
  templates: Template[];
  activity: ActivityItem[];
  activeProjectId: string | null;

  // Client actions
  addClient: (client: Omit<Client, 'id' | 'projectCount' | 'createdAt' | 'updatedAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Project actions
  createProject: (clientId: string, clientName: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;

  // Scan actions
  saveScanResults: (projectId: string, results: ScanResults, selectedElements: string[], customizations: Record<string, ScannedElement['customizations']>) => void;

  // Activity
  addActivity: (item: Omit<ActivityItem, 'id'>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: mockClients,
      projects: mockProjects,
      templates: mockTemplates,
      activity: mockActivity,
      activeProjectId: null,

      addClient: (clientData) => {
        const client: Client = {
          ...clientData,
          id: `cli-${Date.now()}`,
          projectCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ clients: [...state.clients, client] }));
        get().addActivity({
          type: 'project_created',
          description: 'New client added',
          clientName: client.name,
          timestamp: new Date().toISOString(),
        });
        return client;
      },

      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          projects: state.projects.filter((p) => p.clientId !== id),
        }));
      },

      createProject: (clientId, clientName) => {
        const project: Project = {
          id: `proj-${Date.now()}`,
          clientId,
          clientName,
          currentPhase: 1,
          status: 'draft',
          discovery: {
            clientName,
            industry: '',
            website: '',
            goals: [],
            techStack: [],
            notes: '',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [...state.projects, project],
          clients: state.clients.map((c) =>
            c.id === clientId ? { ...c, projectCount: c.projectCount + 1 } : c
          ),
          activeProjectId: project.id,
        }));
        get().addActivity({
          type: 'project_created',
          description: 'New project started',
          clientName,
          timestamp: new Date().toISOString(),
        });
        return project;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          clients: project
            ? state.clients.map((c) =>
                c.id === project.clientId
                  ? { ...c, projectCount: Math.max(0, c.projectCount - 1) }
                  : c
              )
            : state.clients,
        }));
      },

      setActiveProject: (id) => set({ activeProjectId: id }),

      saveScanResults: (projectId, results, selectedElements, customizations) => {
        const totalSelected = selectedElements.length;
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  currentPhase: 3,
                  status: 'in-progress',
                  siteScan: {
                    ...results,
                    selectedElements,
                    customizations,
                    selectedCount: totalSelected,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
        const project = get().projects.find((p) => p.id === projectId);
        if (project) {
          get().addActivity({
            type: 'scan_completed',
            description: `Site scan completed — ${results.totalCount} elements found`,
            clientName: project.clientName,
            timestamp: new Date().toISOString(),
          });
        }
      },

      addActivity: (item) => {
        const activity: ActivityItem = { ...item, id: `act-${Date.now()}` };
        set((state) => ({ activity: [activity, ...state.activity].slice(0, 20) }));
      },
    }),
    {
      name: 'atlas-trackforge',
    }
  )
);
