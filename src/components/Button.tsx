import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconStart,
  iconEnd,
  className,
  type = 'button',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    'pm-button',
    `pm-button--${variant}`,
    `pm-button--${size}`,
    loading && 'pm-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="pm-button__spinner" aria-hidden="true" />}
      {iconStart && <span className="pm-button__icon" aria-hidden="true">{iconStart}</span>}
      {children}
      {iconEnd && <span className="pm-button__icon" aria-hidden="true">{iconEnd}</span>}
    </button>
  );
}
