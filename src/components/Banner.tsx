import type { HTMLAttributes, ReactNode } from 'react';
import './banner.css';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

export interface BannerProps extends HTMLAttributes<HTMLElement> {
  tone?: BannerTone;
  /** what happened, in the owner's words */
  title: string;
  /** how to fix it — an error without a next step is just noise */
  children?: ReactNode;
  /** trailing action, usually a ghost Button */
  action?: ReactNode;
  onDismiss?: () => void;
}

/** Page- or section-level message. Sits in the flow; use Toast for transient confirmations. */
export function Banner({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  className,
  ...rest
}: BannerProps) {
  const cls = ['pm-banner', `pm-banner--${tone}`, className].filter(Boolean).join(' ');
  // Problems interrupt the screen reader; confirmations wait their turn.
  const role = tone === 'danger' || tone === 'warning' ? 'alert' : 'status';

  return (
    <section className={cls} role={role} {...rest}>
      <span className="pm-banner__dot" aria-hidden="true" />
      <div className="pm-banner__text">
        <p className="pm-banner__title">{title}</p>
        {children ? <p className="pm-banner__body">{children}</p> : null}
      </div>
      {action ? <div className="pm-banner__action">{action}</div> : null}
      {onDismiss ? (
        <button
          type="button"
          className="pm-banner__dismiss"
          onClick={onDismiss}
          aria-label={`Dismiss: ${title}`}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M18 6 6 18M6 6l12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </section>
  );
}
