import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../dist/tokens.css';
import './preview.css';

// White-label brand axis, independent of light/dark. Sets data-brand on <html>.
const withBrand = (Story, context) => {
  const brand = context.globals.brand ?? 'teal';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-brand', brand);
  }
  return Story();
};

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true },
    a11y: { test: 'error' },
  },
  globalTypes: {
    brand: {
      description: 'White-label brand',
      defaultValue: 'teal',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: [
          { value: 'teal', title: 'Royal Flush (teal)' },
          { value: 'plum', title: 'Ace High (plum)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    withBrand,
    withThemeByDataAttribute({
      themes: { Light: 'light', Dark: 'dark' },
      defaultTheme: 'Light',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
