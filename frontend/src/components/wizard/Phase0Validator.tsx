import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ValidatorForm } from '../validator/ValidatorForm';
import { ValidatorProgress } from '../validator/ValidatorProgress';
import { useStore } from '../../store/useStore';
import type { ValidatorInputs, ValidatorResults } from '../../types';

// ─── Mock results (MVP — no real browser automation yet) ──────────────────────

const MOCK_RESULTS: Omit<ValidatorResults, 'inputs'> = {
  score: 45,
  criticalIssues: [
    {
      id: 'gclid_dropped',
      title: 'GCLID Parameter Dropped',
      impact: "Google Ads can't track 40% of conversions",
      cause: 'Parameter lost after redirect to checkout',
      severity: 'critical',
    },
    {
      id: 'purchase_not_firing',
      title: 'Purchase Event Not Firing',
      impact: '0 conversions tracked',
      cause: 'No dataLayer.push() on /thank-you page',
      severity: 'critical',
    },
  ],
  warnings: [
    {
      id: 'no_capi',
      title: 'No Meta CAPI Configured',
      impact: 'Losing 35% of iOS conversions',
      severity: 'warning',
    },
    {
      id: 'missing_transaction_id',
      title: 'Missing transaction_id',
      impact: 'Risk of duplicate conversion counting',
      severity: 'warning',
    },
    {
      id: 'no_enhanced_conversions',
      title: 'No Enhanced Conversions',
      impact: '20-30% lower match rate',
      severity: 'warning',
    },
  ],
  passing: [
    'Meta Pixel installed correctly',
    'Google Ads tag present on landing page',
  ],
  detectedSetup: {
    hasGTM: true,
    hasGA4: true,
    hasMetaPixel: true,
    hasGoogleAds: true,
    propertyType: 'spa',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

type View = 'form' | 'progress';

export function Phase0Validator() {
  const navigate = useNavigate();
  const { setValidatorResults } = useStore();
  const [view, setView] = useState<View>('form');
  const [inputs, setInputs] = useState<ValidatorInputs | null>(null);

  function handleFormSubmit(data: ValidatorInputs) {
    setInputs(data);
    setView('progress');
  }

  function handleProgressComplete() {
    setValidatorResults({ ...MOCK_RESULTS, inputs: inputs! });
    navigate('/discovery');
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3">
          <span
            className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-md"
            style={{
              background: 'rgba(11,191,170,0.1)',
              color: '#0BBFAA',
              border: '1px solid rgba(11,191,170,0.2)',
            }}
          >
            Phase 0
          </span>
        </div>
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
          Tracking Validator
        </h1>
        <p className="text-text-muted text-sm mt-2">
          Test your existing setup to detect tracking gaps before building a new architecture.
        </p>
      </div>

      {view === 'form' && (
        <ValidatorForm
          onSubmit={handleFormSubmit}
          onSkip={() => navigate('/discovery')}
        />
      )}

      {view === 'progress' && (
        <ValidatorProgress onComplete={handleProgressComplete} />
      )}
    </div>
  );
}
