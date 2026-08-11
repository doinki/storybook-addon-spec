import type { NormalizedSpecAnnotation, SpecAnnotation } from '../types';

export function normalizeAnnotations(annotations: SpecAnnotation[]): NormalizedSpecAnnotation[] {
  return annotations.map((annotation) => ({ ...annotation, id: String(annotation.id) }));
}

export function numberSpecIds(annotations: NormalizedSpecAnnotation[]): Map<string, number> {
  const numbers = new Map<string, number>();
  for (const annotation of annotations) if (!numbers.has(annotation.id)) numbers.set(annotation.id, numbers.size + 1);
  return numbers;
}
