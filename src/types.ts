export interface SpecAnnotation {
  id: number | string;
  interaction?: string;
  label: string;
  state?: string;
}

export interface NormalizedSpecAnnotation extends Omit<SpecAnnotation, 'id'> {
  id: string;
}

export interface SpecParameter {
  annotations?: SpecAnnotation[];
  enabled?: boolean;
}

export interface SpecHighlightPayload {
  specId: null | string;
}

export interface SpecStatePayload {
  foundIds: string[];
  storyId: string;
}
