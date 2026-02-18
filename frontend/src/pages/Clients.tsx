import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Globe, Users, Trash2, FolderPlus, X, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import type { Industry } from '../types';

const industryColors: Record<string, { bg: string; color: string }> = {
  ecommerce: { bg: 'rgba(11,191,170,0.15)', color: '#0BBFAA' },
  saas: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  leadgen: { bg: 'rgba(234,179,8,0.15)', color: '#eab308' },
  media: { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  healthcare: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  finance: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  education: { bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  other: { bg: 'rgba(122,133,153,0.15)', color: '#7A8599' },
};

const goalOptions = ['Ecommerce', 'Lead Gen', 'Content', 'Branding'];
const techOptions = ['Shopify', 'WooCommerce', 'WordPress', 'Webflow', 'Custom'];
const industryOptions: Industry[] = ['ecommerce', 'saas', 'leadgen', 'media', 'healthcare', 'finance', 'education', 'other'];

interface FormData {
  name: string;
  industry: Industry;
  website: string;
  goals: string[];
  techStack: string[];
  notes: string;
}

const defaultForm: FormData = {
  name: '',
  industry: 'ecommerce',
  website: '',
  goals: [],
  techStack: [],
  notes: '',
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function Clients() {
  const navigate = useNavigate();
  const { clients, addClient, deleteClient, createProject } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.website.toLowerCase().includes(search.toLowerCase())
  );

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
    if (!form.name.trim() || !form.website.trim()) return;
    setSaving(true);
    addClient(form);
    setForm(defaultForm);
    setShowForm(false);
    setSaving(false);
  };

  const handleNewProject = (clientId: string, clientName: string) => {
    const project = createProject(clientId, clientName);
    navigate(`/wizard/${project.id}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#E8ECF2', margin: 0, marginBottom: '0.375rem' }}>
            Clients
          </h1>
          <p style={{ color: '#7A8599', fontSize: '0.9rem', margin: 0 }}>
            {clients.length} client{clients.length !== 1 ? 's' : ''} managed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ background: 'linear-gradient(135deg, #0BBFAA, #099d8b)', color: '#080B12', fontWeight: 600, fontSize: '0.875rem', padding: '0.625rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <div style={{ backgroundColor: '#0D1117', border: '1px solid #0BBFAA', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#E8ECF2' }}>Add New Client</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#7A8599', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#7A8599', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Client Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Corp" required style={{ backgroundColor: '#12161E', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.625rem 0.875rem', width: '100%', fontSize: '0.875rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0BBFAA'} onBlur={(e) => e.target.style.borderColor = '#1A1E28'} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#7A8599', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Website URL *</label>
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" required style={{ backgroundColor: '#12161E', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.625rem 0.875rem', width: '100%', fontSize: '0.875rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0BBFAA'} onBlur={(e) => e.target.style.borderColor = '#1A1E28'} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#7A8599', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Industry</label>
              <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value as Industry })} style={{ backgroundColor: '#12161E', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.625rem 0.875rem', width: '100%', fontSize: '0.875rem', outline: 'none' }}>
                {industryOptions.map((ind) => <option key={ind} value={ind}>{ind.charAt(0).toUpperCase() + ind.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#7A8599', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Primary Goals</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {goalOptions.map((g) => (
                    <button type="button" key={g} onClick={() => toggleMulti('goals', g.toLowerCase().replace(' ', '-'))}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: '6px', border: `1px solid ${form.goals.includes(g.toLowerCase().replace(' ', '-')) ? '#0BBFAA' : '#1A1E28'}`, background: form.goals.includes(g.toLowerCase().replace(' ', '-')) ? 'rgba(11,191,170,0.15)' : 'transparent', color: form.goals.includes(g.toLowerCase().replace(' ', '-')) ? '#0BBFAA' : '#7A8599', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#7A8599', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Tech Stack</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {techOptions.map((t) => (
                    <button type="button" key={t} onClick={() => toggleMulti('techStack', t.toLowerCase())}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: '6px', border: `1px solid ${form.techStack.includes(t.toLowerCase()) ? '#0BBFAA' : '#1A1E28'}`, background: form.techStack.includes(t.toLowerCase()) ? 'rgba(11,191,170,0.15)' : 'transparent', color: form.techStack.includes(t.toLowerCase()) ? '#0BBFAA' : '#7A8599', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#7A8599', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional context..." rows={3} style={{ backgroundColor: '#12161E', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.625rem 0.875rem', width: '100%', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }} onFocus={(e) => e.target.style.borderColor = '#0BBFAA'} onBlur={(e) => e.target.style.borderColor = '#1A1E28'} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #0BBFAA, #099d8b)', color: '#080B12', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#7A8599' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." style={{ backgroundColor: '#0D1117', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.625rem 0.875rem 0.625rem 2.5rem', width: '100%', fontSize: '0.875rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0BBFAA'} onBlur={(e) => e.target.style.borderColor = '#1A1E28'} />
      </div>

      {/* Client Cards Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#7A8599' }}>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ margin: 0 }}>{search ? 'No clients match your search.' : 'No clients yet. Add your first client.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map((client) => {
            const ic = industryColors[client.industry] ?? industryColors.other;
            return (
              <div key={client.id} style={{ backgroundColor: '#0D1117', border: '1px solid #1A1E28', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#E8ECF2', marginBottom: '0.375rem' }}>{client.name}</h3>
                    <a href={client.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: '#7A8599', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0BBFAA'} onMouseLeave={(e) => e.currentTarget.style.color = '#7A8599'}>
                      <Globe size={12} />
                      {client.website.replace(/https?:\/\//, '')}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, backgroundColor: ic.bg, color: ic.color, textTransform: 'capitalize' }}>
                      {client.industry}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {client.techStack.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {client.techStack.map((t) => (
                      <span key={t} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, backgroundColor: '#12161E', color: '#7A8599', textTransform: 'capitalize' }}>{t}</span>
                    ))}
                  </div>
                )}

                {client.notes && (
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#7A8599', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{client.notes}</p>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #1A1E28' }}>
                  <span style={{ fontSize: '0.75rem', color: '#7A8599' }}>
                    {client.projectCount} project{client.projectCount !== 1 ? 's' : ''} · {timeAgo(client.createdAt)}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { if (window.confirm(`Delete ${client.name}?`)) deleteClient(client.id); }} style={{ background: 'none', border: '1px solid #1A1E28', borderRadius: '6px', padding: '0.375rem', color: '#7A8599', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete client" onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1A1E28'; e.currentTarget.style.color = '#7A8599'; }}>
                      <Trash2 size={14} />
                    </button>
                    <button onClick={() => handleNewProject(client.id, client.name)} style={{ background: 'linear-gradient(135deg, #0BBFAA, #099d8b)', border: 'none', borderRadius: '6px', padding: '0.375rem 0.75rem', color: '#080B12', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <FolderPlus size={13} /> New Project
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
