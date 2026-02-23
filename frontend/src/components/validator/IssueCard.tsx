interface IssueCardProps {
  severity: 'critical' | 'warning';
  title: string;
  impact: string;
  cause?: string;
}

const SEVERITY_CONFIG = {
  critical: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.15)',
    dot: '#EF4444',
  },
  warning: {
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.15)',
    dot: '#F59E0B',
  },
};

export function IssueCard({ severity, title, impact, cause }: IssueCardProps) {
  const cfg = SEVERITY_CONFIG[severity];

  return (
    <div
      className="p-4 rounded-lg"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
          style={{ background: cfg.dot }}
        />
        <div>
          <p className="text-sm font-semibold text-text-primary mb-1.5">{title}</p>
          <p className="text-xs text-text-muted mb-1">
            <span className="font-medium" style={{ color: '#7A8599' }}>Impact: </span>
            {impact}
          </p>
          {cause && (
            <p className="text-xs text-text-muted">
              <span className="font-medium" style={{ color: '#7A8599' }}>Cause: </span>
              {cause}
            </p>
          )}
          {/* Placeholder — "Show Fix Guide" modal comes in a later session */}
          <button
            type="button"
            disabled
            className="text-xs mt-2.5 font-medium opacity-40 cursor-not-allowed"
            style={{ color: '#0BBFAA' }}
          >
            Show Fix Guide →
          </button>
        </div>
      </div>
    </div>
  );
}
