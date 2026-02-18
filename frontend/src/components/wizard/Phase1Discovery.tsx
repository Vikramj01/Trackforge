import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../store';
import type { DiscoveryData } from '../../types';

const goalOptions = [
  { id: 'ecommerce', label: 'Ecommerce' },
  { id: 'leadgen', label: 'Lead Gen' },
  { id: 'content', label: 'Content' },
  { id: 'branding', label: 'Branding' },
];

const techOptions = [
  { id: 'shopify', label: 'Shopify' },
  { id: 'woocommerce', label: 'WooCommerce' },
  { id: 'wordpress', label: 'WordPress' },
  { id: 'webflow', label: 'Webflow' },
  { id: 'squarespace', label: 'Squarespace' },
  { id: 'custom', label: 'Custom' },
];

const industries = [
  'ecommerce', 'saas', 'leadgen', 'media', 'healthcare', 'finance', 'education', 'other'
];

interface Props {
  projectId: string;
  onNext: () => void;
  initialData?: DiscoveryData;
}

export default function Phase1Discovery({ projectId, onNext, initialData }: Props) {
  const { updateProject } = useStore();
  const [form, setForm] = useState<DiscoveryData>(
    initialData ?? {
      clientName: '',
      industry: 'ecommerce',
      website: '',
      goals: [],
      techStack: [],
      notes: '',
    }
  );
  const [saving, setSaving] = useState(false);

  const toggleMulti = (field: 'goals' | 'techStack', value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim() || !form.website.trim()) return;
    setSaving(true);
    updateProject(projectId, {
      discovery: form,
      currentPhase: 2,
      status: 'in-progress',
      clientName: form.clientName,
    });
    setSaving(false);
    onNext();
  };

  const inputStyle = {
    backgroundColor: '#12161E',
    border: '1px solid #1A1E28',
    borderRadius: '8px',
    color: '#E8ECF2',
    padding: '0.625rem 0.875rem',
    width: '100%',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  };

  const labelStyle = {
    display: 'block' as const,
    color: '#7A8599',
    fontSize: '0.8125rem',
    fontWeight: 500 as const,
    marginBottom: '0.375rem',
  };

  const toggleBtn = (active: boolean) => ({
    padding: '0.375rem 0.875rem',
    borderRadius: '6px',
    border: `1px solid ${active ? '#0BBFAA' : '#1A1E28'}`,
    background: active ? 'rgba(11,191,170,0.15)' : 'transparent',
    color: active ? '#0BBFAA' : '#7A8599',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    fontWeight: active ? 500 : 400,
    transition: 'all 0.15s',
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '1.375rem', color: '#E8ECF2', margin: 0, marginBottom: '0.375rem' }}>
          Client Discovery
        </h2>
        <p style={{ color: '#7A8599', fontSize: '0.875rem', margin: 0 }}>
          Tell us about your client so we can tailor the tracking setup.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Client Name *</label>
            <input
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              placeholder="Acme Corp"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#0BBFAA')}
              onBlur={(e) => (e.target.style.borderColor = '#1A1E28')}
            />
          </div>
          <div>
            <label style={labelStyle}>Industry</label>
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => (e.target.style.borderColor = '#0BBFAA')}
              onBlur={(e) => (e.target.style.borderColor = '#1A1E28')}
            >
              {industries.map((ind) => (
                <option key={ind} value={ind} style={{ backgroundColor: '#12161E' }}>
                  {ind.charAt(0).toUpperCase() + ind.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Website URL *</label>
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://clientwebsite.com"
            required
            type="url"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#0BBFAA')}
            onBlur={(e) => (e.target.style.borderColor = '#1A1E28')}
          />
        </div>

        <div>
          <label style={labelStyle}>Primary Goals</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {goalOptions.map(({ id, label }) => (
              <button
                type="button"
                key={id}
                onClick={() => toggleMulti('goals', id)}
                style={toggleBtn(form.goals.includes(id))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Current Tech Stack</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {techOptions.map(({ id, label }) => (
              <button
                type="button"
                key={id}
                onClick={() => toggleMulti('techStack', id)}
                style={toggleBtn(form.techStack.includes(id))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any additional context about the client, their goals, or specific requirements..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
            onFocus={(e) => (e.target.style.borderColor = '#0BBFAA')}
            onBlur={(e) => (e.target.style.borderColor = '#1A1E28')}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'linear-gradient(135deg, #0BBFAA, #099d8b)',
              color: '#080B12',
              fontWeight: 600,
              fontSize: '0.875rem',
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: saving ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save & Continue'}
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
