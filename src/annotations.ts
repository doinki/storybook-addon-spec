import type { NormalizedSpecAnnotation, SpecParameter } from './types';

export function numberSpecIds(annotations: NormalizedSpecAnnotation[]): Map<string, number> {
  const numbers = new Map<string, number>();
  for (const annotation of annotations) if (!numbers.has(annotation.id)) numbers.set(annotation.id, numbers.size + 1);
  return numbers;
}

export function resolveSpecAnnotations(spec: SpecParameter | undefined): NormalizedSpecAnnotation[] | null {
  if (spec?.enabled === false || !spec?.annotations?.length) return null;

  return spec.annotations.map((annotation) => ({ ...annotation, id: String(annotation.id) }));
}
