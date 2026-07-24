import { forwardRef, useEffect, useRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './checkbox.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate = false, disabled, className, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const setRefs = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const cls = ['pm-checkbox', disabled && 'pm-checkbox--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={cls}>
      <input ref={setRefs} type="checkbox" className="pm-checkbox__input" disabled={disabled} {...rest} />
      <span className="pm-checkbox__box" aria-hidden="true" />
      {label && <span>{label}</span>}
    </label>
  );
});
