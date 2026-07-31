import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'Indeterminate wait. When the proportion is known, use ProgressBar — a spinner that runs for a measurable job hides information the user already earned.',
      },
    },
  },
  args: { size: 'md', label: 'Loading' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="pm-row">
      <Spinner size="sm" label="Loading tables" />
      <Spinner size="md" label="Loading tables" />
      <Spinner size="lg" label="Loading tables" />
    </div>
  ),
};

// Inside an already-labelled region: label="" drops the role and hides it from AT,
// so the wait is announced once by the parent instead of twice.
export const Decorative: Story = {
  args: { label: '' },
};
