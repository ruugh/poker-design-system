import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';
import { Card } from './Card';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Placeholder in the shape of the content it stands in for. Always decorative — put aria-busy on the region so the wait is announced once, not once per shape.',
      },
    },
  },
  args: { variant: 'text', lines: 1 },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'block', 'circle'] },
  },
  decorators: [(Story) => <div style={{ inlineSize: '24rem' }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="pm-stack">
      <Skeleton variant="text" lines={3} />
      <Skeleton variant="block" />
      <Skeleton variant="circle" />
    </div>
  ),
};

// The point of a skeleton is that the real thing lands in the same place.
export const PlayerCardLoading: Story = {
  render: () => (
    <Card aria-busy="true" aria-label="Loading player">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Skeleton variant="circle" />
        <div style={{ flex: '1 1 auto' }}>
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
    </Card>
  ),
};
