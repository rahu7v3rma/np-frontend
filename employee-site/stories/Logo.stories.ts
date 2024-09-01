import type { Meta, StoryObj } from '@storybook/react';

import Logo from '../src/shared/Logo';

const meta = {
  title: 'Shared/Logo',
  component: Logo,
  parameters: {},
  tags: [],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
