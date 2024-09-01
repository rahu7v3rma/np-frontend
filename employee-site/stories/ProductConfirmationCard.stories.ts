import { Meta, StoryObj } from '@storybook/react';

import ProductConfirmationCard from '@/app/[locale]/(navbar)/[campaign_code]/checkout/_components/productConfirmationCard';

const meta: Meta<typeof ProductConfirmationCard> = {
  component: ProductConfirmationCard,
};

export default meta;
type Story = StoryObj<typeof ProductConfirmationCard>;

export const Primary: Story = {
  args: {
    product: {
      quantity: 1,
      image: '/kitchen-icon.svg',
      name: 'Product name',
      description: 'Lorem ipsum dolor sit amet, consectetur',
    },
  },
};
