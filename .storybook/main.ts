import { defineMain } from '@storybook/react-vite/node';

const config = defineMain({
  addons: ['@storybook/addon-themes', import.meta.resolve('./local-preset.ts')],
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
});

export default config;
