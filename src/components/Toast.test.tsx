import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, ToastProvider } from './Toast';

function Harness({ onUndo }: { onUndo?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider duration={100000}>
      <button type="button" onClick={() => setOpen(true)}>
        Send announcement
      </button>
      <Toast
        open={open}
        onOpenChange={setOpen}
        tone="success"
        title="Announcement sent"
        action={onUndo ? { label: 'Undo', onAction: onUndo } : undefined}
      >
        Delivery finishes in about 2 minutes.
      </Toast>
    </ToastProvider>
  );
}

describe('Toast', () => {
  it('is absent until something happens', () => {
    render(<Harness />);
    expect(screen.queryByText('Announcement sent')).not.toBeInTheDocument();
  });

  it('announces the result of the action that opened it', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Send announcement' }));

    expect(screen.getByText('Announcement sent')).toBeInTheDocument();
    expect(screen.getByText(/about 2 minutes/)).toBeInTheDocument();
  });

  it('runs the recovery action', async () => {
    const onUndo = vi.fn();
    render(<Harness onUndo={onUndo} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send announcement' }));

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledOnce();
  });

  it('can be dismissed by hand before the timer runs out', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Send announcement' }));

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Announcement sent')).not.toBeInTheDocument();
  });
});
