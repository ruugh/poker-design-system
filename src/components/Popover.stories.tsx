import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from './Popover';
import { Button } from './Button';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          'Anchored surface you interact with. Tooltip is a label you read and cannot focus; Popover takes focus and can hold controls. Reach for a Drawer once the content stops fitting.',
      },
    },
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
};
export default meta;
type Story = StoryObj<typeof Popover>;

const Filters = () => (
  <div className="pm-stack" style={{ maxWidth: 'none' }}>
    <Checkbox label="Loyal" defaultChecked />
    <Checkbox label="Active" defaultChecked />
    <Checkbox label="Sleeping" />
    <Checkbox label="Pros" />
  </div>
);

export const Playground: Story = {
  render: (args) => (
    <Popover {...args} trigger={<Button variant="secondary">Segments</Button>}>
      <Filters />
    </Popover>
  ),
};

export const Sides: Story = {
  render: () => (
    <div className="pm-row" style={{ justifyContent: 'center', padding: '6rem' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side} side={side} align="center" trigger={<Button variant="secondary">{side}</Button>}>
          Opens on the {side}. It flips automatically when the edge runs out.
        </Popover>
      ))}
    </div>
  ),
};

// Edge — long content wraps inside the max width rather than stretching off-screen.
export const LongContent: Story = {
  render: () => (
    <Popover trigger={<Button variant="ghost">Why is this pending?</Button>}>
      A connect request stays pending until the club owner confirms it in their own room
      account. If it has been longer than 24 hours, resend it — the owner may have missed the
      notification.
    </Popover>
  ),
};
