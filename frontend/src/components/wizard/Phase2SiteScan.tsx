import { useState, useEffect } from 'react';
import { Scan, CheckCircle, ArrowRight, RotateCcw, Eye, ChevronDown, ChevronUp, Edit2, X, MousePointerClick, FileText, Link, Video } from 'lucide-react';
import { useStore } from '../../store';
import type { ScannedElement, ScanResults } from '../../types';

interface Props {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
  website: string;
}

type Priority = 'high' | 'medium' | 'low';

const priorityConfig: Record<Priority, { label: string; color: string; bg: string; dotColor: string }> = {
  high: { label: 'HIGH PRIORITY', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', dotColor: '#ef4444' },
  medium: { label: 'MEDIUM PRIORITY', color: '#eab308', bg: 'rgba(234,179,8,0.08)', dotColor: '#eab308' },
  low: { label: 'LOW PRIORITY', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', dotColor: '#6b7280' },
};

const typeIcon: Record<string, React.ReactNode> = {
  button: <MousePointerClick size={14} color="#0BBFAA" />,
  form: <FileText size={14} color="#818cf8" />,
  link: <Link size={14} color="#fb923c" />,
  video: <Video size={14} color="#f472b6" />,
};

const ScanPhase = ({ url }: { url: string }) => {
  const steps = [
    'Connecting to website...',
    'Detecting platform & tech stack...',
    'Scanning interactive elements...',
    'Analyzing forms...',
    'Detecting existing tracking...',
    'Categorizing elements by priority...',
    'Finalizing results...',
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < steps.length - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), 600);
      return () => clearTimeout(t);
    }
  }, [step, steps.length]);

  return (
    <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(11,191,170,0.1)', border: '2px solid #0BBFAA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', animation: 'pulse 2s ease-in-out infinite' }}>
        <Scan size={36} color="#0BBFAA" />
      </div>
      <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#E8ECF2', margin: 0, marginBottom: '0.5rem' }}>
        Scanning {url}
      </h3>
      <p style={{ color: '#7A8599', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Analysing your site for trackable elements...
      </p>
      <div style={{ maxWidth: '360px', margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: i < step ? '#0BBFAA' : i === step ? '#E8ECF2' : '#7A8599', fontSize: '0.875rem' }}>
            {i < step ? <CheckCircle size={16} color="#0BBFAA" /> : i === step ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #0BBFAA', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', flexShrink: 0 }} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #1A1E28', flexShrink: 0 }} />}
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

interface ElementCardProps {
  element: ScannedElement;
  onToggle: (id: string) => void;
  onEditName: (id: string, name: string) => void;
}

const ElementCard = ({ element, onToggle, onEditName }: ElementCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(element.suggestedEventName);
  const [showPreview, setShowPreview] = useState(false);

  const handleSaveEdit = () => {
    onEditName(element.id, editValue);
    setEditing(false);
  };

  const gtmPreview = JSON.stringify({
    name: `Click - ${element.text}`,
    type: element.type === 'form' ? 'FORM_SUBMISSION' : 'CLICK',
    filter: [{ type: 'MATCHES_CSS_SELECTOR', parameter: [{ key: 'selector', value: element.selector }] }],
  }, null, 2);

  const ga4Preview = JSON.stringify({
    eventName: element.suggestedEventName,
    eventParameters: element.eventParams ?? {},
  }, null, 2);

  return (
    <div style={{ backgroundColor: element.selected ? 'rgba(11,191,170,0.04)' : 'transparent', border: `1px solid ${element.selected ? 'rgba(11,191,170,0.25)' : '#1A1E28'}`, borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem', transition: 'all 0.15s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        <input type="checkbox" checked={element.selected} onChange={() => onToggle(element.id)} style={{ marginTop: '2px', accentColor: '#0BBFAA', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
            {typeIcon[element.type]}
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#E8ECF2' }}>{element.text}</span>
            {element.instances > 1 && (
              <span style={{ fontSize: '0.75rem', color: '#7A8599', backgroundColor: '#12161E', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{element.instances}x</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#7A8599', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span>Type: <span style={{ color: '#E8ECF2' }}>{element.type}</span></span>
            {element.page && <span>Page: <span style={{ color: '#E8ECF2' }}>{element.page}</span></span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#7A8599' }}>Event:</span>
            {editing ? (
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ backgroundColor: '#12161E', border: '1px solid #0BBFAA', borderRadius: '4px', color: '#E8ECF2', padding: '0.25rem 0.5rem', fontSize: '0.8rem', outline: 'none', fontFamily: 'JetBrains Mono, monospace' }} />
                <button onClick={handleSaveEdit} style={{ background: '#0BBFAA', border: 'none', borderRadius: '4px', color: '#080B12', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                <button onClick={() => setEditing(false)} style={{ background: 'none', border: '1px solid #1A1E28', borderRadius: '4px', color: '#7A8599', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}><X size={11} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#0BBFAA', backgroundColor: 'rgba(11,191,170,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{element.suggestedEventName}</code>
                <button onClick={() => { setEditing(true); setEditValue(element.suggestedEventName); }} style={{ background: 'none', border: 'none', color: '#7A8599', cursor: 'pointer', padding: '0.1rem', display: 'flex' }}>
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#7A8599', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {element.selector}
          </div>
          {showPreview && (
            <div style={{ marginTop: '0.875rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#7A8599', fontWeight: 500, marginBottom: '0.375rem' }}>GTM TRIGGER</div>
                <pre style={{ backgroundColor: '#080B12', border: '1px solid #1A1E28', borderRadius: '6px', padding: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#0BBFAA', margin: 0, overflow: 'auto', maxHeight: '150px' }}>{gtmPreview}</pre>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#7A8599', fontWeight: 500, marginBottom: '0.375rem' }}>GA4 EVENT</div>
                <pre style={{ backgroundColor: '#080B12', border: '1px solid #1A1E28', borderRadius: '6px', padding: '0.75rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#818cf8', margin: 0, overflow: 'auto', maxHeight: '150px' }}>{ga4Preview}</pre>
              </div>
            </div>
          )}
          <button onClick={() => setShowPreview(!showPreview)} style={{ background: 'none', border: 'none', color: '#7A8599', cursor: 'pointer', padding: '0.25rem 0', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <Eye size={12} />
            {showPreview ? 'Hide' : 'Preview'} GTM Config
            {showPreview ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Phase2SiteScan({ projectId, onNext, onBack, website }: Props) {
  const { saveScanResults } = useStore();
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanMethod, setScanMethod] = useState<'browser' | 'http' | null>(null);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [elements, setElements] = useState<{ high: ScannedElement[]; medium: ScannedElement[]; low: ScannedElement[] }>({ high: [], medium: [], low: [] });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ high: true, medium: true, low: false });

  const startScan = async () => {
    setScanning(true);
    setScanDone(false);
    setScanError(null);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: website || 'https://example.com' }),
        signal: AbortSignal.timeout(38000),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || json.error || 'Scan failed');
      }
      const scan: ScanResults & { scanMethod?: 'browser' | 'http' } = json.data;
      setScanMethod((scan as any).scanMethod ?? null);
      setResults(scan);
      setElements({
        high: scan.elements.highPriority.map((el) => ({ ...el, selected: true })),
        medium: scan.elements.mediumPriority.map((el) => ({ ...el, selected: false })),
        low: scan.elements.lowPriority.map((el) => ({ ...el, selected: false })),
      });
      setScanDone(true);
    } catch (err: any) {
      const msg = err.name === 'TimeoutError'
        ? 'Scan timed out. The site may be slow or blocking automated access.'
        : err.message || 'Unknown error during scan.';
      setScanError(msg);
    } finally {
      setScanning(false);
    }
  };

  const toggleElement = (id: string) => {
    const update = (els: ScannedElement[]) =>
      els.map((el) => (el.id === id ? { ...el, selected: !el.selected } : el));
    setElements((prev) => ({ high: update(prev.high), medium: update(prev.medium), low: update(prev.low) }));
  };

  const editEventName = (id: string, name: string) => {
    const update = (els: ScannedElement[]) =>
      els.map((el) => (el.id === id ? { ...el, suggestedEventName: name } : el));
    setElements((prev) => ({ high: update(prev.high), medium: update(prev.medium), low: update(prev.low) }));
  };

  const selectAll = () => {
    const selectAllIn = (els: ScannedElement[]) => els.map((el) => ({ ...el, selected: true }));
    setElements((prev) => ({ high: selectAllIn(prev.high), medium: selectAllIn(prev.medium), low: selectAllIn(prev.low) }));
  };

  const deselectAll = () => {
    const deselectAllIn = (els: ScannedElement[]) => els.map((el) => ({ ...el, selected: false }));
    setElements((prev) => ({ high: deselectAllIn(prev.high), medium: deselectAllIn(prev.medium), low: deselectAllIn(prev.low) }));
  };

  const allElements = [...elements.high, ...elements.medium, ...elements.low];
  const selectedCount = allElements.filter((e) => e.selected).length;
  const totalCount = allElements.length;

  const handleContinue = () => {
    if (!results) return;
    const selectedIds = allElements.filter((e) => e.selected).map((e) => e.id);
    const customizations: Record<string, ScannedElement['customizations']> = {};
    allElements.forEach((el) => { customizations[el.id] = el.customizations; });
    saveScanResults(
      projectId,
      { ...results, elements: { highPriority: elements.high, mediumPriority: elements.medium, lowPriority: elements.low }, totalCount, selectedCount },
      selectedIds,
      customizations
    );
    onNext();
  };

  const CategorySection = ({ priority, els }: { priority: Priority; els: ScannedElement[] }) => {
    const cfg = priorityConfig[priority];
    const isExpanded = expanded[priority];
    const selectedInCat = els.filter((e) => e.selected).length;
    return (
      <div style={{ marginBottom: '1rem', border: '1px solid #1A1E28', borderRadius: '8px', overflow: 'hidden' }}>
        <button
          onClick={() => setExpanded((prev) => ({ ...prev, [priority]: !prev[priority] }))}
          style={{ width: '100%', background: cfg.bg, border: 'none', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cfg.dotColor, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: cfg.color, letterSpacing: '0.05em' }}>{cfg.label}</span>
          <span style={{ fontSize: '0.8rem', color: '#7A8599' }}>{selectedInCat} / {els.length} selected</span>
          {isExpanded ? <ChevronUp size={15} color="#7A8599" /> : <ChevronDown size={15} color="#7A8599" />}
        </button>
        {isExpanded && (
          <div style={{ padding: '0.75rem' }}>
            {els.length === 0 ? (
              <p style={{ color: '#7A8599', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0', margin: 0 }}>No elements in this category.</p>
            ) : (
              els.map((el) => (
                <ElementCard key={el.id} element={el} onToggle={toggleElement} onEditName={editEventName} />
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '1.375rem', color: '#E8ECF2', margin: 0, marginBottom: '0.375rem' }}>
          Site Scan
        </h2>
        <p style={{ color: '#7A8599', fontSize: '0.875rem', margin: 0 }}>
          Scan the website to discover all trackable elements.
        </p>
      </div>

      {!scanning && !scanDone && (
        <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          {scanError && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <X size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Scan Failed</div>
                <div style={{ color: '#7A8599', fontSize: '0.8125rem' }}>{scanError}</div>
              </div>
            </div>
          )}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: scanError ? 'rgba(239,68,68,0.08)' : 'rgba(11,191,170,0.08)', border: `1px solid ${scanError ? 'rgba(239,68,68,0.3)' : '#1A1E28'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Scan size={36} color={scanError ? '#ef4444' : '#7A8599'} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#E8ECF2', margin: 0, marginBottom: '0.5rem' }}>
            {scanError ? 'Retry Scan' : 'Ready to Scan'}
          </h3>
          <p style={{ color: '#7A8599', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Target: <span style={{ color: '#0BBFAA', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{website || 'No URL provided'}</span>
          </p>
          <p style={{ color: '#7A8599', fontSize: '0.8125rem', marginBottom: '2rem' }}>
            We will scan your client's website and identify all interactive elements that should be tracked.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
            <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.625rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>Back</button>
            <button onClick={startScan} style={{ background: 'linear-gradient(135deg, #0BBFAA, #099d8b)', color: '#080B12', fontWeight: 600, fontSize: '0.875rem', padding: '0.625rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scan size={15} /> Start Scan
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {[{ label: 'Quick Scan', desc: 'Homepage only, ~15s' }, { label: 'Deep Scan', desc: 'Multiple pages, ~60s' }].map(({ label, desc }) => (
              <div key={label} style={{ padding: '0.625rem 1rem', border: '1px solid #1A1E28', borderRadius: '8px', fontSize: '0.8125rem', color: '#7A8599', textAlign: 'center', minWidth: '120px' }}>
                <div style={{ fontWeight: 500, color: '#E8ECF2', marginBottom: '0.125rem' }}>{label}</div>
                <div>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scanning && <ScanPhase url={website || 'https://example.com'} />}

      {scanDone && results && (
        <div>
          {/* Scan Summary */}
          <div style={{ backgroundColor: '#0D1117', border: '1px solid #1A1E28', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#7A8599', marginBottom: '0.25rem' }}>PLATFORM</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E8ECF2', textTransform: 'capitalize' }}>{results.platform}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#7A8599', marginBottom: '0.25rem' }}>ELEMENTS FOUND</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0BBFAA' }}>{totalCount} trackable elements</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#7A8599', marginBottom: '0.25rem' }}>EXISTING TRACKING</div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {results.existingTracking.map((t) => (
                      <span key={t.type} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(11,191,170,0.1)', color: '#0BBFAA', border: '1px solid rgba(11,191,170,0.2)' }}>
                        <CheckCircle size={11} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                        {t.type}
                      </span>
                    ))}
                  </div>
                </div>
                {scanMethod && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7A8599', marginBottom: '0.25rem' }}>SCAN METHOD</div>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: scanMethod === 'browser' ? 'rgba(129,140,248,0.1)' : 'rgba(251,146,60,0.1)', color: scanMethod === 'browser' ? '#818cf8' : '#fb923c', border: `1px solid ${scanMethod === 'browser' ? 'rgba(129,140,248,0.25)' : 'rgba(251,146,60,0.25)'}` }}>
                      {scanMethod === 'browser' ? 'Browser (Puppeteer)' : 'HTTP (Fallback)'}
                    </span>
                  </div>
                )}
              </div>
              <button onClick={startScan} style={{ background: 'transparent', border: '1px solid #1A1E28', borderRadius: '8px', color: '#7A8599', padding: '0.5rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <RotateCcw size={13} /> Re-scan
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#7A8599', fontSize: '0.8125rem' }}>
              {selectedCount} of {totalCount} selected
            </span>
            <button onClick={selectAll} style={{ background: 'none', border: '1px solid #1A1E28', borderRadius: '6px', color: '#7A8599', padding: '0.25rem 0.625rem', fontSize: '0.75rem', cursor: 'pointer' }}>Select All</button>
            <button onClick={deselectAll} style={{ background: 'none', border: '1px solid #1A1E28', borderRadius: '6px', color: '#7A8599', padding: '0.25rem 0.625rem', fontSize: '0.75rem', cursor: 'pointer' }}>Deselect All</button>
          </div>

          {/* Element Categories */}
          <CategorySection priority="high" els={elements.high} />
          <CategorySection priority="medium" els={elements.medium} />
          <CategorySection priority="low" els={elements.low} />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem' }}>
            <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #1A1E28', borderRadius: '8px', color: '#E8ECF2', padding: '0.625rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>Back</button>
            <button
              onClick={handleContinue}
              disabled={selectedCount === 0}
              style={{ background: selectedCount === 0 ? '#12161E' : 'linear-gradient(135deg, #0BBFAA, #099d8b)', color: selectedCount === 0 ? '#7A8599' : '#080B12', fontWeight: 600, fontSize: '0.875rem', padding: '0.625rem 1.5rem', borderRadius: '8px', border: 'none', cursor: selectedCount === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Continue with {selectedCount} elements <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
