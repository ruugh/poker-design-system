import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';
import { Button } from './Button';
import { Input } from './Input';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    docs: {
      description: {
        component:
          'Edge sheet for a task that needs room but not a page. Modal is for a decision; Drawer is for work. Header and footer are pinned — only the body scrolls, so the action row never drifts out of reach.',
      },
    },
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['right', 'left'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Drawer>;

function Demo({ side = 'right', size = 'md', long = false }: { side?: 'right' | 'left'; size?: 'sm' | 'md' | 'lg'; long?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Connect club</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Connect club"
        description="The request stays pending until the club owner confirms it."
        side={side}
        size={size}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Send request</Button>
          </>
        }
      >
        <div className="pm-stack" style={{ maxWidth: 'none' }}>
          <Input label="Club ID" hint="Ask the club owner for the 8-digit ID from their room profile." />
          {long
            ? Array.from({ length: 12 }, (_, i) => (
                <Input key={i} label={`Manager email ${i + 1}`} hint="They get access once the club confirms." />
              ))
            : null}
        </div>
      </Drawer>
    </>
  );
}

export const Playground: Story = { render: () => <Demo /> };

export const Sizes: Story = {
  render: () => (
    <div className="pm-row">
      <Demo size="sm" />
      <Demo size="md" />
      <Demo size="lg" />
    </div>
  ),
};

export const FromLeft: Story = { render: () => <Demo side="left" /> };

// Edge — a body longer than the viewport scrolls on its own; the footer stays put.
export const ScrollingBody: Story = { render: () => <Demo long /> };
