import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    docs: {
      description: {
        component:
          'Determinate progress. Omitting `value` switches it to indeterminate — a travelling segment that never claims a proportion it does not know.',
      },
    },
  },
  args: { label: 'Announcement delivery', value: 1284, max: 2000, showValue: true, tone: 'brand' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['brand', 'success', 'warning', 'danger'] },
  },
  decorators: [(Story) => <div style={{ inlineSize: '24rem' }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="pm-stack">
      <ProgressBar label="Announcement delivery" value={1284} max={2000} showValue tone="brand" />
      <ProgressBar label="Player import" value={2000} max={2000} showValue tone="success" />
      <ProgressBar label="Storage used" value={1700} max={2000} showValue tone="warning" />
      <ProgressBar label="Failed deliveries" value={96} max={2000} showValue tone="danger" />
    </div>
  ),
};

export const Indeterminate: Story = {
  args: { label: 'Syncing room account', value: undefined, showValue: false },
};

// Bare bar — no visible label, so the accessible name falls back to aria-label.
export const Unlabelled: Story = {
  args: { label: undefined, value: 640, max: 2000 },
};

// Edge — the boundaries have to render as flat empty and flat full, not as slivers.
export const Boundaries: Story = {
  render: () => (
    <div className="pm-stack">
      <ProgressBar label="Not started" value={0} max={2000} showValue />
      <ProgressBar label="Complete" value={2000} max={2000} showValue tone="success" />
      <ProgressBar label="Over-reported by the room" value={2400} max={2000} showValue tone="danger" />
    </div>
  ),
};
