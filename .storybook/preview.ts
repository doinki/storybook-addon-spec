import './preview.css';

import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview, ReactRenderer } from '@storybook/react-vite';

const preview: Preview = {
  decorators: [
    withThemeByClassName<ReactRenderer>({
      defaultTheme: 'light',
      themes: {
        dark: 'dark',
        light: 'light',
      },
    }),
  ],
  initialGlobals: {
    background: { value: 'light' },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
