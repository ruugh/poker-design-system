import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Add transaction', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="pm-row">
      <Button variant="primary">Add transaction</Button>
      <Button variant="secondary">Export .CSV</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Reject payout</Button>
    </div>
  ),
};

// Hover/focus are live — interact with the buttons. Disabled is shown per variant.
export const States: Story = {
  render: () => (
    <div className="pm-stack">
      <div className="pm-row">
        <Button variant="primary">Default</Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
      </div>
      <div className="pm-row">
        <Button variant="secondary">Default</Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
      </div>
      <div className="pm-row">
        <Button variant="ghost">Default</Button>
        <Button variant="ghost" disabled>
          Disabled
        </Button>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="pm-row">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
    </div>
  ),
};

// Edge case: a long label must not clip or blow out the layout
export const LongLabel: Story = {
  args: { children: 'Approve all pending payouts for Royal Flush Club' },
};
