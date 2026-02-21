import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Server, Globe, Shield, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useStore } from '../store/useStore';

const STATS = [
  { label: 'Active Projects', value: '0', change: null },
  { label: 'Dual-Tracking Rate', value: '—', change: null },
  { label: 'Avg Coverage Gain', value: '—', change: null },
  { label: 'Exports Generated', value: '0', change: null },
];

const FEATURES = [
  {
    icon: Globe,
    title: 'Client-Side Tracking',
    description: 'Browser → GTM → GA4, Meta Pixel. Captures user actions in the browser.',
  },
  {
    icon: Server,
    title: 'Server-Side Tracking',
    description: 'Server → sGTM → GA4 MP, Meta CAPI. Bypasses ad blockers & iOS ITP.',
    highlight: true,
  },
  {
    icon: Shield,
    title: 'Automatic Deduplication',
    description: 'Same event_id on both paths. One conversion counted, never two.',
  },
  {
    icon: TrendingUp,
    title: '20-40% More Conversions',
    description: 'Recover signals lost to ad blockers, ITP, and browser privacy features.',
    highlight: true,
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useStore();

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
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
            Conversion Signal Dashboard
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Design dual-tracking architectures. Capture every conversion — client and server.
          </p>
        </div>
        <Button
          onClick={() => navigate('/discovery')}
          className="shrink-0"
        >
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <p
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 700,
                fontSize: '28px',
                color: '#E8ECF2',
                lineHeight: 1,
                margin: 0,
              }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-text-muted mt-2 font-medium">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Empty state or project list */}
      {projects.length === 0 ? (
        <div className="mb-10">
          <Card className="border-dashed text-center py-16">
            <div
              className="w-14 h-14 rounded-xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background: 'rgba(11, 191, 170, 0.1)',
                border: '1px solid rgba(11, 191, 170, 0.2)',
              }}
            >
              <Plus size={24} className="text-atlas-teal" />
            </div>
            <h2
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 700,
                fontSize: '20px',
                color: '#E8ECF2',
                margin: 0,
              }}
            >
              No projects yet
            </h2>
            <p className="text-text-muted text-sm mt-2 mb-6 max-w-sm mx-auto">
              Create your first tracking architecture. Start by defining client context and
              enabling dual-tracking.
            </p>
            <Button onClick={() => navigate('/discovery')}>
              <Plus size={16} />
              Create First Project
            </Button>
          </Card>
        </div>
      ) : (
        <div className="mb-10">
          <h2
            className="text-base font-semibold text-text-primary mb-4"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Recent Projects
          </h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                hover
                onClick={() => navigate(`/discovery/${project.id}`)}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">{project.clientName}</p>
                  <p className="text-xs text-text-muted mt-0.5 capitalize">
                    Phase {project.currentPhase} · {project.status}
                  </p>
                </div>
                <ArrowRight size={16} className="text-text-muted" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              color: '#E8ECF2',
              margin: 0,
            }}
          >
            How Atlas Works
          </h2>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-md"
            style={{
              background: 'rgba(11, 191, 170, 0.1)',
              color: '#0BBFAA',
              border: '1px solid rgba(11, 191, 170, 0.2)',
              letterSpacing: '0.05em',
            }}
          >
            DUAL-TRACKING
          </span>
        </div>

        {/* Architecture diagram */}
        <Card className="mb-6 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm font-mono">
            <div
              className="px-4 py-2.5 rounded-lg text-center"
              style={{ background: '#12161E', border: '1px solid #1A1E28' }}
            >
              <p className="text-text-muted text-xs mb-1">User Action</p>
              <p className="text-text-primary font-semibold">purchase</p>
            </div>

            <div className="hidden sm:flex flex-col gap-3 flex-1 items-stretch">
              {/* Client path */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: '#1A1E28' }} />
                <span className="text-xs text-text-muted px-2">Client</span>
                <div className="h-px flex-1" style={{ background: '#1A1E28' }} />
                <span className="text-xs text-text-muted">Browser → GTM → GA4, Meta Pixel</span>
              </div>
              {/* Server path */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: '#0BBFAA', opacity: 0.5 }} />
                <span
                  className="text-xs px-2 font-semibold"
                  style={{ color: '#0BBFAA' }}
                >
                  Server
                </span>
                <div className="h-px flex-1" style={{ background: '#0BBFAA', opacity: 0.5 }} />
                <span className="text-xs text-text-muted">
                  Server → sGTM → GA4 MP, CAPI, Ads
                </span>
              </div>
            </div>

            <div className="sm:hidden text-text-muted text-xs text-center">
              <div>Client: Browser → GTM → GA4, Pixel</div>
              <div className="text-atlas-teal mt-1">Server: Server → sGTM → GA4 MP, CAPI</div>
            </div>

            <div
              className="px-4 py-2.5 rounded-lg text-center"
              style={{
                background: 'rgba(11, 191, 170, 0.08)',
                border: '1px solid rgba(11, 191, 170, 0.25)',
              }}
            >
              <p className="text-xs mb-1" style={{ color: '#0BBFAA' }}>Deduplicated</p>
              <p className="text-text-primary font-semibold text-xs">1 conversion</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className={feature.highlight ? 'border-atlas-teal/20' : ''}>
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{
                    background: feature.highlight
                      ? 'rgba(11, 191, 170, 0.1)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${feature.highlight ? 'rgba(11,191,170,0.2)' : '#1A1E28'}`,
                  }}
                >
                  <feature.icon
                    size={18}
                    style={{ color: feature.highlight ? '#0BBFAA' : '#7A8599' }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-text-primary"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {feature.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => navigate('/discovery')}>
            Start Phase 1: Discovery
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
