import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Auto-approve buy-ins under 2,000' },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div className="pm-stack">
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Disabled" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
};
