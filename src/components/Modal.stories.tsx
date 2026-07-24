import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
};
export default meta;
type Story = StoryObj<typeof Modal>;

// Confirm approving a real payout. Tab is trapped, Esc closes, focus returns to the trigger.
export const ApprovePayout: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="pm-story">
        <Button onClick={() => setOpen(true)}>Approve payout</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Approve payout of 5,000 chips?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Approve payout
              </Button>
            </>
          }
        >
          Paying <strong>5,000 chips</strong> to <strong>Alex_Brown</strong> (#ah57e) from Royal
          Flush Club. This can’t be undone once processed.
        </Modal>
      </div>
    );
  },
};

export const DestructiveConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="pm-story">
        <Button variant="danger" onClick={() => setOpen(true)}>
          Reject transaction
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Reject this transaction?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Keep it
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                Reject transaction
              </Button>
            </>
          }
        >
          Rejecting the <strong>−120 chips</strong> withdraw for <strong>pokerrrwoman</strong> will
          flag it as failed and notify the player.
        </Modal>
      </div>
    );
  },
};
