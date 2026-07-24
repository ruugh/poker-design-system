import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: { label: 'Player', placeholder: 'Search players' },
  decorators: [(Story) => <div className="pm-stack">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div className="pm-stack">
      <Input label="Player" placeholder="Search players" />
      <Input label="Player" defaultValue="pokerrrgirl" hint="Matched 1 of 1,256 players" />
      <Input
        label="Buy-in amount"
        defaultValue="-50"
        error
        hint="Amount can’t be negative for a deposit"
      />
      <Input label="Club" defaultValue="Royal Flush Club" disabled hint="Locked to your active club" />
    </div>
  ),
};

// Edge case: overflow text should truncate inside the field, not push the layout
export const LongValue: Story = {
  args: {
    label: 'Reference',
    defaultValue: 'txn_25698543_royal_flush_club_weekend_freeroll_payout_batch_0042',
  },
};
