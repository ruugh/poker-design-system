import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import './input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** helper or error text shown under the field */
  hint?: string;
  error?: boolean;
  /**
   * Marks the field required. Stays a native attribute — this only adds the visible
   * marker, because an asterisk the browser cannot see is not a requirement.
   */
  required?: boolean;
}

export function Input({ label, hint, error = false, required, id, className, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const fieldCls = ['pm-field', error && 'pm-field--error', className].filter(Boolean).join(' ');

  return (
    <div className={fieldCls}>
      {label && (
        <label className="pm-field__label" htmlFor={inputId}>
          {label}
          {required ? (
            <span className="pm-field__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      )}
      <input
        id={inputId}
        className="pm-input"
        required={required}
        aria-invalid={error || undefined}
        aria-describedby={hintId}
        {...rest}
      />
      {hint && (
        <span className="pm-field__help" id={hintId}>
          {hint}
        </span>
      )}
    </div>
  );
}
