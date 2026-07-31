import type { Meta, StoryObj } from '@storybook/react';
import { Banner } from './Banner';
import { Button } from './Button';

const meta: Meta<typeof Banner> = {
  title: 'Components/Banner',
  component: Banner,
  parameters: {
    docs: {
      description: {
        component:
          'In-flow message. Warning and danger take role="alert" and interrupt the screen reader; info and success take role="status" and wait their turn.',
      },
    },
  },
  args: {
    tone: 'info',
    title: 'Two transactions are waiting on your approval',
    children: 'Payouts over $500 need an owner signature before the club can release them.',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
  },
};
export default meta;
type Story = StoryObj<typeof Banner>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="pm-stack" style={{ maxWidth: '44rem' }}>
      <Banner tone="info" title="Two transactions are waiting on your approval">
        Payouts over $500 need an owner signature before the club can release them.
      </Banner>
      <Banner tone="success" title="Announcement sent to 1,284 players" />
      <Banner tone="warning" title="Room account “Aurora Union” has not synced since 14:20">
        Reconnect the account to keep table results current.
      </Banner>
      <Banner tone="danger" title="Buy-in validation is off for Night Owl Club">
        Turn it back on in Automation, or dummy-bot approvals will keep going through unchecked.
      </Banner>
    </div>
  ),
};

// A message the owner can act on without leaving the page.
export const WithAction: Story = {
  args: {
    tone: 'warning',
    title: 'Room account “Aurora Union” has not synced since 14:20',
    children: 'Reconnect the account to keep table results current.',
    action: <Button size="sm" variant="secondary">Reconnect</Button>,
  },
};

export const Dismissible: Story = {
  args: { onDismiss: () => {} },
};

// Title only — the shape has to hold without a body line.
export const TitleOnly: Story = {
  args: { tone: 'success', title: 'Announcement sent to 1,284 players', children: undefined },
};

// Edge — a long title next to an action must wrap, not squeeze the button out.
export const LongTitleWithAction: Story = {
  args: {
    tone: 'danger',
    title:
      'Transaction #48-2291 was recorded twice: once by the room import at 03:14 and once by a manager at 03:16',
    children: 'Keep the import record and void the manual one, or the club balance stays $1,200 over.',
    action: <Button size="sm" variant="secondary">Review</Button>,
    onDismiss: () => {},
  },
};
