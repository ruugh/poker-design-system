import type { HTMLAttributes, CSSProperties } from 'react';
import './skeleton.css';

export type SkeletonVariant = 'text' | 'block' | 'circle';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: SkeletonVariant;
  /** number of stacked lines; only meaningful for variant="text" */
  lines?: number;
  /** any CSS length — the caller knows how wide the real content runs */
  width?: string;
  height?: string;
}

/**
 * Loading placeholder shaped like the content it replaces. Always decorative: mark the
 * region it lives in with aria-busy so the wait is announced once, not per shape.
 */
export function Skeleton({
  variant = 'text',
  lines = 1,
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const cls = ['pm-skeleton', `pm-skeleton--${variant}`, className].filter(Boolean).join(' ');
  const dims: CSSProperties = { ...style };
  if (width) dims.inlineSize = width;
  if (height) dims.blockSize = height;

  if (variant === 'text' && lines > 1) {
    return (
      <span className="pm-skeleton__lines" aria-hidden="true" {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className={cls}
            // The last line runs short, the way a real paragraph does.
            style={i === lines - 1 ? { ...dims, inlineSize: '60%' } : dims}
          />
        ))}
      </span>
    );
  }

  return <span className={cls} style={dims} aria-hidden="true" {...rest} />;
}
