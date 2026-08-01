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

// Required is a native attribute; the asterisk only makes it visible.
export const Required: Story = {
  args: { label: 'Club ID', required: true, hint: 'Ask the club owner for the 8-digit ID.' },
};

// Read-only is not disabled: the value keeps full contrast and stays selectable, because
// half the fields in a club profile are mirrored from the room and still need reading.
export const ReadOnlyVsDisabled: Story = {
  render: () => (
    <div className="pm-stack">
      <Input label="Club ID" defaultValue="4821 9930" readOnly hint="Mirrored from the room account — not editable here." />
      <Input label="Club ID" defaultValue="4821 9930" disabled hint="Reconnect the room account to edit this." />
    </div>
  ),
};

// Empty is a state of its own — the placeholder carries a different colour to the value.
export const EmptyAndFilled: Story = {
  render: () => (
    <div className="pm-stack">
      <Input label="Club ID" placeholder="e.g. 4821 9930" hint="Ask the club owner for the 8-digit ID." />
      <Input label="Club ID" defaultValue="4821 9930" hint="Ask the club owner for the 8-digit ID." />
    </div>
  ),
};
