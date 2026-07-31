import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toast, ToastProvider } from './Toast';
import { Button } from './Button';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    docs: {
      description: {
        component:
          'Transient confirmation, named after the action that caused it — “Publish” the button, “Published” the toast. Anything the owner must act on belongs in a Banner, which stays put.',
      },
    },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'danger'] },
  },
};
export default meta;
type Story = StoryObj<typeof Toast>;

function Demo({
  tone = 'success',
  title = 'Announcement sent',
  body,
  undo,
}: {
  tone?: 'info' | 'success' | 'danger';
  title?: string;
  body?: string;
  undo?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider duration={100000}>
      <Button
        onClick={() => {
          setOpen(false);
          // re-open on the next frame so repeat clicks retrigger the animation
          requestAnimationFrame(() => setOpen(true));
        }}
      >
        Send announcement
      </Button>
      <Toast
        open={open}
        onOpenChange={setOpen}
        tone={tone}
        title={title}
        action={undo ? { label: 'Undo', onAction: () => setOpen(false) } : undefined}
      >
        {body}
      </Toast>
    </ToastProvider>
  );
}

export const Playground: Story = { render: () => <Demo /> };

export const WithBodyAndUndo: Story = {
  render: () => (
    <Demo title="Announcement sent to 1,284 players" body="Delivery finishes in about 2 minutes." undo />
  ),
};

export const Failure: Story = {
  render: () => (
    <Demo
      tone="danger"
      title="96 announcements could not be delivered"
      body="Those players have no linked room account. Open Players to see the list."
    />
  ),
};
