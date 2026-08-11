import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

export default defineConfig(async () => {
  const packageJson = (await import('./package.json', { with: { type: 'json' } })).default;

  const {
    bundler: { managerEntries = [], previewEntries = [] },
  } = packageJson;

  const commonConfig: Options = {
    clean: false,
    external: ['react', 'react-dom', '@storybook/icons'],
    format: ['esm'],
    splitting: true,
    treeshake: true,
  };

  const configs: Options[] = [];

  if (managerEntries.length > 0) {
    configs.push({
      ...commonConfig,
      entry: managerEntries,
      platform: 'browser',
      target: 'esnext',
    });
  }

  if (previewEntries.length > 0) {
    configs.push({
      ...commonConfig,
      dts: true,
      entry: previewEntries,
      injectStyle: true,
      platform: 'browser',
      target: 'esnext',
    });
  }

  return configs;
});
