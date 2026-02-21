import type { Journey, JourneyEvent, EventParameter, EventType, EventCategory, ConversionType } from '../types';

// ─── Factory helpers ──────────────────────────────────────────────────────────

function mkParam(
  name: string,
  type: EventParameter['type'],
  required: boolean
): EventParameter {
  return { id: crypto.randomUUID(), name, type, required };
}

function mkEvent(
  canonicalName: string,
  displayName: string,
  description: string,
  eventType: EventType,
  category: EventCategory,
  conversionType: ConversionType,
  parameters: EventParameter[],
  route?: string
): JourneyEvent {
  return {
    id: crypto.randomUUID(),
    canonicalName,
    displayName,
    description,
    eventType,
    category,
    conversionType,
    parameters,
    route,
    implementationNotes: '',
  };
}

// ─── Template definitions ─────────────────────────────────────────────────────

export interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ecommerce' | 'saas' | 'leadgen';
  businessModels: string[];
  eventCount: number;
  createJourney: () => Journey;
}

export const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  {
    id: 'ecommerce-checkout',
    name: 'Checkout Funnel',
    description: 'Complete purchase funnel — product view through transaction',
    category: 'ecommerce',
    businessModels: ['ecommerce', 'marketplace'],
    eventCount: 7,
    createJourney: (): Journey => ({
      id: crypto.randomUUID(),
      name: 'Checkout Funnel',
      description: 'Complete ecommerce purchase funnel',
      templateId: 'ecommerce-checkout',
      events: [
        mkEvent(
          'view_item', 'View Item', 'User views a product detail page',
          'page_view', 'acquisition', 'none',
          [mkParam('item_id', 'string', true), mkParam('item_name', 'string', true), mkParam('price', 'number', true), mkParam('currency', 'string', true)],
          '/products/:id'
        ),
        mkEvent(
          'add_to_cart', 'Add to Cart', 'User adds an item to their cart',
          'user_action', 'acquisition', 'none',
          [mkParam('item_id', 'string', true), mkParam('item_name', 'string', true), mkParam('price', 'number', true), mkParam('quantity', 'number', true), mkParam('currency', 'string', true), mkParam('value', 'number', true)]
        ),
        mkEvent(
          'view_cart', 'View Cart', 'User views the cart page',
          'page_view', 'acquisition', 'none',
          [mkParam('value', 'number', false), mkParam('currency', 'string', true), mkParam('items', 'array', true)],
          '/cart'
        ),
        mkEvent(
          'begin_checkout', 'Begin Checkout', 'User initiates the checkout process',
          'user_action', 'revenue', 'none',
          [mkParam('value', 'number', true), mkParam('currency', 'string', true), mkParam('items', 'array', true)]
        ),
        mkEvent(
          'add_payment_info', 'Add Payment Info', 'User enters payment details',
          'user_action', 'revenue', 'none',
          [mkParam('value', 'number', false), mkParam('currency', 'string', true), mkParam('payment_type', 'string', false)]
        ),
        mkEvent(
          'add_shipping_info', 'Add Shipping Info', 'User enters shipping details',
          'user_action', 'revenue', 'none',
          [mkParam('value', 'number', false), mkParam('currency', 'string', true), mkParam('shipping_tier', 'string', false)]
        ),
        mkEvent(
          'purchase', 'Purchase', 'Transaction completed successfully',
          'success', 'revenue', 'primary',
          [mkParam('transaction_id', 'string', true), mkParam('value', 'number', true), mkParam('currency', 'string', true), mkParam('tax', 'number', false), mkParam('shipping', 'number', false), mkParam('items', 'array', true)]
        ),
      ],
    }),
  },

  {
    id: 'ecommerce-discovery',
    name: 'Product Discovery',
    description: 'Search and browse journey — search through category exploration',
    category: 'ecommerce',
    businessModels: ['ecommerce', 'marketplace'],
    eventCount: 4,
    createJourney: (): Journey => ({
      id: crypto.randomUUID(),
      name: 'Product Discovery',
      description: 'Product search and browse journey',
      templateId: 'ecommerce-discovery',
      events: [
        mkEvent(
          'search', 'Search', 'User performs a product search',
          'user_action', 'acquisition', 'none',
          [mkParam('search_term', 'string', true)]
        ),
        mkEvent(
          'view_item_list', 'View Item List', 'User views a product listing or category page',
          'page_view', 'acquisition', 'none',
          [mkParam('item_list_id', 'string', false), mkParam('item_list_name', 'string', true), mkParam('items', 'array', true)],
          '/category/:slug'
        ),
        mkEvent(
          'select_item', 'Select Item', 'User clicks a product from a list',
          'user_action', 'acquisition', 'none',
          [mkParam('item_list_name', 'string', false), mkParam('item_id', 'string', true), mkParam('item_name', 'string', true)]
        ),
        mkEvent(
          'view_item', 'View Item', 'User views a product detail page',
          'page_view', 'acquisition', 'none',
          [mkParam('item_id', 'string', true), mkParam('item_name', 'string', true), mkParam('price', 'number', true), mkParam('currency', 'string', true)],
          '/products/:id'
        ),
      ],
    }),
  },

  {
    id: 'saas-signup',
    name: 'Signup Funnel',
    description: 'User registration and account creation flow',
    category: 'saas',
    businessModels: ['saas'],
    eventCount: 3,
    createJourney: (): Journey => ({
      id: crypto.randomUUID(),
      name: 'Signup Funnel',
      description: 'SaaS user registration flow',
      templateId: 'saas-signup',
      events: [
        mkEvent(
          'view_signup_page', 'View Signup Page', 'User lands on the signup page',
          'page_view', 'acquisition', 'none',
          [mkParam('page_location', 'string', false)],
          '/signup'
        ),
        mkEvent(
          'begin_signup', 'Begin Signup', 'User starts filling out the signup form',
          'user_action', 'activation', 'none',
          [mkParam('method', 'string', false)]
        ),
        mkEvent(
          'signup_complete', 'Signup Complete', 'Account created successfully',
          'success', 'activation', 'primary',
          [mkParam('method', 'string', false), mkParam('user_id', 'string', false)]
        ),
      ],
    }),
  },

  {
    id: 'saas-activation',
    name: 'Activation Journey',
    description: 'Post-signup activation — first value moment',
    category: 'saas',
    businessModels: ['saas'],
    eventCount: 4,
    createJourney: (): Journey => ({
      id: crypto.randomUUID(),
      name: 'Activation Journey',
      description: 'SaaS user activation and first-value journey',
      templateId: 'saas-activation',
      events: [
        mkEvent(
          'onboarding_start', 'Onboarding Start', 'User begins the onboarding flow',
          'page_view', 'activation', 'none',
          [mkParam('user_id', 'string', false)],
          '/onboarding'
        ),
        mkEvent(
          'feature_used', 'Feature Used', 'User uses a core product feature for the first time',
          'user_action', 'activation', 'none',
          [mkParam('feature_name', 'string', true)]
        ),
        mkEvent(
          'onboarding_complete', 'Onboarding Complete', 'User completes the onboarding checklist',
          'success', 'activation', 'secondary',
          [mkParam('user_id', 'string', false), mkParam('steps_completed', 'number', false)]
        ),
        mkEvent(
          'upgrade_intent', 'Upgrade Intent', 'User views pricing or initiates upgrade',
          'user_action', 'revenue', 'none',
          [mkParam('plan_viewed', 'string', false)],
          '/pricing'
        ),
      ],
    }),
  },

  {
    id: 'leadgen-contact',
    name: 'Contact Flow',
    description: 'Contact form submission lead generation flow',
    category: 'leadgen',
    businessModels: ['leadgen', 'media'],
    eventCount: 3,
    createJourney: (): Journey => ({
      id: crypto.randomUUID(),
      name: 'Contact Flow',
      description: 'Lead generation contact form flow',
      templateId: 'leadgen-contact',
      events: [
        mkEvent(
          'view_contact_page', 'View Contact Page', 'User views the contact page',
          'page_view', 'acquisition', 'none',
          [mkParam('page_location', 'string', false)],
          '/contact'
        ),
        mkEvent(
          'begin_form', 'Begin Form', 'User starts filling out the contact form',
          'user_action', 'activation', 'none',
          [mkParam('form_name', 'string', true), mkParam('form_id', 'string', false)]
        ),
        mkEvent(
          'lead_submit', 'Lead Submit', 'User submits the contact form',
          'success', 'revenue', 'primary',
          [mkParam('form_name', 'string', true), mkParam('form_id', 'string', false), mkParam('form_destination', 'string', false)]
        ),
      ],
    }),
  },

  {
    id: 'leadgen-download',
    name: 'Download Flow',
    description: 'Content download or lead magnet flow',
    category: 'leadgen',
    businessModels: ['leadgen', 'media'],
    eventCount: 3,
    createJourney: (): Journey => ({
      id: crypto.randomUUID(),
      name: 'Download Flow',
      description: 'Content download lead generation flow',
      templateId: 'leadgen-download',
      events: [
        mkEvent(
          'view_download_page', 'View Download Page', 'User views the content download page',
          'page_view', 'acquisition', 'none',
          [mkParam('content_name', 'string', true)],
          '/resources/:slug'
        ),
        mkEvent(
          'download_intent', 'Download Intent', 'User clicks the download CTA',
          'user_action', 'activation', 'none',
          [mkParam('content_name', 'string', true), mkParam('content_type', 'string', false)]
        ),
        mkEvent(
          'download_complete', 'Download Complete', 'User successfully receives the content',
          'success', 'revenue', 'primary',
          [mkParam('content_name', 'string', true), mkParam('email', 'string', true)]
        ),
      ],
    }),
  },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

export function getDefaultJourneysForBusinessModel(businessModel?: string): Journey[] {
  if (!businessModel) return [];
  const template = JOURNEY_TEMPLATES.find((t) => t.businessModels.includes(businessModel));
  if (!template) return [];
  return [template.createJourney()];
}
