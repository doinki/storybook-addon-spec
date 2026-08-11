import React from 'react';
import type { DecoratorFunction } from 'storybook/internal/types';
import { addons } from 'storybook/preview-api';

import { SpecOverlay } from './components/spec-overlay';
import { EVENTS, PARAM_KEY } from './constants';
import type { NormalizedSpecAnnotation, SpecParameter } from './types';
import { normalizeAnnotations } from './utils/annotations';

export const withSpec: DecoratorFunction = (Story, context) => {
  const spec = context.parameters[PARAM_KEY] as SpecParameter | undefined;

  if (context.viewMode !== 'story' || !spec?.annotations?.length) return <Story />;

  return (
    <SpecBridge annotations={normalizeAnnotations(spec.annotations)} showBadges={spec.showBadges} storyId={context.id}>
      <Story />
    </SpecBridge>
  );
};

interface SpecBridgeProps {
  annotations: NormalizedSpecAnnotation[];
  children: React.ReactNode;
  showBadges?: boolean;
  storyId: string;
}

function SpecBridge({ annotations, children, showBadges, storyId }: SpecBridgeProps) {
  const channel = addons.getChannel();
  const [activeId, setActiveId] = React.useState<null | string>(null);
  const foundRef = React.useRef<null | string[]>(null);

  const sendState = React.useCallback(
    (found: string[]) => {
      foundRef.current = found;
      channel.emit(EVENTS.STATE, { found, storyId });
    },
    [channel, storyId],
  );

  const handleMeasure = React.useCallback(
    (found: string[]) => {
      const prev = foundRef.current;
      if (prev && prev.length === found.length && prev.every((id, index) => id === found[index])) return;
      sendState(found);
    },
    [sendState],
  );

  React.useEffect(() => {
    const handleHighlight = (payload: { specId: null | string }) => setActiveId(payload.specId);
    const handleRequest = () => sendState(foundRef.current ?? []);

    channel.on(EVENTS.HIGHLIGHT, handleHighlight);
    channel.on(EVENTS.REQUEST_STATE, handleRequest);

    return () => {
      channel.off(EVENTS.HIGHLIGHT, handleHighlight);
      channel.off(EVENTS.REQUEST_STATE, handleRequest);
    };
  }, [channel, sendState]);

  return (
    <SpecOverlay annotations={annotations} showBadges={showBadges} activeId={activeId} onMeasure={handleMeasure}>
      {children}
    </SpecOverlay>
  );
}
