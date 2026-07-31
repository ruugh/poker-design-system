import type { HTMLAttributes } from 'react';
import './spinner.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: SpinnerSize;
  /**
   * Announced while the wait lasts. Pass an empty string when the spinner sits inside
   * an already-labelled control (a loading Button announces itself via aria-busy).
   */
  label?: string;
}

/** Indeterminate wait. When you know the proportion, use ProgressBar instead. */
export function Spinner({ size = 'md', label = 'Loading', className, ...rest }: SpinnerProps) {
  const cls = ['pm-spinner', `pm-spinner--${size}`, className].filter(Boolean).join(' ');
  return (
    <span
      className={cls}
      role={label ? 'status' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <span className="pm-spinner__ring" />
    </span>
  );
}
