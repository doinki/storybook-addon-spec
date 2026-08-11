import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import type { SpecParameter } from '../types';

const meta: Meta = {
  title: 'Example/Spec',
};

export default meta;
type Story = StoryObj;

export const List: Story = {
  parameters: {
    spec: {
      annotations: [
        {
          id: 'filter-keyword',
          interaction: 'Pressing Enter runs the search',
          label: 'Keyword input',
          state: 'Empty by default',
        },
        {
          id: 'filter-search',
          interaction: 'On click, fetches the list that matches the keyword',
          label: 'Search button',
          state: 'Disabled while the keyword input is empty',
        },
        {
          id: 'sort-order',
          label: 'Sort dropdown',
          state: 'Specified but not on the screen yet — the panel marks it "missing", catching typos and omissions',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', padding: '1.5rem' }}>
      <input data-spec-id="filter-keyword" placeholder="Keyword" />
      <button data-spec-id="filter-search" type="button">
        Search
      </button>
    </div>
  ),
};

export const NoAnnotations: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', padding: '1.5rem' }}>
      <input placeholder="Keyword" />
      <button type="button">Search</button>
    </div>
  ),
};

export const InnerScroll: Story = {
  parameters: {
    spec: {
      annotations: [
        {
          id: 'scroll-item',
          interaction: 'On click, opens the item detail',
          label: 'List item 10',
          state: 'The badge keeps tracking the item while the list scrolls',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => (
    <div style={{ border: '1px solid #ccc', height: '12rem', overflow: 'auto', width: '16rem' }}>
      {Array.from({ length: 20 }, (_, index) => `Item ${index + 1}`).map((label) => (
        <div
          key={label}
          {...(label === 'Item 10' ? { 'data-spec-id': 'scroll-item' } : {})}
          style={{ padding: '0.5rem 1rem' }}
        >
          {label}
        </div>
      ))}
    </div>
  ),
};

export const Animation: Story = {
  parameters: {
    spec: {
      annotations: [
        {
          id: 'animated-action',
          interaction: 'On click, runs the action',
          label: 'Action button',
          state: 'Slides in on mount; the badge realigns when the animation ends',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => <AnimationDemo />,
};

export const Transition: Story = {
  parameters: {
    spec: {
      annotations: [
        {
          id: 'expand-toggle',
          interaction: 'On click, expands or collapses the description',
          label: 'Expand toggle',
        },
        {
          id: 'transition-submit',
          label: 'Submit button',
          state: 'Pushed down while the description expands; the badge realigns when the transition ends',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => <TransitionDemo />,
};

export const LazyImage: Story = {
  parameters: {
    spec: {
      annotations: [
        {
          id: 'lazy-submit',
          label: 'Submit button',
          state: 'Pushed down when the image above finishes loading',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => (
    <div style={{ border: '1px solid #ccc', height: '14rem', overflow: 'auto', width: '20rem' }}>
      <img alt="Random placeholder" src="https://picsum.photos/seed/spec/240/140" style={{ display: 'block' }} />
      <button data-spec-id="lazy-submit" type="button">
        Submit
      </button>
    </div>
  ),
};

function AnimationDemo() {
  const [iteration, setIteration] = React.useState(0);

  return (
    <div style={{ padding: '1.5rem' }}>
      <style>{'@keyframes spec-slide-in { from { margin-left: 8rem; } to { margin-left: 0; } }'}</style>
      <button
        onClick={() => setIteration(iteration + 1)}
        style={{ display: 'block', marginBottom: '1rem' }}
        type="button"
      >
        Replay
      </button>
      <button
        key={iteration}
        data-spec-id="animated-action"
        style={{ animation: 'spec-slide-in 1s ease' }}
        type="button"
      >
        Action
      </button>
    </div>
  );
}

function TransitionDemo() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div style={{ padding: '1.5rem', width: '18rem' }}>
      <button data-spec-id="expand-toggle" onClick={() => setExpanded(!expanded)} type="button">
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      <p style={{ height: expanded ? '5rem' : '1.25rem', overflow: 'hidden', transition: 'height 0.3s ease' }}>
        The description grows to its full height while this box expands, pushing the button below.
      </p>
      <button data-spec-id="transition-submit" type="button">
        Submit
      </button>
    </div>
  );
}
