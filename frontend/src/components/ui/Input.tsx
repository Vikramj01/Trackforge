import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-widest text-text-primary mb-2"
        >
          {label}
          {props.required && <span className="text-atlas-teal ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-input-bg border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-atlas-teal focus:ring-2 focus:ring-atlas-teal/10 ${
          error ? 'border-red-500' : 'border-border'
        } ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-text-muted mt-1.5">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  );
}
