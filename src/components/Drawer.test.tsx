import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from './Drawer';

function Harness({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Connect club
      </button>
      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        title="Connect club"
        description="The request stays pending until the club owner confirms it."
        footer={<button type="button">Send request</button>}
      >
        <input aria-label="Club ID" />
      </Drawer>
    </>
  );
}

describe('Drawer', () => {
  it('is a dialog labelled by its title and described by its subtitle', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Connect club' }));

    const dialog = screen.getByRole('dialog', { name: 'Connect club' });
    expect(dialog).toHaveAttribute('aria-describedby');
    const describedBy = dialog.getAttribute('aria-describedby')!;
    expect(document.getElementById(describedBy)).toHaveTextContent(/stays pending/);
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Connect club' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes from the header control', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Connect club' }));

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps the body content and the pinned footer action reachable', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Connect club' }));

    expect(screen.getByLabelText('Club ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send request' })).toBeInTheDocument();
  });

  it('hides the rest of the page from assistive tech while open', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Connect club' });
    await userEvent.click(trigger);
    // Radix marks the siblings aria-hidden, so the trigger is no longer reachable by role.
    expect(screen.queryByRole('button', { name: 'Connect club' })).not.toBeInTheDocument();
  });
});
