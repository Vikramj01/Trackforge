import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';

const STEPS = [
  'Loading landing page with ad parameters',
  'Checking pixel installation',
  'Navigating to conversion page',
  'Analyzing conversion events',
  'Validating data quality',
];

// Each step takes 800ms → total ~4 seconds + 500ms pause at 100%
const STEP_MS = 800;

interface ValidatorProgressProps {
  onComplete: () => void;
}

export function ValidatorProgress({ onComplete }: ValidatorProgressProps) {
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setCompletedSteps(count);
      if (count >= STEPS.length) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, STEP_MS);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progress = Math.round((completedSteps / STEPS.length) * 100);

  return (
    <Card>
      <p className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-6">
        Testing Your Tracking...
      </p>

      <div className="space-y-3 mb-8">
        {STEPS.map((step, i) => {
          const done = i < completedSteps;
          const active = i === completedSteps && completedSteps < STEPS.length;
          return (
            <div key={step} className="flex items-center gap-3">
              <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                {done ? (
                  <CheckCircle size={18} color="#0BBFAA" />
                ) : active ? (
                  <Loader2 size={18} color="#0BBFAA" className="animate-spin" />
                ) : (
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ border: '1.5px solid #1A1E28' }}
                  />
                )}
              </span>
              <span
                className="text-sm transition-colors"
                style={{
                  color: done
                    ? '#7A8599'
                    : active
                    ? '#E8ECF2'
                    : 'rgba(122,133,153,0.4)',
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-text-muted mb-3">Estimated time: 45 seconds</p>

      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: '#1A1E28' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #14DFC8, #0BBFAA)',
          }}
        />
      </div>
      <p className="text-xs text-text-muted mt-2">{progress}%</p>
    </Card>
  );
}
