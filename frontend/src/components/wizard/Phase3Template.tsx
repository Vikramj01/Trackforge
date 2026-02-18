import { useState } from 'react';
import { ArrowRight, Check, Search, Tag, Layers } from 'lucide-react';
import { useStore } from '../../store';

interface Props {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
  preselectedTemplateId?: string;
}

const channelColors: Record<string, { bg: string; color: string }> = {
  'google-ads': { bg: 'rgba(66,133,244,0.15)', color: '#4285f4' },
  meta: { bg: 'rgba(24,119,242,0.15)', color: '#1877f2' },
  linkedin: { bg: 'rgba(0,119,181,0.15)', color: '#0077b5' },
  ga4: { bg: 'rgba(11,191,170,0.15)', color: '#0BBFAA' },
  tiktok: { bg: 'rgba(255,0,80,0.15)', color: '#ff0050' },
};

const platformFilters = ['All', 'Shopify', 'WooCommerce', 'WordPress', 'Webflow', 'Custom'];
const useCaseFilters = ['All', 'Ecommerce', 'Lead Gen', 'SaaS'];

export default function Phase3Template({ projectId, onNext, onBack, preselectedTemplateId }: Props) {
  const { templates, updateProject } = useStore();
  const [selected, setSelected] = useState<string | null>(preselectedTemplateId ?? null);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [useCaseFilter, setUseCaseFilter] = useState('All');

  const filtered = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === 'All' || t.platform.some((p) => p.toLowerCase() === platformFilter.toLowerCase());
    const matchUseCase = useCaseFilter === 'All' || t.useCase.some((u) => u.toLowerCase() === useCaseFilter.toLowerCase().replace(' ', ''));
    return matchSearch && matchPlatform && matchUseCase;
  });

  const handleContinue = () => {
    const tpl = templates.find((t) => t.id === selected);
    if (!tpl) return;
    updateProject(projectId, {
      templateSelection: { templateId: tpl.id, templateName: tpl.name },
      currentPhase: 4,
    });
    onNext();
  };

  const FilterBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', border: `1px solid ${active ? '#0BBFAA' : '#1A1E28'}`, background: active ? 'rgba(11,191,170,0.15)' : 'transparent', color: active ? '#0BBFAA' : '#7A8599', fontSize: '0.78rem', cursor: 'pointer', fontWeight: active ? 500 : 400 }}>
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '1.375rem', color: '#E8ECF2', margin: 0, marginBottom: '0.375rem' }}>Select a Template</h2>
        <p style={{ color: '#7A8599', fontSize: '0.875rem', margin: 0 }}>Choose a pre-built tracking configuration that matches your client's needs.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '340px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#7A8599' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." style={{ backgroundColor: '#12161E', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.5rem 0.75rem 0.5rem 2.25rem', width: '100%', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0BBFAA'} onBlur={(e) => e.target.style.borderColor = '#1A1E28'} />
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Layers size={13} color="#7A8599" />
          {platformFilters.map((f) => <FilterBtn key={f} label={f} active={platformFilter === f} onClick={() => setPlatformFilter(f)} />)}
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Tag size={13} color="#7A8599" />
          {useCaseFilters.map((f) => <FilterBtn key={f} label={f} active={useCaseFilter === f} onClick={() => setUseCaseFilter(f)} />)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {filtered.map((tpl) => {
          const isSelected = selected === tpl.id;
          return (
            <div key={tpl.id} onClick={() => setSelected(tpl.id)} style={{ backgroundColor: isSelected ? 'rgba(11,191,170,0.06)' : '#0D1117', border: `1px solid ${isSelected ? '#0BBFAA' : '#1A1E28'}`, borderRadius: '8px', padding: '1rem', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}>
              {isSelected && (
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: '22px', height: '22px', borderRadius: '50%', background: '#0BBFAA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={13} color="#080B12" strokeWidth={3} />
                </div>
              )}
              <h4 style={{ margin: 0, marginBottom: '0.375rem', fontSize: '0.9rem', fontWeight: 600, color: '#E8ECF2', paddingRight: isSelected ? '2rem' : '0' }}>{tpl.name}</h4>
              <p style={{ margin: 0, marginBottom: '0.75rem', fontSize: '0.8rem', color: '#7A8599', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tpl.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                {tpl.platform.map((p) => <span key={p} style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', backgroundColor: '#12161E', color: '#7A8599', textTransform: 'capitalize' }}>{p}</span>)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {tpl.channels.map((c) => {
                  const s = channelColors[c] ?? { bg: 'rgba(122,133,153,0.15)', color: '#7A8599' };
                  return <span key={c} style={{ padding: '0.15rem 0.4rem', borderRadius: '999px', fontSize: '0.68rem', backgroundColor: s.bg, color: s.color, textTransform: 'uppercase' }}>{c}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.625rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>Back</button>
        <button onClick={handleContinue} disabled={!selected} style={{ background: selected ? 'linear-gradient(135deg, #0BBFAA, #099d8b)' : '#12161E', color: selected ? '#080B12' : '#7A8599', fontWeight: 600, fontSize: '0.875rem', padding: '0.625rem 1.5rem', borderRadius: '8px', border: 'none', cursor: selected ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
