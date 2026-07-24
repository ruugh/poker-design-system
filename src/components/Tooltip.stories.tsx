import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from './Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  decorators: [(Story) => <div style={{ padding: '3rem' }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

// Hover or focus the trigger. Bubble is aria-describedby-linked.
export const OnButton: Story = {
  render: () => (
    <Tooltip label="Exports the current filter as a .CSV file">
      <Button variant="secondary">Export .CSV</Button>
    </Tooltip>
  ),
};

export const OnText: Story = {
  render: () => (
    <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)' }}>
      Status:{' '}
      <Tooltip label="The club owner hasn’t confirmed this connection yet">
        <span style={{ textDecoration: 'underline dotted', cursor: 'help' }}>Pending</span>
      </Tooltip>
    </span>
  ),
};
