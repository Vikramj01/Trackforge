import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Tag, Layers } from 'lucide-react';
import { useStore } from '../store';

const channelColors: Record<string, { bg: string; color: string }> = {
  'google-ads': { bg: 'rgba(66,133,244,0.15)', color: '#4285f4' },
  meta: { bg: 'rgba(24,119,242,0.15)', color: '#1877f2' },
  linkedin: { bg: 'rgba(0,119,181,0.15)', color: '#0077b5' },
  ga4: { bg: 'rgba(11,191,170,0.15)', color: '#0BBFAA' },
  tiktok: { bg: 'rgba(255,0,80,0.15)', color: '#ff0050' },
  'bing-ads': { bg: 'rgba(255,170,0,0.15)', color: '#ffaa00' },
};

const platformFilters = ['All', 'Shopify', 'WooCommerce', 'WordPress', 'Webflow', 'Custom'];
const useCaseFilters = ['All', 'Ecommerce', 'Lead Gen', 'SaaS', 'Media'];

export default function Templates() {
  const navigate = useNavigate();
  const { templates } = useStore();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [useCaseFilter, setUseCaseFilter] = useState('All');

  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform =
      platformFilter === 'All' ||
      t.platform.some((p) => p.toLowerCase() === platformFilter.toLowerCase());
    const matchesUseCase =
      useCaseFilter === 'All' ||
      t.useCase.some((u) => u.toLowerCase() === useCaseFilter.toLowerCase().replace(' ', '').replace('leadgen', 'leadgen').replace('Lead Gen', 'leadgen'));
    return matchesSearch && matchesPlatform && matchesUseCase;
  });

  const handleUseTemplate = (templateId: string, templateName: string) => {
    navigate('/wizard', { state: { templateId, templateName } });
  };

  const FilterButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        padding: '0.375rem 0.875rem',
        borderRadius: '6px',
        border: active ? '1px solid #0BBFAA' : '1px solid #1A1E28',
        background: active ? 'rgba(11,191,170,0.15)' : 'transparent',
        color: active ? '#0BBFAA' : '#7A8599',
        fontSize: '0.8125rem',
        cursor: 'pointer',
        fontWeight: active ? 500 : 400,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#E8ECF2', margin: 0, marginBottom: '0.375rem' }}>
          Templates
        </h1>
        <p style={{ color: '#7A8599', fontSize: '0.9rem', margin: 0 }}>
          Pre-built tracking configurations for common platforms and use cases.
        </p>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#7A8599' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            style={{ backgroundColor: '#0D1117', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.5rem 0.875rem 0.5rem 2.375rem', width: '100%', fontSize: '0.875rem', outline: 'none' }}
            onFocus={(e) => (e.target.style.borderColor = '#0BBFAA')}
            onBlur={(e) => (e.target.style.borderColor = '#1A1E28')}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Layers size={14} color="#7A8599" />
          <span style={{ fontSize: '0.8125rem', color: '#7A8599', marginRight: '0.25rem' }}>Platform:</span>
          {platformFilters.map((f) => (
            <FilterButton key={f} label={f} active={platformFilter === f} onClick={() => setPlatformFilter(f)} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Tag size={14} color="#7A8599" />
          <span style={{ fontSize: '0.8125rem', color: '#7A8599', marginRight: '0.25rem' }}>Use Case:</span>
          {useCaseFilters.map((f) => (
            <FilterButton key={f} label={f} active={useCaseFilter === f} onClick={() => setUseCaseFilter(f)} />
          ))}
        </div>
      </div>

      {/* Template count */}
      <p style={{ color: '#7A8599', fontSize: '0.8125rem', marginBottom: '1rem' }}>
        {filtered.length} template{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
        {filtered.map((template) => (
          <div
            key={template.id}
            style={{ backgroundColor: '#0D1117', border: '1px solid #1A1E28', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'border-color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0BBFAA')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1A1E28')}
          >
            <div>
              <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600, color: '#E8ECF2' }}>{template.name}</h3>
              <p style={{ margin: 0, fontSize: '0.8625rem', color: '#7A8599', lineHeight: 1.55 }}>{template.description}</p>
            </div>

            {/* Platform tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {template.platform.map((p) => (
                <span key={p} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, backgroundColor: '#12161E', color: '#7A8599', textTransform: 'capitalize' }}>{p}</span>
              ))}
            </div>

            {/* Channel tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {template.channels.map((c) => {
                const style = channelColors[c] ?? { bg: 'rgba(122,133,153,0.15)', color: '#7A8599' };
                return (
                  <span key={c} style={{ padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 500, backgroundColor: style.bg, color: style.color, textTransform: 'uppercase' }}>{c}</span>
                );
              })}
            </div>

            {/* GTM Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {template.tags.map((tag) => (
                <span key={tag} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', backgroundColor: 'rgba(11,191,170,0.08)', color: '#0BBFAA', border: '1px solid rgba(11,191,170,0.2)' }}>{tag}</span>
              ))}
            </div>

            <button
              onClick={() => handleUseTemplate(template.id, template.name)}
              style={{ background: 'linear-gradient(135deg, #0BBFAA, #099d8b)', color: '#080B12', fontWeight: 600, fontSize: '0.875rem', padding: '0.625rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: 'auto' }}
            >
              Use Template <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
