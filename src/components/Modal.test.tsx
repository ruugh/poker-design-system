import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';
import { Button } from './Button';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Approve payout of 5,000 chips?"
        footer={<Button onClick={() => setOpen(false)}>Approve</Button>}
      >
        Paying 5,000 chips to Alex_Brown.
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('is not in the DOM until opened', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens, labels itself by the title, and moves focus inside', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Approve payout of 5,000 chips?');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('closes on Escape', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Focus restoration to the trigger is a Radix guarantee, verified in a real
    // browser — jsdom does not reliably reinstate document.activeElement on unmount.
  });
});
