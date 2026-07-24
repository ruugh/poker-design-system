import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';
import { Checkbox } from './Checkbox';
import { Switch } from './Switch';

describe('Input', () => {
  it('associates the label with the field', () => {
    render(<Input label="Player" />);
    expect(screen.getByLabelText('Player')).toBeInTheDocument();
  });

  it('marks itself invalid and describes the error in the error state', () => {
    render(<Input label="Buy-in" error hint="Amount can’t be negative" />);
    const field = screen.getByLabelText('Buy-in');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Amount can’t be negative');
  });

  it('does not report invalid in the normal state', () => {
    render(<Input label="Player" hint="Search by nickname" />);
    expect(screen.getByLabelText('Player')).not.toHaveAttribute('aria-invalid');
  });
});

describe('Checkbox', () => {
  it('toggles checked on click', async () => {
    render(<Checkbox label="Loyal" />);
    const box = screen.getByRole('checkbox', { name: 'Loyal' });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(box).toBeChecked();
  });

  it('reflects the indeterminate flag', () => {
    render(<Checkbox label="All" indeterminate />);
    expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(true);
  });
});

describe('Switch', () => {
  it('exposes role=switch and toggles', async () => {
    render(<Switch label="Auto-approve" />);
    const sw = screen.getByRole('switch', { name: 'Auto-approve' });
    expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    expect(sw).toBeChecked();
  });
});
