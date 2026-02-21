import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Server, Globe, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { useStore } from '../../store/useStore';
import {
  INDUSTRY_OPTIONS,
  BUSINESS_MODEL_OPTIONS,
  PRIMARY_OBJECTIVE_OPTIONS,
  TECH_STACK_OPTIONS,
} from '../../types';

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const discoverySchema = z
  .object({
    clientName: z.string().min(1, 'Client name is required'),
    industry: z.string().min(1, 'Industry is required'),
    website: z.string().url('Must be a valid URL (include https://)'),
    propertyType: z.enum(['spa', 'headless', 'cms', 'webapp'], {
      message: 'Select a property type',
    }),
    businessModel: z.enum(['ecommerce', 'saas', 'leadgen', 'media', 'marketplace'], {
      message: 'Select a business model',
    }),
    primaryObjective: z.enum(
      ['purchase', 'subscription', 'lead', 'trial', 'activation'],
      { message: 'Select a primary objective' }
    ),
    techStack: z.array(z.string()),
    enableServerSide: z.boolean(),
    serverMethod: z
      .enum(['self-hosted', 'atlas-hosted', 'gcp-hosted'])
      .optional(),
    serverEndpoint: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.enableServerSide && !data.serverMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a deployment method',
        path: ['serverMethod'],
      });
    }
    if (
      data.enableServerSide &&
      data.serverMethod === 'self-hosted' &&
      data.serverEndpoint &&
      data.serverEndpoint.length > 0
    ) {
      const urlResult = z.string().url().safeParse(data.serverEndpoint);
      if (!urlResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Must be a valid URL (include https://)',
          path: ['serverEndpoint'],
        });
      }
    }
  });

type DiscoveryFormValues = z.infer<typeof discoverySchema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
      <div
        className="p-2 rounded-lg"
        style={{
          background: 'rgba(11, 191, 170, 0.1)',
          border: '1px solid rgba(11, 191, 170, 0.2)',
        }}
      >
        <Icon size={18} className="text-atlas-teal" />
      </div>
      <div>
        <h2
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            color: '#E8ECF2',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function FieldGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 }) {
  return (
    <div className={`grid grid-cols-1 ${cols === 2 ? 'md:grid-cols-2' : ''} gap-4`}>
      {children}
    </div>
  );
}

// ─── Property Type Selector ───────────────────────────────────────────────────

const PROPERTY_TYPES = [
  {
    value: 'spa',
    label: 'Single-Page App',
    desc: 'React, Vue, Angular — page transitions without reload',
    warning: 'High risk of conversion loss',
  },
  {
    value: 'headless',
    label: 'Headless Ecommerce',
    desc: 'Checkout on a different domain or subdomain',
    warning: 'High risk of conversion loss',
  },
  {
    value: 'cms',
    label: 'Traditional CMS',
    desc: 'WordPress, Squarespace, Webflow, etc.',
    warning: null,
  },
  {
    value: 'webapp',
    label: 'Web Application',
    desc: 'SaaS dashboard, portal, complex app',
    warning: null,
  },
];

function PropertyTypeSelector({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-2">
        Property Type <span className="text-atlas-teal">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PROPERTY_TYPES.map((pt) => {
          const selected = value === pt.value;
          return (
            <button
              key={pt.value}
              type="button"
              onClick={() => onChange(pt.value)}
              className="text-left p-3 rounded-lg border transition-all duration-150"
              style={{
                background: selected ? 'rgba(11, 191, 170, 0.08)' : '#12161E',
                borderColor: selected ? '#0BBFAA' : '#1A1E28',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: selected ? '#0BBFAA' : '#7A8599',
                  }}
                >
                  {selected && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#0BBFAA' }}
                    />
                  )}
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: selected ? '#0BBFAA' : '#E8ECF2' }}
                >
                  {pt.label}
                </span>
              </div>
              <p className="text-xs text-text-muted ml-5.5 leading-relaxed">{pt.desc}</p>
              {pt.warning && (
                <p
                  className="text-xs mt-1 ml-5.5 font-medium"
                  style={{ color: '#F59E0B' }}
                >
                  ⚠ {pt.warning}
                </p>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  );
}

// ─── Tech Stack Checkboxes ────────────────────────────────────────────────────

function TechStackSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (item: string) => {
    onChange(
      value.includes(item) ? value.filter((v) => v !== item) : [...value, item]
    );
  };

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-2">
        Current Tech Stack
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TECH_STACK_OPTIONS.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all duration-150"
              style={{
                background: checked ? 'rgba(11, 191, 170, 0.08)' : '#12161E',
                borderColor: checked ? '#0BBFAA' : '#1A1E28',
                color: checked ? '#0BBFAA' : '#7A8599',
              }}
            >
              <div
                className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: checked ? '#0BBFAA' : '#7A8599',
                  background: checked ? '#0BBFAA' : 'transparent',
                }}
              >
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="#080B12"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Server-Side Tracking Section ─────────────────────────────────────────────

const SERVER_METHODS = [
  {
    value: 'self-hosted',
    label: 'Self-hosted',
    badge: 'FREE',
    badgeColor: '#0BBFAA',
    desc: 'You deploy to Railway, Vercel, GCP, or AWS. Full control.',
    detail: 'Railway (recommended) · Vercel Functions · Google Cloud Run · AWS Lambda',
  },
  {
    value: 'atlas-hosted',
    label: 'Atlas-hosted',
    badge: '$49/mo',
    badgeColor: '#7A8599',
    desc: 'Managed service. Zero DevOps, instant setup.',
    detail: 'We handle deployment, scaling, and monitoring.',
  },
  {
    value: 'gcp-hosted',
    label: 'Google Cloud hosted',
    badge: '$50-200/mo',
    badgeColor: '#7A8599',
    desc: 'Official server-side GTM on Google Cloud Platform.',
    detail: 'Requires GCP account. Official Google infrastructure.',
  },
];

function ServerSideSection({
  enableServerSide,
  serverMethod,
  serverEndpoint,
  onEnableChange,
  onMethodChange,
  onEndpointChange,
  methodError,
  endpointError,
}: {
  enableServerSide: boolean;
  serverMethod?: string;
  serverEndpoint?: string;
  onEnableChange: (v: boolean) => void;
  onMethodChange: (v: string) => void;
  onEndpointChange: (v: string) => void;
  methodError?: string;
  endpointError?: string;
}) {
  return (
    <Card
      className="border-2"
      style={{
        borderColor: enableServerSide ? 'rgba(11,191,170,0.3)' : '#1A1E28',
        background: enableServerSide ? 'rgba(11,191,170,0.03)' : '#0D1117',
      }}
    >
      <SectionHeader
        icon={Server}
        title="Server-Side Tracking"
        subtitle="Recommended for all modern web apps"
      />

      {/* Enable toggle */}
      <div className="mb-6">
        <div className="flex flex-col gap-2">
          {/* Yes */}
          <button
            type="button"
            onClick={() => onEnableChange(true)}
            className="flex items-start gap-3 p-4 rounded-lg border text-left transition-all duration-150"
            style={{
              background: enableServerSide ? 'rgba(11, 191, 170, 0.08)' : '#12161E',
              borderColor: enableServerSide ? '#0BBFAA' : '#1A1E28',
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0"
              style={{ borderColor: enableServerSide ? '#0BBFAA' : '#7A8599' }}
            >
              {enableServerSide && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#0BBFAA' }}
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: enableServerSide ? '#0BBFAA' : '#E8ECF2' }}
                >
                  Yes — Enable server-side tracking
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(11, 191, 170, 0.15)',
                    color: '#0BBFAA',
                    border: '1px solid rgba(11, 191, 170, 0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  RECOMMENDED
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Captures 20-40% more conversions. Bypasses ad blockers, iOS ITP, and
                browser privacy restrictions. Required for Meta CAPI and Enhanced Conversions.
              </p>
            </div>
          </button>

          {/* No */}
          <button
            type="button"
            onClick={() => onEnableChange(false)}
            className="flex items-start gap-3 p-4 rounded-lg border text-left transition-all duration-150"
            style={{
              background: !enableServerSide ? 'rgba(239,68,68,0.05)' : '#12161E',
              borderColor: !enableServerSide ? 'rgba(239,68,68,0.3)' : '#1A1E28',
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0"
              style={{ borderColor: !enableServerSide ? '#EF4444' : '#7A8599' }}
            >
              {!enableServerSide && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#EF4444' }}
                />
              )}
            </div>
            <div>
              <span
                className="text-sm font-semibold"
                style={{ color: !enableServerSide ? '#EF4444' : '#7A8599' }}
              >
                No — Client-side only
              </span>
              <p className="text-xs text-text-muted mt-1">
                Not recommended. Ad blockers will block 30%+ of tracking. iOS ITP will
                delete cookies after 7 days. You will lose conversions.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Server method (only if enabled) */}
      {enableServerSide && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-3">
              Server Deployment Method <span className="text-atlas-teal">*</span>
            </label>
            <div className="space-y-2">
              {SERVER_METHODS.map((method) => {
                const selected = serverMethod === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => onMethodChange(method.value)}
                    className="w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all duration-150"
                    style={{
                      background: selected ? 'rgba(11, 191, 170, 0.06)' : '#12161E',
                      borderColor: selected ? '#0BBFAA' : '#1A1E28',
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0"
                      style={{ borderColor: selected ? '#0BBFAA' : '#7A8599' }}
                    >
                      {selected && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: '#0BBFAA' }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: selected ? '#0BBFAA' : '#E8ECF2' }}
                        >
                          {method.label}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background: 'rgba(11, 191, 170, 0.1)',
                            color: method.badgeColor,
                            border: `1px solid ${method.badgeColor}40`,
                          }}
                        >
                          {method.badge}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{method.desc}</p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: '#7A8599', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
                      >
                        {method.detail}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {methodError && (
              <p className="text-xs text-red-400 mt-1.5">{methodError}</p>
            )}
          </div>

          {/* Server endpoint URL (self-hosted only) */}
          {serverMethod === 'self-hosted' && (
            <div>
              <Input
                label="Server Endpoint URL"
                placeholder="https://api.yoursite.com/track"
                value={serverEndpoint || ''}
                onChange={(e) => onEndpointChange(e.target.value)}
                error={endpointError}
                hint="Leave blank if you haven't deployed yet — you can add this later."
              />
            </div>
          )}

          {/* Info banner */}
          <div
            className="flex items-start gap-3 p-4 rounded-lg"
            style={{
              background: 'rgba(11, 191, 170, 0.05)',
              border: '1px solid rgba(11, 191, 170, 0.15)',
            }}
          >
            <Info size={16} className="text-atlas-teal mt-0.5 shrink-0" />
            <div className="text-xs text-text-muted leading-relaxed">
              <p className="font-semibold text-atlas-teal mb-1">What gets generated in Phase 4:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Server-side GTM container (GA4 MP, Meta CAPI, Google Ads Enhanced)</li>
                <li>Production-ready Node.js + Python server endpoint code</li>
                <li>PII hashing (SHA-256) for email, phone, address</li>
                <li>Meta CAPI setup guide + Enhanced Conversions guide</li>
                <li>Deployment guides (Railway, Vercel, GCP)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warning if disabled */}
      {!enableServerSide && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg"
          style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#EF4444' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#FCA5A5' }}>
            Without server-side tracking, you will lose 20-40% of conversions to ad blockers,
            iOS ITP, and browser privacy features. Meta CAPI and Google Enhanced Conversions
            will not be available.
          </p>
        </div>
      )}
    </Card>
  );
}

// ─── Phase Stepper ────────────────────────────────────────────────────────────

const PHASES = [
  { n: 1, label: 'Discovery' },
  { n: 2, label: 'Journeys' },
  { n: 3, label: 'Orchestration' },
  { n: 4, label: 'Export' },
];

function PhaseStepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {PHASES.map((phase, i) => (
        <div key={phase.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
              style={{
                borderColor: phase.n === current ? '#0BBFAA' : '#1A1E28',
                background:
                  phase.n === current
                    ? 'rgba(11,191,170,0.1)'
                    : phase.n < current
                    ? '#0BBFAA'
                    : '#12161E',
                color:
                  phase.n < current
                    ? '#080B12'
                    : phase.n === current
                    ? '#0BBFAA'
                    : '#7A8599',
              }}
            >
              {phase.n < current ? <CheckCircle size={14} /> : phase.n}
            </div>
            <span
              className="text-xs mt-1.5 font-medium"
              style={{
                color: phase.n === current ? '#0BBFAA' : '#7A8599',
                whiteSpace: 'nowrap',
              }}
            >
              {phase.label}
            </span>
          </div>
          {i < PHASES.length - 1 && (
            <div
              className="h-px w-12 sm:w-20 mb-5"
              style={{
                background: phase.n < current ? '#0BBFAA' : '#1A1E28',
                opacity: 0.5,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function Phase1Discovery() {
  const navigate = useNavigate();
  const { addProject, setActiveProject } = useStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DiscoveryFormValues>({
    resolver: zodResolver(discoverySchema),
    defaultValues: {
      clientName: '',
      industry: '',
      website: '',
      propertyType: undefined,
      businessModel: undefined,
      primaryObjective: undefined,
      techStack: [],
      enableServerSide: true,
      serverMethod: 'self-hosted',
      serverEndpoint: '',
      notes: '',
    },
  });

  const enableServerSide = watch('enableServerSide');
  const serverMethod = watch('serverMethod');
  const propertyType = watch('propertyType');
  const techStack = watch('techStack');

  const onSubmit = (data: DiscoveryFormValues) => {
    const id = crypto.randomUUID();
    const now = new Date();

    addProject({
      id,
      clientName: data.clientName,
      clientId: id,
      currentPhase: 1,
      status: 'draft',
      discovery: {
        clientName: data.clientName,
        industry: data.industry,
        website: data.website,
        propertyType: data.propertyType,
        businessModel: data.businessModel,
        primaryObjective: data.primaryObjective,
        techStack: data.techStack,
        serverSideTracking: {
          enabled: data.enableServerSide,
          method: data.serverMethod,
          serverEndpoint: data.serverEndpoint || undefined,
        },
        notes: data.notes,
      },
      createdAt: now,
      updatedAt: now,
    });

    setActiveProject(id);
    navigate('/journey');
  };

  const saveDraft = handleSubmit(() => {
    /* no-op for now — same as submit */
  });

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-xs text-text-muted hover:text-text-primary transition mb-4 flex items-center gap-1"
        >
          ← Back to Dashboard
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
          Phase 1 · Discovery
        </h1>
        <p className="text-text-muted text-sm mt-1.5">
          Define client context and configure dual-tracking architecture preferences.
        </p>
      </div>

      <PhaseStepper current={1} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Client Information ─────────────────────────────────────────── */}
        <Card>
          <SectionHeader icon={Globe} title="Client Information" />

          <div className="space-y-4">
            <FieldGrid cols={2}>
              <Input
                label="Client Name"
                placeholder="Acme Corp"
                required
                error={errors.clientName?.message}
                {...register('clientName')}
              />
              <Select
                label="Industry"
                options={INDUSTRY_OPTIONS as unknown as { value: string; label: string }[]}
                placeholder="Select industry..."
                required
                error={errors.industry?.message}
                {...register('industry')}
              />
            </FieldGrid>

            <Input
              label="Website URL"
              placeholder="https://yoursite.com"
              required
              error={errors.website?.message}
              {...register('website')}
            />

            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <PropertyTypeSelector
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.propertyType?.message}
                />
              )}
            />

            {/* Highlight dual-tracking recommendation for SPAs/headless */}
            {(propertyType === 'spa' || propertyType === 'headless') && (
              <div
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{
                  background: 'rgba(11,191,170,0.06)',
                  border: '1px solid rgba(11,191,170,0.2)',
                }}
              >
                <Info size={14} className="text-atlas-teal mt-0.5 shrink-0" />
                <p className="text-xs text-text-muted leading-relaxed">
                  <span className="text-atlas-teal font-semibold">
                    Server-side tracking is essential for this property type.
                  </span>{' '}
                  SPAs and headless ecommerce sites are most affected by ad blockers and ITP.
                  Dual-tracking will significantly improve your conversion coverage.
                </p>
              </div>
            )}

            <FieldGrid cols={2}>
              <Select
                label="Business Model"
                options={BUSINESS_MODEL_OPTIONS as unknown as { value: string; label: string }[]}
                placeholder="Select model..."
                required
                error={errors.businessModel?.message}
                {...register('businessModel')}
              />
              <Select
                label="Primary Objective"
                options={PRIMARY_OBJECTIVE_OPTIONS as unknown as { value: string; label: string }[]}
                placeholder="Select objective..."
                required
                error={errors.primaryObjective?.message}
                {...register('primaryObjective')}
              />
            </FieldGrid>

            <Controller
              name="techStack"
              control={control}
              render={({ field }) => (
                <TechStackSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-2">
                Notes
              </label>
              <textarea
                className="w-full bg-input-bg border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 resize-none"
                placeholder="Any additional context, existing tracking setup, or goals..."
                rows={3}
                {...register('notes')}
              />
            </div>
          </div>
        </Card>

        {/* ── Server-Side Tracking ───────────────────────────────────────── */}
        <Controller
          name="enableServerSide"
          control={control}
          render={() => (
            <ServerSideSection
              enableServerSide={enableServerSide}
              serverMethod={serverMethod}
              serverEndpoint={watch('serverEndpoint')}
              onEnableChange={(v) => setValue('enableServerSide', v)}
              onMethodChange={(v) =>
                setValue('serverMethod', v as 'self-hosted' | 'atlas-hosted' | 'gcp-hosted')
              }
              onEndpointChange={(v) => setValue('serverEndpoint', v)}
              methodError={errors.serverMethod?.message}
              endpointError={errors.serverEndpoint?.message}
            />
          )}
        />

        {/* ── Tech Stack Summary ─────────────────────────────────────────── */}
        {techStack.length > 0 && (
          <Card>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
              Selected Tech Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {techStack.map((t) => {
                const opt = TECH_STACK_OPTIONS.find((o) => o.value === t);
                return (
                  <span
                    key={t}
                    className="text-xs font-medium px-2.5 py-1 rounded"
                    style={{
                      background: 'rgba(11, 191, 170, 0.1)',
                      color: '#0BBFAA',
                      border: '1px solid rgba(11, 191, 170, 0.2)',
                    }}
                  >
                    {opt?.label || t}
                  </span>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={saveDraft}
          >
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Continue to Journey Designer →'}
          </Button>
        </div>

        {/* Schema summary preview */}
        <div
          className="p-4 rounded-lg border"
          style={{ background: 'rgba(0,0,0,0.3)', borderColor: '#1A1E28' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
            What Atlas will pre-configure based on your selections
          </p>
          <ul className="text-xs text-text-muted space-y-1 list-disc list-inside">
            <li>
              Journey templates based on business model (e.g., Checkout Funnel for Ecommerce)
            </li>
            <li>Recommended events with required parameters</li>
            <li>
              Default tracking method:{' '}
              <span className="text-atlas-teal font-semibold">
                {enableServerSide ? 'Both client + server (recommended)' : 'Client-side only'}
              </span>
            </li>
            {enableServerSide && (
              <li>
                Server-side clients:{' '}
                <span className="text-atlas-teal">GA4 MP, Meta CAPI, Google Ads Enhanced</span>
              </li>
            )}
          </ul>
        </div>
      </form>
    </div>
  );
}
