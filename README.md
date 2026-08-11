# storybook-addon-spec

A Storybook addon that turns your stories into **annotated screen specs** — numbered badges on the canvas, and a spec table (state rules & interactions) in the addon panel.

Screen-spec documents (wireframe annotations, screen definition docs) tend to drift away from the actual implementation because they live in separate tools. This addon keeps the spec **next to the living UI**: planners and designers review the screen and its spec side by side, and developers use the same table as their starting checklist.

- Put `data-spec-id` on story elements and describe them in `parameters.spec.annotations` — **numbered badges** appear on the canvas automatically.
- The **"Spec" panel** shows a per-element table with `State` and `Interaction` columns.
- Hovering (or keyboard-focusing) a table row **highlights** the target element on the canvas.
- Ids that are not present on the screen are marked **"missing"** — typos and omissions surface immediately.
- Several annotations may share one `id` to attach multiple rules to a single element; they share one badge number.

Works with React-renderer Storybooks (e.g. `@storybook/react-vite`). Badges and highlights are drawn with inline styles, so no CSS framework is required. **Dark mode** (`.dark` class or `data-theme="dark"` attribute) is supported out of the box.

## Installation

```sh
pnpm add -D storybook-addon-spec
```

Register it in `.storybook/main.ts`:

```ts
const config: StorybookConfig = {
  addons: ['storybook-addon-spec'],
  // ...
};
```

## Usage

```tsx
export const List: Story = {
  render: () => (
    <div>
      <input data-spec-id="filter-keyword" placeholder="Keyword" />
      <button data-spec-id="filter-search" type="button">
        Search
      </button>
    </div>
  ),
  parameters: {
    spec: {
      annotations: [
        {
          id: 'filter-keyword',
          label: 'Keyword input',
          state: 'Empty by default',
          interaction: 'Pressing Enter runs the search',
        },
        {
          id: 'filter-search',
          label: 'Search button',
          state: 'Disabled while the keyword input is empty',
          interaction: 'On click, fetches the list that matches the keyword',
        },
      ],
    },
  },
};
```

Import the types when you want type-checked annotations:

```ts
import type { SpecAnnotation } from 'storybook-addon-spec';
```

## API

`parameters.spec`:

| Key           | Type               | Description                                                                                                                              |
| ------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `annotations` | `SpecAnnotation[]` | Per-element spec entries. Badge numbers follow the order in which unique `id`s first appear; entries with the same `id` share one number |
| `showBadges`  | `boolean`          | Whether to draw numbered badges on the canvas (default `true`)                                                                           |

`SpecAnnotation`:

| Field          | Type               | Description                                                                                       |
| -------------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| `id`           | `string \| number` | The target element's `data-spec-id` value — entries with the same id are grouped under one number |
| `label`        | `string`           | Element name (e.g. "Save button")                                                                 |
| `state?`       | `string`           | State rule (e.g. "Disabled until required fields are filled")                                     |
| `interaction?` | `string`           | Interaction (e.g. "Click → save, then show a toast")                                              |

Tip: for repeated elements such as table rows, put `data-spec-id` on the first occurrence only — `{...(index === 0 ? { 'data-spec-id': '…' } : {})}`.
