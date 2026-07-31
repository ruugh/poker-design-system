import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes the real numbers to assistive tech', () => {
    render(<ProgressBar label="Announcement delivery" value={1284} max={2000} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '1284');
    expect(bar).toHaveAttribute('aria-valuemax', '2000');
    expect(bar).toHaveAttribute('aria-valuetext', '1,284 of 2,000');
  });

  it('claims no proportion when it has none', () => {
    render(<ProgressBar label="Syncing room account" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('clamps a value the caller got wrong instead of overflowing the track', () => {
    const { rerender } = render(<ProgressBar label="Over-reported" value={2400} max={2000} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2000');

    rerender(<ProgressBar label="Negative" value={-40} max={2000} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('falls back to an aria-label when there is no visible label', () => {
    render(<ProgressBar value={640} max={2000} />);
    expect(screen.getByRole('progressbar', { name: 'Progress' })).toBeInTheDocument();
  });

  it('prints the formatted value only when asked and only when determinate', () => {
    const { rerender } = render(<ProgressBar label="Delivery" value={1284} max={2000} showValue />);
    expect(screen.getByText('1,284 / 2,000')).toBeInTheDocument();

    rerender(<ProgressBar label="Delivery" showValue />);
    expect(screen.queryByText(/\//)).not.toBeInTheDocument();
  });
});
