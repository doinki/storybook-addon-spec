import './spec-overlay.css';

import React from 'react';

import type { NormalizedSpecAnnotation } from '../types';
import { numberSpecIds } from '../utils/annotations';

const badgeStyle: React.CSSProperties = {
  alignItems: 'center',
  background: 'var(--spec-badge-bg, oklch(55.8% 0.288 302.321))',
  borderRadius: '50%',
  boxShadow: '0 0 0 2px var(--spec-badge-ring, #fff), 0 1px 2px var(--spec-badge-shadow, rgba(0, 0, 0, 0.15))',
  color: 'var(--spec-badge-fg, #fff)',
  display: 'inline-flex',
  fontSize: '0.6875rem',
  fontWeight: 600,
  height: '1.25rem',
  justifyContent: 'center',
  pointerEvents: 'none',
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  width: '1.25rem',
  zIndex: 50,
};

const highlightStyle: React.CSSProperties = {
  background: 'var(--spec-highlight-bg, oklch(62.7% 0.265 303.9 / 0.1))',
  borderRadius: '0.375rem',
  boxShadow: '0 0 0 2px var(--spec-highlight-ring, oklch(55.8% 0.288 302.321 / 0.8))',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 40,
};

interface SpecOverlayProps extends Omit<React.ComponentProps<'div'>, 'ref'> {
  activeId?: null | string;
  annotations: NormalizedSpecAnnotation[];
  onMeasure?: (foundIds: string[]) => void;
  showBadges?: boolean;
}

export function SpecOverlay({
  activeId,
  annotations,
  children,
  onMeasure,
  showBadges = true,
  style,
  ...props
}: SpecOverlayProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const rects = useSpecRects(containerRef, annotations, onMeasure);
  const activeRect = activeId == null ? null : rects[activeId];
  const numbers = numberSpecIds(annotations);

  return (
    <div
      ref={containerRef}
      data-slot="spec-overlay"
      style={{ position: 'relative', width: '100%', ...style }}
      {...props}
    >
      {children}
      {showBadges &&
        [...numbers].map(([id, number]) => {
          const rect = rects[id];
          if (!rect) return null;

          return (
            <span
              key={id}
              aria-hidden="true"
              data-slot="spec-badge"
              style={{ ...badgeStyle, left: rect.left + rect.width, top: rect.top }}
            >
              {number}
            </span>
          );
        })}
      {activeRect && (
        <div
          aria-hidden="true"
          data-slot="spec-highlight"
          style={{
            ...highlightStyle,
            height: activeRect.height + 4,
            left: activeRect.left - 2,
            top: activeRect.top - 2,
            width: activeRect.width + 4,
          }}
        />
      )}
    </div>
  );
}

interface TargetRect {
  height: number;
  left: number;
  top: number;
  width: number;
}

function rectsEqual(a: Record<string, TargetRect>, b: Record<string, TargetRect>) {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;

  return keys.every((key) => {
    const prev = a[key];
    const next = b[key];
    return (
      !!prev &&
      !!next &&
      prev.height === next.height &&
      prev.left === next.left &&
      prev.top === next.top &&
      prev.width === next.width
    );
  });
}

function useSpecRects(
  containerRef: React.RefObject<HTMLDivElement | null>,
  annotations: NormalizedSpecAnnotation[],
  onMeasure?: (foundIds: string[]) => void,
) {
  const [rects, setRects] = React.useState<Record<string, TargetRect>>({});
  const annotationsRef = React.useRef(annotations);
  annotationsRef.current = annotations;
  const onMeasureRef = React.useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  const measure = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    const next: Record<string, TargetRect> = {};
    for (const id of new Set(annotationsRef.current.map((annotation) => annotation.id))) {
      const target = container.querySelector(`[data-spec-id="${CSS.escape(id)}"]`);
      if (!target) continue;
      const rect = target.getBoundingClientRect();
      next[id] = {
        height: rect.height,
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        width: rect.width,
      };
    }

    setRects((prev) => (rectsEqual(prev, next) ? prev : next));
    onMeasureRef.current?.(Object.keys(next));
  }, [containerRef]);

  React.useLayoutEffect(() => {
    measure();

    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(container);

    const isOverlay = (node: Node) => {
      const element = node instanceof Element ? node : node.parentElement;
      return element?.closest('[data-slot="spec-badge"], [data-slot="spec-highlight"]') != null;
    };

    const mutationObserver = new MutationObserver((records) => {
      const relevant = records.some((record) => {
        if (record.type === 'childList')
          return [...record.addedNodes, ...record.removedNodes].some((node) => !isOverlay(node));

        return !isOverlay(record.target);
      });
      if (relevant) scheduleMeasure();
    });
    mutationObserver.observe(container, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    container.addEventListener('animationend', scheduleMeasure, true);
    container.addEventListener('transitionend', scheduleMeasure, true);
    container.addEventListener('scroll', scheduleMeasure, true);
    container.addEventListener('load', scheduleMeasure, true);

    document.fonts?.ready.then(scheduleMeasure).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      container.removeEventListener('animationend', scheduleMeasure, true);
      container.removeEventListener('transitionend', scheduleMeasure, true);
      container.removeEventListener('scroll', scheduleMeasure, true);
      container.removeEventListener('load', scheduleMeasure, true);
    };
  }, [containerRef, measure]);

  return rects;
}
