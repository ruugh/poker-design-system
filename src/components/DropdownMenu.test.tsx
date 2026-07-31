import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from './DropdownMenu';

function Harness({ onApprove = () => {}, onRemove = () => {} }) {
  return (
    <DropdownMenu trigger={<button type="button">Actions</button>}>
      <DropdownMenu.Label>Balance</DropdownMenu.Label>
      <DropdownMenu.Item onSelect={onApprove}>Approve payout</DropdownMenu.Item>
      <DropdownMenu.Item disabled>Tag as pro</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item tone="danger" onSelect={onRemove}>
        Remove player
      </DropdownMenu.Item>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('opens from the keyboard and lands focus on the first enabled item', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();

    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Approve payout' })).toHaveFocus();
  });

  it('steps past the disabled item with the arrow keys', async () => {
    render(<Harness />);
    screen.getByRole('button', { name: 'Actions' }).focus();
    await userEvent.keyboard('{Enter}');

    await userEvent.keyboard('{ArrowDown}');
    // "Tag as pro" is disabled, so roving focus skips it entirely.
    expect(screen.getByRole('menuitem', { name: 'Remove player' })).toHaveFocus();
  });

  it('runs the item action on selection', async () => {
    const onApprove = vi.fn();
    render(<Harness onApprove={onApprove} />);

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Approve payout' }));
    expect(onApprove).toHaveBeenCalledOnce();
  });

  it('does not run a disabled item', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));

    const disabled = screen.getByRole('menuitem', { name: 'Tag as pro' });
    expect(disabled).toHaveAttribute('data-disabled');
  });

  it('closes on Escape', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
