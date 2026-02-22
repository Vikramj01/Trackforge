import { useState } from 'react';
import { Check, Zap, Building2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Plan {
  id: 'free' | 'pro' | 'agency';
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ElementType;
  projectLimit: string;
  features: string[];
  stripePriceId: string | null;
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with tracking architecture.',
    icon: Sparkles,
    projectLimit: '3 projects',
    features: [
      '3 client projects',
      'Full journey design',
      'Conversion orchestration',
      'Community support',
    ],
    stripePriceId: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For agencies running multiple clients.',
    icon: Zap,
    projectLimit: 'Unlimited projects',
    features: [
      'Unlimited client projects',
      'Server-side export packages',
      'GTM container exports',
      'Priority email support',
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_PRO as string,
    highlight: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$149',
    period: '/month',
    description: 'For large teams and white-label use.',
    icon: Building2,
    projectLimit: 'Unlimited projects',
    features: [
      'Everything in Pro',
      'Up to 5 team seats',
      'White-label exports',
      'Dedicated Slack support',
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_AGENCY as string,
  },
];

export function Billing() {
  const { profile, refreshProfile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleUpgrade(plan: Plan) {
    if (!plan.stripePriceId) return;
    setLoadingPlan(plan.id);

    try {
      // Call the Supabase Edge Function to create a Stripe Checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.stripePriceId, planId: plan.id },
      });

      if (error || !data?.url) {
        console.error('Checkout error:', error);
        setLoadingPlan(null);
        return;
      }

      window.location.href = data.url as string;
    } catch {
      setLoadingPlan(null);
    }
  }

  async function handleManageBilling() {
    setLoadingPlan('portal');
    try {
      const { data, error } = await supabase.functions.invoke('create-portal', {});
      if (error || !data?.url) {
        setLoadingPlan(null);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      setLoadingPlan(null);
    }
  }

  const currentPlan = profile?.plan ?? 'free';

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <h1
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700,
            fontSize: '32px',
            letterSpacing: '-0.01em',
            color: '#E8ECF2',
            margin: 0,
          }}
        >
          Plans &amp; Billing
        </h1>
        <p className="text-text-muted mt-2 text-sm">
          You are on the{' '}
          <span className="text-atlas-teal font-semibold capitalize">{currentPlan}</span> plan.
          {profile?.plan !== 'free' && (
            <button
              onClick={handleManageBilling}
              disabled={loadingPlan === 'portal'}
              className="ml-3 text-atlas-teal underline text-sm disabled:opacity-50"
            >
              {loadingPlan === 'portal' ? 'Loading…' : 'Manage billing →'}
            </button>
          )}
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          const isHigher =
            (plan.id === 'pro' && currentPlan === 'free') ||
            (plan.id === 'agency' && currentPlan !== 'agency');

          return (
            <Card
              key={plan.id}
              className={`flex flex-col ${plan.highlight ? 'border-atlas-teal/30' : ''}`}
              style={
                plan.highlight
                  ? { background: 'rgba(11,191,170,0.04)' }
                  : undefined
              }
            >
              {/* Plan header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background: plan.highlight
                      ? 'rgba(11,191,170,0.1)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${plan.highlight ? 'rgba(11,191,170,0.2)' : '#1A1E28'}`,
                  }}
                >
                  <Icon
                    size={18}
                    style={{ color: plan.highlight ? '#0BBFAA' : '#7A8599' }}
                  />
                </div>
                {isCurrent && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      background: 'rgba(11,191,170,0.1)',
                      color: '#0BBFAA',
                      border: '1px solid rgba(11,191,170,0.2)',
                    }}
                  >
                    Current
                  </span>
                )}
              </div>

              <h3
                style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#E8ECF2',
                  margin: 0,
                }}
              >
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mt-1 mb-1">
                <span
                  style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontWeight: 700,
                    fontSize: '28px',
                    color: '#E8ECF2',
                  }}
                >
                  {plan.price}
                </span>
                <span className="text-text-muted text-sm">{plan.period}</span>
              </div>

              <p className="text-text-muted text-xs mb-5">{plan.description}</p>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0"
                      style={{ color: '#0BBFAA' }}
                    />
                    <span className="text-xs text-text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div
                  className="w-full text-center text-sm py-2.5 rounded-lg font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: '#7A8599',
                    border: '1px solid #1A1E28',
                  }}
                >
                  Current plan
                </div>
              ) : isHigher ? (
                <Button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full justify-center ${plan.highlight ? '' : 'opacity-80'}`}
                >
                  {loadingPlan === plan.id ? 'Redirecting…' : `Upgrade to ${plan.name}`}
                </Button>
              ) : (
                <div
                  className="w-full text-center text-sm py-2.5 rounded-lg font-medium"
                  style={{
                    color: '#7A8599',
                    border: '1px solid #1A1E28',
                  }}
                >
                  Downgrade available via billing portal
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Refresh plan status (post-checkout) */}
      <div className="mt-8 text-center">
        <button
          onClick={refreshProfile}
          className="text-xs text-text-muted hover:text-atlas-teal transition-colors"
        >
          Just upgraded? Refresh plan status
        </button>
      </div>
    </div>
  );
}
