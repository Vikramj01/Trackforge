import { XCircle, AlertTriangle, CheckCircle2, ArrowRight, RotateCcw, Download } from 'lucide-react';
import { ScoreIndicator } from './ScoreIndicator';
import { IssueCard } from './IssueCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { ValidatorResults as ValidatorResultsType } from '../../types';

interface ValidatorResultsProps {
  results: ValidatorResultsType;
  onFixAll: () => void;
  onRunAgain: () => void;
}

export function ValidatorResults({ results, onFixAll, onRunAgain }: ValidatorResultsProps) {
  return (
    <div className="space-y-4">
      {/* Score card */}
      <ScoreIndicator score={results.score} />

      {/* Critical issues */}
      {results.criticalIssues.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} color="#EF4444" />
            <p
              className="text-sm font-semibold text-text-primary"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Critical Issues ({results.criticalIssues.length})
            </p>
          </div>
          <div className="space-y-3">
            {results.criticalIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                id={issue.id}
                severity={issue.severity as 'critical'}
                title={issue.title}
                impact={issue.impact}
                cause={issue.cause}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Warnings */}
      {results.warnings.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} color="#F59E0B" />
            <p
              className="text-sm font-semibold text-text-primary"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Warnings ({results.warnings.length})
            </p>
          </div>
          <div className="space-y-3">
            {results.warnings.map((issue) => (
              <IssueCard
                key={issue.id}
                id={issue.id}
                severity={issue.severity as 'warning'}
                title={issue.title}
                impact={issue.impact}
                cause={issue.cause}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Passing */}
      {results.passing.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} color="#10B981" />
            <p
              className="text-sm font-semibold text-text-primary"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Working ({results.passing.length})
            </p>
          </div>
          <div className="space-y-2.5">
            {results.passing.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={14} color="#10B981" className="shrink-0" />
                <span className="text-sm text-text-muted">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CTAs */}
      <div className="pt-1">
        <Button onClick={onFixAll} className="w-full justify-center mb-3">
          Fix All Issues with Atlas
          <ArrowRight size={16} />
        </Button>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onRunAgain}
            className="flex-1 justify-center"
          >
            <RotateCcw size={15} />
            Run Another Test
          </Button>

          {/* Download Report — not yet implemented */}
          <button
            type="button"
            disabled
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all cursor-not-allowed"
            style={{
              background: 'transparent',
              border: '1px solid #1A1E28',
              color: '#7A8599',
              opacity: 0.4,
            }}
            title="Coming soon"
          >
            <Download size={15} />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
