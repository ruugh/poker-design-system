import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  args: { label: 'Transaction type' },
  decorators: [(Story) => <div className="pm-stack">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof Select>;

const options = (
  <>
    <option>All types</option>
    <option>Deposit</option>
    <option>Payout</option>
    <option>Bonus</option>
    <option>Penalty</option>
    <option>Table result</option>
  </>
);

export const Playground: Story = { render: (args) => <Select {...args}>{options}</Select> };

export const States: Story = {
  render: () => (
    <div className="pm-stack">
      <Select label="Transaction type">{options}</Select>
      <Select label="Club" defaultValue="Royal Flush Club">
        <option>Royal Flush Club</option>
        <option>Ace High Club</option>
      </Select>
      <Select label="Type" error hint="Pick a type to filter by">
        {options}
      </Select>
      <Select label="Club" disabled hint="Locked to your active club">
        <option>Royal Flush Club</option>
      </Select>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <Select label="Club" required hint="Only clubs you own appear here.">
      {options}
    </Select>
  ),
};

// No read-only row: <select> has no readonly attribute and is always :read-only in CSS.
export const EmptyAndChosen: Story = {
  render: () => (
    <div className="pm-stack">
      <Select label="Club" defaultValue="" hint="Only clubs you own appear here.">
        <option value="" disabled>
          Choose a club
        </option>
        {options}
      </Select>
      <Select label="Club" hint="Only clubs you own appear here.">
        {options}
      </Select>
    </div>
  ),
};
