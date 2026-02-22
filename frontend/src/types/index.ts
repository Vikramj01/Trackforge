// ─── Journey / Phase 2 ───────────────────────────────────────────────────────

export type EventType = 'page_view' | 'user_action' | 'success' | 'error';
export type EventCategory = 'acquisition' | 'activation' | 'revenue' | 'retention';
export type ConversionType = 'none' | 'primary' | 'secondary';

export interface EventParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
}

export interface JourneyEvent {
  id: string;
  canonicalName: string;
  displayName: string;
  description: string;
  eventType: EventType;
  route?: string;
  category: EventCategory;
  conversionType: ConversionType;
  parameters: EventParameter[];
  implementationNotes?: string;
}

export interface Journey {
  id: string;
  name: string;
  description?: string;
  templateId?: string;
  events: JourneyEvent[];
}

// ─── Discovery / Phase 1 ────────────────────────────────────────────────────

export type PropertyType = 'spa' | 'headless' | 'cms' | 'webapp';
export type BusinessModel = 'ecommerce' | 'saas' | 'leadgen' | 'media' | 'marketplace';
export type PrimaryObjective = 'purchase' | 'subscription' | 'lead' | 'trial' | 'activation';
export type ServerDeploymentMethod = 'self-hosted' | 'atlas-hosted' | 'gcp-hosted';

export interface ServerSideConfig {
  enabled: boolean;
  method?: ServerDeploymentMethod;
  serverEndpoint?: string;
}

export interface DiscoveryData {
  clientName: string;
  industry: string;
  website: string;
  propertyType: PropertyType;
  businessModel: BusinessModel;
  primaryObjective: PrimaryObjective;
  techStack: string[];
  serverSideTracking: ServerSideConfig;
  notes?: string;
}

// ─── Client / Project ────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  industry: string;
  website: string;
  propertyType: PropertyType;
  businessModel: BusinessModel;
  primaryObjective: string;
  techStack: string[];
  serverSideTracking: ServerSideConfig;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'draft' | 'in-progress' | 'ready-to-deploy' | 'deployed';
export type ProjectPhase = 1 | 2 | 3 | 4;

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  currentPhase: ProjectPhase;
  status: ProjectStatus;
  discovery?: DiscoveryData;
  journeys?: Journey[];
  conversions?: Conversion[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Conversion / Phase 3 ────────────────────────────────────────────────────

export type TrackingMethod = 'client-only' | 'server-only' | 'both';
export type ValueLogic = 'dynamic' | 'fixed';

export interface ConversionPlatforms {
  ga4Client: { enabled: boolean; eventName: string };
  metaPixel: { enabled: boolean; eventName: string };
  ga4Server: { enabled: boolean; eventName: string };
  metaCAPI: { enabled: boolean; eventName: string };
  googleAds: { enabled: boolean; conversionLabel: string };
}

export interface ConversionUserData {
  email: boolean;
  phone: boolean;
  firstName: boolean;
  lastName: boolean;
  city: boolean;
  country: boolean;
  postalCode: boolean;
}

export interface Conversion {
  id: string;
  eventId: string;
  canonicalName: string;
  displayName: string;
  conversionType: 'primary' | 'secondary';
  trackingMethod: TrackingMethod;
  valueLogic: ValueLogic;
  fixedValue: number;
  currency: string;
  isRevenueEvent: boolean;
  isPaidMediaOptimization: boolean;
  platforms: ConversionPlatforms;
  enableDeduplication: boolean;
  enhancedConversionsEnabled: boolean;
  userData: ConversionUserData;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface AppStore {
  projects: Project[];
  activeProjectId: string | null;
  loading: boolean;
  loadProjects: (userId: string) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  setActiveProject: (id: string | null) => void;
  getActiveProject: () => Project | undefined;
}

// ─── Tech Stack Options ──────────────────────────────────────────────────────

export const TECH_STACK_OPTIONS = [
  { value: 'ga4', label: 'Google Analytics 4' },
  { value: 'gtm', label: 'Google Tag Manager' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'meta-pixel', label: 'Meta Pixel' },
  { value: 'linkedin', label: 'LinkedIn Insight Tag' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'none', label: 'None / Starting Fresh' },
] as const;

export const INDUSTRY_OPTIONS = [
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'leadgen', label: 'Lead Generation' },
  { value: 'media', label: 'Media & Publishing' },
  { value: 'other', label: 'Other' },
] as const;

export const BUSINESS_MODEL_OPTIONS = [
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'leadgen', label: 'Lead Gen' },
  { value: 'media', label: 'Media' },
  { value: 'marketplace', label: 'Marketplace' },
] as const;

export const PRIMARY_OBJECTIVE_OPTIONS = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'lead', label: 'Lead' },
  { value: 'trial', label: 'Free Trial' },
  { value: 'activation', label: 'Activation' },
] as const;
