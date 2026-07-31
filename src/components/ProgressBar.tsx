import type { HTMLAttributes } from 'react';
import './progress-bar.css';

export type ProgressTone = 'brand' | 'success' | 'warning' | 'danger';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** omit for an indeterminate bar — "working", with no claim about how far along */
  value?: number;
  max?: number;
  /** visible label; falls back to aria-label when you need the bar bare */
  label?: string;
  /** print the value next to the label, e.g. "1,284 / 2,000" */
  showValue?: boolean;
  tone?: ProgressTone;
}

const fmt = new Intl.NumberFormat('en-US');

/** Determinate progress when the proportion is known; Spinner when it is not. */
export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  tone = 'brand',
  className,
  ...rest
}: ProgressBarProps) {
  const indeterminate = value === undefined;
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), max);
  const pct = max > 0 ? (clamped / max) * 100 : 0;

  const cls = [
    'pm-progress',
    `pm-progress--${tone}`,
    indeterminate && 'pm-progress--indeterminate',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} {...rest}>
      {label ? (
        <div className="pm-progress__meta">
          <span className="pm-progress__label">{label}</span>
          {showValue && !indeterminate ? (
            <span className="pm-progress__value">
              {fmt.format(clamped)} / {fmt.format(max)}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className="pm-progress__track"
        role="progressbar"
        aria-label={label ? undefined : 'Progress'}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={indeterminate ? undefined : `${fmt.format(clamped)} of ${fmt.format(max)}`}
      >
        <div
          className="pm-progress__fill"
          style={indeterminate ? undefined : { inlineSize: `${pct}%` }}
        />
      </div>
    </div>
  );
}
