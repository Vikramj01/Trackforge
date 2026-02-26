import type { Project } from '../types';

// ─── Server-Side GTM Container Generator ─────────────────────────────────────
//
// Generates a GTM server container JSON that can be imported into a
// Server-Side Google Tag Manager container. The container includes:
//   - GA4 Client (accepts gtag / GA4 hit format)
//   - GA4 Measurement Protocol tags (gaawe)
//   - Meta CAPI tags (fbcapi)
//   - Google Ads Enhanced Conversion tags (gclidw)
//
// All credential values are left as placeholders to be filled in after import.

export function generateServerGTMContainer(project: Project): string {
  const clientName = project.discovery?.clientName || 'Client';
  const conversions = project.conversions || [];

  let variableId = 1;
  let triggerId = 1;
  let tagId = 1;

  // Only conversions that route traffic through the server-side GTM container
  const serverConvs = conversions.filter(
    (c) => c.trackingMethod === 'server-only' || c.trackingMethod === 'both',
  );

  const hasGA4 = serverConvs.some((c) => c.platforms.ga4Server.enabled);
  const hasMeta = serverConvs.some((c) => c.platforms.metaCAPI.enabled);
  const hasGAds = serverConvs.some(
    (c) => c.platforms.googleAds.enabled && c.enhancedConversionsEnabled,
  );

  const variables: object[] = [];

  // ── Constant variables (credentials / IDs) ─────────────────────────────────
  if (hasGA4) {
    variables.push(
      {
        accountId: '0', containerId: '0', variableId: String(variableId++),
        name: 'GA4 Measurement ID', type: 'c',
        parameter: [{ type: 'TEMPLATE', key: 'value', value: 'G-XXXXXXXXXX' }],
      },
      {
        accountId: '0', containerId: '0', variableId: String(variableId++),
        name: 'GA4 API Secret', type: 'c',
        parameter: [{ type: 'TEMPLATE', key: 'value', value: 'YOUR_API_SECRET' }],
      },
    );
  }
  if (hasMeta) {
    variables.push(
      {
        accountId: '0', containerId: '0', variableId: String(variableId++),
        name: 'Meta Pixel ID', type: 'c',
        parameter: [{ type: 'TEMPLATE', key: 'value', value: 'YOUR_PIXEL_ID' }],
      },
      {
        accountId: '0', containerId: '0', variableId: String(variableId++),
        name: 'Meta Access Token', type: 'c',
        parameter: [{ type: 'TEMPLATE', key: 'value', value: 'YOUR_ACCESS_TOKEN' }],
      },
    );
  }

  // ── Event Data variables (read from the incoming request payload) ────────────
  const evdKeys = ['event_id', 'value', 'currency', 'transaction_id'];
  if (hasMeta || hasGAds) evdKeys.push('user_data.email', 'user_data.phone');
  if (hasGAds) {
    evdKeys.push(
      'user_data.address.first_name', 'user_data.address.last_name',
      'user_data.address.city', 'user_data.address.country',
      'user_data.address.postal_code',
    );
  }
  evdKeys.forEach((key) => {
    variables.push({
      accountId: '0', containerId: '0', variableId: String(variableId++),
      name: `ED - ${key}`, type: 'evd',
      parameter: [{ type: 'TEMPLATE', key: 'keyPath', value: key }],
    });
  });

  // ── HTTP Request variables (IP + User-Agent, needed for Meta CAPI) ───────────
  if (hasMeta) {
    variables.push(
      {
        accountId: '0', containerId: '0', variableId: String(variableId++),
        name: 'HTTP - Client IP', type: 'hso',
        parameter: [{ type: 'TEMPLATE', key: 'component', value: 'CLIENT_IP' }],
      },
      {
        accountId: '0', containerId: '0', variableId: String(variableId++),
        name: 'HTTP - User Agent', type: 'hso',
        parameter: [{ type: 'TEMPLATE', key: 'component', value: 'USER_AGENT' }],
      },
    );
  }

  // ── GA4 Client ─────────────────────────────────────────────────────────────
  const clients = [
    {
      accountId: '0', containerId: '0', clientId: '1',
      name: 'GA4 Client', type: 'gtag',
      parameter: [{ type: 'INTEGER', key: 'protocolVersion', value: '2' }],
    },
  ];

  // ── Triggers — one per server-side conversion ──────────────────────────────
  const triggers = serverConvs.map((conv) => ({
    accountId: '0', containerId: '0',
    triggerId: String(triggerId++),
    name: `Event - ${conv.canonicalName}`,
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

  const triggerMap = new Map(serverConvs.map((conv, i) => [conv.canonicalName, String(i + 1)]));
  const tags: object[] = [];

  serverConvs.forEach((conv) => {
    const tId = triggerMap.get(conv.canonicalName);
    if (!tId) return;

    // GA4 Measurement Protocol tag (gaawe)
    if (conv.platforms.ga4Server.enabled) {
      const eventParams: object[] = [
        {
          type: 'MAP',
          map: [
            { type: 'TEMPLATE', key: 'name', value: 'event_id' },
            { type: 'TEMPLATE', key: 'value', value: '{{ED - event_id}}' },
          ],
        },
      ];
      if (conv.isRevenueEvent || conv.valueLogic === 'dynamic') {
        eventParams.push(
          {
            type: 'MAP',
            map: [
              { type: 'TEMPLATE', key: 'name', value: 'value' },
              { type: 'TEMPLATE', key: 'value', value: '{{ED - value}}' },
            ],
          },
          {
            type: 'MAP',
            map: [
              { type: 'TEMPLATE', key: 'name', value: 'currency' },
              { type: 'TEMPLATE', key: 'value', value: '{{ED - currency}}' },
            ],
          },
        );
      }
      if (conv.isRevenueEvent) {
        eventParams.push({
          type: 'MAP',
          map: [
            { type: 'TEMPLATE', key: 'name', value: 'transaction_id' },
            { type: 'TEMPLATE', key: 'value', value: '{{ED - transaction_id}}' },
          ],
        });
      }
      tags.push({
        accountId: '0', containerId: '0',
        tagId: String(tagId++),
        name: `GA4 MP - ${conv.displayName}`,
        type: 'gaawe',
        parameter: [
          { type: 'TEMPLATE', key: 'eventName', value: conv.platforms.ga4Server.eventName || conv.canonicalName },
          { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' },
          { type: 'TEMPLATE', key: 'apiSecret', value: '{{GA4 API Secret}}' },
          { type: 'LIST', key: 'eventParameters', list: eventParams },
          {
            type: 'LIST',
            key: 'userProperties',
            list: [
              {
                type: 'MAP',
                map: [
                  { type: 'TEMPLATE', key: 'name', value: 'user_data_email_sha256' },
                  { type: 'TEMPLATE', key: 'value', value: '{{ED - user_data.email}}' },
                ],
              },
              {
                type: 'MAP',
                map: [
                  { type: 'TEMPLATE', key: 'name', value: 'user_data_phone_sha256' },
                  { type: 'TEMPLATE', key: 'value', value: '{{ED - user_data.phone}}' },
                ],
              },
            ],
          },
        ],
        firingTriggerId: [tId],
      });
    }

    // Meta CAPI tag (fbcapi)
    if (conv.platforms.metaCAPI.enabled) {
      tags.push({
        accountId: '0', containerId: '0',
        tagId: String(tagId++),
        name: `Meta CAPI - ${conv.displayName}`,
        type: 'fbcapi',
        parameter: [
          { type: 'TEMPLATE', key: 'pixelId', value: '{{Meta Pixel ID}}' },
          { type: 'TEMPLATE', key: 'accessToken', value: '{{Meta Access Token}}' },
          { type: 'TEMPLATE', key: 'eventName', value: conv.platforms.metaCAPI.eventName || conv.canonicalName },
          { type: 'TEMPLATE', key: 'eventId', value: '{{ED - event_id}}' },
          {
            type: 'MAP',
            key: 'userData',
            map: [
              { type: 'TEMPLATE', key: 'em', value: '{{ED - user_data.email}}' },
              { type: 'TEMPLATE', key: 'ph', value: '{{ED - user_data.phone}}' },
              { type: 'TEMPLATE', key: 'client_ip_address', value: '{{HTTP - Client IP}}' },
              { type: 'TEMPLATE', key: 'client_user_agent', value: '{{HTTP - User Agent}}' },
            ],
          },
          {
            type: 'MAP',
            key: 'customData',
            map: [
              { type: 'TEMPLATE', key: 'value', value: '{{ED - value}}' },
              { type: 'TEMPLATE', key: 'currency', value: '{{ED - currency}}' },
            ],
          },
        ],
        firingTriggerId: [tId],
      });
    }

    // Google Ads Enhanced Conversions tag (gclidw)
    if (conv.platforms.googleAds.enabled && conv.enhancedConversionsEnabled) {
      tags.push({
        accountId: '0', containerId: '0',
        tagId: String(tagId++),
        name: `Google Ads Enhanced - ${conv.displayName}`,
        type: 'gclidw',
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
            value: conv.valueLogic === 'fixed' ? String(conv.fixedValue) : '{{ED - value}}',
          },
          { type: 'TEMPLATE', key: 'currencyCode', value: conv.currency },
          { type: 'TEMPLATE', key: 'transactionId', value: '{{ED - transaction_id}}' },
          {
            type: 'MAP',
            key: 'enhancedConversionsData',
            map: [
              { type: 'TEMPLATE', key: 'email', value: '{{ED - user_data.email}}' },
              { type: 'TEMPLATE', key: 'phone_number', value: '{{ED - user_data.phone}}' },
              {
                type: 'MAP',
                key: 'address',
                map: [
                  { type: 'TEMPLATE', key: 'first_name', value: '{{ED - user_data.address.first_name}}' },
                  { type: 'TEMPLATE', key: 'last_name', value: '{{ED - user_data.address.last_name}}' },
                  { type: 'TEMPLATE', key: 'city', value: '{{ED - user_data.address.city}}' },
                  { type: 'TEMPLATE', key: 'country', value: '{{ED - user_data.address.country}}' },
                  { type: 'TEMPLATE', key: 'postal_code', value: '{{ED - user_data.address.postal_code}}' },
                ],
              },
            ],
          },
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
          name: `Atlas Server - ${clientName}`,
          publicId: 'GTM-SXXXXXXX',
          usageContext: ['SERVER'],
        },
        client: clients,
        tag: tags,
        trigger: triggers,
        variable: variables,
      },
    },
    null,
    2,
  );
}
