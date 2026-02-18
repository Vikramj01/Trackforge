// Site scanning service using heuristic analysis
// In production this would use Puppeteer/Playwright for real browser automation

export interface TrackingDetection {
  type: string;
  found: boolean;
  details?: Record<string, string>;
}

export interface ScannedElement {
  id: string;
  type: 'button' | 'form' | 'link' | 'video';
  text: string;
  selector: string;
  instances: number;
  priority: 'high' | 'medium' | 'low';
  suggestedEventName: string;
  eventParams?: Record<string, string>;
  selected: boolean;
  page?: string;
}

export interface ScanResult {
  url: string;
  scanDate: string;
  platform: string;
  existingTracking: TrackingDetection[];
  elements: {
    highPriority: ScannedElement[];
    mediumPriority: ScannedElement[];
    lowPriority: ScannedElement[];
  };
  totalCount: number;
  selectedCount: number;
}

const inferPlatformFromUrl = (url: string): string => {
  if (url.includes('shopify')) return 'shopify';
  if (url.includes('wordpress') || url.includes('wp-')) return 'wordpress';
  if (url.includes('webflow')) return 'webflow';
  if (url.includes('squarespace')) return 'squarespace';
  return 'custom';
};

const generateMockScanForUrl = (url: string, platform: string): ScanResult => {
  const isEcommerce = platform === 'shopify' || platform === 'woocommerce' || url.includes('shop') || url.includes('store');
  const isLeadGen = url.includes('contact') || url.includes('agency') || url.includes('consulting');

  const highPriority: ScannedElement[] = [];
  const mediumPriority: ScannedElement[] = [];
  const lowPriority: ScannedElement[] = [];

  if (isEcommerce) {
    highPriority.push(
      { id: 'btn_0', type: 'button', text: 'Add to Cart', selector: '#product-form button.btn-add-cart', instances: 12, priority: 'high', suggestedEventName: 'add_to_cart', eventParams: { button_location: 'product_page' }, selected: true, page: 'Product pages' },
      { id: 'btn_1', type: 'button', text: 'Proceed to Checkout', selector: '.cart__checkout-button', instances: 1, priority: 'high', suggestedEventName: 'begin_checkout', eventParams: { button_location: 'cart_page' }, selected: true, page: 'Cart page' },
      { id: 'form_0', type: 'form', text: 'Newsletter Signup', selector: 'form.newsletter-form', instances: 2, priority: 'high', suggestedEventName: 'subscribe', selected: true, page: 'Footer' }
    );
    mediumPriority.push(
      { id: 'btn_2', type: 'button', text: 'Buy Now', selector: '.product-buy-now', instances: 8, priority: 'medium', suggestedEventName: 'purchase_intent', selected: false, page: 'Product pages' },
      { id: 'video_0', type: 'video', text: 'Product Video', selector: 'iframe[src*="youtube.com"]', instances: 2, priority: 'medium', suggestedEventName: 'video_play', selected: false, page: 'Product pages' }
    );
  } else {
    highPriority.push(
      { id: 'form_0', type: 'form', text: 'Contact Form', selector: 'form#contact-form', instances: 1, priority: 'high', suggestedEventName: 'contact_form_submit', eventParams: { form_name: 'contact' }, selected: true, page: 'Contact page' },
      { id: 'btn_0', type: 'button', text: 'Get Started', selector: '.hero-cta, .btn-primary', instances: 3, priority: 'high', suggestedEventName: 'cta_click', eventParams: { button_location: 'hero' }, selected: true, page: 'Homepage' },
      { id: 'link_0', type: 'link', text: 'Phone Number', selector: 'a[href^="tel:"]', instances: 2, priority: 'high', suggestedEventName: 'phone_click', selected: true, page: 'Header, Footer' }
    );
    mediumPriority.push(
      { id: 'form_1', type: 'form', text: 'Newsletter Signup', selector: 'form.newsletter-form', instances: 1, priority: 'medium', suggestedEventName: 'subscribe', selected: false, page: 'Footer' },
      { id: 'btn_1', type: 'button', text: 'Learn More', selector: '.btn-learn-more', instances: 4, priority: 'medium', suggestedEventName: 'cta_learn_more', selected: false, page: 'Services section' }
    );
  }

  lowPriority.push(
    { id: 'link_nav', type: 'link', text: 'Navigation Links', selector: 'header nav a', instances: 8, priority: 'low', suggestedEventName: 'navigation_click', selected: false, page: 'All pages' },
    { id: 'link_footer', type: 'link', text: 'Footer Links', selector: 'footer a', instances: 12, priority: 'low', suggestedEventName: 'navigation_click', selected: false, page: 'All pages' },
    { id: 'link_social', type: 'link', text: 'Social Media Links', selector: 'a[href*="instagram.com"], a[href*="facebook.com"]', instances: 4, priority: 'low', suggestedEventName: 'social_click', selected: false, page: 'Footer' }
  );

  const totalCount = highPriority.length + mediumPriority.length + lowPriority.length;
  const selectedCount = highPriority.filter(e => e.selected).length;

  return {
    url,
    scanDate: new Date().toISOString(),
    platform,
    existingTracking: [
      { type: 'Google Analytics 4 (GA4)', found: Math.random() > 0.4 },
      { type: 'Google Tag Manager', found: Math.random() > 0.5 },
      { type: 'Meta Pixel', found: Math.random() > 0.6 },
    ].filter(t => t.found),
    elements: { highPriority, mediumPriority, lowPriority },
    totalCount,
    selectedCount,
  };
};

export const scanWebsite = async (url: string): Promise<ScanResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const platform = inferPlatformFromUrl(url);
  return generateMockScanForUrl(url, platform);
};
