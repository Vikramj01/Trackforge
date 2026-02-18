import { useNavigate } from 'react-router-dom';
import {
  Users,
  FolderOpen,
  FileText,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  Scan,
  Package,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../store';

const phaseLabel: Record<number, string> = {
  1: 'Discovery',
  2: 'Site Scan',
  3: 'Template',
  4: 'Deploy',
};

const statusStyle: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'rgba(122,133,153,0.15)', color: '#7A8599' },
  'in-progress': { bg: 'rgba(234,179,8,0.15)', color: '#eab308' },
  deployed: { bg: 'rgba(11,191,170,0.15)', color: '#0BBFAA' },
  archived: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
};

const activityIcon: Record<string, React.ReactNode> = {
  project_created: <FolderOpen size={14} color="#0BBFAA" />,
  scan_completed: <Scan size={14} color="#eab308" />,
  template_selected: <Package size={14} color="#7A8599" />,
  deployed: <Rocket size={14} color="#0BBFAA" />,
  project_updated: <Clock size={14} color="#7A8599" />,
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { clients, projects, templates, activity } = useStore();

  const deployed = projects.filter((p) => p.status === 'deployed').length;
  const inProgress = projects.filter((p) => p.status === 'in-progress').length;

  const stats = [
    {
      label: 'Total Clients',
      value: clients.length,
      icon: <Users size={20} color="#0BBFAA" />,
      change: '+2 this month',
    },
    {
      label: 'Active Projects',
      value: inProgress,
      icon: <FolderOpen size={20} color="#eab308" />,
      change: `${deployed} deployed`,
    },
    {
      label: 'Templates',
      value: templates.length,
      icon: <FileText size={20} color="#7A8599" />,
      change: '2 added recently',
    },
    {
      label: 'Deployments',
      value: deployed,
      icon: <TrendingUp size={20} color="#0BBFAA" />,
      change: 'All verified',
    },
  ];

  const handleNewProject = () => {
    navigate('/wizard');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', animation: 'fade-in 0.3s ease-out' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: '1.75rem',
              color: '#E8ECF2',
              margin: 0,
              marginBottom: '0.375rem',
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: '#7A8599', fontSize: '0.9rem', margin: 0 }}>
            Manage your clients and tracking deployments.
          </p>
        </div>
        <button
          onClick={handleNewProject}
          style={{
            background: 'linear-gradient(135deg, #0BBFAA, #099d8b)',
            color: '#080B12',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#0D1117',
              border: '1px solid #1A1E28',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.875rem',
              }}
            >
              <span style={{ color: '#7A8599', fontSize: '0.8125rem', fontWeight: 500 }}>
                {stat.label}
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#12161E',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stat.icon}
              </div>
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#E8ECF2',
                fontFamily: "'Bricolage Grotesque', sans-serif",
                marginBottom: '0.25rem',
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7A8599' }}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Active Projects */}
        <div
          style={{
            backgroundColor: '#0D1117',
            border: '1px solid #1A1E28',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #1A1E28',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#E8ECF2',
              }}
            >
              Active Projects
            </h2>
            <button
              onClick={() => navigate('/clients')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0BBFAA',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#7A8599',
              }}
            >
              <FolderOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No projects yet.</p>
              <button
                onClick={handleNewProject}
                style={{
                  marginTop: '1rem',
                  background: 'linear-gradient(135deg, #0BBFAA, #099d8b)',
                  color: '#080B12',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Create First Project
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Client', 'Phase', 'Status', 'Updated', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '0.75rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        color: '#7A8599',
                        fontWeight: 500,
                        borderBottom: '1px solid #1A1E28',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const style = statusStyle[project.status];
                  return (
                    <tr
                      key={project.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/wizard/${project.id}`)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#12161E')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <td
                        style={{
                          padding: '1rem 1.5rem',
                          fontSize: '0.875rem',
                          color: '#E8ECF2',
                          fontWeight: 500,
                        }}
                      >
                        {project.clientName}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#7A8599',
                            }}
                          >
                            Phase {project.currentPhase}:
                          </span>
                          <span
                            style={{
                              fontSize: '0.8125rem',
                              color: '#E8ECF2',
                            }}
                          >
                            {phaseLabel[project.currentPhase]}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.2rem 0.625rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            backgroundColor: style.bg,
                            color: style.color,
                            textTransform: 'capitalize',
                          }}
                        >
                          {project.status === 'deployed' && (
                            <CheckCircle size={12} style={{ marginRight: '0.25rem' }} />
                          )}
                          {project.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '1rem 1.5rem',
                          fontSize: '0.8125rem',
                          color: '#7A8599',
                        }}
                      >
                        {timeAgo(project.updatedAt)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <ChevronRight size={16} color="#7A8599" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Actions */}
          <div
            style={{
              backgroundColor: '#0D1117',
              border: '1px solid #1A1E28',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '1rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#E8ECF2',
              }}
            >
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'New Project', icon: <Plus size={15} />, action: () => navigate('/wizard') },
                { label: 'Browse Templates', icon: <FileText size={15} />, action: () => navigate('/templates') },
                { label: 'View All Clients', icon: <Users size={15} />, action: () => navigate('/clients') },
              ].map(({ label, icon, action }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid #1A1E28',
                    borderRadius: '8px',
                    padding: '0.625rem 0.875rem',
                    color: '#E8ECF2',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0BBFAA';
                    e.currentTarget.style.color = '#0BBFAA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1A1E28';
                    e.currentTarget.style.color = '#E8ECF2';
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            style={{
              backgroundColor: '#0D1117',
              border: '1px solid #1A1E28',
              borderRadius: '8px',
              padding: '1.25rem',
              flex: 1,
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '1rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#E8ECF2',
              }}
            >
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {activity.slice(0, 8).map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#12161E',
                      border: '1px solid #1A1E28',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}
                  >
                    {activityIcon[item.type] ?? <Clock size={14} color="#7A8599" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', color: '#E8ECF2', fontWeight: 500 }}>
                      {item.clientName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#7A8599' }}>{item.description}</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A8599', marginTop: '0.125rem' }}>
                      {timeAgo(item.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
