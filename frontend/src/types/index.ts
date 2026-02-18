export type Industry =
  | 'ecommerce'
  | 'saas'
  | 'leadgen'
  | 'media'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'other';

export type Platform =
  | 'shopify'
  | 'woocommerce'
  | 'wordpress'
  | 'webflow'
  | 'squarespace'
  | 'custom'
  | 'unknown';

export type ProjectStatus = 'draft' | 'in-progress' | 'deployed' | 'archived';
export type ProjectPhase = 1 | 2 | 3 | 4;

export type ElementType = 'button' | 'form' | 'link' | 'video';
export type ElementPriority = 'high' | 'medium' | 'low';

export interface TrackingDetection {
  type: string;
  found: boolean;
  details?: Record<string, string>;
}

export interface ScannedElement {
  id: string;
  type: ElementType;
  text: string;
  selector: string;
  instances: number;
  priority: ElementPriority;
  suggestedEventName: string;
  eventParams?: Record<string, string>;
  selected: boolean;
  page?: string;
  customizations?: {
    eventName?: string;
    eventParams?: Record<string, string>;
    conditions?: string[];
  };
}

export interface ScanResults {
  url: string;
  scanDate: string;
  platform: Platform;
  existingTracking: TrackingDetection[];
  elements: {
    highPriority: ScannedElement[];
    mediumPriority: ScannedElement[];
    lowPriority: ScannedElement[];
  };
  selectedCount: number;
  totalCount: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  platform: string[];
  useCase: string[];
  channels: string[];
  tags: string[];
  gtmJson?: object;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  industry: Industry;
  website: string;
  goals: string[];
  techStack: string[];
  notes: string;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryData {
  clientName: string;
  industry: string;
  website: string;
  goals: string[];
  techStack: string[];
  notes: string;
}

export interface DeploymentData {
  gtmContainerId: string;
  ga4PropertyId: string;
  metaPixelId?: string;
  linkedInPartnerId?: string;
  generatedAssets?: {
    containerJson?: string;
    installGuide?: string;
    verificationScript?: string;
    testingChecklist?: string;
  };
  deployedAt?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  currentPhase: ProjectPhase;
  status: ProjectStatus;
  discovery: DiscoveryData;
  siteScan?: ScanResults & {
    selectedElements: string[];
    customizations: Record<string, ScannedElement['customizations']>;
  };
  templateSelection?: {
    templateId: string;
    templateName: string;
    customizations?: object;
  };
  deployment?: DeploymentData;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'project_updated' | 'scan_completed' | 'template_selected' | 'deployed';
  description: string;
  clientName: string;
  timestamp: string;
}
