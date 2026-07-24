import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Completed', tone: 'success', dot: true },
  argTypes: {
    tone: { control: 'select', options: ['success', 'warning', 'danger', 'brand', 'neutral'] },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

// The real transaction/table statuses, each on its audited tone
export const Statuses: Story = {
  render: () => (
    <div className="pm-row">
      <Badge tone="success">Completed</Badge>
      <Badge tone="success">Open</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge tone="neutral">Closed</Badge>
      <Badge tone="brand">Sending</Badge>
    </div>
  ),
};

export const WithoutDot: Story = {
  args: { dot: false, children: 'VIP' },
};
