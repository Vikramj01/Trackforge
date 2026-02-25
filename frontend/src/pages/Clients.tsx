import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  ArrowRight,
  Globe,
  FolderOpen,
  Trash2,
  ChevronDown,
  ChevronRight,
  Activity,
  Search,
  Building2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import type { Project } from '../types';

// ─── Derived "client" type ────────────────────────────────────────────────────

interface ClientGroup {
  name: string;
  website?: string;
  industry?: string;
  projects: Project[];
  latestPhase: number;
  latestStatus: Project['status'];
  updatedAt: Date;
}

function groupByClient(projects: Project[]): ClientGroup[] {
  const map = new Map<string, ClientGroup>();

  for (const project of projects) {
    const key = project.clientName.toLowerCase().trim();
    const existing = map.get(key);

    if (existing) {
      existing.projects.push(project);
      if (project.updatedAt > existing.updatedAt) {
        existing.latestPhase = project.currentPhase;
        existing.latestStatus = project.status;
        existing.updatedAt = project.updatedAt;
        if (project.discovery?.website) existing.website = project.discovery.website;
        if (project.discovery?.industry) existing.industry = project.discovery.industry;
      }
    } else {
      map.set(key, {
        name: project.clientName,
        website: project.discovery?.website,
        industry: project.discovery?.industry,
        projects: [project],
        latestPhase: project.currentPhase,
        latestStatus: project.status,
        updatedAt: project.updatedAt,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Project['status'], { bg: string; color: string; label: string }> = {
  draft:             { bg: 'rgba(122,133,153,0.12)', color: '#7A8599',  label: 'Draft' },
  'in-progress':     { bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24',  label: 'In Progress' },
  'ready-to-deploy': { bg: 'rgba(11,191,170,0.12)',  color: '#0BBFAA',  label: 'Ready' },
  deployed:          { bg: 'rgba(34,197,94,0.12)',   color: '#22C55E',  label: 'Deployed' },
};

function StatusBadge({ status }: { status: Project['status'] }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-md"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}
    >
      {s.label}
    </span>
  );
}

// ─── Phase dots ───────────────────────────────────────────────────────────────

function PhaseDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: n <= current ? '#0BBFAA' : '#1A1E28',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PHASE_ROUTE: Record<number, string> = {
  1: '/discovery',
  2: '/journey',
  3: '/orchestration',
  4: '/export',
};

export function Clients() {
  const navigate = useNavigate();
  const { projects, loadProjects, deleteProject, setActiveProject } = useStore();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [confirmDeleteClient, setConfirmDeleteClient] = useState<string | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadProjects(user.id);
  }, [user, loadProjects]);

  const clients = groupByClient(projects);

  const filtered = search.trim()
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.website?.toLowerCase().includes(search.toLowerCase()) ||
        c.industry?.toLowerCase().includes(search.toLowerCase())
      )
    : clients;

  async function handleDeleteClient(clientName: string) {
    const clientProjects = projects.filter(
      (p) => p.clientName.toLowerCase().trim() === clientName.toLowerCase().trim()
    );
    for (const p of clientProjects) {
      await deleteProject(p.id);
    }
    setConfirmDeleteClient(null);
    if (expandedClient === clientName) setExpandedClient(null);
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '32px',
              letterSpacing: '-0.01em',
              color: '#E8ECF2',
              margin: 0,
            }}
          >
            Clients
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            {clients.length === 0
              ? 'No clients yet — start by creating a new project.'
              : `${clients.length} client${clients.length !== 1 ? 's' : ''} · ${projects.length} project${projects.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <Button onClick={() => navigate('/validator')} className="shrink-0">
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative mb-6">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-text-primary placeholder-text-muted"
            style={{ background: '#12161E', border: '1px solid #1A1E28', outline: 'none' }}
            onFocus={(e) => (e.target.style.borderColor = '#0BBFAA')}
            onBlur={(e) => (e.target.style.borderColor = '#1A1E28')}
          />
        </div>
      )}

      {/* Empty state */}
      {clients.length === 0 && (
        <Card className="text-center py-16">
          <div
            className="mx-auto mb-4 flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              background: 'rgba(11,191,170,0.1)',
              border: '1px solid rgba(11,191,170,0.2)',
            }}
          >
            <Users size={24} style={{ color: '#0BBFAA' }} />
          </div>
          <p
            className="text-base font-semibold text-text-primary mb-2"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            No clients yet
          </p>
          <p className="text-sm text-text-muted mb-6 max-w-xs mx-auto">
            Create your first project and your clients will appear here automatically.
          </p>
          <Button onClick={() => navigate('/validator')}>
            <Activity size={16} />
            Start First Project
          </Button>
        </Card>
      )}

      {/* Client list */}
      <div className="space-y-3">
        {filtered.map((client) => {
          const isExpanded = expandedClient === client.name;
          const isConfirmingDelete = confirmDeleteClient === client.name;

          return (
            <div key={client.name}>
              <Card
                className="cursor-pointer group"
                onClick={() => {
                  if (isConfirmingDelete) return;
                  setExpandedClient(isExpanded ? null : client.name);
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="shrink-0 flex items-center justify-center rounded-lg"
                    style={{
                      width: 40,
                      height: 40,
                      background: 'rgba(11,191,170,0.08)',
                      border: '1px solid rgba(11,191,170,0.15)',
                    }}
                  >
                    <Building2 size={18} style={{ color: '#0BBFAA' }} />
                  </div>

                  {/* Client info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="text-sm font-semibold text-text-primary"
                        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {client.name}
                      </p>
                      <StatusBadge status={client.latestStatus} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {client.website && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Globe size={11} />
                          {client.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      )}
                      {client.industry && (
                        <span className="text-xs text-text-muted capitalize">{client.industry}</span>
                      )}
                      <span className="text-xs text-text-muted">
                        <FolderOpen size={11} className="inline mr-1" />
                        {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
                      </span>
                      <PhaseDots current={client.latestPhase} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isConfirmingDelete ? (
                      <>
                        <span className="text-xs text-text-muted mr-1">Delete all?</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClient(client.name);
                          }}
                          className="text-xs font-semibold px-2.5 py-1 rounded"
                          style={{
                            color: '#f87171',
                            background: 'rgba(248,113,113,0.1)',
                            border: '1px solid rgba(248,113,113,0.2)',
                          }}
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteClient(null);
                          }}
                          className="text-xs font-medium px-2.5 py-1 rounded text-text-muted ml-1"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A1E28' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteClient(client.name);
                          }}
                          className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-400"
                          title="Delete client and all projects"
                        >
                          <Trash2 size={14} />
                        </button>
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-text-muted ml-1" />
                        ) : (
                          <ChevronRight size={16} className="text-text-muted ml-1" />
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded: projects */}
                {isExpanded && (
                  <div
                    className="mt-4 pt-4 space-y-2"
                    style={{ borderTop: '1px solid #1A1E28' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {client.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group/proj transition-colors"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A1E28' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = 'rgba(11,191,170,0.2)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1A1E28')}
                        onClick={() => {
                          if (confirmDeleteProject === project.id) return;
                          setActiveProject(project.id);
                          navigate(PHASE_ROUTE[project.currentPhase] ?? '/discovery');
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">
                              {project.clientName}
                            </span>
                            <span className="text-xs text-text-muted">Phase {project.currentPhase}</span>
                            <StatusBadge status={project.status} />
                          </div>
                          {project.discovery?.website && (
                            <p className="text-xs text-text-muted mt-0.5">
                              {project.discovery.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {confirmDeleteProject === project.id ? (
                            <>
                              <span className="text-xs text-text-muted mr-1">Delete?</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteProject(project.id);
                                  setConfirmDeleteProject(null);
                                }}
                                className="text-xs font-semibold px-2 py-0.5 rounded"
                                style={{
                                  color: '#f87171',
                                  background: 'rgba(248,113,113,0.1)',
                                  border: '1px solid rgba(248,113,113,0.2)',
                                }}
                              >
                                Yes
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteProject(null);
                                }}
                                className="text-xs font-medium px-2 py-0.5 rounded text-text-muted ml-1"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A1E28' }}
                              >
                                No
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteProject(project.id);
                                }}
                                className="p-1 rounded opacity-0 group-hover/proj:opacity-100 transition-opacity text-text-muted hover:text-red-400"
                              >
                                <Trash2 size={12} />
                              </button>
                              <ArrowRight size={14} className="text-text-muted" />
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add another project for this client */}
                    <button
                      onClick={() => navigate('/validator')}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
                      style={{ border: '1px dashed #1A1E28' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(11,191,170,0.3)';
                        e.currentTarget.style.color = '#0BBFAA';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#1A1E28';
                        e.currentTarget.style.color = '';
                      }}
                    >
                      <Plus size={12} />
                      Add another project for {client.name}
                    </button>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {/* No search results */}
      {clients.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">No clients match "{search}"</p>
          <button
            onClick={() => setSearch('')}
            className="text-xs text-atlas-teal mt-2 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
