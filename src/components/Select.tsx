import { useId } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';
import './select.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: boolean;
  children: ReactNode;
}

export function Select({ label, hint, error = false, id, className, children, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const cls = ['pm-select-field', error && 'pm-select-field--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      {label && (
        <label className="pm-select-field__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className="pm-select">
        <select
          id={selectId}
          className="pm-select__input"
          aria-invalid={error || undefined}
          aria-describedby={hintId}
          {...rest}
        >
          {children}
        </select>
        <svg className="pm-select__chevron" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {hint && (
        <span className="pm-select-field__help" id={hintId}>
          {hint}
        </span>
      )}
    </div>
  );
}
