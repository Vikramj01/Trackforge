// ─── Atlas Tracking Validator — Extension Popup ───────────────────────────────
// Change this to your deployed Atlas URL for production builds.
const ATLAS_URL = 'http://localhost:5173';

// ─── Bootstrap ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('app');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id || !tab.url || !/^https?:\/\//.test(tab.url)) {
      app.innerHTML = renderError(
        'Cannot scan this page.',
        "Navigate to a website first. Extensions can't scan chrome://, extension://, or local file pages."
      );
      return;
    }

    // Inject the scanner function directly into the page context
    const injection = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scanTrackingTags,
    });

    const raw = injection[0]?.result;
    if (!raw) {
      app.innerHTML = renderError('Scan returned no data.', 'Try refreshing the page and clicking the extension again.');
      return;
    }

    const results = buildResults(raw, tab.url);
    app.innerHTML = renderResults(results, tab.url);

    document.getElementById('btn-atlas')?.addEventListener('click', () => {
      const encoded = encodeURIComponent(btoa(JSON.stringify(results)));
      const targetUrl = `${ATLAS_URL}/validator?results=${encoded}`;
      // Navigate the currently-scanned tab to Atlas.
      // Simplest and most reliable: no cross-tab search, no scripting injection.
      chrome.tabs.update(tab.id, { url: targetUrl });
    });

    document.getElementById('btn-copy')?.addEventListener('click', () => {
      const encoded = encodeURIComponent(btoa(JSON.stringify(results)));
      navigator.clipboard.writeText(encoded).then(() => {
        const btn = document.getElementById('btn-copy');
        if (btn) {
          btn.textContent = '\u2713 Copied!';
          setTimeout(() => { btn.textContent = 'Copy results code'; }, 2000);
        }
      });
    });

  } catch (err) {
    app.innerHTML = renderError('Scan failed.', err.message || 'An unexpected error occurred.');
  }
});

// ─── Scanner — runs inside the target page context ────────────────────────────
// IMPORTANT: This function is serialised and injected into the page.
// It cannot reference anything outside itself (no closures, no imports).

function scanTrackingTags() {
  const raw = {
    hasGTM: false,
    gtmId: null,
    hasGA4: false,
    ga4Id: null,
    hasMetaPixel: false,
    metaPixelId: null,
    hasGoogleAds: false,
    googleAdsId: null,
    dataLayerEvents: [],
    isSPA: false,
  };

  // ─ GTM via window global ─
  if (window.google_tag_manager) {
    raw.hasGTM = true;
    const ids = Object.keys(window.google_tag_manager).filter(function(k) { return /^GTM-/.test(k); });
    raw.gtmId = ids[0] || null;
  }

  // ─ GTM via script src ─
  if (!raw.hasGTM) {
    var gtmEl = document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
    if (gtmEl) {
      raw.hasGTM = true;
      var m = gtmEl.getAttribute('src').match(/[?&]id=(GTM-[A-Z0-9]+)/);
      raw.gtmId = m ? m[1] : null;
    }
  }

  // ─ dataLayer events ─
  if (Array.isArray(window.dataLayer)) {
    raw.dataLayerEvents = window.dataLayer
      .map(function(e) { return e && e.event; })
      .filter(Boolean)
      .slice(0, 10);
  }

  // ─ Inline script text — scan for tag IDs ─
  var inlineScripts = Array.prototype.slice.call(document.querySelectorAll('script:not([src])'));
  var allText = inlineScripts.map(function(s) { return s.textContent || ''; }).join(' ');

  var ga4m = allText.match(/G-[A-Z0-9]{5,}/);
  if (ga4m) { raw.hasGA4 = true; raw.ga4Id = ga4m[0]; }

  var awm = allText.match(/AW-[0-9]{8,}/);
  if (awm) { raw.hasGoogleAds = true; raw.googleAdsId = awm[0]; }

  var fbm = allText.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"]?(\d{10,})/);
  if (fbm) { raw.hasMetaPixel = true; raw.metaPixelId = fbm[1]; }

  // ─ src scripts ─
  var srcScripts = Array.prototype.slice.call(document.querySelectorAll('script[src]'));
  srcScripts.forEach(function(s) {
    var src = s.getAttribute('src') || '';
    if (src.indexOf('googletagmanager.com/gtag') > -1) {
      var gm = src.match(/[?&]id=(G-[A-Z0-9]+)/);
      if (gm) { raw.hasGA4 = true; raw.ga4Id = raw.ga4Id || gm[0]; }
      var am = src.match(/[?&]id=(AW-[0-9]+)/);
      if (am) { raw.hasGoogleAds = true; raw.googleAdsId = raw.googleAdsId || am[0]; }
    }
    if (src.indexOf('connect.facebook.net') > -1) raw.hasMetaPixel = true;
  });

  // ─ window globals fallback ─
  if (window.fbq) raw.hasMetaPixel = true;

  // ─ SPA detection ─
  raw.isSPA = !!(
    window.__NEXT_DATA__ ||
    document.getElementById('__next') ||
    window.__nuxt__ ||
    document.getElementById('__nuxt') ||
    window.__vue_app__ ||
    document.querySelector('[data-reactroot]') ||
    (document.getElementById('root') && document.getElementById('root').childElementCount > 0)
  );

  return raw;
}

// ─── Build structured results from raw scan ───────────────────────────────────

function buildResults(raw, url) {
  var issues = [];
  var warnings = [];
  var passing = [];

  if (!raw.hasGTM) {
    issues.push({
      id: 'no_gtm',
      title: 'No Google Tag Manager',
      impact: 'Cannot manage tracking tags without a GTM container',
      cause: 'GTM container script (GTM-XXXXXXX) not detected on this page',
      severity: 'critical',
    });
  } else {
    passing.push('Google Tag Manager detected' + (raw.gtmId ? ' (' + raw.gtmId + ')' : ''));
  }

  if (!raw.hasGA4) {
    issues.push({
      id: 'no_ga4',
      title: 'No GA4 Measurement Tag',
      impact: 'No Google Analytics 4 data being collected on this page',
      cause: 'GA4 measurement ID (G-XXXXXXX) not found in scripts',
      severity: 'critical',
    });
  } else {
    passing.push('GA4 detected' + (raw.ga4Id ? ' (' + raw.ga4Id + ')' : ''));
  }

  if (!raw.hasMetaPixel) {
    warnings.push({
      id: 'no_meta',
      title: 'No Meta Pixel',
      impact: 'Missing Meta/Facebook conversion tracking — losing iOS conversions',
      cause: 'fbq() not initialized, connect.facebook.net script not loaded',
      severity: 'warning',
    });
  } else {
    passing.push('Meta Pixel detected' + (raw.metaPixelId ? ' (' + raw.metaPixelId + ')' : ''));
  }

  if (!raw.hasGoogleAds) {
    warnings.push({
      id: 'no_gads',
      title: 'No Google Ads Conversion Tag',
      impact: 'Google Ads conversion tracking may be inactive on this page',
      cause: 'AW-XXXXXXXXX conversion ID not found in scripts',
      severity: 'warning',
    });
  } else {
    passing.push('Google Ads detected' + (raw.googleAdsId ? ' (' + raw.googleAdsId + ')' : ''));
  }

  if (raw.hasGTM && raw.dataLayerEvents.length === 0) {
    warnings.push({
      id: 'empty_dl',
      title: 'dataLayer Has No Events',
      impact: 'GTM may not be firing any tags on this page',
      cause: 'window.dataLayer is empty — no events pushed on page load',
      severity: 'warning',
    });
  } else if (raw.dataLayerEvents.length > 0) {
    passing.push('dataLayer active: ' + raw.dataLayerEvents.slice(0, 3).join(', '));
  }

  var score = 100;
  score -= issues.length * 22;
  score -= warnings.length * 8;
  score = Math.max(0, Math.min(100, score));

  return {
    url: url,
    score: score,
    issues: issues,
    warnings: warnings,
    passing: passing,
    hasGTM: raw.hasGTM,
    hasGA4: raw.hasGA4,
    hasMetaPixel: raw.hasMetaPixel,
    hasGoogleAds: raw.hasGoogleAds,
    propertyType: raw.isSPA ? 'spa' : 'webapp',
    dataLayerEvents: raw.dataLayerEvents,
  };
}

// ─── Render helpers ───────────────────────────────────────────────────────────

function scoreColor(s) {
  if (s <= 40) return '#EF4444';
  if (s <= 70) return '#F59E0B';
  return '#10B981';
}

function scoreLabel(s) {
  if (s <= 40) return 'Critical';
  if (s <= 70) return 'Needs Work';
  if (s <= 85) return 'Good';
  return 'Excellent';
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderResults(r, url) {
  var c = scoreColor(r.score);
  var shortUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  var issueHtml = r.issues.map(function(i) {
    return '<div class="issue" style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15)">'
      + '<div class="issue-title">\u2717 ' + esc(i.title) + '</div>'
      + '<div class="issue-impact">' + esc(i.impact) + '</div>'
      + '</div>';
  }).join('');

  var warnHtml = r.warnings.map(function(w) {
    return '<div class="issue" style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15)">'
      + '<div class="issue-title">\u26a0 ' + esc(w.title) + '</div>'
      + '<div class="issue-impact">' + esc(w.impact) + '</div>'
      + '</div>';
  }).join('');

  var passingHtml = r.passing.length > 0
    ? '<div class="passing-block">'
        + r.passing.map(function(p) {
            return '<div class="passing-item">\u2713 ' + esc(p) + '</div>';
          }).join('')
        + '</div>'
    : '';

  return '<div>'
    + '<div class="header"><span class="header-dot"></span><span class="header-label">Atlas Validator</span></div>'
    + '<div class="url-line" title="' + esc(url) + '">' + esc(shortUrl) + '</div>'
    + '<div class="score-row">'
    +   '<span class="score-num" style="color:' + c + '">' + r.score + '</span>'
    +   '<span class="score-denom">/100</span>'
    +   '<span class="score-badge" style="color:' + c + ';background:' + c + '22;border:1px solid ' + c + '44">'
    +     scoreLabel(r.score).toUpperCase()
    +   '</span>'
    + '</div>'
    + '<div class="stats">'
    +   '<div class="stat" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2)">'
    +     '<div class="stat-num" style="color:#EF4444">' + r.issues.length + '</div>'
    +     '<div class="stat-label">Critical</div>'
    +   '</div>'
    +   '<div class="stat" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2)">'
    +     '<div class="stat-num" style="color:#F59E0B">' + r.warnings.length + '</div>'
    +     '<div class="stat-label">Warnings</div>'
    +   '</div>'
    +   '<div class="stat" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2)">'
    +     '<div class="stat-num" style="color:#10B981">' + r.passing.length + '</div>'
    +     '<div class="stat-label">Passing</div>'
    +   '</div>'
    + '</div>'
    + issueHtml
    + warnHtml
    + passingHtml
    + '<button class="btn-primary" id="btn-atlas">Fix All Issues in Atlas \u2192</button>'
    + '<button class="btn-copy" id="btn-copy">Copy results code</button>'
    + '</div>';
}

function renderError(heading, detail) {
  return '<div class="error">'
    + '<p>' + esc(heading) + '</p>'
    + '<small>' + esc(detail) + '</small>'
    + '</div>';
}
