import type { HTMLAttributes, ReactNode } from 'react';
import './badge.css';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'brand' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** show the leading status dot */
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', dot = true, className, children, ...rest }: BadgeProps) {
  const cls = ['pm-badge', `pm-badge--${tone}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {dot && <span className="pm-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
