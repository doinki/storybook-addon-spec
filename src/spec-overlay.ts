import './spec-overlay.css';

import { numberSpecIds } from './annotations';
import type { NormalizedSpecAnnotation } from './types';

const WATCHED_EVENTS = [
  'animationcancel',
  'animationend',
  'error',
  'load',
  'scroll',
  'toggle',
  'transitioncancel',
  'transitionend',
];

const WHOLE_SUBTREE = { attributes: true, characterData: true, childList: true, subtree: true } as const;

const STRICT_VISIBILITY = { contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true } as const;

export interface SpecOverlay {
  destroy: () => void;
  setActiveId: (id: null | string) => void;
}

export interface SpecOverlayOptions {
  annotations: NormalizedSpecAnnotation[];
  onFoundChange?: (foundIds: string[]) => void;
}

interface SpecTarget {
  badge: HTMLElement;
  found: boolean;
  id: string;
  rect: DOMRect | null;
}

export function createSpecOverlay({ annotations, onFoundChange }: SpecOverlayOptions): SpecOverlay {
  const layer = createOverlayElement('div', 'spec-layer');
  const highlight = createOverlayElement('div', 'spec-highlight');
  highlight.hidden = true;

  const targets: SpecTarget[] = [];
  const targetsById = new Map<string, SpecTarget>();
  for (const [id, number] of numberSpecIds(annotations)) {
    const badge = createOverlayElement('span', 'spec-badge');
    badge.hidden = true;
    badge.textContent = String(number);
    layer.append(badge);

    const target: SpecTarget = { badge, found: false, id, rect: null };
    targets.push(target);
    targetsById.set(id, target);
  }

  layer.append(highlight);

  let activeId: null | string = null;
  let pendingFrame = 0;
  let reportedIds: null | string[] = null;

  const scheduleMeasure = () => {
    if (pendingFrame === 0) pendingFrame = requestAnimationFrame(measure);
  };

  const paintHighlight = () => {
    const rect = activeId == null ? null : targetsById.get(activeId)?.rect;
    highlight.hidden = !rect;
    if (!rect) return;

    highlight.style.transform = `translate(${rect.left - 2}px, ${rect.top - 2}px)`;
    highlight.style.width = `${rect.width + 4}px`;
    highlight.style.height = `${rect.height + 4}px`;
  };

  function measure() {
    pendingFrame = 0;
    if (!layer.isConnected) document.body.append(layer);

    for (const target of targets) {
      target.found = false;
      target.rect = null;
    }

    for (const element of document.querySelectorAll<HTMLElement | SVGElement>('[data-spec-id]')) {
      const target = targetsById.get(element.dataset.specId ?? '');
      if (!target || target.found) continue;

      target.found = true;
      target.rect = visibleRect(element);
    }

    for (const { badge, rect } of targets) {
      badge.hidden = rect == null;
      if (rect) badge.style.transform = `translate(${rect.left + rect.width}px, ${rect.top}px) translate(-50%,-50%)`;
    }
    paintHighlight();

    const foundIds = targets.filter((target) => target.found).map((target) => target.id);
    if (reportedIds == null || !sameIds(reportedIds, foundIds)) {
      reportedIds = foundIds;
      onFoundChange?.(foundIds);
    }
  }

  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleMeasure);

  const mutationObserver = new MutationObserver((records) => {
    if (records.every((record) => layer.contains(record.target))) return;
    scheduleMeasure();
  });

  document.body.append(layer);

  resizeObserver?.observe(document.documentElement);
  mutationObserver.observe(document.body, WHOLE_SUBTREE);
  mutationObserver.observe(document.documentElement, { attributeFilter: ['class', 'data-theme', 'style'] });
  mutationObserver.observe(document.head, { childList: true });

  const controller = new AbortController();
  const { signal } = controller;

  const captureOptions = { capture: true, passive: true, signal } as const;
  for (const type of WATCHED_EVENTS) document.addEventListener(type, scheduleMeasure, captureOptions);
  window.addEventListener('resize', scheduleMeasure, { passive: true, signal });
  document.fonts?.addEventListener('loadingdone', scheduleMeasure, { signal });

  measure();

  return {
    destroy() {
      if (pendingFrame !== 0) cancelAnimationFrame(pendingFrame);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      controller.abort();
      layer.remove();
    },
    setActiveId(id) {
      if (activeId === id) return;
      activeId = id;
      paintHighlight();
      scheduleMeasure();
    },
  };
}

function createOverlayElement(tag: string, slot: string) {
  const element = document.createElement(tag);
  element.setAttribute('aria-hidden', 'true');
  element.dataset.slot = slot;
  return element;
}

function visibleRect(element: Element): DOMRect | null {
  if (element.checkVisibility && !element.checkVisibility(STRICT_VISIBILITY)) return null;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 && rect.height <= 0) return null;
  return isClipped(element, rect) ? null : rect;
}

function isClipped(element: Element, rect: DOMRect) {
  if (getComputedStyle(element).position === 'fixed') return false;

  let ancestor = element.parentElement;
  while (ancestor && ancestor !== document.documentElement) {
    const style = getComputedStyle(ancestor);
    const clips = style.overflowX !== 'visible' || style.overflowY !== 'visible';
    if (clips && isOutside(rect, ancestor.getBoundingClientRect())) return true;

    ancestor = ancestor.parentElement;
  }

  return false;
}

function isOutside(rect: DOMRect, clip: DOMRect) {
  return rect.bottom <= clip.top || rect.top >= clip.bottom || rect.right <= clip.left || rect.left >= clip.right;
}

function sameIds(previous: string[], next: string[]) {
  return previous.length === next.length && previous.every((id, index) => id === next[index]);
}
