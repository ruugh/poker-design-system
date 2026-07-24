import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { name: 'pokerrrgirl', size: 'md' },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="pm-row">
      <Avatar name="pokerrrgirl" size="sm" />
      <Avatar name="pokerrrgirl" size="md" />
      <Avatar name="pokerrrgirl" size="lg" />
    </div>
  ),
};

// Initials fallback derives from the handle — one word takes two letters, two words take both.
export const Initials: Story = {
  render: () => (
    <div className="pm-row">
      <Avatar name="Alex Brown" />
      <Avatar name="Yanis Macegora" />
      <Avatar name="deepstack_dan" />
      <Avatar name="kingofchips" />
    </div>
  ),
};
