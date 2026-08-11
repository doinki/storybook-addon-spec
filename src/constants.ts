export const ADDON_ID = 'storybook-addon-spec';
export const PANEL_ID = `${ADDON_ID}/panel`;

export const PARAM_KEY = 'spec';

export const EVENTS = {
  HIGHLIGHT: `${ADDON_ID}/highlight`,
  REQUEST_STATE: `${ADDON_ID}/request-state`,
  STATE: `${ADDON_ID}/state`,
} as const;
