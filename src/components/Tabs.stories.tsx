import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
};
export default meta;
type Story = StoryObj<typeof Tabs>;

// Real settings sub-nav. Arrow keys move between tabs, Home/End jump to ends.
export const SettingsNav: Story = {
  render: () => (
    <Tabs
      aria-label="Settings sections"
      items={[
        { id: 'profile', label: 'Profile', content: 'Owner profile and contact details.' },
        { id: 'security', label: 'Security', content: 'Password, sessions and 2FA.' },
        { id: 'rooms', label: 'Room accounts', content: 'Connected poker rooms and their sync status.' },
        { id: 'team', label: 'Team & roles', content: 'Managers and their access levels.' },
        { id: 'billing', label: 'Billing', content: 'Plan, invoices and payment method.' },
      ]}
    />
  ),
};

export const ConnectedRequests: Story = {
  render: () => (
    <Tabs
      aria-label="Clubs"
      items={[
        { id: 'connected', label: 'Connected', content: '3 clubs connected and syncing.' },
        { id: 'requests', label: 'Requests', content: '1 club awaiting owner confirmation.' },
        { id: 'archived', label: 'Archived', content: 'No archived clubs.', disabled: true },
      ]}
    />
  ),
};
