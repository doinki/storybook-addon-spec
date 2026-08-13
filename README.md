# storybook-addon-spec

A Storybook addon that turns your stories into **annotated screen specs** — numbered badges on the canvas, and a spec table (state rules & interactions) in the addon panel.

Put `data-spec-id` on an element and describe it in `parameters.spec.annotations`: the canvas gets a numbered badge, and the **Spec** panel lists the element's state and interaction rules. Hovering (or keyboard-focusing) a row highlights the element; an `id` that matches nothing on screen is flagged **"missing"**. The overlay watches the whole document, so elements that escape the story container — modals, dropdowns and tooltips via React portals or Vue teleports — are tracked too.

Renderer-agnostic — badges and highlights are plain DOM on an overlay layer and the decorator hands the story through untouched, so React, Vue, Svelte, Angular, Web Components and HTML Storybooks all behave the same. Targets are found with `document.querySelector`, which does not cross a shadow boundary, so `data-spec-id` has to live in the light DOM. **Dark mode** (`.dark` class or `data-theme="dark"`, anywhere in the document) works out of the box.

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

```ts
import type { SpecAnnotation } from 'storybook-addon-spec';
```

## API

`parameters.spec`:

| Key           | Type               | Description                                                                                     |
| ------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `annotations` | `SpecAnnotation[]` | Per-element spec entries                                                                        |
| `enabled`     | `boolean`          | Run the addon for this story — `false` turns off both the badges and the panel (default `true`) |

`SpecAnnotation`:

| Field          | Type               | Description                                                                                    |
| -------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| `id`           | `string \| number` | The target element's `data-spec-id`. Numbers are stringified, so `1` and `'1'` are the same id |
| `label`        | `string`           | Element name (e.g. "Save button")                                                              |
| `state?`       | `string`           | State rule (e.g. "Disabled until required fields are filled")                                  |
| `interaction?` | `string`           | Interaction (e.g. "Click → save, then show a toast")                                           |

Badge numbers follow the order in which unique `id`s first appear. Entries sharing an `id` share one number, and the panel groups their rows together — use that to attach several rules to one element.

`annotations` is an array, so Storybook replaces rather than merges it: a story-level list overrides a meta- or project-level one. Other keys, such as a project-wide `enabled`, still merge through.
