import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';
import { Skeleton } from './Skeleton';

describe('Spinner', () => {
  it('announces the wait by default', () => {
    render(<Spinner label="Loading tables" />);
    expect(screen.getByRole('status', { name: 'Loading tables' })).toBeInTheDocument();
  });

  it('goes silent when the surrounding control already speaks', () => {
    // A loading Button carries aria-busy; a second announcement would be noise.
    const { container } = render(<Spinner label="" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Skeleton', () => {
  it('is decorative — the region it sits in owns the announcement', () => {
    const { container } = render(<Skeleton variant="block" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders one node per text line', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    expect(container.querySelectorAll('.pm-skeleton')).toHaveLength(3);
  });

  it('stays a single node when there is only one line', () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.querySelector('.pm-skeleton__lines')).toBeNull();
    expect(container.querySelectorAll('.pm-skeleton')).toHaveLength(1);
  });
});
