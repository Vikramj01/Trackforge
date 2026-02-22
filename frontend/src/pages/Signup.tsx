import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function Signup() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    });

    if (error) {
      setServerError(error.message);
    } else {
      // Supabase may require email confirmation depending on project settings.
      // If auto-confirm is on, onAuthStateChange will fire and redirect happens automatically.
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0A0D14' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{
              background: 'rgba(11, 191, 170, 0.1)',
              border: '1px solid rgba(11, 191, 170, 0.25)',
            }}
          >
            <UserPlus size={22} style={{ color: '#0BBFAA' }} />
          </div>
          <h1
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              color: '#E8ECF2',
              margin: 0,
            }}
          >
            Create your account
          </h1>
          <p className="text-text-muted text-sm mt-2">Free plan — 3 projects included</p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{ background: '#0F1218', border: '1px solid #1A1E28' }}
        >
          {success ? (
            <div className="text-center py-4">
              <p className="text-atlas-teal font-semibold">Account created!</p>
              <p className="text-text-muted text-sm mt-1">Redirecting you in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-2">
                  Full Name
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  placeholder="Jane Smith"
                  autoComplete="name"
                  className="w-full bg-input-bg border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 border-border"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full bg-input-bg border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 border-border"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-2">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full bg-input-bg border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 border-border"
                />
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <div
                  className="rounded-lg px-4 py-3 text-sm text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {serverError}
                </div>
              )}

              <Button type="submit" className="w-full justify-center" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create free account'}
              </Button>

              <p className="text-xs text-text-muted text-center">
                By signing up you agree to our terms of service.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-atlas-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
