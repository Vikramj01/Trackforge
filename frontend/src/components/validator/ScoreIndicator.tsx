import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';

interface ScoreIndicatorProps {
  score: number;
}

function getScoreConfig(score: number) {
  if (score <= 40)
    return {
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.2)',
      label: 'Critical',
      loss: '35–45%',
    };
  if (score <= 70)
    return {
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.2)',
      label: 'Needs Work',
      loss: '15–25%',
    };
  if (score <= 85)
    return {
      color: '#10B981',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
      label: 'Good',
      loss: '5–10%',
    };
  return {
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    label: 'Excellent',
    loss: null,
  };
}

export function ScoreIndicator({ score }: ScoreIndicatorProps) {
  const cfg = getScoreConfig(score);

  // Animate count from 0 → score
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 40;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplay(score);
        clearInterval(interval);
      } else {
        setDisplay(Math.round(current));
      }
    }, 800 / steps); // matches ~0.8s duration
    return () => clearInterval(interval);
  }, [score]);

  return (
    <Card>
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-5"
        style={{ color: '#7A8599' }}
      >
        Tracking Health Score
      </p>

      <div className="flex items-end gap-4 mb-4">
        {/* Big number */}
        <div>
          <span
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '56px',
              lineHeight: 1,
              color: cfg.color,
            }}
          >
            {display}
          </span>
          <span className="text-xl font-semibold ml-1" style={{ color: 'rgba(122,133,153,0.6)' }}>
            /100
          </span>
        </div>

        {/* Badge */}
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-md mb-1"
          style={{
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
            letterSpacing: '0.05em',
          }}
        >
          {cfg.label.toUpperCase()}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden mb-3"
        style={{ background: '#1A1E28' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${(display / 100) * 100}%`,
            background: `linear-gradient(90deg, ${cfg.color}cc, ${cfg.color})`,
          }}
        />
      </div>

      {cfg.loss && (
        <p className="text-sm text-text-muted">
          You're losing{' '}
          <span className="font-semibold" style={{ color: cfg.color }}>
            {cfg.loss}
          </span>{' '}
          of conversions to tracking gaps
        </p>
      )}
    </Card>
  );
}
