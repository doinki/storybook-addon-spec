import type { ProjectAnnotations, Renderer } from 'storybook/internal/types';

import { withSpec } from './with-spec';

const preview: ProjectAnnotations<Renderer> = {
  decorators: [withSpec],
};

export default preview;
