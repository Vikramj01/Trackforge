import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Server,
  Monitor,
  Layers,
  Shield,
  Info,
  Target,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useStore } from '../../store/useStore';
import type { Conversion, TrackingMethod, ValueLogic } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASES = [
  { n: 1, label: 'Discovery' },
  { n: 2, label: 'Journeys' },
  { n: 3, label: 'Orchestration' },
  { n: 4, label: 'Export' },
];

const GA4_EVENT_MAP: Record<string, string> = {
  purchase: 'purchase',
  add_to_cart: 'add_to_cart',
  begin_checkout: 'begin_checkout',
  view_item: 'view_item',
  view_item_list: 'view_item_list',
  remove_from_cart: 'remove_from_cart',
  sign_up: 'sign_up',
  login: 'login',
  lead_submit: 'generate_lead',
  subscribe: 'subscribe',
  trial_start: 'begin_trial',
  trial_convert: 'purchase',
};

const META_EVENT_MAP: Record<string, string> = {
  purchase: 'Purchase',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  view_item: 'ViewContent',
  view_item_list: 'ViewContent',
  sign_up: 'CompleteRegistration',
  lead_submit: 'Lead',
  subscribe: 'Subscribe',
  trial_start: 'StartTrial',
  trial_convert: 'Purchase',
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CHF', 'SGD'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function defaultConversion(e: {
  id: string;
  canonicalName: string;
  displayName: string;
  conversionType: 'primary' | 'secondary';
}): Conversion {
  const name = e.canonicalName;
  const ga4Name = GA4_EVENT_MAP[name] ?? name;
  const metaName = META_EVENT_MAP[name] ?? toPascalCase(name);

  return {
    id: crypto.randomUUID(),
    eventId: e.id,
    canonicalName: name,
    displayName: e.displayName || name,
    conversionType: e.conversionType,
    trackingMethod: 'both',
    valueLogic: 'dynamic',
    fixedValue: 0,
    currency: 'USD',
    isRevenueEvent: name === 'purchase' || name.includes('subscri'),
    isPaidMediaOptimization: true,
    platforms: {
      ga4Client: { enabled: true, eventName: ga4Name },
      metaPixel: { enabled: true, eventName: metaName },
      ga4Server: { enabled: true, eventName: ga4Name },
      metaCAPI: { enabled: true, eventName: metaName },
      googleAds: { enabled: e.conversionType === 'primary', conversionLabel: '' },
    },
    enableDeduplication: true,
    enhancedConversionsEnabled: false,
    userData: {
      email: true,
      phone: false,
      firstName: false,
      lastName: false,
      city: false,
      country: false,
      postalCode: false,
    },
  };
}

function computeReadinessScore(conversions: Conversion[]): number {
  if (conversions.length === 0) return 0;

  const primary = conversions.filter((c) => c.conversionType === 'primary');
  let score = 0;

  // +15 Primary conversion defined
  if (primary.length > 0) score += 15;

  // +20 Dual tracking on at least one primary
  if (primary.some((c) => c.trackingMethod === 'both')) score += 20;

  // +20 All conversions have at least one platform enabled
  const allMapped = conversions.every((c) => {
    const { platforms: p, trackingMethod: m } = c;
    const hasClient = p.ga4Client.enabled || p.metaPixel.enabled;
    const hasServer = p.ga4Server.enabled || p.metaCAPI.enabled || p.googleAds.enabled;
    if (m === 'client-only') return hasClient;
    if (m === 'server-only') return hasServer;
    return hasClient && hasServer;
  });
  if (allMapped) score += 20;

  // +10 Value configured on all
  if (conversions.every((c) => c.valueLogic === 'dynamic' || c.fixedValue > 0)) score += 10;

  // +10 Deduplication enabled on all dual-tracking conversions
  const dual = conversions.filter((c) => c.trackingMethod === 'both');
  if (dual.length === 0 || dual.every((c) => c.enableDeduplication)) score += 10;

  // +10 Tracking method set on all (always true after defaults, but explicit check)
  if (conversions.every((c) => !!c.trackingMethod)) score += 10;

  // +10 Enhanced conversions on at least one primary
  if (primary.some((c) => c.enhancedConversionsEnabled)) score += 10;

  // +5 Meta CAPI enabled on at least one primary
  if (primary.some((c) => c.platforms.metaCAPI.enabled && c.trackingMethod !== 'client-only')) score += 5;

  return Math.min(score, 100);
}

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

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="shrink-0">
      <div
        className="relative rounded-full transition-all"
        style={{
          background: on ? '#0BBFAA' : '#1A1E28',
          border: `2px solid ${on ? '#0BBFAA' : '#3D4A5C'}`,
          height: '22px',
          width: '40px',
        }}
      >
        <div
          className="absolute top-0.5 rounded-full transition-all"
          style={{
            width: '14px',
            height: '14px',
            background: on ? '#080B12' : '#7A8599',
            left: on ? '22px' : '2px',
          }}
        />
      </div>
    </button>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" onClick={() => onChange(!checked)}>
      <div
        className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
        style={{
          borderColor: checked ? '#0BBFAA' : '#7A8599',
          background: checked ? '#0BBFAA' : 'transparent',
        }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#080B12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  );
}

// ─── Platform Row ─────────────────────────────────────────────────────────────

interface PlatformRowProps {
  label: string;
  dotColor: string;
  enabled: boolean;
  eventName: string;
  onToggle: (v: boolean) => void;
  onEventNameChange: (v: string) => void;
  placeholder?: string;
}

function PlatformRow({ label, dotColor, enabled, eventName, onToggle, onEventNameChange, placeholder }: PlatformRowProps) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border transition-all"
      style={{
        background: '#0D1117',
        borderColor: enabled ? `${dotColor}40` : '#1A1E28',
      }}
    >
      <button type="button" onClick={() => onToggle(!enabled)} className="flex items-center gap-2 shrink-0">
        <div
          className="w-4 h-4 rounded border-2 flex items-center justify-center"
          style={{
            borderColor: enabled ? dotColor : '#7A8599',
            background: enabled ? dotColor : 'transparent',
          }}
        >
          {enabled && (
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span
          className="text-xs font-semibold text-left"
          style={{ color: enabled ? '#E8ECF2' : '#7A8599', width: '160px' }}
        >
          {label}
        </span>
      </button>
      {enabled && (
        <input
          className="flex-1 bg-input-bg border border-border rounded px-2 py-1 text-xs text-text-primary font-mono placeholder-text-muted focus:outline-none focus:border-atlas-teal transition-all"
          placeholder={placeholder}
          value={eventName}
          onChange={(e) => onEventNameChange(e.target.value)}
        />
      )}
    </div>
  );
}

// ─── Conversion Card ──────────────────────────────────────────────────────────

interface ConversionCardProps {
  conversion: Conversion;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (updated: Conversion) => void;
  serverSideEnabled: boolean;
}

function ConversionCard({ conversion, isExpanded, onToggleExpand, onChange, serverSideEnabled }: ConversionCardProps) {
  function set<K extends keyof Conversion>(key: K, value: Conversion[K]) {
    onChange({ ...conversion, [key]: value });
  }

  function setPlatform<K extends keyof Conversion['platforms']>(
    platform: K,
    updates: Partial<Conversion['platforms'][K]>
  ) {
    onChange({
      ...conversion,
      platforms: {
        ...conversion.platforms,
        [platform]: { ...conversion.platforms[platform], ...updates },
      },
    });
  }

  function setUserData<K extends keyof Conversion['userData']>(key: K, value: boolean) {
    onChange({ ...conversion, userData: { ...conversion.userData, [key]: value } });
  }

  const showClient = conversion.trackingMethod === 'client-only' || conversion.trackingMethod === 'both';
  const showServer = conversion.trackingMethod === 'server-only' || conversion.trackingMethod === 'both';
  const showDedup = conversion.trackingMethod === 'both';

  // Mini readiness: 5 dots
  const miniChecks = [
    !!conversion.trackingMethod,
    showClient ? conversion.platforms.ga4Client.enabled || conversion.platforms.metaPixel.enabled : true,
    showServer ? conversion.platforms.ga4Server.enabled || conversion.platforms.metaCAPI.enabled || conversion.platforms.googleAds.enabled : true,
    conversion.valueLogic === 'dynamic' || conversion.fixedValue > 0,
    !showDedup || conversion.enableDeduplication,
  ];
  const miniScore = miniChecks.filter(Boolean).length;

  const trackingMethodColor =
    conversion.trackingMethod === 'both' ? '#0BBFAA' :
    conversion.trackingMethod === 'server-only' ? '#60A5FA' : '#7A8599';

  return (
    <Card>
      {/* Header — always visible */}
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="p-2 rounded-lg shrink-0"
            style={{
              background: conversion.conversionType === 'primary' ? 'rgba(11,191,170,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${conversion.conversionType === 'primary' ? 'rgba(11,191,170,0.2)' : 'rgba(245,158,11,0.2)'}`,
            }}
          >
            <Target size={15} style={{ color: conversion.conversionType === 'primary' ? '#0BBFAA' : '#F59E0B' }} />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-sm font-medium"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E8ECF2' }}
              >
                {conversion.canonicalName}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap"
                style={
                  conversion.conversionType === 'primary'
                    ? { background: 'rgba(11,191,170,0.15)', color: '#0BBFAA', border: '1px solid rgba(11,191,170,0.3)' }
                    : { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }
                }
              >
                {conversion.conversionType === 'primary' ? 'PRIMARY' : 'SECONDARY'}
              </span>
            </div>
            {conversion.displayName && conversion.displayName !== conversion.canonicalName && (
              <p className="text-xs text-text-muted mt-0.5 truncate">{conversion.displayName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Mini readiness dots */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: i < miniScore ? '#0BBFAA' : '#1A1E28' }}
              />
            ))}
          </div>
          {/* Tracking method pill */}
          <span
            className="text-xs px-2 py-0.5 rounded-full border hidden sm:block whitespace-nowrap"
            style={{
              background: `${trackingMethodColor}15`,
              borderColor: `${trackingMethodColor}30`,
              color: trackingMethodColor,
            }}
          >
            {conversion.trackingMethod === 'both' ? 'Dual tracking' :
             conversion.trackingMethod === 'server-only' ? 'Server-side' : 'Client-side'}
          </span>
          {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </div>
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-border space-y-6">

          {/* 1. Tracking Method */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-primary mb-3">
              Tracking Method
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                {
                  value: 'client-only',
                  label: 'Client-side only',
                  desc: 'Browser GTM → GA4, Meta Pixel',
                  icon: Monitor,
                  color: '#7A8599',
                  warning: '⚠ Blocked 20–40% by ad blockers',
                },
                {
                  value: 'server-only',
                  label: 'Server-side only',
                  desc: 'sGTM → GA4 MP, Meta CAPI',
                  icon: Server,
                  color: '#60A5FA',
                  warning: null,
                },
                {
                  value: 'both',
                  label: 'Both (Recommended)',
                  desc: 'Auto deduplication via event_id',
                  icon: Layers,
                  color: '#0BBFAA',
                  warning: null,
                },
              ] as const).map(({ value, label, desc, icon: Icon, color, warning }) => {
                const active = conversion.trackingMethod === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('trackingMethod', value as TrackingMethod)}
                    className="text-left p-3 rounded-lg border-2 transition-all"
                    style={{
                      background: active ? `${color}10` : '#12161E',
                      borderColor: active ? color : '#1A1E28',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: active ? color : '#7A8599' }}
                      >
                        {active && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
                      </div>
                      <Icon size={12} style={{ color: active ? color : '#7A8599' }} />
                      <span className="text-xs font-semibold" style={{ color: active ? color : '#E8ECF2' }}>
                        {label}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted pl-6">{desc}</p>
                    {warning && (
                      <p className="text-xs mt-1 pl-6" style={{ color: '#EF4444' }}>{warning}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Conversion Value */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-primary mb-3">
              Conversion Value
            </h4>
            <div className="space-y-3">
              {/* Dynamic / Fixed radio */}
              <div className="flex gap-3">
                {(['dynamic', 'fixed'] as ValueLogic[]).map((vl) => {
                  const active = conversion.valueLogic === vl;
                  return (
                    <button
                      key={vl}
                      type="button"
                      onClick={() => set('valueLogic', vl)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all"
                      style={{
                        background: active ? 'rgba(11,191,170,0.1)' : '#12161E',
                        borderColor: active ? '#0BBFAA' : '#1A1E28',
                        color: active ? '#0BBFAA' : '#7A8599',
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: active ? '#0BBFAA' : '#7A8599' }}
                      >
                        {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0BBFAA' }} />}
                      </div>
                      {vl === 'dynamic' ? 'Dynamic (from data layer)' : 'Fixed value'}
                    </button>
                  );
                })}
              </div>

              {/* Fixed value + currency row */}
              <div className="flex gap-3">
                {conversion.valueLogic === 'fixed' && (
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-1.5">
                      Fixed Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full bg-input-bg border border-border rounded-lg pl-7 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 transition-all"
                        placeholder="0.00"
                        value={conversion.fixedValue || ''}
                        onChange={(e) => set('fixedValue', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}
                <div className={conversion.valueLogic === 'fixed' ? 'w-28' : 'w-36'}>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-1.5">
                    Currency
                  </label>
                  <select
                    className="w-full bg-input-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8599' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                      paddingRight: '32px',
                    }}
                    value={conversion.currency}
                    onChange={(e) => set('currency', e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Flags */}
              <div className="flex gap-5">
                <Checkbox
                  checked={conversion.isRevenueEvent}
                  onChange={(v) => set('isRevenueEvent', v)}
                  label="Revenue event"
                />
                <Checkbox
                  checked={conversion.isPaidMediaOptimization}
                  onChange={(v) => set('isPaidMediaOptimization', v)}
                  label="Optimize paid media"
                />
              </div>
            </div>
          </section>

          {/* 3. Platform Mapping */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-primary mb-3">
              Platform Mapping
            </h4>
            <div className={`grid gap-4 ${showClient && showServer ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Client platforms */}
              {showClient && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Monitor size={12} className="text-text-muted" />
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Client-side (Browser)</span>
                  </div>
                  <div className="space-y-2">
                    <PlatformRow
                      label="GA4 (Browser)"
                      dotColor="#E37400"
                      enabled={conversion.platforms.ga4Client.enabled}
                      eventName={conversion.platforms.ga4Client.eventName}
                      onToggle={(v) => setPlatform('ga4Client', { enabled: v })}
                      onEventNameChange={(v) => setPlatform('ga4Client', { eventName: v })}
                      placeholder="GA4 event name"
                    />
                    <PlatformRow
                      label="Meta Pixel (Browser)"
                      dotColor="#1877F2"
                      enabled={conversion.platforms.metaPixel.enabled}
                      eventName={conversion.platforms.metaPixel.eventName}
                      onToggle={(v) => setPlatform('metaPixel', { enabled: v })}
                      onEventNameChange={(v) => setPlatform('metaPixel', { eventName: v })}
                      placeholder="Meta standard event"
                    />
                  </div>
                </div>
              )}

              {/* Server platforms */}
              {showServer && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Server size={12} className="text-text-muted" />
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Server-side</span>
                  </div>
                  <div className="space-y-2">
                    <PlatformRow
                      label="GA4 Measurement Protocol"
                      dotColor="#E37400"
                      enabled={conversion.platforms.ga4Server.enabled}
                      eventName={conversion.platforms.ga4Server.eventName}
                      onToggle={(v) => setPlatform('ga4Server', { enabled: v })}
                      onEventNameChange={(v) => setPlatform('ga4Server', { eventName: v })}
                      placeholder="GA4 MP event name"
                    />
                    <PlatformRow
                      label="Meta Conversions API"
                      dotColor="#1877F2"
                      enabled={conversion.platforms.metaCAPI.enabled}
                      eventName={conversion.platforms.metaCAPI.eventName}
                      onToggle={(v) => setPlatform('metaCAPI', { enabled: v })}
                      onEventNameChange={(v) => setPlatform('metaCAPI', { eventName: v })}
                      placeholder="Meta standard event"
                    />
                    {/* Google Ads — uses conversionLabel not eventName */}
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg border transition-all"
                      style={{
                        background: '#0D1117',
                        borderColor: conversion.platforms.googleAds.enabled ? '#34A85340' : '#1A1E28',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPlatform('googleAds', { enabled: !conversion.platforms.googleAds.enabled })}
                        className="flex items-center gap-2 shrink-0"
                      >
                        <div
                          className="w-4 h-4 rounded border-2 flex items-center justify-center"
                          style={{
                            borderColor: conversion.platforms.googleAds.enabled ? '#34A853' : '#7A8599',
                            background: conversion.platforms.googleAds.enabled ? '#34A853' : 'transparent',
                          }}
                        >
                          {conversion.platforms.googleAds.enabled && (
                            <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span
                          className="text-xs font-semibold text-left"
                          style={{ color: conversion.platforms.googleAds.enabled ? '#E8ECF2' : '#7A8599', width: '160px' }}
                        >
                          Google Ads Enhanced
                        </span>
                      </button>
                      {conversion.platforms.googleAds.enabled && (
                        <input
                          className="flex-1 bg-input-bg border border-border rounded px-2 py-1 text-xs text-text-primary font-mono placeholder-text-muted focus:outline-none focus:border-atlas-teal transition-all"
                          placeholder="Conversion label (optional)"
                          value={conversion.platforms.googleAds.conversionLabel}
                          onChange={(e) => setPlatform('googleAds', { conversionLabel: e.target.value })}
                        />
                      )}
                    </div>
                  </div>

                  {/* Warning if server-side not configured */}
                  {!serverSideEnabled && (
                    <div
                      className="flex items-start gap-2 p-3 rounded-lg mt-3"
                      style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}
                    >
                      <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: '#F59E0B' }} />
                      <p className="text-xs text-text-muted">
                        Server-side tracking requires a server endpoint. Enable it in{' '}
                        <span className="text-atlas-teal">Phase 1 → Discovery</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* 4. Deduplication */}
          {showDedup && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-text-primary mb-3">
                Deduplication
              </h4>
              <div
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{ background: '#0D1117', borderColor: '#1A1E28' }}
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">Automatic deduplication</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Same{' '}
                    <code className="font-mono text-atlas-teal">event_id</code>{' '}
                    (UUID v4) sent from client + server — prevents double-counting in GA4 and Meta
                  </p>
                </div>
                <Toggle on={conversion.enableDeduplication} onChange={(v) => set('enableDeduplication', v)} />
              </div>
            </section>
          )}

          {/* 5. Enhanced Conversions & User Data */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={13} className="text-atlas-teal" />
                <h4 className="text-xs font-semibold uppercase tracking-widest text-text-primary">
                  Enhanced Conversions & User Data
                </h4>
              </div>
              <Toggle
                on={conversion.enhancedConversionsEnabled}
                onChange={(v) => set('enhancedConversionsEnabled', v)}
              />
            </div>

            {conversion.enhancedConversionsEnabled && (
              <div
                className="p-4 rounded-lg border"
                style={{ background: 'rgba(11,191,170,0.02)', borderColor: 'rgba(11,191,170,0.15)' }}
              >
                <p className="text-xs text-text-muted mb-3">
                  All user data is hashed (SHA-256) before transmission. Enables better match quality in Google Ads and Meta.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'email', label: 'Email (SHA-256)' },
                    { key: 'phone', label: 'Phone (SHA-256)' },
                    { key: 'firstName', label: 'First name' },
                    { key: 'lastName', label: 'Last name' },
                    { key: 'city', label: 'City' },
                    { key: 'country', label: 'Country' },
                    { key: 'postalCode', label: 'Postal code' },
                  ] as { key: keyof Conversion['userData']; label: string }[]).map(({ key, label }) => (
                    <Checkbox
                      key={key}
                      checked={conversion.userData[key]}
                      onChange={(v) => setUserData(key, v)}
                      label={label}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </Card>
  );
}

// ─── Readiness Panel ──────────────────────────────────────────────────────────

function ReadinessPanel({ score }: { score: number }) {
  const color = score >= 75 ? '#0BBFAA' : score >= 45 ? '#F59E0B' : '#EF4444';
  const label = score >= 75 ? 'Ready' : score >= 45 ? 'In Progress' : 'Needs Attention';

  return (
    <div className="rounded-lg border p-5" style={{ background: '#0D1117', borderColor: '#1A1E28' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              color: '#E8ECF2',
              margin: 0,
            }}
          >
            Readiness Score
          </h3>
          <p className="text-xs text-text-muted mt-0.5">Overall conversion orchestration quality</p>
        </div>
        <div className="text-right">
          <div
            className="text-4xl font-bold leading-none"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color }}
          >
            {score}
          </div>
          <div className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: '#1A1E28' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: 'Primary conversion defined', pts: 15 },
          { label: 'Dual tracking enabled', pts: 20 },
          { label: 'Platforms mapped', pts: 20 },
          { label: 'Value configured', pts: 10 },
          { label: 'Deduplication enabled', pts: 10 },
          { label: 'Tracking methods set', pts: 10 },
          { label: 'Enhanced conversions', pts: 10 },
          { label: 'Meta CAPI configured', pts: 5 },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="font-mono text-xs shrink-0" style={{ color: '#3D4A5C' }}>+{item.pts}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Validation Panel ─────────────────────────────────────────────────────────

function ValidationPanel({ conversions }: { conversions: Conversion[] }) {
  const hasPrimary = conversions.some((c) => c.conversionType === 'primary');
  const allHaveMethod = conversions.every((c) => !!c.trackingMethod);
  const allHavePlatform = conversions.every((c) => {
    const { platforms: p, trackingMethod: m } = c;
    const hasClient = p.ga4Client.enabled || p.metaPixel.enabled;
    const hasServer = p.ga4Server.enabled || p.metaCAPI.enabled || p.googleAds.enabled;
    if (m === 'client-only') return hasClient;
    if (m === 'server-only') return hasServer;
    return hasClient && hasServer;
  });
  const isValid = hasPrimary && allHaveMethod && allHavePlatform;

  const checks = [
    { ok: hasPrimary, text: hasPrimary ? 'Primary conversion configured' : 'Configure at least one primary conversion' },
    { ok: allHaveMethod, text: allHaveMethod ? 'Tracking method set for all conversions' : 'Set tracking method for all conversions' },
    { ok: allHavePlatform, text: allHavePlatform ? 'Platform mapping configured' : 'Enable at least one platform per conversion' },
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

export function Phase3ConversionOrchestration() {
  const navigate = useNavigate();
  const { getActiveProject, updateProject } = useStore();
  const project = getActiveProject();

  // Collect conversion events from all journeys
  const conversionEvents = useMemo(() => {
    const result: Array<{
      id: string;
      canonicalName: string;
      displayName: string;
      conversionType: 'primary' | 'secondary';
    }> = [];
    for (const journey of project?.journeys ?? []) {
      for (const event of journey.events) {
        if (event.conversionType !== 'none') {
          result.push({
            id: event.id,
            canonicalName: event.canonicalName,
            displayName: event.displayName,
            conversionType: event.conversionType,
          });
        }
      }
    }
    return result;
  }, [project?.journeys]);

  // Initialize: merge saved data with current journey conversion events
  const [conversions, setConversions] = useState<Conversion[]>(() => {
    const savedMap = new Map((project?.conversions ?? []).map((c) => [c.eventId, c]));
    return conversionEvents.map((e) => savedMap.get(e.id) ?? defaultConversion(e));
  });

  // Expand first conversion by default
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const first = conversions[0]?.id;
    return first ? new Set([first]) : new Set();
  });

  // Redirect if no active project
  useEffect(() => {
    if (!project) navigate('/discovery');
  }, [project, navigate]);

  // Derived
  const serverSideEnabled = project?.discovery?.serverSideTracking?.enabled ?? false;
  const readinessScore = computeReadinessScore(conversions);
  const isValid =
    conversions.length > 0 &&
    conversions.some((c) => c.conversionType === 'primary') &&
    conversions.every((c) => !!c.trackingMethod) &&
    conversions.every((c) => {
      const { platforms: p, trackingMethod: m } = c;
      const hasClient = p.ga4Client.enabled || p.metaPixel.enabled;
      const hasServer = p.ga4Server.enabled || p.metaCAPI.enabled || p.googleAds.enabled;
      if (m === 'client-only') return hasClient;
      if (m === 'server-only') return hasServer;
      return hasClient && hasServer;
    });

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateConversion(updated: Conversion) {
    setConversions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function saveDraft() {
    if (project) updateProject(project.id, { conversions });
  }

  async function handleContinue() {
    if (project) await updateProject(project.id, { conversions, currentPhase: 3 });
    navigate('/export');
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/journey')}
          className="text-xs text-text-muted hover:text-text-primary transition mb-4 flex items-center gap-1"
        >
          ← Back to Journey Designer
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
          Phase 3 · Conversion Orchestration
        </h1>
        <p className="text-text-muted text-sm mt-1.5">
          Map conversion events to tracking platforms with dual-tracking configuration.{' '}
          {project?.discovery?.clientName && (
            <span className="text-atlas-teal font-medium">{project.discovery.clientName}</span>
          )}
        </p>
      </div>

      <PhaseStepper current={3} />

      {/* No conversions state */}
      {conversionEvents.length === 0 ? (
        <div
          className="rounded-lg border p-10 text-center"
          style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.03)' }}
        >
          <AlertCircle size={32} style={{ color: '#F59E0B', margin: '0 auto 12px' }} />
          <h3
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '18px',
              color: '#E8ECF2',
              margin: '0 0 8px',
            }}
          >
            No conversion events found
          </h3>
          <p className="text-sm text-text-muted mb-5">
            Go back to the Journey Designer and mark at least one event as a conversion (primary or secondary).
          </p>
          <Button variant="secondary" onClick={() => navigate('/journey')}>
            ← Back to Journey Designer
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Info banner */}
          <div
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{ background: 'rgba(11,191,170,0.05)', border: '1px solid rgba(11,191,170,0.15)' }}
          >
            <Info size={14} className="text-atlas-teal mt-0.5 shrink-0" />
            <p className="text-xs text-text-muted leading-relaxed">
              <span className="text-atlas-teal font-semibold">
                {conversions.length} conversion event{conversions.length !== 1 ? 's' : ''}
              </span>{' '}
              found across your journeys. Configure the tracking method, platform mapping, and deduplication for each.
              {!serverSideEnabled && (
                <span>
                  {' '}
                  <span style={{ color: '#F59E0B' }}>Server-side tracking is disabled.</span>{' '}
                  Enable it in Phase 1 to unlock GA4 MP, Meta CAPI, and Google Ads Enhanced.
                </span>
              )}
            </p>
          </div>

          {/* Conversion cards */}
          {conversions.map((conversion) => (
            <ConversionCard
              key={conversion.id}
              conversion={conversion}
              isExpanded={expandedIds.has(conversion.id)}
              onToggleExpand={() => toggleExpand(conversion.id)}
              onChange={updateConversion}
              serverSideEnabled={serverSideEnabled}
            />
          ))}

          {/* Readiness score */}
          <ReadinessPanel score={readinessScore} />

          {/* Validation */}
          <ValidationPanel conversions={conversions} />

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={saveDraft}>
              Save Draft
            </Button>
            <Button type="button" disabled={!isValid} onClick={handleContinue}>
              Continue to Export →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
