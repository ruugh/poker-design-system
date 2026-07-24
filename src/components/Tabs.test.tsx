import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

const items = [
  { id: 'connected', label: 'Connected', content: 'Connected clubs' },
  { id: 'requests', label: 'Requests', content: 'Pending requests' },
  { id: 'archived', label: 'Archived', content: 'Archived clubs' },
];

describe('Tabs', () => {
  it('shows the first tab selected and only its panel', () => {
    render(<Tabs items={items} aria-label="Clubs" />);
    expect(screen.getByRole('tab', { name: 'Connected' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Connected clubs')).toBeVisible();
    expect(screen.queryByText('Pending requests')).not.toBeInTheDocument();
  });

  it('moves selection with the arrow keys and swaps the panel', async () => {
    render(<Tabs items={items} aria-label="Clubs" />);
    await userEvent.tab(); // focus the active tab
    expect(screen.getByRole('tab', { name: 'Connected' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Requests' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Pending requests')).toBeVisible();
  });

  it('wires each tab to its panel via aria-controls', () => {
    render(<Tabs items={items} aria-label="Clubs" />);
    const tab = screen.getByRole('tab', { name: 'Connected' });
    const panel = screen.getByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
  });
});
