import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { createPortal } from 'react-dom';

import type { SpecParameter } from '../types';

const canvasStyle: React.CSSProperties = { padding: '1.5rem' };
const canvasRowStyle: React.CSSProperties = { ...canvasStyle, display: 'flex', gap: '0.5rem' };

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
    <div style={canvasRowStyle}>
      <input data-spec-id="filter-keyword" placeholder="Keyword" />
      <button data-spec-id="filter-search" type="button">
        Search
      </button>
    </div>
  ),
};

export const NoAnnotations: Story = {
  render: () => (
    <div style={canvasRowStyle}>
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
          state: 'The badge follows the item as the list scrolls, hiding when clipped — still counted as present',
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
          id: 'lazy-reload',
          interaction: 'On click, downloads a new image',
          label: 'Reload button',
        },
        {
          id: 'lazy-submit',
          label: 'Submit button',
          state: 'Pushed down when the image loads — the badge realigns on the load event alone, with no DOM change',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => <LazyImageDemo />,
};

export const Portal: Story = {
  parameters: {
    spec: {
      annotations: [
        {
          id: 'portal-open',
          interaction: 'On click, opens the dialog',
          label: 'Open button',
        },
        {
          id: 'portal-title',
          label: 'Dialog title',
          state: 'Rendered into document.body through createPortal',
        },
        {
          id: 'portal-confirm',
          interaction: 'On click, closes the dialog',
          label: 'Confirm button',
          state: 'Tracked even though it lives outside the story container',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => <PortalDemo />,
};

export const DuplicateIds: Story = {
  parameters: {
    spec: {
      annotations: [
        {
          id: 'shared-target',
          label: 'Save button',
          state: 'Disabled until the form is valid',
        },
        {
          id: 'shared-target',
          interaction: 'On click, submits the form',
          label: 'Save button',
          state: 'Two annotations on one element — one badge, one number, two rows',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => (
    <div style={canvasStyle}>
      <button data-spec-id="shared-target" type="button">
        Save
      </button>
    </div>
  ),
};

export const NumericIds: Story = {
  parameters: {
    spec: {
      annotations: [
        {
          id: 1,
          label: 'Save button',
          state: 'Numeric id, stringified to "1" so it matches data-spec-id="1"',
        },
        {
          id: 2,
          interaction: 'On click, discards the draft',
          label: 'Cancel button',
        },
        {
          id: 1,
          interaction: 'On click, submits the form',
          label: 'Save button',
          state: 'The same id again — a third row, but it shares badge number 1',
        },
        {
          id: '1',
          label: 'Save button',
          state: 'The string "1" is the same id as the number 1',
        },
        {
          id: '01',
          label: 'Nothing carries this id',
          state: 'Compared as strings, never as numbers — "01" is not "1", so this row is missing',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => (
    <div style={canvasRowStyle}>
      <button data-spec-id="1" type="button">
        Save
      </button>
      <button data-spec-id="2" type="button">
        Cancel
      </button>
    </div>
  ),
};

export const AllMissing: Story = {
  parameters: {
    spec: {
      annotations: [
        { id: 'typo-one', label: 'Nothing matches this id' },
        { id: 'typo-two', label: 'Nor this one' },
      ],
    } satisfies SpecParameter,
  },
  render: () => (
    <div style={canvasStyle}>
      <button type="button">Save</button>
    </div>
  ),
};

export const HiddenTarget: Story = {
  parameters: {
    spec: {
      annotations: [
        {
          id: 'hidden-dialog-title',
          label: 'Dialog title',
          state: 'Mounted with `hidden`, so it is not rendered at all',
        },
        {
          id: 'hidden-invisible',
          label: 'Invisible label',
          state: 'Takes up its space, but `visibility: hidden` paints nothing',
        },
        {
          id: 'hidden-transparent',
          label: 'Transparent label',
          state: 'Laid out and painted, but `opacity: 0` leaves nothing to see',
        },
      ],
    } satisfies SpecParameter,
  },
  render: () => (
    <div style={canvasStyle}>
      <p style={{ margin: 0 }}>Three annotated elements below, none of them visible.</p>
      <strong hidden data-spec-id="hidden-dialog-title">
        Delete item
      </strong>
      <p data-spec-id="hidden-invisible" style={{ visibility: 'hidden' }}>
        Invisible
      </p>
      <p data-spec-id="hidden-transparent" style={{ opacity: 0 }}>
        Transparent
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    spec: {
      annotations: [{ id: 'disabled-target', label: 'Save button' }],
      enabled: false,
    } satisfies SpecParameter,
  },
  render: () => (
    <div style={canvasStyle}>
      <button data-spec-id="disabled-target" type="button">
        Save
      </button>
    </div>
  ),
};

function AnimationDemo() {
  const [iteration, setIteration] = React.useState(0);

  return (
    <div style={canvasStyle}>
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

function LazyImageDemo() {
  const [seed, setSeed] = React.useState(() => Date.now());

  return (
    <div style={canvasStyle}>
      <button
        data-spec-id="lazy-reload"
        onClick={() => setSeed(Date.now())}
        style={{ display: 'block', marginBottom: '1rem' }}
        type="button"
      >
        Reload image
      </button>
      <div style={{ border: '1px solid #ccc', height: '14rem', overflow: 'auto', width: '20rem' }}>
        <img
          key={seed}
          alt="Random placeholder"
          src={`https://picsum.photos/seed/spec-${seed}/240/140`}
          style={{ display: 'block' }}
        />
        <button data-spec-id="lazy-submit" type="button">
          Submit
        </button>
      </div>
    </div>
  );
}

function PortalDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={canvasStyle}>
      <button data-spec-id="portal-open" onClick={() => setOpen(true)} type="button">
        Open dialog
      </button>
      {open &&
        createPortal(
          <div
            style={{
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.4)',
              display: 'flex',
              inset: 0,
              justifyContent: 'center',
              position: 'fixed',
              zIndex: 1000,
            }}
          >
            <div
              role="dialog"
              style={{
                background: '#fff',
                borderRadius: '0.5rem',
                color: '#000',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1.5rem',
                width: '18rem',
              }}
            >
              <strong data-spec-id="portal-title">Delete item</strong>
              <p style={{ margin: 0 }}>This dialog is rendered outside the story container.</p>
              <button data-spec-id="portal-confirm" onClick={() => setOpen(false)} type="button">
                Confirm
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function TransitionDemo() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div style={{ ...canvasStyle, width: '18rem' }}>
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
