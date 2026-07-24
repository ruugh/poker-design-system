import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Triggers an action; the label names the result, not a generic verb. Four ' +
          'variants (primary/secondary/ghost/danger) × two sizes, with loading and icon ' +
          'slots. See the Guidelines page for variant choice and do/don’t.',
      },
    },
  },
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

const PlusIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

export const WithIcons: Story = {
  render: () => (
    <div className="pm-row">
      <Button iconStart={PlusIcon}>Add transaction</Button>
      <Button variant="secondary" iconStart={PlusIcon}>New club</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="pm-row">
      <Button loading>Approve payout</Button>
      <Button variant="secondary" loading>Export .CSV</Button>
      <Button variant="danger" loading>Reject</Button>
    </div>
  ),
};
