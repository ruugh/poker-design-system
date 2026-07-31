import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu } from './DropdownMenu';
import { Button } from './Button';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    docs: {
      description: {
        component:
          'Actions on a thing — the row overflow, the club switcher. Roving focus, typeahead, Esc and the menu roles come from Radix; the tokens and the one-focal-point rule are ours.',
      },
    },
  },
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
  },
};
export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Playground: Story = {
  render: (args) => (
    <DropdownMenu {...args} trigger={<Button variant="secondary">Actions</Button>}>
      <DropdownMenu.Item onSelect={() => {}}>Approve payout</DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => {}}>Move to another club</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item tone="danger" onSelect={() => {}}>
        Remove player
      </DropdownMenu.Item>
    </DropdownMenu>
  ),
};

export const Grouped: Story = {
  render: () => (
    <DropdownMenu trigger={<Button variant="secondary">Player actions</Button>}>
      <DropdownMenu.Label>Balance</DropdownMenu.Label>
      <DropdownMenu.Item shortcut="⌘A" onSelect={() => {}}>
        Approve payout
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => {}}>Record buy-in</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Label>Segment</DropdownMenu.Label>
      <DropdownMenu.Item onSelect={() => {}}>Tag as loyal</DropdownMenu.Item>
      <DropdownMenu.Item disabled>Tag as pro — needs 30 days of history</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item tone="danger" onSelect={() => {}}>
        Remove player
      </DropdownMenu.Item>
    </DropdownMenu>
  ),
};

// Edge — an item longer than the menu truncates; it never widens the panel without limit.
export const LongItem: Story = {
  render: () => (
    <DropdownMenu trigger={<Button variant="secondary">Room account</Button>}>
      <DropdownMenu.Item onSelect={() => {}}>
        Reconnect “Aurora Union — Night Owl Club (primary room account)”
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => {}}>Sync now</DropdownMenu.Item>
    </DropdownMenu>
  ),
};
