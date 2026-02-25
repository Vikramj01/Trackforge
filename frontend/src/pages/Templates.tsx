import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Zap,
  Target,
  ArrowRight,
  Activity,
  Tag,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { JOURNEY_TEMPLATES } from '../data/journeyTemplates';
import type { JourneyTemplate } from '../data/journeyTemplates';

// ─── Category config ──────────────────────────────────────────────────────────

type Category = 'all' | 'ecommerce' | 'saas' | 'leadgen';

const CATEGORIES: { id: Category; label: string; icon: typeof ShoppingCart }[] = [
  { id: 'all',       label: 'All Templates', icon: FileText },
  { id: 'ecommerce', label: 'Ecommerce',     icon: ShoppingCart },
  { id: 'saas',      label: 'SaaS',          icon: Zap },
  { id: 'leadgen',   label: 'Lead Gen',      icon: Target },
];

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  ecommerce: { bg: 'rgba(251,191,36,0.1)',  color: '#FBBF24' },
  saas:      { bg: 'rgba(11,191,170,0.1)',  color: '#0BBFAA' },
  leadgen:   { bg: 'rgba(168,85,247,0.1)',  color: '#A855F7' },
};

const EVENT_TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  page_view:   { bg: 'rgba(122,133,153,0.1)', color: '#7A8599' },
  user_action: { bg: 'rgba(11,191,170,0.1)',  color: '#0BBFAA' },
  success:     { bg: 'rgba(34,197,94,0.1)',   color: '#22C55E' },
  error:       { bg: 'rgba(248,113,113,0.1)', color: '#F87171' },
};

const CONVERSION_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  primary:   { bg: 'rgba(11,191,170,0.15)',  color: '#0BBFAA',  label: 'Primary Conversion' },
  secondary: { bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24',  label: 'Secondary Conversion' },
  none:      { bg: 'rgba(122,133,153,0.08)', color: '#7A8599',  label: 'Micro-event' },
};

// ─── Template card ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onStartProject,
}: {
  template: JourneyTemplate;
  onStartProject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const catStyle = CATEGORY_STYLES[template.category] ?? { bg: 'rgba(122,133,153,0.1)', color: '#7A8599' };

  // Generate a preview journey to show events
  const previewJourney = template.createJourney();

  return (
    <Card className="flex flex-col gap-0 overflow-hidden p-0">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded capitalize"
                style={{ background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.color}22` }}
              >
                {template.category}
              </span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#7A8599', border: '1px solid #1A1E28' }}
              >
                {template.eventCount} events
              </span>
            </div>
            <h3
              className="text-base font-semibold text-text-primary"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {template.name}
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">{template.description}</p>
          </div>
        </div>

        {/* Business model tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <Tag size={11} className="text-text-muted" />
          {template.businessModels.map((bm) => (
            <span
              key={bm}
              className="text-xs text-text-muted capitalize px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A1E28' }}
            >
              {bm}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={onStartProject} className="flex-1 justify-center text-xs py-2">
            <Activity size={13} />
            Start Project with Template
          </Button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A1E28' }}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            {expanded ? 'Hide' : 'Preview'} events
          </button>
        </div>
      </div>

      {/* Expanded event list */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1A1E28' }}>
          <div className="px-5 py-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Event Sequence
            </p>
            <div className="space-y-2">
              {previewJourney.events.map((event, idx) => {
                const typeStyle = EVENT_TYPE_STYLES[event.eventType] ?? EVENT_TYPE_STYLES.user_action;
                const convStyle = CONVERSION_STYLES[event.conversionType];

                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 py-2.5 px-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A1E28' }}
                  >
                    {/* Step number */}
                    <div
                      className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        width: 22,
                        height: 22,
                        background: 'rgba(11,191,170,0.1)',
                        color: '#0BBFAA',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code
                          className="text-xs font-mono"
                          style={{ color: '#E8ECF2', fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {event.canonicalName}
                        </code>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded capitalize"
                          style={{ background: typeStyle.bg, color: typeStyle.color, fontSize: 10 }}
                        >
                          {event.eventType.replace('_', ' ')}
                        </span>
                        {event.conversionType !== 'none' && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: convStyle.bg, color: convStyle.color, fontSize: 10 }}
                          >
                            {convStyle.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{event.description}</p>
                      {event.parameters.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {event.parameters.slice(0, 5).map((param) => (
                            <span
                              key={param.id}
                              className="text-xs px-1.5 py-0.5 rounded font-mono"
                              style={{
                                background: param.required
                                  ? 'rgba(11,191,170,0.08)'
                                  : 'rgba(255,255,255,0.04)',
                                color: param.required ? '#0BBFAA' : '#7A8599',
                                border: `1px solid ${param.required ? 'rgba(11,191,170,0.2)' : '#1A1E28'}`,
                                fontSize: 10,
                                fontFamily: 'JetBrains Mono, monospace',
                              }}
                            >
                              {param.name}
                            </span>
                          ))}
                          {event.parameters.length > 5 && (
                            <span className="text-xs text-text-muted" style={{ fontSize: 10 }}>
                              +{event.parameters.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {event.route && (
                      <span
                        className="text-xs font-mono shrink-0"
                        style={{ color: '#7A8599', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}
                      >
                        {event.route}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function Templates() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filtered =
    activeCategory === 'all'
      ? JOURNEY_TEMPLATES
      : JOURNEY_TEMPLATES.filter((t) => t.category === activeCategory);

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
            Templates
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Pre-built journey templates for common business models. Preview events, then start a
            project.
          </p>
        </div>
        <Button onClick={() => navigate('/validator')} className="shrink-0" variant="secondary">
          <Activity size={16} />
          New Project
          <ArrowRight size={16} />
        </Button>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count =
            cat.id === 'all'
              ? JOURNEY_TEMPLATES.length
              : JOURNEY_TEMPLATES.filter((t) => t.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isActive ? 'rgba(11,191,170,0.1)' : 'rgba(255,255,255,0.04)',
                border: isActive ? '1px solid rgba(11,191,170,0.25)' : '1px solid #1A1E28',
                color: isActive ? '#0BBFAA' : '#7A8599',
              }}
            >
              <cat.icon size={14} />
              {cat.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  background: isActive ? 'rgba(11,191,170,0.2)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#0BBFAA' : '#7A8599',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-lg mb-6"
        style={{ background: 'rgba(11,191,170,0.06)', border: '1px solid rgba(11,191,170,0.15)' }}
      >
        <FileText size={15} style={{ color: '#0BBFAA', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs text-text-muted leading-relaxed">
          Templates are automatically applied in Phase 2 (Journey Designer) based on your business
          model. Use "Start Project with Template" to kick off the wizard — the template will be
          pre-loaded when you reach the journey step.
        </p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onStartProject={() => navigate('/validator')}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">No templates in this category.</p>
        </div>
      )}
    </div>
  );
}
