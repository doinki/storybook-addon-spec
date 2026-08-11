import type { AddonTypes } from 'storybook/internal/csf';
import { definePreviewAddon } from 'storybook/internal/csf';

import addonAnnotations from './preview';
import type { SpecParameter } from './types';

export type { SpecAnnotation, SpecParameter } from './types';

export interface SpecTypes extends AddonTypes {
  parameters: { spec?: SpecParameter };
}

export default () => definePreviewAddon<SpecTypes>(addonAnnotations);
