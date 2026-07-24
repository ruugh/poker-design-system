import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Validate buy-ins automatically' },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div className="pm-stack">
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate (some rows selected)" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
  ),
};
