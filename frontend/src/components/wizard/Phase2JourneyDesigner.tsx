import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Edit3,
  X,
  ChevronRight,
  Info,
  Map,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useStore } from '../../store/useStore';
import { JOURNEY_TEMPLATES, getDefaultJourneysForBusinessModel } from '../../data/journeyTemplates';
import type { Journey, JourneyEvent, EventParameter, EventType, EventCategory, ConversionType } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES: { value: EventType; label: string; color: string; bg: string }[] = [
  { value: 'page_view',   label: 'Page View',   color: '#7A8599', bg: 'rgba(122,133,153,0.1)' },
  { value: 'user_action', label: 'User Action', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
  { value: 'success',     label: 'Success',     color: '#0BBFAA', bg: 'rgba(11,191,170,0.1)' },
  { value: 'error',       label: 'Error',       color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
];

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'acquisition', label: 'Acquisition' },
  { value: 'activation',  label: 'Activation' },
  { value: 'revenue',     label: 'Revenue' },
  { value: 'retention',   label: 'Retention' },
];

const PARAM_TYPES: { value: EventParameter['type']; label: string }[] = [
  { value: 'string',  label: 'string' },
  { value: 'number',  label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'array',   label: 'array' },
];

const CONVERSION_OPTIONS: { value: ConversionType; label: string; desc: string }[] = [
  { value: 'none',      label: 'No',               desc: 'Not a conversion' },
  { value: 'primary',   label: 'Yes — Primary',    desc: 'Main business goal' },
  { value: 'secondary', label: 'Yes — Secondary',  desc: 'Supporting goal' },
];

const PHASES = [
  { n: 1, label: 'Discovery' },
  { n: 2, label: 'Journeys' },
  { n: 3, label: 'Orchestration' },
  { n: 4, label: 'Export' },
];

// ─── Phase Stepper ────────────────────────────────────────────────────────────

function PhaseStepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {PHASES.map((phase, i) => (
        <div key={phase.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
              style={{
                borderColor: phase.n === current ? '#0BBFAA' : phase.n < current ? '#0BBFAA' : '#1A1E28',
                background: phase.n === current ? 'rgba(11,191,170,0.1)' : phase.n < current ? '#0BBFAA' : '#12161E',
                color: phase.n < current ? '#080B12' : phase.n === current ? '#0BBFAA' : '#7A8599',
              }}
            >
              {phase.n < current ? <CheckCircle size={14} /> : phase.n}
            </div>
            <span
              className="text-xs mt-1.5 font-medium"
              style={{ color: phase.n === current ? '#0BBFAA' : '#7A8599', whiteSpace: 'nowrap' }}
            >
              {phase.label}
            </span>
          </div>
          {i < PHASES.length - 1 && (
            <div
              className="h-px w-12 sm:w-20 mb-5"
              style={{ background: phase.n < current ? '#0BBFAA' : '#1A1E28', opacity: 0.5 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: EventType }) {
  const t = EVENT_TYPES.find((e) => e.value === type)!;
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap"
      style={{ background: t.bg, color: t.color, border: `1px solid ${t.color}30` }}
    >
      {t.label}
    </span>
  );
}

// ─── Conversion Badge ─────────────────────────────────────────────────────────

function ConvBadge({ type }: { type: ConversionType }) {
  if (type === 'none') return null;
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap"
      style={
        type === 'primary'
          ? { background: 'rgba(11,191,170,0.15)', color: '#0BBFAA', border: '1px solid rgba(11,191,170,0.3)' }
          : { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }
      }
    >
      {type === 'primary' ? 'PRIMARY' : 'SECONDARY'}
    </span>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CatBadge({ cat }: { cat: EventCategory }) {
  return (
    <span className="text-xs text-text-muted capitalize">{cat}</span>
  );
}

// ─── Event Editor (inline expand) ────────────────────────────────────────────

interface EventEditorProps {
  draft: JourneyEvent;
  onChange: (draft: JourneyEvent) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EventEditor({ draft, onChange, onSave, onCancel }: EventEditorProps) {
  function set<K extends keyof JourneyEvent>(key: K, value: JourneyEvent[K]) {
    onChange({ ...draft, [key]: value });
  }

  function addParam() {
    onChange({
      ...draft,
      parameters: [...draft.parameters, { id: crypto.randomUUID(), name: '', type: 'string', required: false }],
    });
  }

  function updateParam(id: string, updates: Partial<EventParameter>) {
    onChange({
      ...draft,
      parameters: draft.parameters.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  }

  function removeParam(id: string) {
    onChange({ ...draft, parameters: draft.parameters.filter((p) => p.id !== id) });
  }

  return (
    <div
      className="rounded-lg border p-4 mt-1"
      style={{ background: 'rgba(11,191,170,0.03)', borderColor: 'rgba(11,191,170,0.2)' }}
    >
      {/* Row 1: Canonical + Display Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-1.5">
            Canonical Name <span className="text-atlas-teal">*</span>
          </label>
          <input
            className="w-full bg-input-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono placeholder-text-muted focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 transition-all"
            placeholder="e.g. add_to_cart"
            value={draft.canonicalName}
            onChange={(e) => set('canonicalName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-1.5">
            Display Name
          </label>
          <input
            className="w-full bg-input-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 transition-all"
            placeholder="e.g. Add to Cart"
            value={draft.displayName}
            onChange={(e) => set('displayName', e.target.value)}
          />
        </div>
      </div>

      {/* Row 2: Description */}
      <div className="mb-3">
        <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-1.5">
          Description
        </label>
        <input
          className="w-full bg-input-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 transition-all"
          placeholder="When is this event triggered?"
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      {/* Row 3: Event Type */}
      <div className="mb-3">
        <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-2">
          Event Type
        </label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((t) => {
            const active = draft.eventType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => set('eventType', t.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
                style={{
                  background: active ? t.bg : '#12161E',
                  borderColor: active ? t.color : '#1A1E28',
                  color: active ? t.color : '#7A8599',
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full border flex items-center justify-center"
                  style={{ borderColor: active ? t.color : '#7A8599' }}
                >
                  {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />}
                </div>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 4: Route + Category + Conversion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-1.5">
            Route / Context
          </label>
          <input
            className="w-full bg-input-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono placeholder-text-muted focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 transition-all"
            placeholder="/path/:param"
            value={draft.route || ''}
            onChange={(e) => set('route', e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-1.5">
            Category
          </label>
          <select
            className="w-full bg-input-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 transition-all appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8599' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              paddingRight: '32px',
            }}
            value={draft.category}
            onChange={(e) => set('category', e.target.value as EventCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-1.5">
            Conversion?
          </label>
          <select
            className="w-full bg-input-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 transition-all appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8599' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              paddingRight: '32px',
            }}
            value={draft.conversionType}
            onChange={(e) => set('conversionType', e.target.value as ConversionType)}
          >
            {CONVERSION_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 5: Parameters */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-text-primary">
            Parameters
          </label>
          <button
            type="button"
            onClick={addParam}
            className="flex items-center gap-1 text-xs font-medium text-atlas-teal hover:text-text-primary transition-colors"
          >
            <Plus size={12} /> Add Parameter
          </button>
        </div>

        {draft.parameters.length === 0 ? (
          <p className="text-xs text-text-muted italic">No parameters yet. Add parameters to define the data this event captures.</p>
        ) : (
          <div className="space-y-1.5">
            {/* Header row */}
            <div className="grid gap-2 px-2" style={{ gridTemplateColumns: '1fr 100px 80px 28px' }}>
              <span className="text-xs text-text-muted uppercase tracking-wider">Name</span>
              <span className="text-xs text-text-muted uppercase tracking-wider">Type</span>
              <span className="text-xs text-text-muted uppercase tracking-wider">Required</span>
              <span />
            </div>
            {draft.parameters.map((param) => (
              <div
                key={param.id}
                className="grid items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{ gridTemplateColumns: '1fr 100px 80px 28px', background: '#12161E', border: '1px solid #1A1E28' }}
              >
                <input
                  className="bg-transparent text-sm text-text-primary font-mono placeholder-text-muted focus:outline-none"
                  placeholder="param_name"
                  value={param.name}
                  onChange={(e) => updateParam(param.id, { name: e.target.value })}
                />
                <select
                  className="bg-transparent text-xs text-text-muted focus:outline-none cursor-pointer appearance-none"
                  value={param.type}
                  onChange={(e) => updateParam(param.id, { type: e.target.value as EventParameter['type'] })}
                >
                  {PARAM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => updateParam(param.id, { required: !param.required })}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                  style={{ color: param.required ? '#0BBFAA' : '#7A8599' }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0"
                    style={{
                      borderColor: param.required ? '#0BBFAA' : '#7A8599',
                      background: param.required ? '#0BBFAA' : 'transparent',
                    }}
                  >
                    {param.required && (
                      <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#080B12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {param.required ? 'Required' : 'Optional'}
                </button>
                <button
                  type="button"
                  onClick={() => removeParam(param.id)}
                  className="flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 6: Implementation Notes */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-1.5">
          Implementation Notes
        </label>
        <textarea
          className="w-full bg-input-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 transition-all resize-none"
          placeholder="Notes for the developer implementing this event..."
          rows={2}
          value={draft.implementationNotes || ''}
          onChange={(e) => set('implementationNotes', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onSave}>
          Done
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Template Chooser ─────────────────────────────────────────────────────────

interface TemplateChooserProps {
  existingTemplateIds: string[];
  onSelect: (templateId: string) => void;
  onCustom: () => void;
  onClose?: () => void;
  isFirstJourney?: boolean;
}

function TemplateChooser({ existingTemplateIds, onSelect, onCustom, onClose, isFirstJourney }: TemplateChooserProps) {
  const grouped = {
    ecommerce: JOURNEY_TEMPLATES.filter((t) => t.category === 'ecommerce'),
    saas: JOURNEY_TEMPLATES.filter((t) => t.category === 'saas'),
    leadgen: JOURNEY_TEMPLATES.filter((t) => t.category === 'leadgen'),
  };

  const categoryLabels: Record<string, string> = {
    ecommerce: 'Ecommerce',
    saas: 'SaaS',
    leadgen: 'Lead Gen',
  };

  return (
    <Card style={{ borderColor: 'rgba(11,191,170,0.25)', background: 'rgba(11,191,170,0.02)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(11,191,170,0.1)', border: '1px solid rgba(11,191,170,0.2)' }}
          >
            <Map size={16} className="text-atlas-teal" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '16px', color: '#E8ECF2', margin: 0 }}>
              {isFirstJourney ? 'Add Your First Journey' : 'Add Another Journey'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Choose a template or start from scratch</p>
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {(['ecommerce', 'saas', 'leadgen'] as const).map((cat) => (
        <div key={cat} className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">{categoryLabels[cat]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {grouped[cat].map((template) => {
              const alreadyAdded = existingTemplateIds.includes(template.id);
              return (
                <button
                  key={template.id}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => onSelect(template.id)}
                  className="text-left p-3 rounded-lg border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: alreadyAdded ? '#12161E' : '#12161E',
                    borderColor: '#1A1E28',
                  }}
                  onMouseEnter={(e) => { if (!alreadyAdded) (e.currentTarget as HTMLButtonElement).style.borderColor = '#0BBFAA'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A1E28'; }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-text-primary">{template.name}</span>
                    <span className="text-xs text-text-muted">{template.eventCount} events</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{template.description}</p>
                  {alreadyAdded && (
                    <p className="text-xs mt-1" style={{ color: '#0BBFAA' }}>Already added</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom journey */}
      <div className="border-t border-border pt-3 mt-2">
        <button
          type="button"
          onClick={onCustom}
          className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed text-left transition-all hover:border-atlas-teal hover:bg-atlas-teal/5"
          style={{ borderColor: '#1A1E28' }}
        >
          <Plus size={16} className="text-atlas-teal" />
          <div>
            <span className="text-sm font-semibold text-text-primary">Custom Journey</span>
            <p className="text-xs text-text-muted">Start from scratch with a blank journey</p>
          </div>
        </button>
      </div>
    </Card>
  );
}

// ─── Journey Card ─────────────────────────────────────────────────────────────

interface JourneyCardProps {
  journey: Journey;
  editingEventId: string | null;
  editingDraft: JourneyEvent | null;
  onEditStart: (eventId: string) => void;
  onEditChange: (draft: JourneyEvent) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onAddEvent: () => void;
  onDeleteEvent: (eventId: string) => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
}

function JourneyCard({
  journey,
  editingEventId,
  editingDraft,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onAddEvent,
  onDeleteEvent,
  onDelete,
  onNameChange,
}: JourneyCardProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(journey.name);

  const primaryConversions = journey.events.filter((e) => e.conversionType === 'primary').length;

  function commitName() {
    setEditingName(false);
    if (nameValue.trim()) onNameChange(nameValue.trim());
    else setNameValue(journey.name);
  }

  return (
    <Card>
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-border">
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              autoFocus
              className="bg-input-bg border border-atlas-teal rounded px-2 py-1 text-sm font-bold text-text-primary focus:outline-none w-full max-w-xs"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setEditingName(false); setNameValue(journey.name); } }}
            />
          ) : (
            <button
              type="button"
              className="group flex items-center gap-2"
              onClick={() => setEditingName(true)}
              title="Click to rename"
            >
              <h3
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '17px', color: '#E8ECF2', margin: 0 }}
              >
                {journey.name}
              </h3>
              <Edit3 size={13} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-text-muted">{journey.events.length} events</span>
            {primaryConversions > 0 && (
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(11,191,170,0.1)', color: '#0BBFAA', border: '1px solid rgba(11,191,170,0.2)' }}
              >
                {primaryConversions} primary conversion{primaryConversions > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-transparent text-xs text-text-muted hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all"
          title="Remove journey"
        >
          <Trash2 size={13} />
          Remove
        </button>
      </div>

      {/* Event steps */}
      {journey.events.length === 0 ? (
        <div className="text-center py-6 text-text-muted">
          <p className="text-sm">No events yet.</p>
          <p className="text-xs mt-1">Add events to define the steps in this journey.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Column headers */}
          <div
            className="grid items-center gap-3 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted"
            style={{ gridTemplateColumns: '28px 1fr 100px 90px 110px 64px' }}
          >
            <span>#</span>
            <span>Event</span>
            <span>Type</span>
            <span>Category</span>
            <span>Conversion</span>
            <span />
          </div>

          {journey.events.map((event, idx) => {
            const isEditing = editingEventId === event.id;
            return (
              <div key={event.id}>
                {/* Step row */}
                <div
                  className="grid items-center gap-3 px-3 py-2.5 rounded-lg border transition-all"
                  style={{
                    gridTemplateColumns: '28px 1fr 100px 90px 110px 64px',
                    background: isEditing ? 'rgba(11,191,170,0.04)' : '#12161E',
                    borderColor: isEditing ? 'rgba(11,191,170,0.3)' : '#1A1E28',
                  }}
                >
                  {/* Step number */}
                  <span
                    className="text-xs font-bold text-center w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#1A1E28', color: '#7A8599', fontSize: '11px' }}
                  >
                    {idx + 1}
                  </span>

                  {/* Event name */}
                  <div className="min-w-0">
                    <span
                      className="text-sm font-medium block truncate"
                      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E8ECF2', fontSize: '13px' }}
                    >
                      {event.canonicalName || <span className="text-text-muted italic">unnamed</span>}
                    </span>
                    {event.displayName && event.displayName !== event.canonicalName && (
                      <span className="text-xs text-text-muted truncate block">{event.displayName}</span>
                    )}
                  </div>

                  {/* Type */}
                  <TypeBadge type={event.eventType} />

                  {/* Category */}
                  <CatBadge cat={event.category} />

                  {/* Conversion */}
                  <div>
                    <ConvBadge type={event.conversionType} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      type="button"
                      onClick={() => isEditing ? onEditCancel() : onEditStart(event.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition-all"
                      style={
                        isEditing
                          ? { background: 'rgba(11,191,170,0.1)', borderColor: 'rgba(11,191,170,0.3)', color: '#0BBFAA' }
                          : { background: '#1A1E28', borderColor: '#1A1E28', color: '#7A8599' }
                      }
                    >
                      {isEditing ? <X size={11} /> : <ChevronRight size={11} />}
                      {isEditing ? 'Close' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-1 rounded text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Inline editor */}
                {isEditing && editingDraft && (
                  <EventEditor
                    draft={editingDraft}
                    onChange={onEditChange}
                    onSave={onEditSave}
                    onCancel={onEditCancel}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add event button */}
      <div className="mt-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={onAddEvent}
          className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-atlas-teal transition-colors"
        >
          <Plus size={14} />
          Add Event
        </button>
      </div>
    </Card>
  );
}

// ─── Validation Panel ─────────────────────────────────────────────────────────

function ValidationPanel({ journeys }: { journeys: Journey[] }) {
  const hasJourneys = journeys.length > 0;
  const hasPrimary = journeys.some((j) => j.events.some((e) => e.conversionType === 'primary'));
  const hasUnnamedEvents = journeys.some((j) => j.events.some((e) => !e.canonicalName.trim()));
  const isValid = hasJourneys && hasPrimary && !hasUnnamedEvents;

  const checks = [
    { ok: hasJourneys,     text: hasJourneys ? 'At least one journey defined' : 'Add at least one journey' },
    { ok: hasPrimary,      text: hasPrimary ? 'Primary conversion event defined' : 'Mark at least one event as Primary conversion' },
    { ok: !hasUnnamedEvents, text: hasUnnamedEvents ? 'Some events are missing a canonical name' : 'All events have canonical names' },
  ];

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        background: isValid ? 'rgba(11,191,170,0.03)' : 'rgba(245,158,11,0.03)',
        borderColor: isValid ? 'rgba(11,191,170,0.2)' : 'rgba(245,158,11,0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        {isValid
          ? <CheckCircle size={16} className="text-atlas-teal" />
          : <AlertCircle size={16} style={{ color: '#F59E0B' }} />
        }
        <span
          className="text-sm font-semibold"
          style={{ color: isValid ? '#0BBFAA' : '#F59E0B' }}
        >
          {isValid ? 'Ready to continue' : 'Complete the following'}
        </span>
      </div>
      <ul className="space-y-1.5">
        {checks.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            {c.ok
              ? <CheckCircle size={13} className="text-atlas-teal mt-0.5 shrink-0" />
              : <AlertCircle size={13} className="mt-0.5 shrink-0" style={{ color: '#F59E0B' }} />
            }
            <span style={{ color: c.ok ? '#7A8599' : '#E8ECF2' }}>{c.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Phase2JourneyDesigner() {
  const navigate = useNavigate();
  const { getActiveProject, updateProject } = useStore();
  const project = getActiveProject();

  // ── State ────────────────────────────────────────────────────────────────────

  const [journeys, setJourneys] = useState<Journey[]>(() => {
    if (project?.journeys?.length) return project.journeys;
    return getDefaultJourneysForBusinessModel(project?.discovery?.businessModel);
  });

  // editingKey = 'journeyId:eventId'
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<JourneyEvent | null>(null);
  const [showTemplateChooser, setShowTemplateChooser] = useState(false);

  // Redirect if no active project
  useEffect(() => {
    if (!project) navigate('/discovery');
  }, [project, navigate]);

  // ── Derived ───────────────────────────────────────────────────────────────────

  const existingTemplateIds = journeys.map((j) => j.templateId).filter(Boolean) as string[];
  const isValid =
    journeys.length > 0 &&
    journeys.some((j) => j.events.some((e) => e.conversionType === 'primary')) &&
    !journeys.some((j) => j.events.some((e) => !e.canonicalName.trim()));

  // ── Journey helpers ───────────────────────────────────────────────────────────

  function addJourneyFromTemplate(templateId: string) {
    const template = JOURNEY_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setJourneys((prev) => [...prev, template.createJourney()]);
    setShowTemplateChooser(false);
  }

  function addCustomJourney() {
    setJourneys((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: 'Custom Journey', description: '', events: [] },
    ]);
    setShowTemplateChooser(false);
  }

  function deleteJourney(journeyId: string) {
    if (editingKey?.startsWith(journeyId)) {
      setEditingKey(null);
      setEditingDraft(null);
    }
    setJourneys((prev) => prev.filter((j) => j.id !== journeyId));
  }

  function updateJourneyName(journeyId: string, name: string) {
    setJourneys((prev) => prev.map((j) => (j.id === journeyId ? { ...j, name } : j)));
  }

  // ── Event helpers ─────────────────────────────────────────────────────────────

  function startEditEvent(journeyId: string, eventId: string) {
    const journey = journeys.find((j) => j.id === journeyId);
    const event = journey?.events.find((e) => e.id === eventId);
    if (!event) return;
    setEditingKey(`${journeyId}:${eventId}`);
    setEditingDraft({ ...event, parameters: event.parameters.map((p) => ({ ...p })) });
  }

  function saveEventEdit() {
    if (!editingDraft || !editingKey) return;
    const [journeyId, eventId] = editingKey.split(':');
    setJourneys((prev) =>
      prev.map((j) =>
        j.id === journeyId
          ? { ...j, events: j.events.map((e) => (e.id === eventId ? { ...editingDraft } : e)) }
          : j
      )
    );
    setEditingKey(null);
    setEditingDraft(null);
  }

  function cancelEventEdit() {
    setEditingKey(null);
    setEditingDraft(null);
  }

  function addEvent(journeyId: string) {
    const newEvent: JourneyEvent = {
      id: crypto.randomUUID(),
      canonicalName: '',
      displayName: '',
      description: '',
      eventType: 'user_action',
      category: 'acquisition',
      conversionType: 'none',
      parameters: [],
      implementationNotes: '',
    };
    setJourneys((prev) =>
      prev.map((j) => (j.id === journeyId ? { ...j, events: [...j.events, newEvent] } : j))
    );
    // Auto-open the new event for editing
    setEditingKey(`${journeyId}:${newEvent.id}`);
    setEditingDraft({ ...newEvent });
  }

  function deleteEvent(journeyId: string, eventId: string) {
    if (editingKey === `${journeyId}:${eventId}`) {
      setEditingKey(null);
      setEditingDraft(null);
    }
    setJourneys((prev) =>
      prev.map((j) =>
        j.id === journeyId ? { ...j, events: j.events.filter((e) => e.id !== eventId) } : j
      )
    );
  }

  // ── Persist & navigate ────────────────────────────────────────────────────────

  function saveDraft() {
    if (project) updateProject(project.id, { journeys });
  }

  function handleContinue() {
    if (project) updateProject(project.id, { journeys, currentPhase: 2 });
    navigate('/orchestration');
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/discovery')}
          className="text-xs text-text-muted hover:text-text-primary transition mb-4 flex items-center gap-1"
        >
          ← Back to Discovery
        </button>
        <h1
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700,
            fontSize: '28px',
            letterSpacing: '-0.01em',
            color: '#E8ECF2',
            margin: 0,
          }}
        >
          Phase 2 · Journey Designer
        </h1>
        <p className="text-text-muted text-sm mt-1.5">
          Define user journeys and canonical events.{' '}
          {project?.discovery?.clientName && (
            <span className="text-atlas-teal font-medium">{project.discovery.clientName}</span>
          )}
        </p>
      </div>

      <PhaseStepper current={2} />

      {/* Context info banner */}
      {project?.discovery?.businessModel && journeys.length > 0 && (
        <div
          className="flex items-start gap-3 p-3 rounded-lg mb-6"
          style={{ background: 'rgba(11,191,170,0.05)', border: '1px solid rgba(11,191,170,0.15)' }}
        >
          <Info size={14} className="text-atlas-teal mt-0.5 shrink-0" />
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="text-atlas-teal font-semibold">Pre-populated</span> from your{' '}
            <span className="text-text-primary capitalize">{project.discovery.businessModel}</span> business model.
            Edit events, rename journeys, and add additional templates as needed.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {/* Empty state — show template chooser inline */}
        {journeys.length === 0 && !showTemplateChooser && (
          <TemplateChooser
            existingTemplateIds={existingTemplateIds}
            onSelect={addJourneyFromTemplate}
            onCustom={addCustomJourney}
            isFirstJourney
          />
        )}

        {/* Journey cards */}
        {journeys.map((journey) => {
          const [editJourneyId, editEventId] = (editingKey || '').split(':');
          const isEditingInThisJourney = editJourneyId === journey.id;

          return (
            <JourneyCard
              key={journey.id}
              journey={journey}
              editingEventId={isEditingInThisJourney ? editEventId : null}
              editingDraft={isEditingInThisJourney ? editingDraft : null}
              onEditStart={(eventId) => startEditEvent(journey.id, eventId)}
              onEditChange={setEditingDraft}
              onEditSave={saveEventEdit}
              onEditCancel={cancelEventEdit}
              onAddEvent={() => addEvent(journey.id)}
              onDeleteEvent={(eventId) => deleteEvent(journey.id, eventId)}
              onDelete={() => deleteJourney(journey.id)}
              onNameChange={(name) => updateJourneyName(journey.id, name)}
            />
          );
        })}

        {/* Add another journey */}
        {journeys.length > 0 && !showTemplateChooser && (
          <button
            type="button"
            onClick={() => setShowTemplateChooser(true)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed text-sm font-medium text-text-muted hover:text-atlas-teal hover:border-atlas-teal hover:bg-atlas-teal/5 transition-all"
            style={{ borderColor: '#1A1E28' }}
          >
            <Plus size={16} />
            Add Another Journey
          </button>
        )}

        {/* Template chooser panel (for adding additional journeys) */}
        {showTemplateChooser && journeys.length > 0 && (
          <TemplateChooser
            existingTemplateIds={existingTemplateIds}
            onSelect={addJourneyFromTemplate}
            onCustom={addCustomJourney}
            onClose={() => setShowTemplateChooser(false)}
          />
        )}

        {/* Validation */}
        {journeys.length > 0 && <ValidationPanel journeys={journeys} />}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={saveDraft}>
            Save Draft
          </Button>
          <Button type="button" disabled={!isValid} onClick={handleContinue}>
            Continue to Conversion Orchestration →
          </Button>
        </div>
      </div>
    </div>
  );
}
