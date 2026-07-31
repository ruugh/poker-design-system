import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from './Popover';

function Harness() {
  return (
    <Popover trigger={<button type="button">Segments</button>}>
      <label>
        <input type="checkbox" /> Sleeping
      </label>
    </Popover>
  );
}

describe('Popover', () => {
  it('stays shut until the trigger is used', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on click and marks the trigger expanded', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Segments' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('holds focusable controls — this is a surface, not a label', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Segments' }));

    const box = screen.getByRole('checkbox');
    await userEvent.click(box);
    expect(box).toBeChecked();
  });

  it('closes on Escape and hands focus back to the trigger', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Segments' });
    await userEvent.click(trigger);

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
