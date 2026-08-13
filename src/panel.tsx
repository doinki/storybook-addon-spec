import React from 'react';
import { useChannel, useParameter, useStorybookState } from 'storybook/manager-api';
import { styled } from 'storybook/theming';

import { numberSpecIds, resolveSpecAnnotations } from './annotations';
import { EVENTS, PARAM_KEY } from './constants';
import type { SpecHighlightPayload, SpecParameter, SpecStatePayload } from './types';

const Wrapper = styled.div({
  height: '100%',
  overflow: 'auto',
  padding: '1rem',
});

const SpecTable = styled.table(({ theme }) => ({
  '& tbody tr': { cursor: 'default' },
  '& tbody tr:focus-visible': { outline: `2px solid ${theme.color.secondary}`, outlineOffset: '-2px' },
  '& tbody tr:hover': { background: theme.background.hoverable },
  '& td': {
    borderBottom: `1px solid ${theme.appBorderColor}`,
    color: theme.color.defaultText,
    lineHeight: 1.55,
    padding: '0.5rem 0.625rem',
    verticalAlign: 'top',
  },
  '& th': {
    borderBottom: `1px solid ${theme.appBorderColor}`,
    color: theme.color.mediumdark,
    fontWeight: 600,
    padding: '0.5rem 0.625rem',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  borderCollapse: 'collapse',
  fontSize: '0.8125rem',
  width: '100%',
}));

const BADGE_BG = 'oklch(55.8% 0.288 302.321)';

const NumberBadge = styled.span({
  alignItems: 'center',
  background: BADGE_BG,
  borderRadius: '50%',
  color: '#fff',
  display: 'inline-flex',
  fontSize: '0.6875rem',
  fontWeight: 600,
  height: '1.25rem',
  justifyContent: 'center',
  width: '1.25rem',
});

const LabelCell = styled.td({ fontWeight: 600, whiteSpace: 'nowrap' });

const LabelContent = styled.div({
  alignItems: 'center',
  display: 'flex',
  gap: '0.5rem',
});

const MutedCell = styled.td({ opacity: 0.8 });

const Missing = styled.span(({ theme }) => ({
  color: theme.color.negative,
  fontSize: '0.6875rem',
  fontWeight: 400,
}));

export function SpecPanel() {
  const { storyId } = useStorybookState();
  const spec = useParameter<SpecParameter | undefined>(PARAM_KEY);
  const annotations = resolveSpecAnnotations(spec);
  const [foundIds, setFoundIds] = React.useState<null | string[]>(null);

  const emit = useChannel(
    {
      [EVENTS.STATE]: (payload: SpecStatePayload) => {
        if (payload.storyId === storyId) setFoundIds(payload.foundIds);
      },
    },
    [storyId],
  );

  const highlight = React.useCallback(
    (specId: null | string) => emit(EVENTS.HIGHLIGHT, { specId } satisfies SpecHighlightPayload),
    [emit],
  );

  React.useEffect(() => {
    setFoundIds(null);
    highlight(null);
    emit(EVENTS.REQUEST_STATE);
  }, [emit, highlight, storyId]);

  React.useEffect(() => () => highlight(null), [highlight]);

  if (annotations == null) return null;

  const badgeNumbers = numberSpecIds(annotations);

  const rows = annotations.toSorted((a, b) => (badgeNumbers.get(a.id) ?? 0) - (badgeNumbers.get(b.id) ?? 0));

  const isMissing = (id: string) => foundIds != null && !foundIds.includes(id);

  return (
    <Wrapper>
      <SpecTable>
        <colgroup>
          <col style={{ width: '2.5rem' }} />
          <col />
          <col style={{ width: '45%' }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Element</th>
            <th scope="col">State</th>
            <th scope="col">Interaction</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((annotation, index) => (
            <tr
              key={`${annotation.id}-${index}`}
              onBlur={() => highlight(null)}
              onFocus={() => highlight(annotation.id)}
              onPointerEnter={() => highlight(annotation.id)}
              onPointerLeave={() => highlight(null)}
              tabIndex={0}
            >
              <td>
                <NumberBadge>{badgeNumbers.get(annotation.id)}</NumberBadge>
              </td>
              <LabelCell>
                <LabelContent>
                  {annotation.label}
                  {isMissing(annotation.id) && <Missing>missing</Missing>}
                </LabelContent>
              </LabelCell>
              <MutedCell>{annotation.state ?? '—'}</MutedCell>
              <MutedCell>{annotation.interaction ?? '—'}</MutedCell>
            </tr>
          ))}
        </tbody>
      </SpecTable>
    </Wrapper>
  );
}
