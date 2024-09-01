import React from "react";
import type { Preview } from '@storybook/react';
import '../src/app/[locale]/globals.css';

import { I18nProviderClient } from '../src/locales/client';

const preview: Preview = {
  decorators: [
    (Story) => (
      <I18nProviderClient locale="en">
        <Story />
      </I18nProviderClient>
    )
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
