import React from 'react';
import { AddonPanel } from 'storybook/internal/components';
import { addons, types } from 'storybook/manager-api';

import { SpecPanel } from './components/panel';
import { ADDON_ID, PANEL_ID } from './constants';

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => (
      <AddonPanel active={!!active}>
        <SpecPanel />
      </AddonPanel>
    ),
    title: 'Spec',
    type: types.PANEL,
  });
});
