import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Copy,
  Check,
  FileCode2,
  BookOpen,
  Server,
  Package,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowLeft,
  Terminal,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Project } from '../../types';

// ─── GTM Container Generator ─────────────────────────────────────────────────

function generateGTMContainer(project: Project): string {
  const clientName = project.discovery?.clientName || 'Client';
  const journeys = project.journeys || [];
  const conversions = project.conversions || [];

  let tagId = 1;
  let triggerId = 1;
  let variableId = 1;

  const allEvents = journeys.flatMap((j) => j.events);
  const allParams = new Set<string>(['event_id', 'currency', 'value', 'transaction_id']);
  allEvents.forEach((e) => e.parameters.forEach((p) => allParams.add(p.name)));

  const builtInVariables = [
    { type: 'PAGE_URL', name: 'Page URL' },
    { type: 'PAGE_HOSTNAME', name: 'Page Hostname' },
    { type: 'PAGE_PATH', name: 'Page Path' },
    { type: 'REFERRER', name: 'Referrer' },
    { type: 'EVENT', name: 'Event' },
  ];

  const variables = Array.from(allParams).map((param) => ({
    accountId: '0',
    containerId: '0',
    variableId: String(variableId++),
    name: `DLV - ${param}`,
    type: 'v',
    parameter: [
      { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
      { type: 'BOOLEAN', key: 'setDefaultValue', value: 'false' },
      { type: 'TEMPLATE', key: 'name', value: param },
    ],
  }));

  const triggers = conversions.map((conv) => ({
    accountId: '0',
    containerId: '0',
    triggerId: String(triggerId++),
    name: `CE - ${conv.canonicalName}`,
    type: 'CUSTOM_EVENT',
    customEventFilter: [
      {
        type: 'EQUALS',
        parameter: [
          { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
          { type: 'TEMPLATE', key: 'arg1', value: conv.canonicalName },
        ],
      },
    ],
  }));

  const triggerMap = new Map(conversions.map((conv, i) => [conv.canonicalName, String(i + 1)]));
  const tags: object[] = [];

  conversions.forEach((conv) => {
    const tId = triggerMap.get(conv.canonicalName);
    if (!tId) return;

    const baseParams = [
      {
        type: 'MAP',
        map: [
          { type: 'TEMPLATE', key: 'name', value: 'event_id' },
          { type: 'TEMPLATE', key: 'value', value: '{{DLV - event_id}}' },
        ],
      },
    ];

    if (conv.isRevenueEvent || conv.valueLogic === 'dynamic') {
      baseParams.push({
        type: 'MAP',
        map: [
          { type: 'TEMPLATE', key: 'name', value: 'value' },
          { type: 'TEMPLATE', key: 'value', value: '{{DLV - value}}' },
        ],
      });
      baseParams.push({
        type: 'MAP',
        map: [
          { type: 'TEMPLATE', key: 'name', value: 'currency' },
          { type: 'TEMPLATE', key: 'value', value: '{{DLV - currency}}' },
        ],
      });
    }

    const isClientSide = ['client-only', 'both'].includes(conv.trackingMethod);

    if (conv.platforms.ga4Client.enabled && isClientSide) {
      tags.push({
        accountId: '0',
        containerId: '0',
        tagId: String(tagId++),
        name: `GA4 Event - ${conv.displayName}`,
        type: 'gaawe',
        parameter: [
          { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'false' },
          { type: 'TEMPLATE', key: 'measurementIdOverride', value: 'G-XXXXXXXXXX' },
          {
            type: 'TEMPLATE',
            key: 'eventName',
            value: conv.platforms.ga4Client.eventName || conv.canonicalName,
          },
          { type: 'LIST', key: 'eventParameters', list: baseParams },
        ],
        firingTriggerId: [tId],
      });
    }

    if (conv.platforms.metaPixel.enabled && isClientSide) {
      const pixelEventName = conv.platforms.metaPixel.eventName || conv.canonicalName;
      tags.push({
        accountId: '0',
        containerId: '0',
        tagId: String(tagId++),
        name: `Meta Pixel - ${conv.displayName}`,
        type: 'html',
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'html',
            value: `<script>\nfbq('track', '${pixelEventName}', {\n  value: {{DLV - value}},\n  currency: '${conv.currency}',\n  eventID: '{{DLV - event_id}}'\n});\n</script>`,
          },
          { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' },
        ],
        firingTriggerId: [tId],
      });
    }

    if (conv.platforms.googleAds.enabled && isClientSide) {
      tags.push({
        accountId: '0',
        containerId: '0',
        tagId: String(tagId++),
        name: `Google Ads Conv - ${conv.displayName}`,
        type: 'awct',
        parameter: [
          { type: 'TEMPLATE', key: 'conversionId', value: 'AW-XXXXXXXXXX' },
          {
            type: 'TEMPLATE',
            key: 'conversionLabel',
            value: conv.platforms.googleAds.conversionLabel || 'XXXXXXXXXXXX',
          },
          {
            type: 'TEMPLATE',
            key: 'conversionValue',
            value:
              conv.valueLogic === 'fixed' ? String(conv.fixedValue) : '{{DLV - value}}',
          },
          { type: 'TEMPLATE', key: 'currencyCode', value: conv.currency },
          { type: 'TEMPLATE', key: 'transactionId', value: '{{DLV - event_id}}' },
        ],
        firingTriggerId: [tId],
      });
    }
  });

  return JSON.stringify(
    {
      exportFormatVersion: 2,
      exportTime: new Date().toISOString().replace('T', ' ').split('.')[0],
      containerVersion: {
        path: 'accounts/0/containers/0/versions/0',
        accountId: '0',
        containerId: '0',
        containerVersionId: '0',
        container: {
          path: 'accounts/0/containers/0',
          accountId: '0',
          containerId: '0',
          name: `Atlas - ${clientName}`,
          publicId: 'GTM-XXXXXXX',
          usageContext: ['WEB'],
        },
        builtInVariable: builtInVariables,
        tag: tags,
        trigger: triggers,
        variable: variables,
      },
    },
    null,
    2
  );
}

// ─── Data Layer Spec Generator ────────────────────────────────────────────────

function generateDataLayerSpec(project: Project): string {
  const clientName = project.discovery?.clientName || 'Client';
  const journeys = project.journeys || [];
  const conversions = project.conversions || [];

  let out = `# Atlas Data Layer Specification
## ${clientName} — Generated by Atlas v1.0
**Date:** ${new Date().toLocaleDateString()}
**Website:** ${project.discovery?.website || 'N/A'}

---

## Overview

This specification defines the \`window.dataLayer\` events for each user action.
Events marked ⚡ use client-server deduplication via \`event_id\`.

### Deduplication Helper

\`\`\`javascript
window.dataLayer = window.dataLayer || [];

function generateEventId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
\`\`\`

---

`;

  journeys.forEach((journey) => {
    out += `## Journey: ${journey.name}\n\n`;
    if (journey.description) out += `${journey.description}\n\n`;

    journey.events.forEach((event, index) => {
      const conv = conversions.find((c) => c.eventId === event.id);
      const isConversion = event.conversionType !== 'none';

      out += `### Step ${index + 1}: ${event.displayName}${isConversion ? ' ⚡' : ''}\n\n`;
      out += `**Canonical Name:** \`${event.canonicalName}\`  \n`;
      out += `**Type:** ${event.eventType}  \n`;
      out += `**Category:** ${event.category}  \n`;
      if (event.route) out += `**Route:** \`${event.route}\`  \n`;
      if (isConversion) {
        out += `**Conversion:** ${event.conversionType === 'primary' ? '🎯 Primary' : '◎ Secondary'}  \n`;
      }
      out += '\n';

      if (event.description) out += `${event.description}\n\n`;

      out += `**Data Layer Push:**\n\`\`\`javascript\nwindow.dataLayer.push({\n  event: '${event.canonicalName}',\n`;
      if (isConversion) out += `  event_id: generateEventId(), // Required for deduplication\n`;
      if (conv?.isRevenueEvent || conv?.valueLogic === 'dynamic') {
        out += `  value: 0.00, // Replace with actual transaction value\n`;
        out += `  currency: '${conv?.currency || 'USD'}',\n`;
      }
      event.parameters.forEach((p) => {
        const ex =
          p.type === 'number' ? '0' : p.type === 'boolean' ? 'false' : p.type === 'array' ? '[]' : `'{{${p.name.toUpperCase()}}}'`;
        out += `  ${p.name}: ${ex},${p.required ? ' // Required' : ''}\n`;
      });
      out += `});\n\`\`\`\n\n`;

      if (event.parameters.length > 0) {
        out += `**Parameters:**\n| Name | Type | Required |\n|------|------|----------|\n`;
        event.parameters.forEach((p) => {
          out += `| \`${p.name}\` | ${p.type} | ${p.required ? 'Yes' : 'No'} |\n`;
        });
        out += '\n';
      }

      if (event.implementationNotes) {
        out += `> **Note:** ${event.implementationNotes}\n\n`;
      }

      out += '---\n\n';
    });
  });

  return out;
}

// ─── Server Code Generator ────────────────────────────────────────────────────

function generateServerCode(project: Project): string {
  const conversions = project.conversions || [];
  const serverConfig = project.discovery?.serverSideTracking;
  const endpoint = serverConfig?.serverEndpoint || '/api/track';
  const hasMeta = conversions.some(
    (c) => c.platforms.metaCAPI.enabled && ['server-only', 'both'].includes(c.trackingMethod)
  );

  let out = `// ================================================================
// Atlas Server-Side Tracking Endpoint
// Generated by Atlas v1.0 for ${project.discovery?.clientName || 'Client'}
// Date: ${new Date().toLocaleDateString()}
// ================================================================

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// ─── Environment Variables ───────────────────────────────────────────────────
// Add these to your .env file
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID; // e.g., G-XXXXXXXXXX
const GA4_API_SECRET     = process.env.GA4_API_SECRET;     // GA4 Admin > Data Streams
${hasMeta ? `const META_PIXEL_ID      = process.env.META_PIXEL_ID;      // Meta Events Manager
const META_ACCESS_TOKEN  = process.env.META_ACCESS_TOKEN;  // Meta System User Token` : ''}

// ─── Utilities ───────────────────────────────────────────────────────────────

function hashData(value) {
  if (!value) return null;
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

`;

  out += `// ─── GA4 Measurement Protocol ────────────────────────────────────────────────

async function sendToGA4(eventName, params, clientId, sessionId) {
  const body = {
    client_id: clientId || 'server-side',
    events: [{
      name: eventName,
      params: {
        session_id: sessionId,
        engagement_time_msec: '100',
        ...params,
      },
    }],
  };

  const res = await fetch(
    \`https://www.google-analytics.com/mp/collect?measurement_id=\${GA4_MEASUREMENT_ID}&api_secret=\${GA4_API_SECRET}\`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );

  if (!res.ok) throw new Error(\`GA4 MP error: \${res.status}\`);
}

`;

  if (hasMeta) {
    out += `// ─── Meta Conversions API ────────────────────────────────────────────────────

async function sendToMetaCAPI(eventName, eventId, userData, customData, sourceUrl, clientIp, userAgent) {
  const ud = {};
  if (userData.email)      ud.em = [hashData(userData.email)];
  if (userData.phone)      ud.ph = [hashData(userData.phone)];
  if (userData.firstName)  ud.fn = [hashData(userData.firstName)];
  if (userData.lastName)   ud.ln = [hashData(userData.lastName)];
  if (userData.city)       ud.ct = [hashData(userData.city)];
  if (userData.country)    ud.country = [hashData(userData.country)];
  if (userData.postalCode) ud.zp = [hashData(userData.postalCode)];

  const body = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: sourceUrl,
      action_source: 'website',
      user_data: { ...ud, client_ip_address: clientIp, client_user_agent: userAgent },
      custom_data: customData,
    }],
  };

  const res = await fetch(
    \`https://graph.facebook.com/v19.0/\${META_PIXEL_ID}/events?access_token=\${META_ACCESS_TOKEN}\`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(\`Meta CAPI error: \${JSON.stringify(err)}\`);
  }
}

`;
  }

  out += `// ─── Tracking Endpoint ───────────────────────────────────────────────────────
/**
 * POST ${endpoint}
 *
 * Body: {
 *   event: string          — Canonical event name
 *   event_id: string       — Unique ID per event fire (deduplication key)
 *   client_id: string      — GA4 client ID (from _ga cookie)
 *   session_id?: string    — GA4 session ID
 *   event_source_url?: string
 *   params?: object        — Event-specific parameters
 *   user_data?: object     — User fields for enhanced conversions
 * }
 */
router.post('${endpoint}', async (req, res) => {
  try {
    const {
      event,
      event_id,
      client_id,
      session_id,
      event_source_url,
      params = {},
      user_data = {},
    } = req.body;

    if (!event || !event_id) {
      return res.status(400).json({ error: 'Missing required fields: event, event_id' });
    }

    const results = {};

    switch (event) {
`;

  conversions.forEach((conv) => {
    const ga4On = conv.platforms.ga4Server.enabled && ['server-only', 'both'].includes(conv.trackingMethod);
    const metaOn = conv.platforms.metaCAPI.enabled && ['server-only', 'both'].includes(conv.trackingMethod);
    if (!ga4On && !metaOn) return;

    out += `      case '${conv.canonicalName}': { // ${conv.displayName} (${conv.conversionType})\n`;
    out += `        const ep = { event_id, ...params`;
    if (conv.isRevenueEvent)
      out += `, value: params.value ?? ${conv.valueLogic === 'fixed' ? conv.fixedValue : 0}, currency: params.currency ?? '${conv.currency}'`;
    out += ` };\n`;

    if (ga4On) {
      out += `        results.ga4 = await sendToGA4('${conv.platforms.ga4Server.eventName || conv.canonicalName}', ep, client_id, session_id);\n`;
    }
    if (metaOn) {
      out += `        results.meta = await sendToMetaCAPI('${conv.platforms.metaCAPI.eventName || conv.canonicalName}', event_id, user_data, { value: ep.value, currency: ep.currency }, event_source_url, req.ip, req.headers['user-agent']);\n`;
    }

    out += `        break;\n      }\n\n`;
  });

  out += `      default:
        return res.status(400).json({ error: \`Unknown event: \${event}\` });
    }

    res.json({ success: true, event, event_id, results });
  } catch (err) {
    console.error('[Atlas] Tracking error:', err);
    res.status(500).json({ error: 'Tracking failed', message: err.message });
  }
});

module.exports = router;
`;

  return out;
}

// ─── Deploy Guide Generator ───────────────────────────────────────────────────

function generateDeployGuide(project: Project): string {
  const clientName = project.discovery?.clientName || 'Client';
  const serverConfig = project.discovery?.serverSideTracking;
  const conversions = project.conversions || [];
  const hasMeta = conversions.some((c) => c.platforms.metaPixel.enabled || c.platforms.metaCAPI.enabled);
  const hasGAds = conversions.some((c) => c.platforms.googleAds.enabled);
  const slug = clientName.toLowerCase().replace(/\s+/g, '-');

  return `# Atlas Deployment Guide
## ${clientName} — Generated by Atlas v1.0

---

## Step 1: GTM Container Setup

1. Download \`atlas-gtm-${slug}.json\` from the GTM Export tab
2. Open **Google Tag Manager → Admin → Import Container**
3. Select the downloaded file, choose your workspace, click **Merge**
4. In the workspace, update placeholder values:
   - Replace \`G-XXXXXXXXXX\` with your actual GA4 Measurement ID
   ${hasGAds ? `- Replace \`AW-XXXXXXXXXX\` with your Google Ads Conversion ID\n   - Update each conversion label from your Google Ads account` : ''}
5. Open **Preview** and verify tags are loading correctly
6. **Publish** the container when ready

---

## Step 2: Data Layer Implementation

Add the deduplication helper to your site's main JavaScript bundle or \`<head>\`:

\`\`\`javascript
window.dataLayer = window.dataLayer || [];

function generateEventId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
\`\`\`

Then implement each data layer push from the **Data Layer Spec** document.

**Key rules:**
- Generate a fresh \`event_id\` on every event fire
- Never cache or reuse event IDs across fires
- Push events *before* any navigation or redirect occurs

---

${
  serverConfig?.enabled
    ? `## Step 3: Server-Side Endpoint

${
  serverConfig.method === 'self-hosted'
    ? `**Self-Hosted (Express.js)**

1. Copy \`atlas-server-${slug}.js\` to your server project
2. Install dependencies:
   \`\`\`bash
   npm install express
   \`\`\`
3. Set environment variables:
   \`\`\`bash
   GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   GA4_API_SECRET=your_api_secret
   ${hasMeta ? `META_PIXEL_ID=your_pixel_id\n   META_ACCESS_TOKEN=your_access_token` : ''}
   \`\`\`
4. Mount the router:
   \`\`\`javascript
   const atlasTracker = require('./atlas-server-${slug}');
   app.use('/', atlasTracker);
   \`\`\`
5. Deploy to \`${serverConfig.serverEndpoint || 'your server URL'}\``
    : serverConfig.method === 'gcp-hosted'
    ? `**Google Cloud Run**

1. Create a new Cloud Run service
2. Deploy the generated endpoint code as the service handler
3. Set environment variables in the Cloud Run console
4. Update your GTM server-side tags with the Cloud Run service URL`
    : `**Atlas-Hosted**

Your Atlas-hosted endpoint will be configured by the Atlas team.
Share the generated server code with your Atlas implementation engineer.`
}

---

## Step 4: Testing & Validation
`
    : `## Step 3: Testing & Validation
`
}
**GA4 DebugView**
1. Add \`debug_mode: true\` to each GA4 Event tag in GTM (temporarily)
2. Open **GA4 → Configure → DebugView**
3. Fire each event on your site and verify in real-time
4. Remove \`debug_mode\` before going live

${
  hasMeta
    ? `**Meta Events Testing**
1. Open **Meta Events Manager → Test Events**
2. Enter the test event code in your Meta Pixel base code
3. Fire each conversion and verify both browser and server events appear
4. Confirm deduplication — each event should appear only once
`
    : ''
}${
  hasGAds
    ? `**Google Ads Verification**
1. Use the **Google Ads Tag Assistant** Chrome extension
2. Verify conversion tags fire on the correct events
3. Check conversion data in **Google Ads → Tools → Conversions** after 24h
`
    : ''
}
---

## Go-Live Checklist

- [ ] GTM container imported and published
- [ ] GA4 Measurement ID updated in all tags
${hasGAds ? '- [ ] Google Ads Conversion ID and labels updated\n' : ''}- [ ] Data layer events implemented on site
- [ ] All events verified in GTM Preview mode
${
  serverConfig?.enabled
    ? `- [ ] Server endpoint deployed and accessible
- [ ] Environment variables configured
- [ ] Server events confirmed in GA4 DebugView
`
    : ''
}${
  hasMeta
    ? `- [ ] Meta Pixel browser events verified
- [ ] Meta CAPI server events verified
- [ ] Deduplication confirmed in Meta Events Manager
`
    : ''
}${hasGAds ? '- [ ] Google Ads conversions verified\n' : ''}- [ ] QA completed across all conversion events
- [ ] Stakeholders notified of go-live
`;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = 'overview' | 'gtm' | 'datalayer' | 'server' | 'guide';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Package size={15} /> },
  { id: 'gtm', label: 'GTM Export', icon: <Tag size={15} /> },
  { id: 'datalayer', label: 'Data Layer Spec', icon: <Layers size={15} /> },
  { id: 'server', label: 'Server Code', icon: <Server size={15} /> },
  { id: 'guide', label: 'Deploy Guide', icon: <BookOpen size={15} /> },
];

const PHASE_STEPS = [
  { num: 1, label: 'Discovery' },
  { num: 2, label: 'Journey Design' },
  { num: 3, label: 'Orchestration' },
  { num: 4, label: 'Export' },
];

// ─── Shared code-block + action bar ──────────────────────────────────────────

function CodeArtifact({
  content,
  filename,
  mimeType = 'text/plain',
  copyKey,
  copied,
  onCopy,
  onDownload,
}: {
  content: string;
  filename: string;
  mimeType?: string;
  copyKey: string;
  copied: string | null;
  onCopy: (content: string, key: string) => void;
  onDownload: (content: string, filename: string, mime: string) => void;
}) {
  return (
    <div
      style={{
        border: '1px solid #1A1E28',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: '#0D1117',
          borderBottom: '1px solid #1A1E28',
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            color: '#7A8599',
          }}
        >
          {filename}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onCopy(content, copyKey)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #1A1E28',
              background: '#12161E',
              color: '#E8ECF2',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {copied === copyKey ? (
              <>
                <Check size={12} color="#0BBFAA" />
                <span style={{ color: '#0BBFAA' }}>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
          <button
            onClick={() => onDownload(content, filename, mimeType)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #0BBFAA',
              background: 'rgba(11,191,170,0.08)',
              color: '#0BBFAA',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Download size={12} />
            Download
          </button>
        </div>
      </div>

      {/* Code block */}
      <pre
        style={{
          margin: 0,
          padding: '16px',
          background: '#080B12',
          color: '#B0C4D8',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          lineHeight: '1.65',
          overflowX: 'auto',
          maxHeight: '420px',
          overflowY: 'auto',
          whiteSpace: 'pre',
        }}
      >
        {content}
      </pre>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  project,
  onTabChange,
}: {
  project: Project;
  onTabChange: (t: TabId) => void;
}) {
  const conversions = project.conversions || [];
  const journeys = project.journeys || [];
  const serverEnabled = project.discovery?.serverSideTracking?.enabled ?? false;

  const hasMeta = conversions.some(
    (c) => c.platforms.metaPixel.enabled || c.platforms.metaCAPI.enabled
  );
  const hasGAds = conversions.some((c) => c.platforms.googleAds.enabled);
  const dualTracked = conversions.filter((c) => c.trackingMethod === 'both').length;

  const artifacts = [
    {
      id: 'gtm' as TabId,
      icon: <Tag size={18} color="#0BBFAA" />,
      label: 'GTM Container Export',
      desc: `${conversions.length} conversion tag${conversions.length !== 1 ? 's' : ''} (GA4${hasMeta ? ', Meta Pixel' : ''}${hasGAds ? ', Google Ads' : ''})`,
    },
    {
      id: 'datalayer' as TabId,
      icon: <Layers size={18} color="#0BBFAA" />,
      label: 'Data Layer Specification',
      desc: `${journeys.flatMap((j) => j.events).length} events across ${journeys.length} journey${journeys.length !== 1 ? 's' : ''}`,
    },
    {
      id: 'server' as TabId,
      icon: <Server size={18} color={serverEnabled ? '#0BBFAA' : '#7A8599'} />,
      label: 'Server-Side Endpoint',
      desc: serverEnabled
        ? `Node.js/Express — ${project.discovery?.serverSideTracking?.method ?? ''}`
        : 'Not configured — server-side tracking disabled',
    },
    {
      id: 'guide' as TabId,
      icon: <BookOpen size={18} color="#0BBFAA" />,
      label: 'Deployment Guide',
      desc: 'Step-by-step implementation checklist',
    },
  ];

  const checks = [
    { label: 'Discovery completed', ok: !!project.discovery },
    { label: 'Journeys defined', ok: journeys.length > 0 },
    {
      label: 'Primary conversion configured',
      ok: conversions.some((c) => c.conversionType === 'primary'),
    },
    {
      label: 'Platform mapping set',
      ok: conversions.every(
        (c) =>
          c.platforms.ga4Client.enabled ||
          c.platforms.ga4Server.enabled ||
          c.platforms.metaPixel.enabled ||
          c.platforms.metaCAPI.enabled ||
          c.platforms.googleAds.enabled
      ),
    },
    { label: 'Dual-tracking enabled', ok: dualTracked > 0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Conversions', value: conversions.length },
          { label: 'Dual-Tracked', value: dualTracked },
          {
            label: 'Platforms',
            value: [
              conversions.some((c) => c.platforms.ga4Client.enabled || c.platforms.ga4Server.enabled) && 'GA4',
              hasMeta && 'Meta',
              hasGAds && 'Google Ads',
            ]
              .filter(Boolean)
              .join(', ') || '—',
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: '16px',
              background: '#0D1117',
              border: '1px solid #1A1E28',
              borderRadius: '10px',
            }}
          >
            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#0BBFAA',
                fontFamily: 'Bricolage Grotesque, sans-serif',
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: '#7A8599', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Readiness checklist */}
      <div
        style={{
          padding: '16px 20px',
          background: '#0D1117',
          border: '1px solid #1A1E28',
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            color: '#E8ECF2',
            marginBottom: '12px',
          }}
        >
          Export Readiness
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {checks.map((c) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {c.ok ? (
                <CheckCircle2 size={16} color="#0BBFAA" />
              ) : (
                <AlertCircle size={16} color="#F59E0B" />
              )}
              <span style={{ fontSize: '13px', color: c.ok ? '#E8ECF2' : '#7A8599' }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Artifact cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div
          style={{
            fontSize: '12px',
            color: '#7A8599',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}
        >
          Generated Artifacts
        </div>
        {artifacts.map((a) => (
          <button
            key={a.id}
            onClick={() => onTabChange(a.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: '#0D1117',
              border: '1px solid #1A1E28',
              borderRadius: '10px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0BBFAA')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1A1E28')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {a.icon}
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#E8ECF2',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {a.label}
                </div>
                <div style={{ fontSize: '12px', color: '#7A8599', marginTop: '2px' }}>
                  {a.desc}
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="#7A8599" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Phase4Export() {
  const navigate = useNavigate();
  const { getActiveProject, updateProject } = useStore();

  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [copied, setCopied] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const project = hydrated ? getActiveProject() : undefined;

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (content: string, filename: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleComplete = async () => {
    if (project) {
      await updateProject(project.id, { currentPhase: 4, status: 'ready-to-deploy' });
    }
    setCompleted(true);
    setTimeout(() => navigate('/'), 1200);
  };

  if (!hydrated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
        <div style={{ color: '#7A8599', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '32px' }}>
        <div
          style={{
            padding: '24px',
            background: '#0D1117',
            border: '1px solid #F59E0B',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} color="#F59E0B" />
          <div>
            <div style={{ fontWeight: 600, color: '#E8ECF2', fontSize: '14px' }}>
              No active project
            </div>
            <div style={{ color: '#7A8599', fontSize: '13px', marginTop: '4px' }}>
              Please start from the Dashboard and complete Phases 1–3 first.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const slug = (project.discovery?.clientName || 'client').toLowerCase().replace(/\s+/g, '-');
  const serverEnabled = project.discovery?.serverSideTracking?.enabled ?? false;

  const gtmJSON = generateGTMContainer(project);
  const dlSpec = generateDataLayerSpec(project);
  const serverCode = generateServerCode(project);
  const deployGuide = generateDeployGuide(project);

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Phase stepper ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          marginBottom: '32px',
        }}
      >
        {PHASE_STEPS.map((step, i) => {
          const isActive = step.num === 4;
          const isDone = step.num < 4;
          return (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isDone ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (step.num === 1) navigate('/discovery');
                  else if (step.num === 2) navigate('/journey');
                  else if (step.num === 3) navigate('/orchestration');
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: isActive
                      ? '#0BBFAA'
                      : isDone
                      ? 'rgba(11,191,170,0.15)'
                      : '#1A1E28',
                    color: isActive ? '#080B12' : isDone ? '#0BBFAA' : '#7A8599',
                    border: isActive ? 'none' : isDone ? '1px solid #0BBFAA' : '1px solid #1A1E28',
                    flexShrink: 0,
                  }}
                >
                  {isDone ? <Check size={13} /> : step.num}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#E8ECF2' : isDone ? '#7A8599' : '#3D4559',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < PHASE_STEPS.length - 1 && (
                <div
                  style={{
                    width: '32px',
                    height: '1px',
                    background: '#1A1E28',
                    margin: '0 8px',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <FileCode2 size={22} color="#0BBFAA" />
          <h1
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '26px',
              color: '#E8ECF2',
              margin: 0,
            }}
          >
            Export &amp; Deploy
          </h1>
        </div>
        <p style={{ color: '#7A8599', fontSize: '14px', margin: 0, maxWidth: '580px' }}>
          Download your GTM container, data layer spec, server endpoint, and deployment guide. All
          artifacts are generated from your Phase 1–3 configuration.
        </p>
      </div>

      {/* ── Tab bar ── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          borderBottom: '1px solid #1A1E28',
          paddingBottom: '0',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const disabled = tab.id === 'server' && !serverEnabled;
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #0BBFAA' : '2px solid transparent',
                marginBottom: '-1px',
                color: isActive ? '#0BBFAA' : disabled ? '#3D4559' : '#7A8599',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'color 0.15s',
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'server' && !serverEnabled && (
                <span
                  style={{
                    fontSize: '10px',
                    color: '#3D4559',
                    background: '#1A1E28',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  off
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'overview' && (
        <OverviewTab project={project} onTabChange={setActiveTab} />
      )}

      {activeTab === 'gtm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(11,191,170,0.06)',
              border: '1px solid rgba(11,191,170,0.2)',
              borderRadius: '8px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <Tag size={16} color="#0BBFAA" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '13px', color: '#B0C4D8', lineHeight: '1.5' }}>
              Import this JSON file into GTM via <strong style={{ color: '#E8ECF2' }}>Admin → Import Container</strong>. After importing, replace{' '}
              <code
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: '#1A1E28',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '12px',
                }}
              >
                G-XXXXXXXXXX
              </code>{' '}
              and{' '}
              <code
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: '#1A1E28',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '12px',
                }}
              >
                AW-XXXXXXXXXX
              </code>{' '}
              with your actual Measurement and Conversion IDs.
            </div>
          </div>
          <CodeArtifact
            content={gtmJSON}
            filename={`atlas-gtm-${slug}.json`}
            mimeType="application/json"
            copyKey="gtm"
            copied={copied}
            onCopy={handleCopy}
            onDownload={handleDownload}

          />
        </div>
      )}

      {activeTab === 'datalayer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(11,191,170,0.06)',
              border: '1px solid rgba(11,191,170,0.2)',
              borderRadius: '8px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <Layers size={16} color="#0BBFAA" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '13px', color: '#B0C4D8', lineHeight: '1.5' }}>
              Share this spec with your developers. Each section includes the exact{' '}
              <code
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: '#1A1E28',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '12px',
                }}
              >
                window.dataLayer.push()
              </code>{' '}
              call and parameter table for every event across all journeys.
            </div>
          </div>
          <CodeArtifact
            content={dlSpec}
            filename={`atlas-datalayer-spec-${slug}.md`}
            mimeType="text/markdown"
            copyKey="datalayer"
            copied={copied}
            onCopy={handleCopy}
            onDownload={handleDownload}

          />
        </div>
      )}

      {activeTab === 'server' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {serverEnabled ? (
            <>
              <div
                style={{
                  padding: '14px 16px',
                  background: 'rgba(11,191,170,0.06)',
                  border: '1px solid rgba(11,191,170,0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}
              >
                <Terminal size={16} color="#0BBFAA" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div style={{ fontSize: '13px', color: '#B0C4D8', lineHeight: '1.5' }}>
                  Node.js/Express endpoint for{' '}
                  <strong style={{ color: '#E8ECF2' }}>
                    {project.discovery?.serverSideTracking?.method ?? 'server-side'}
                  </strong>{' '}
                  deployment. Set the environment variables in your{' '}
                  <code
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      background: '#1A1E28',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      fontSize: '12px',
                    }}
                  >
                    .env
                  </code>{' '}
                  file before deploying.
                </div>
              </div>
              <CodeArtifact
                content={serverCode}
                filename={`atlas-server-${slug}.js`}
                mimeType="text/javascript"
                copyKey="server"
                copied={copied}
                onCopy={handleCopy}
                onDownload={handleDownload}

              />
            </>
          ) : (
            <div
              style={{
                padding: '32px',
                background: '#0D1117',
                border: '1px solid #1A1E28',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <Server size={36} color="#3D4559" style={{ margin: '0 auto 12px' }} />
              <div style={{ color: '#7A8599', fontSize: '14px' }}>
                Server-side tracking is not enabled for this project.
              </div>
              <div style={{ color: '#3D4559', fontSize: '12px', marginTop: '6px' }}>
                Return to Phase 1 — Discovery to enable it.
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'guide' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(11,191,170,0.06)',
              border: '1px solid rgba(11,191,170,0.2)',
              borderRadius: '8px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <BookOpen size={16} color="#0BBFAA" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '13px', color: '#B0C4D8', lineHeight: '1.5' }}>
              Step-by-step deployment checklist generated from your project configuration. Download
              as Markdown and share with your team.
            </div>
          </div>
          <CodeArtifact
            content={deployGuide}
            filename={`atlas-deploy-guide-${slug}.md`}
            mimeType="text/markdown"
            copyKey="guide"
            copied={copied}
            onCopy={handleCopy}
            onDownload={handleDownload}

          />
        </div>
      )}

      {/* ── Navigation ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid #1A1E28',
        }}
      >
        <button
          onClick={() => navigate('/orchestration')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid #1A1E28',
            background: 'transparent',
            color: '#7A8599',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <ArrowLeft size={15} />
          Back to Orchestration
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              handleDownload(gtmJSON, `atlas-gtm-${slug}.json`, 'application/json');
              handleDownload(dlSpec, `atlas-datalayer-spec-${slug}.md`, 'text/markdown');
              if (serverEnabled) handleDownload(serverCode, `atlas-server-${slug}.js`, 'text/javascript');
              handleDownload(deployGuide, `atlas-deploy-guide-${slug}.md`, 'text/markdown');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #1A1E28',
              background: '#0D1117',
              color: '#E8ECF2',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Download size={15} />
            Download All
          </button>

          <button
            onClick={handleComplete}
            disabled={completed}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '8px',
              border: 'none',
              background: completed
                ? 'rgba(11,191,170,0.2)'
                : 'linear-gradient(135deg, #0BBFAA 0%, #0A9E8F 100%)',
              color: completed ? '#0BBFAA' : '#080B12',
              fontSize: '14px',
              fontWeight: 600,
              cursor: completed ? 'default' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: completed ? 'none' : '0 2px 12px rgba(11,191,170,0.3)',
            }}
          >
            {completed ? (
              <>
                <Check size={15} />
                Project Complete
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Mark as Complete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
