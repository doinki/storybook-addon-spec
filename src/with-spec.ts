// oxlint-disable react-hooks/rules-of-hooks
import type { DecoratorFunction } from 'storybook/internal/types';
import { addons, useEffect } from 'storybook/preview-api';

import { resolveSpecAnnotations } from './annotations';
import { EVENTS, PARAM_KEY } from './constants';
import { createSpecOverlay } from './spec-overlay';
import type { NormalizedSpecAnnotation, SpecHighlightPayload, SpecParameter, SpecStatePayload } from './types';

type SpecStoryContext = Parameters<DecoratorFunction>[1];

interface SpecSession {
  end: () => void;
  ids: string[];
  storyId: string;
}

let currentSession: null | SpecSession = null;

export const withSpec: DecoratorFunction = (StoryFn, context) => {
  const annotations = readAnnotations(context);

  if (!matchesSession(currentSession, context.id, annotations)) {
    currentSession?.end();
    currentSession = annotations ? startSession(context.id, annotations) : null;
  }

  const session = currentSession;

  useEffect(
    () => () => {
      if (currentSession !== session) return;

      session?.end();
      currentSession = null;
    },
    [session],
  );

  return StoryFn();
};

function readAnnotations(context: SpecStoryContext): NormalizedSpecAnnotation[] | null {
  if (context.viewMode !== 'story') return null;

  return resolveSpecAnnotations(context.parameters[PARAM_KEY] as SpecParameter | undefined);
}

function matchesSession(session: null | SpecSession, storyId: string, annotations: NormalizedSpecAnnotation[] | null) {
  if (!session) return annotations == null;
  if (!annotations) return false;

  return (
    session.storyId === storyId &&
    session.ids.length === annotations.length &&
    annotations.every((annotation, index) => annotation.id === session.ids[index])
  );
}

function startSession(storyId: string, annotations: NormalizedSpecAnnotation[]): SpecSession {
  const channel = addons.getChannel();

  let lastFoundIds: string[] = [];

  const sendState = (foundIds: string[]) => {
    lastFoundIds = foundIds;
    channel.emit(EVENTS.STATE, { foundIds, storyId } satisfies SpecStatePayload);
  };

  const overlay = createSpecOverlay({ annotations, onFoundChange: sendState });

  const handleHighlight = ({ specId }: SpecHighlightPayload) => overlay.setActiveId(specId);
  const handleRequestState = () => sendState(lastFoundIds);

  channel.on(EVENTS.HIGHLIGHT, handleHighlight);
  channel.on(EVENTS.REQUEST_STATE, handleRequestState);

  return {
    end() {
      channel.off(EVENTS.HIGHLIGHT, handleHighlight);
      channel.off(EVENTS.REQUEST_STATE, handleRequestState);
      overlay.destroy();
    },
    ids: annotations.map((annotation) => annotation.id),
    storyId,
  };
}
