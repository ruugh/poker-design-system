import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  decorators: [(Story) => <div className="pm-stack">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Quiet: Story = {
  render: () => (
    <Card title="Royal Flush Club" subtitle="1,256 players · 24 tables">
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        Peer cards default to the quiet surface: a hairline border, no shadow. Nothing here is
        asking for attention.
      </p>
    </Card>
  ),
};

export const Raised: Story = {
  render: () => (
    <Card variant="raised" title="Weekend Freeroll" subtitle="Active campaign"
      action={<Badge tone="brand">Sending</Badge>}>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        Raised earns a shadow — it means “look here”. Reserved for the active or hero card.
      </p>
      <Button size="sm" variant="secondary">View campaign</Button>
    </Card>
  ),
};

export const Selected: Story = {
  render: () => (
    <Card variant="selected" title="Silver plan" subtitle="Current subscription"
      action={<Badge tone="success" dot={false}>Active</Badge>}>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        Selected state: brand-tinted surface and border, one step up from its peers.
      </p>
    </Card>
  ),
};
