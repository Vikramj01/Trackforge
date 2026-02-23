import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import type { ValidatorInputs, ValidatorPlatform, ConversionGoal } from '../../types';

const PLATFORMS: { value: ValidatorPlatform; label: string }[] = [
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'meta-ads', label: 'Meta Ads' },
  { value: 'linkedin-ads', label: 'LinkedIn Ads' },
];

const CONVERSION_TYPES: { value: ConversionGoal; label: string }[] = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'lead', label: 'Lead / Form Submit' },
  { value: 'signup', label: 'Sign Up' },
  { value: 'add-to-cart', label: 'Add to Cart' },
];

interface ValidatorFormProps {
  onSubmit: (inputs: ValidatorInputs) => void;
  onSkip: () => void;
}

export function ValidatorForm({ onSubmit, onSkip }: ValidatorFormProps) {
  const [platforms, setPlatforms] = useState<ValidatorPlatform[]>(['google-ads', 'meta-ads']);
  const [landingUrl, setLandingUrl] = useState('');
  const [conversionUrl, setConversionUrl] = useState('');
  const [conversionType, setConversionType] = useState<ConversionGoal | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function togglePlatform(p: ValidatorPlatform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!landingUrl.trim()) {
      e.landingUrl = 'Required';
    } else if (!/^https?:\/\/.+/.test(landingUrl.trim())) {
      e.landingUrl = 'Must be a valid URL starting with https://';
    }
    if (!conversionUrl.trim()) {
      e.conversionUrl = 'Required';
    } else if (!/^https?:\/\/.+/.test(conversionUrl.trim())) {
      e.conversionUrl = 'Must be a valid URL starting with https://';
    }
    if (platforms.length === 0) e.platforms = 'Select at least one platform';
    if (!conversionType) e.conversionType = 'Select a conversion type';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      landingUrl: landingUrl.trim(),
      conversionUrl: conversionUrl.trim(),
      platforms,
      conversionType: conversionType as ConversionGoal,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <p className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-6">
          Test Your Tracking Setup
        </p>

        {/* Platforms */}
        <div className="mb-6">
          <p className="text-sm font-medium text-text-primary mb-3">
            What platform are you testing?
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const checked = platforms.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: checked ? 'rgba(11,191,170,0.1)' : '#12161E',
                    border: `1px solid ${checked ? 'rgba(11,191,170,0.4)' : '#1A1E28'}`,
                    color: checked ? '#0BBFAA' : '#7A8599',
                  }}
                >
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: checked ? '#0BBFAA' : 'transparent',
                      border: `1.5px solid ${checked ? '#0BBFAA' : '#3A3F4E'}`,
                    }}
                  >
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="#080B12"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {p.label}
                </button>
              );
            })}
          </div>
          {errors.platforms && (
            <p className="text-xs mt-2" style={{ color: '#EF4444' }}>
              {errors.platforms}
            </p>
          )}
        </div>

        {/* Landing URL */}
        <div className="mb-4">
          <Input
            label="Landing Page URL"
            placeholder="https://mystore.com/landing"
            value={landingUrl}
            onChange={(e) => setLandingUrl(e.target.value)}
            error={errors.landingUrl}
            hint="Where your ads send visitors"
          />
        </div>

        {/* Conversion URL */}
        <div className="mb-6">
          <Input
            label="Conversion Page URL"
            placeholder="https://mystore.com/thank-you"
            value={conversionUrl}
            onChange={(e) => setConversionUrl(e.target.value)}
            error={errors.conversionUrl}
            hint="Where conversions happen"
          />
        </div>

        {/* Conversion type */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-3">
            Conversion Type{' '}
            <span style={{ color: '#0BBFAA' }}>*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CONVERSION_TYPES.map((ct) => {
              const selected = conversionType === ct.value;
              return (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setConversionType(ct.value)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all"
                  style={{
                    background: selected ? 'rgba(11,191,170,0.1)' : '#12161E',
                    border: `1px solid ${selected ? 'rgba(11,191,170,0.4)' : '#1A1E28'}`,
                    color: selected ? '#0BBFAA' : '#7A8599',
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                    style={{
                      border: `1.5px solid ${selected ? '#0BBFAA' : '#3A3F4E'}`,
                    }}
                  >
                    {selected && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: '#0BBFAA' }}
                      />
                    )}
                  </span>
                  {ct.label}
                </button>
              );
            })}
          </div>
          {errors.conversionType && (
            <p className="text-xs mt-2" style={{ color: '#EF4444' }}>
              {errors.conversionType}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit">
            <Search size={16} />
            Run Test
          </Button>
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5"
          >
            Skip to Discovery
            <ArrowRight size={14} />
          </button>
        </div>
      </Card>
    </form>
  );
}
