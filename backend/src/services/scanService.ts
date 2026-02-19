import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  scanMethod: 'browser' | 'http';
}

// ─── Chrome Path Detection ────────────────────────────────────────────────────

function findChromePath(): string | null {
  const candidates: string[] = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/usr/local/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Chromium\\Application\\chrome.exe',
  ];

  // Add Windows LOCALAPPDATA path if defined
  const localAppData = process.env['LOCALAPPDATA'];
  if (localAppData) {
    candidates.push(path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'));
  }

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

// ─── Event Name Inference ─────────────────────────────────────────────────────

function inferEventName(text: string): string {
  const t = text.toLowerCase().trim();
  if (t.includes('add to cart') || t.includes('add to bag')) return 'add_to_cart';
  if (t.includes('buy now') || t.includes('purchase')) return 'purchase_intent';
  if (t.includes('checkout') || t.includes('check out') || t.includes('proceed to checkout')) return 'begin_checkout';
  if (t.includes('sign up') || t.includes('signup') || t.includes('create account') || t.includes('register')) return 'sign_up';
  if (t.includes('log in') || t.includes('login') || t.includes('sign in')) return 'login';
  if (t.includes('subscribe') || t.includes('newsletter')) return 'subscribe';
  if (t.includes('download') || t.includes('get pdf') || t.includes('get guide')) return 'file_download';
  if (t.includes('contact') || t.includes('get in touch') || t.includes('reach out')) return 'contact_click';
  if (t.includes('get started') || t.includes('start free') || t.includes('try free')) return 'cta_get_started';
  if (t.includes('learn more') || t.includes('find out more') || t.includes('read more')) return 'cta_learn_more';
  if (t.includes('request demo') || t.includes('book demo') || t.includes('schedule demo')) return 'demo_request';
  if (t.includes('book') || t.includes('schedule') || t.includes('appointment')) return 'booking_click';
  if (t.includes('wishlist') || t.includes('save for later') || t.includes('save item')) return 'add_to_wishlist';
  if (t.includes('quick view') || t.includes('view product')) return 'view_item';
  if (t.includes('search')) return 'search';
  return 'button_click';
}

// ─── Priority Classification ──────────────────────────────────────────────────

function getPriority(type: string, eventName: string): 'high' | 'medium' | 'low' {
  const highEvents = new Set([
    'add_to_cart', 'begin_checkout', 'purchase_intent', 'sign_up',
    'contact_click', 'demo_request', 'cta_get_started', 'booking_click',
    'contact_form_submit', 'phone_click',
  ]);
  const mediumEvents = new Set([
    'subscribe', 'file_download', 'video_play', 'cta_learn_more', 'login',
    'add_to_wishlist', 'view_item', 'search', 'email_click',
  ]);

  if (type === 'form') return 'high';
  if (highEvents.has(eventName)) return 'high';
  if (mediumEvents.has(eventName)) return 'medium';
  if (type === 'video') return 'medium';
  return 'low';
}

// ─── Group Similar Elements ───────────────────────────────────────────────────

function groupSimilar(items: ScannedElement[]): ScannedElement[] {
  const grouped: Record<string, ScannedElement> = {};
  items.forEach((item) => {
    const key = `${item.type}__${item.suggestedEventName}__${item.text.slice(0, 30).toLowerCase()}`;
    if (!grouped[key]) {
      grouped[key] = { ...item, instances: 1 };
    } else {
      grouped[key].instances++;
    }
  });
  return Object.values(grouped);
}

// ─── Browser Scanner (Puppeteer) ──────────────────────────────────────────────

async function browserScan(url: string, chromePath: string): Promise<ScanResult> {
  const puppeteer = await import('puppeteer-core');

  const browser = await puppeteer.default.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--blink-settings=imagesEnabled=false',
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

    // Let JS hydrate briefly
    await new Promise((r) => setTimeout(r, 1500));

    // ── Platform detection ────────────────────────────────────────────────────
    const platform: string = await page.evaluate(() => {
      const gen = document.querySelector<HTMLMetaElement>('meta[name="generator"]')?.content?.toLowerCase() ?? '';
      if (gen.includes('shopify')) return 'shopify';
      if (gen.includes('woocommerce')) return 'woocommerce';
      if (gen.includes('wordpress')) return 'wordpress';
      if (gen.includes('webflow')) return 'webflow';
      if (gen.includes('squarespace')) return 'squarespace';
      if (gen.includes('wix')) return 'wix';

      const scripts = Array.from(document.scripts).map((s) => s.src);
      if (scripts.some((s) => s.includes('cdn.shopify.com'))) return 'shopify';
      if (scripts.some((s) => s.includes('wp-includes') || s.includes('wp-content'))) return 'wordpress';
      if (scripts.some((s) => s.includes('webflow.com'))) return 'webflow';
      if (scripts.some((s) => s.includes('squarespace.com'))) return 'squarespace';
      if (scripts.some((s) => s.includes('static.wixstatic.com'))) return 'wix';
      if (document.querySelector('[data-shopify]')) return 'shopify';
      if (document.querySelector('.woocommerce')) return 'woocommerce';

      return 'custom';
    });

    // ── Tracking detection ────────────────────────────────────────────────────
    const existingTracking: TrackingDetection[] = await page.evaluate(() => {
      const results: Array<{ type: string; found: boolean; details?: Record<string, string> }> = [];
      const scripts = Array.from(document.scripts).map((s) => s.src);
      const html = document.documentElement.innerHTML;

      const gtmScript = scripts.find((s) => s.includes('googletagmanager.com/gtm.js'));
      const gtmId = gtmScript?.match(/id=(GTM-[A-Z0-9]+)/)?.[1] ?? html.match(/GTM-[A-Z0-9]+/)?.[0];
      if (gtmScript || (window as any).google_tag_manager) {
        results.push({ type: 'Google Tag Manager', found: true, details: gtmId ? { containerId: gtmId } : {} });
      }

      const ga4Script = scripts.find((s) => s.includes('gtag/js'));
      const ga4Id = ga4Script?.match(/id=(G-[A-Z0-9]+)/)?.[1] ?? html.match(/G-[A-Z0-9]{8,}/)?.[0];
      if (ga4Script || (window as any).gtag) {
        results.push({ type: 'Google Analytics 4 (GA4)', found: true, details: ga4Id ? { measurementId: ga4Id } : {} });
      }

      if ((window as any).ga || (window as any)._gaq) {
        results.push({ type: 'Google Analytics (UA)', found: true });
      }

      const fbPixelId = html.match(/fbq\('init',\s*'(\d+)'\)/)?.[1];
      if (scripts.some((s) => s.includes('connect.facebook.net')) || (window as any).fbq) {
        results.push({ type: 'Meta Pixel', found: true, details: fbPixelId ? { pixelId: fbPixelId } : {} });
      }

      if ((window as any)._linkedin_data_partner_ids || html.includes('snap.licdn.com')) {
        results.push({ type: 'LinkedIn Insight Tag', found: true });
      }
      if (html.includes('analytics.tiktok.com') || (window as any).ttq) {
        results.push({ type: 'TikTok Pixel', found: true });
      }
      if (html.includes('static.hotjar.com') || (window as any).hj) {
        results.push({ type: 'Hotjar', found: true });
      }

      return results;
    });

    // ── Extract interactive elements ──────────────────────────────────────────
    const rawElements: Array<{
      type: string; id: string; text: string; selector: string;
      suggestedEventName: string; eventParams?: Record<string, string>;
    }> = await page.evaluate(() => {
      const items: any[] = [];
      let counter = 0;

      const getSelector = (el: Element): string => {
        if (el.id) return `#${el.id}`;
        const tag = el.tagName.toLowerCase();
        const classes = Array.from(el.classList)
          .filter((c) => c && !c.match(/^\d/) && c.length < 40)
          .slice(0, 2).join('.');
        const base = classes ? `${tag}.${classes}` : tag;
        const parent = el.parentElement;
        if (!parent || parent === document.body) return base;
        const parentTag = parent.tagName.toLowerCase();
        const parentClass = Array.from(parent.classList).slice(0, 1).join('.');
        const parentSel = parentClass ? `${parentTag}.${parentClass}` : parentTag;
        return `${parentSel} > ${base}`;
      };

      const inferEvent = (text: string): string => {
        const t = text.toLowerCase().trim();
        if (t.includes('add to cart') || t.includes('add to bag')) return 'add_to_cart';
        if (t.includes('buy now') || t.includes('purchase')) return 'purchase_intent';
        if (t.includes('checkout') || t.includes('proceed to checkout')) return 'begin_checkout';
        if (t.includes('sign up') || t.includes('signup') || t.includes('create account') || t.includes('register')) return 'sign_up';
        if (t.includes('log in') || t.includes('login') || t.includes('sign in')) return 'login';
        if (t.includes('subscribe') || t.includes('newsletter')) return 'subscribe';
        if (t.includes('download')) return 'file_download';
        if (t.includes('contact') || t.includes('get in touch')) return 'contact_click';
        if (t.includes('get started') || t.includes('start free') || t.includes('try free')) return 'cta_get_started';
        if (t.includes('learn more') || t.includes('find out more')) return 'cta_learn_more';
        if (t.includes('request demo') || t.includes('book demo') || t.includes('schedule demo')) return 'demo_request';
        if (t.includes('book') || t.includes('schedule') || t.includes('appointment')) return 'booking_click';
        if (t.includes('wishlist') || t.includes('save for later')) return 'add_to_wishlist';
        if (t.includes('quick view') || t.includes('view product')) return 'view_item';
        if (t.includes('search')) return 'search';
        return 'button_click';
      };

      // Buttons & CTAs
      const btnSel = 'button, input[type="submit"], input[type="button"], [role="button"], a.btn, a.button, a[class*="btn-"], a[class*="-btn"], a[class*="cta"]';
      document.querySelectorAll<HTMLElement>(btnSel).forEach((el) => {
        const text = (el.innerText || (el as HTMLInputElement).value || el.getAttribute('aria-label') || '').trim();
        if (!text || text.length < 2 || text.length > 80) return;
        items.push({
          type: 'button', id: `btn_${counter++}`, text,
          selector: getSelector(el),
          suggestedEventName: inferEvent(text),
          eventParams: { button_text: text },
        });
      });

      // Forms
      document.querySelectorAll<HTMLFormElement>('form').forEach((form) => {
        const fields = Array.from(form.elements).filter((el: any) => el.name && el.type !== 'hidden');
        if (fields.length === 0) return;
        const submitEl = form.querySelector<HTMLElement>('[type="submit"], button[type="submit"], button:not([type])');
        const submitText = submitEl?.innerText?.trim() || 'Submit';
        const formText = (form.innerText || '').toLowerCase();
        let purpose = 'generic'; let eventName = 'form_submit';
        if (formText.includes('contact') || fields.some((f: any) => /message|comment|enquiry/i.test(f.name))) { purpose = 'contact'; eventName = 'contact_form_submit'; }
        else if (formText.includes('newsletter') || formText.includes('subscribe') || (fields.length <= 3 && fields.some((f: any) => f.type === 'email'))) { purpose = 'newsletter'; eventName = 'subscribe'; }
        else if (formText.includes('checkout') || formText.includes('billing') || formText.includes('payment')) { purpose = 'checkout'; eventName = 'begin_checkout'; }
        else if (formText.includes('login') || formText.includes('sign in') || formText.includes('password')) { purpose = 'login'; eventName = 'login'; }
        else if (formText.includes('register') || formText.includes('sign up') || formText.includes('create account')) { purpose = 'signup'; eventName = 'sign_up'; }
        else if (formText.includes('search')) { purpose = 'search'; eventName = 'search'; }
        items.push({
          type: 'form', id: `form_${counter++}`,
          text: `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Form (${submitText})`,
          selector: getSelector(form),
          suggestedEventName: eventName,
          eventParams: { form_purpose: purpose, submit_text: submitText },
        });
      });

      // Special links: tel, mailto, downloads, social
      document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
        const href = link.getAttribute('href') || '';
        const text = link.innerText.trim();
        if (!href) return;
        if (href.startsWith('tel:')) {
          items.push({ type: 'link', id: `link_${counter++}`, text: text || href, selector: 'a[href^="tel:"]', suggestedEventName: 'phone_click', eventParams: { phone: href.replace('tel:', '') } });
        } else if (href.startsWith('mailto:')) {
          items.push({ type: 'link', id: `link_${counter++}`, text: text || 'Email', selector: 'a[href^="mailto:"]', suggestedEventName: 'email_click', eventParams: { email: href.replace('mailto:', '').split('?')[0] } });
        } else if (/\.(pdf|docx?|xlsx?|zip|pptx?)(\?.*)?$/i.test(href)) {
          const ext = href.match(/\.([a-z]+)(\?.*)?$/i)?.[1]?.toLowerCase() ?? 'file';
          items.push({ type: 'link', id: `link_${counter++}`, text: text || 'Download', selector: `a[href$=".${ext}"]`, suggestedEventName: 'file_download', eventParams: { file_extension: ext } });
        } else if (/facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com|youtube\.com|tiktok\.com|pinterest\.com/.test(href)) {
          const network = href.match(/\b(facebook|instagram|twitter|linkedin|youtube|tiktok|pinterest)\b/i)?.[1]?.toLowerCase() ?? 'social';
          if (text) items.push({ type: 'link', id: `link_${counter++}`, text, selector: `a[href*="${network}.com"]`, suggestedEventName: 'social_click', eventParams: { social_network: network } });
        }
      });

      // Videos
      document.querySelectorAll<HTMLElement>('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="vimeo.com"], video').forEach((el) => {
        const src = (el as HTMLIFrameElement).src || '';
        const provider = src.includes('vimeo') ? 'vimeo' : 'youtube';
        items.push({ type: 'video', id: `video_${counter++}`, text: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Video`, selector: `iframe[src*="${provider}.com"]`, suggestedEventName: 'video_play', eventParams: { video_provider: provider } });
      });

      return items;
    });

    await browser.close();

    // Build final structured result
    const allElements: ScannedElement[] = rawElements.map((el) => {
      const priority = getPriority(el.type, el.suggestedEventName);
      return {
        id: el.id, type: el.type as ScannedElement['type'],
        text: el.text, selector: el.selector, instances: 1,
        priority, suggestedEventName: el.suggestedEventName,
        eventParams: el.eventParams, selected: priority === 'high',
        page: 'Scanned page',
      };
    });

    const grouped = groupSimilar(allElements);
    const highPriority = grouped.filter((e) => e.priority === 'high');
    const mediumPriority = grouped.filter((e) => e.priority === 'medium');
    const lowPriority = grouped.filter((e) => e.priority === 'low');

    return {
      url, scanDate: new Date().toISOString(), platform, existingTracking,
      elements: { highPriority, mediumPriority, lowPriority },
      totalCount: grouped.length,
      selectedCount: grouped.filter((e) => e.selected).length,
      scanMethod: 'browser',
    };
  } catch (err) {
    await browser.close().catch(() => {});
    throw err;
  }
}

// ─── HTTP Fallback Scanner (no Chrome needed) ─────────────────────────────────

async function httpScan(url: string): Promise<ScanResult> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AtlasTrackForge/1.0; +https://atlas-trackforge.com)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);

  const html = await response.text();

  // Platform
  let platform = 'custom';
  if (html.includes('cdn.shopify.com') || html.includes('Shopify.theme')) platform = 'shopify';
  else if (html.includes('woocommerce')) platform = 'woocommerce';
  else if (html.includes('wp-content') || html.includes('wp-includes')) platform = 'wordpress';
  else if (html.includes('webflow.com')) platform = 'webflow';
  else if (html.includes('squarespace.com')) platform = 'squarespace';
  else if (html.includes('static.wixstatic.com')) platform = 'wix';
  else {
    const gen = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (gen?.includes('wordpress')) platform = 'wordpress';
    else if (gen?.includes('shopify')) platform = 'shopify';
    else if (gen?.includes('webflow')) platform = 'webflow';
  }

  // Tracking
  const tracking: TrackingDetection[] = [];
  const gtmId = html.match(/GTM-[A-Z0-9]+/)?.[0];
  if (html.includes('googletagmanager.com/gtm.js') || gtmId) {
    tracking.push({ type: 'Google Tag Manager', found: true, details: gtmId ? { containerId: gtmId } : {} });
  }
  const ga4Id = html.match(/G-[A-Z0-9]{8,}/)?.[0];
  if (html.includes('gtag/js') || html.includes("gtag('config'") || ga4Id) {
    tracking.push({ type: 'Google Analytics 4 (GA4)', found: true, details: ga4Id ? { measurementId: ga4Id } : {} });
  }
  if (html.includes('google-analytics.com/analytics.js') || html.includes("ga('create'")) {
    tracking.push({ type: 'Google Analytics (UA)', found: true });
  }
  const pixelId = html.match(/fbq\('init',\s*'(\d+)'\)/)?.[1];
  if (html.includes('connect.facebook.net') || pixelId) {
    tracking.push({ type: 'Meta Pixel', found: true, details: pixelId ? { pixelId } : {} });
  }
  if (html.includes('snap.licdn.com')) tracking.push({ type: 'LinkedIn Insight Tag', found: true });
  if (html.includes('analytics.tiktok.com')) tracking.push({ type: 'TikTok Pixel', found: true });
  if (html.includes('static.hotjar.com')) tracking.push({ type: 'Hotjar', found: true });

  // Elements from raw HTML
  const allElements: ScannedElement[] = [];
  let counter = 0;

  // Buttons
  const seenTexts = new Set<string>();
  for (const m of html.matchAll(/<button[^>]*>([\s\S]{1,120}?)<\/button>/gi)) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!text || text.length < 2 || text.length > 80 || seenTexts.has(text.toLowerCase())) continue;
    seenTexts.add(text.toLowerCase());
    const eventName = inferEventName(text);
    const priority = getPriority('button', eventName);
    allElements.push({ id: `btn_${counter++}`, type: 'button', text, selector: 'button', instances: 1, priority, suggestedEventName: eventName, eventParams: { button_text: text }, selected: priority === 'high', page: 'Scanned page' });
  }
  // input[type=submit]
  for (const m of html.matchAll(/<input[^>]+type=["']submit["'][^>]+value=["']([^"']{1,60})["']/gi)) {
    const text = m[1].trim();
    if (!text || seenTexts.has(text.toLowerCase())) continue;
    seenTexts.add(text.toLowerCase());
    const eventName = inferEventName(text);
    const priority = getPriority('button', eventName);
    allElements.push({ id: `btn_${counter++}`, type: 'button', text, selector: 'input[type="submit"]', instances: 1, priority, suggestedEventName: eventName, eventParams: { button_text: text }, selected: priority === 'high', page: 'Scanned page' });
  }

  // Forms
  for (const m of html.matchAll(/<form[\s\S]*?<\/form>/gi)) {
    const formHtml = m[0].toLowerCase();
    let eventName = 'form_submit'; let purpose = 'generic';
    if (formHtml.includes('contact') || /name=["']message["']|name=["']comment["']/.test(formHtml)) { purpose = 'contact'; eventName = 'contact_form_submit'; }
    else if (formHtml.includes('newsletter') || formHtml.includes('subscribe')) { purpose = 'newsletter'; eventName = 'subscribe'; }
    else if (formHtml.includes('checkout') || formHtml.includes('billing') || formHtml.includes('payment')) { purpose = 'checkout'; eventName = 'begin_checkout'; }
    else if (formHtml.includes('password') || formHtml.includes('login') || formHtml.includes('sign in')) { purpose = 'login'; eventName = 'login'; }
    else if (formHtml.includes('register') || formHtml.includes('sign up') || formHtml.includes('create account')) { purpose = 'signup'; eventName = 'sign_up'; }
    else if (formHtml.includes('search')) { purpose = 'search'; eventName = 'search'; }
    const submitMatch = formHtml.match(/value=["']([^"']{1,40})["'][^>]*type=["']submit["']|type=["']submit["'][^>]*value=["']([^"']{1,40})["']|<button[^>]*>([\s\S]{1,40}?)<\/button>/);
    const submitText = (submitMatch?.[1] || submitMatch?.[2] || submitMatch?.[3] || 'Submit').replace(/<[^>]+>/g, '').trim();
    allElements.push({ id: `form_${counter++}`, type: 'form', text: `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Form (${submitText})`, selector: 'form', instances: 1, priority: 'high', suggestedEventName: eventName, eventParams: { form_purpose: purpose }, selected: true, page: 'Scanned page' });
  }

  // Tel links
  const telMatch = html.match(/href=["'](tel:[^"'\s]+)["']/i);
  if (telMatch) allElements.push({ id: `link_${counter++}`, type: 'link', text: telMatch[1].replace('tel:', ''), selector: 'a[href^="tel:"]', instances: 1, priority: 'high', suggestedEventName: 'phone_click', eventParams: { phone: telMatch[1].replace('tel:', '') }, selected: true, page: 'Scanned page' });

  // Mailto
  const mailMatch = html.match(/href=["'](mailto:[^"'?\s]+)/i);
  if (mailMatch) allElements.push({ id: `link_${counter++}`, type: 'link', text: mailMatch[1].replace('mailto:', ''), selector: 'a[href^="mailto:"]', instances: 1, priority: 'medium', suggestedEventName: 'email_click', eventParams: { email: mailMatch[1].replace('mailto:', '') }, selected: false, page: 'Scanned page' });

  // Downloads
  if (/href=["'][^"']*\.(pdf|docx?|zip|xlsx?)/i.test(html)) {
    const ext = html.match(/href=["'][^"']*\.([a-z]+)/i)?.[1] ?? 'pdf';
    allElements.push({ id: `link_${counter++}`, type: 'link', text: 'File Download', selector: `a[href$=".${ext}"]`, instances: 1, priority: 'medium', suggestedEventName: 'file_download', eventParams: { file_extension: ext }, selected: false, page: 'Scanned page' });
  }

  // Social
  for (const network of ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest']) {
    if (html.toLowerCase().includes(`${network}.com`)) {
      allElements.push({ id: `link_${counter++}`, type: 'link', text: `${network.charAt(0).toUpperCase() + network.slice(1)}`, selector: `a[href*="${network}.com"]`, instances: 1, priority: 'low', suggestedEventName: 'social_click', eventParams: { social_network: network }, selected: false, page: 'Footer' });
    }
  }

  // Videos
  if (html.includes('youtube.com/embed') || html.includes('youtu.be')) {
    allElements.push({ id: `video_${counter++}`, type: 'video', text: 'YouTube Video', selector: 'iframe[src*="youtube.com"]', instances: 1, priority: 'medium', suggestedEventName: 'video_play', eventParams: { video_provider: 'youtube' }, selected: false, page: 'Scanned page' });
  }
  if (html.includes('player.vimeo.com')) {
    allElements.push({ id: `video_${counter++}`, type: 'video', text: 'Vimeo Video', selector: 'iframe[src*="vimeo.com"]', instances: 1, priority: 'medium', suggestedEventName: 'video_play', eventParams: { video_provider: 'vimeo' }, selected: false, page: 'Scanned page' });
  }

  const grouped = groupSimilar(allElements);
  return {
    url, scanDate: new Date().toISOString(), platform, existingTracking: tracking,
    elements: {
      highPriority: grouped.filter((e) => e.priority === 'high'),
      mediumPriority: grouped.filter((e) => e.priority === 'medium'),
      lowPriority: grouped.filter((e) => e.priority === 'low'),
    },
    totalCount: grouped.length,
    selectedCount: grouped.filter((e) => e.selected).length,
    scanMethod: 'http',
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function scanWebsite(url: string): Promise<ScanResult> {
  const chromePath = findChromePath();

  if (chromePath) {
    console.log(`[scan] Chrome found at: ${chromePath} — using browser scan`);
    try {
      return await browserScan(url, chromePath);
    } catch (err: any) {
      console.warn(`[scan] Browser scan failed (${err.message}) — falling back to HTTP scan`);
      return await httpScan(url);
    }
  }

  console.log('[scan] No Chrome found — using HTTP scan (install Chrome for full JS-rendered scanning)');
  return await httpScan(url);
}
