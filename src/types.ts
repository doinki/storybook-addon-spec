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
  showBadges?: boolean;
}

export interface SpecStatePayload {
  found: string[];
  storyId: string;
}
