import { useState } from 'react';
import { User, Mail, Shield, CreditCard, LogOut, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const PLAN_STYLES = {
  free:   { bg: 'rgba(122,133,153,0.1)', color: '#7A8599',  label: 'Free' },
  pro:    { bg: 'rgba(11,191,170,0.1)',  color: '#0BBFAA',  label: 'Pro' },
  agency: { bg: 'rgba(168,85,247,0.1)', color: '#A855F7',  label: 'Agency' },
};

const PLAN_LIMITS = {
  free:   { projects: 3,   exports: 5,   description: 'Up to 3 projects, 5 exports/month' },
  pro:    { projects: 20,  exports: 100, description: 'Up to 20 projects, 100 exports/month' },
  agency: { projects: 999, exports: 999, description: 'Unlimited projects and exports' },
};

export function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.full_name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState('');

  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const plan = profile?.plan ?? 'free';
  const planStyle = PLAN_STYLES[plan] ?? PLAN_STYLES.free;
  const planLimits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  async function handleSaveName() {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError('Display name cannot be empty.');
      return;
    }
    setNameError('');
    setSavingName(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: trimmed })
      .eq('id', user!.id);

    setSavingName(false);

    if (error) {
      setNameError('Failed to save. Please try again.');
    } else {
      setNameSaved(true);
      await refreshProfile();
      setTimeout(() => setNameSaved(false), 2500);
    }
  }

  async function handleSendPasswordReset() {
    if (!user?.email) return;
    setSendingReset(true);
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    setSendingReset(false);
    setResetSent(true);
    setTimeout(() => setResetSent(false), 5000);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
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
          Settings
        </h1>
        <p className="text-text-muted mt-2 text-sm">Manage your account and preferences.</p>
      </div>

      {/* Profile section */}
      <section className="mb-6">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3"
          style={{ letterSpacing: '0.08em' }}
        >
          Profile
        </h2>
        <Card className="space-y-5">
          {/* Display name */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
              <User size={13} />
              Display Name
            </label>
            <div className="flex items-center gap-2">
              <input
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setNameSaved(false);
                  setNameError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                placeholder="Your name"
                className="flex-1 px-3.5 py-2.5 rounded-lg text-sm text-text-primary placeholder-text-muted"
                style={{ background: '#12161E', border: '1px solid #1A1E28', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = '#0BBFAA')}
                onBlur={(e) => (e.target.style.borderColor = nameSaved ? 'rgba(34,197,94,0.4)' : '#1A1E28')}
              />
              <button
                onClick={handleSaveName}
                disabled={savingName || displayName.trim() === (profile?.full_name ?? '')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background:
                    nameSaved
                      ? 'rgba(34,197,94,0.15)'
                      : displayName.trim() === (profile?.full_name ?? '')
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(11,191,170,0.15)',
                  color:
                    nameSaved
                      ? '#22C55E'
                      : displayName.trim() === (profile?.full_name ?? '')
                      ? '#7A8599'
                      : '#0BBFAA',
                  border: `1px solid ${nameSaved ? 'rgba(34,197,94,0.3)' : '#1A1E28'}`,
                  cursor:
                    savingName || displayName.trim() === (profile?.full_name ?? '')
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {savingName ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : nameSaved ? (
                  <Check size={14} />
                ) : null}
                {nameSaved ? 'Saved' : 'Save'}
              </button>
            </div>
            {nameError && <p className="text-xs text-red-400 mt-1.5">{nameError}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
              <Mail size={13} />
              Email Address
            </label>
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A1E28' }}
            >
              <span className="text-sm text-text-primary flex-1">{user?.email}</span>
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                Verified
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1.5">
              Email cannot be changed from here. Contact support if needed.
            </p>
          </div>
        </Card>
      </section>

      {/* Plan section */}
      <section className="mb-6">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3"
          style={{ letterSpacing: '0.08em' }}
        >
          Plan &amp; Billing
        </h2>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  background: planStyle.bg,
                  border: `1px solid ${planStyle.color}22`,
                }}
              >
                <CreditCard size={16} style={{ color: planStyle.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#E8ECF2' }}
                  >
                    {planStyle.label} Plan
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded capitalize"
                    style={{
                      background: planStyle.bg,
                      color: planStyle.color,
                      border: `1px solid ${planStyle.color}22`,
                    }}
                  >
                    {profile?.plan_status ?? 'active'}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">{planLimits.description}</p>
              </div>
            </div>
            {plan === 'free' && (
              <Button
                onClick={() => navigate('/billing')}
                className="shrink-0 text-xs py-1.5"
              >
                Upgrade
              </Button>
            )}
          </div>

          {plan === 'free' && (
            <div
              className="px-4 py-3 rounded-lg"
              style={{ background: 'rgba(11,191,170,0.05)', border: '1px solid rgba(11,191,170,0.15)' }}
            >
              <p className="text-xs font-semibold text-atlas-teal mb-1">Unlock Pro</p>
              <p className="text-xs text-text-muted leading-relaxed">
                Get 20 projects, unlimited exports, and priority support. Starting at $29/month.
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* Security section */}
      <section className="mb-6">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3"
          style={{ letterSpacing: '0.08em' }}
        >
          Security
        </h2>
        <Card className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Shield size={14} className="text-text-muted" />
                  Password
                </p>
                <p className="text-xs text-text-muted mt-0.5 ml-5">
                  We'll send a reset link to your email address.
                </p>
              </div>
              <button
                onClick={handleSendPasswordReset}
                disabled={sendingReset || resetSent}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shrink-0"
                style={{
                  background: resetSent ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                  border: resetSent ? '1px solid rgba(34,197,94,0.25)' : '1px solid #1A1E28',
                  color: resetSent ? '#22C55E' : '#7A8599',
                  cursor: sendingReset || resetSent ? 'default' : 'pointer',
                }}
              >
                {sendingReset ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : resetSent ? (
                  <Check size={13} />
                ) : null}
                {resetSent ? 'Email sent!' : sendingReset ? 'Sending...' : 'Reset Password'}
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div style={{ borderTop: '1px solid #1A1E28', paddingTop: '1rem' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <LogOut size={14} className="text-text-muted" />
                  Sign out
                </p>
                <p className="text-xs text-text-muted mt-0.5 ml-5">
                  You'll need to sign in again to access your projects.
                </p>
              </div>
              {confirmSignOut ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-muted">Sure?</span>
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-semibold px-2.5 py-1 rounded"
                    style={{
                      color: '#f87171',
                      background: 'rgba(248,113,113,0.1)',
                      border: '1px solid rgba(248,113,113,0.2)',
                    }}
                  >
                    Sign out
                  </button>
                  <button
                    onClick={() => setConfirmSignOut(false)}
                    className="text-xs font-medium px-2.5 py-1 rounded text-text-muted"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A1E28' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmSignOut(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shrink-0 text-text-muted hover:text-text-primary"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A1E28' }}
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* Account info */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3"
          style={{ letterSpacing: '0.08em' }}
        >
          Account
        </h2>
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Account ID</span>
              <code
                className="text-xs font-mono"
                style={{ color: '#7A8599', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {user?.id?.slice(0, 8)}…
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Member since</span>
              <span className="text-xs text-text-muted">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Atlas version</span>
              <span className="text-xs text-text-muted">v1.0 · Sprint 5</span>
            </div>
          </div>

          {/* Danger zone */}
          <div
            className="mt-4 pt-4 flex items-start gap-3"
            style={{ borderTop: '1px solid #1A1E28' }}
          >
            <AlertTriangle size={14} style={{ color: '#F87171', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-semibold text-red-400">Danger Zone</p>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                To permanently delete your account and all data, email{' '}
                <a
                  href="mailto:support@atlas.app"
                  className="underline hover:text-text-primary"
                  style={{ color: '#7A8599' }}
                >
                  support@atlas.app
                </a>
                . This action is irreversible.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
