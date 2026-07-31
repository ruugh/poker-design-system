import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Banner } from './Banner';

describe('Banner', () => {
  it('interrupts for problems and waits its turn for confirmations', () => {
    const { rerender } = render(<Banner tone="danger" title="Buy-in validation is off" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Banner tone="warning" title="Room account has not synced" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Banner tone="success" title="Announcement sent" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('names the dismiss control after the message it closes', async () => {
    const onDismiss = vi.fn();
    render(<Banner title="Announcement sent" onDismiss={onDismiss} />);
    // Several banners can be on screen at once — "Dismiss" alone would be ambiguous.
    const close = screen.getByRole('button', { name: 'Dismiss: Announcement sent' });
    await userEvent.click(close);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('has no dismiss control unless a handler is given', () => {
    render(<Banner title="Announcement sent" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the remedy line and the action together', () => {
    render(
      <Banner tone="warning" title="Room account has not synced" action={<button type="button">Reconnect</button>}>
        Reconnect the account to keep table results current.
      </Banner>,
    );
    expect(screen.getByText(/keep table results current/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
  });
});
