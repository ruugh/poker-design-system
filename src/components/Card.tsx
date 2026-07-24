import type { HTMLAttributes, ReactNode } from 'react';
import './card.css';

export type CardVariant = 'quiet' | 'raised' | 'selected';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  title?: string;
  subtitle?: string;
  /** rendered in the header, opposite the title (e.g. a Badge or menu) */
  action?: ReactNode;
  children?: ReactNode;
}

export function Card({
  variant = 'quiet',
  title,
  subtitle,
  action,
  className,
  children,
  ...rest
}: CardProps) {
  const cls = ['pm-card', `pm-card--${variant}`, className].filter(Boolean).join(' ');
  const hasHeader = title || subtitle || action;
  return (
    <div className={cls} {...rest}>
      {hasHeader && (
        <div className="pm-card__header">
          <div>
            {title && <h3 className="pm-card__title">{title}</h3>}
            {subtitle && <p className="pm-card__subtitle">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
