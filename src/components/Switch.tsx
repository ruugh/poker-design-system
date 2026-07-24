import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './switch.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, disabled, className, ...rest },
  ref,
) {
  const cls = ['pm-switch', disabled && 'pm-switch--disabled', className].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <input ref={ref} type="checkbox" role="switch" className="pm-switch__input" disabled={disabled} {...rest} />
      <span className="pm-switch__track" aria-hidden="true">
        <span className="pm-switch__thumb" />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
});
