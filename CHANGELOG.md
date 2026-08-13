# storybook-addon-spec

## 0.2.0

### Minor Changes

- cc137ff: Track annotated elements rendered outside the story container, and drop the React dependency from the preview.

  The overlay is now plain DOM appended to `document.body` — a viewport-fixed layer whose targets are looked up across the whole document — so modals, dropdowns and tooltips that escape the story container (via React portals, Vue teleports, and the like) get badges and highlights as well. The decorator only runs a side effect and returns the story untouched, so the addon no longer depends on the renderer: React, Vue, Svelte, Angular, Web Components and HTML Storybooks all work the same way, as long as the annotated elements are in the light DOM (targets are found with `document.querySelector`, which does not cross a shadow boundary).

  Also in this release:

  - `parameters.spec.enabled` turns the whole addon off for a story, canvas and panel alike.
  - A target that is present but has nothing to point at — invisible, zero-sized, or scrolled out of a clipping ancestor — no longer leaves a badge floating in empty space, and still does not count as "missing".
  - Badges appear as soon as the story renders, instead of waiting for Storybook's `completing` phase to let running animations finish.
  - Dark-mode tokens follow a `.dark` / `data-theme="dark"` signal anywhere in the document, not just an ancestor of the layer.

  **Breaking.**

  - `parameters.spec.showBadges` is removed — use `parameters.spec.enabled`, which switches the canvas and the panel together.
  - The wrapper `div` around each story is gone. A story that used it as its positioned ancestor, or as the basis for a percentage width or height, now lays out against whatever encloses the story, and selectors that count DOM depth (`#storybook-root > div > .thing`) are one level shallower.
  - The `data-slot="spec-overlay"` attribute belongs to the new viewport layer now, and has been renamed to `data-slot="spec-layer"` — CSS written against the old name stops matching, rather than suddenly styling a `position: fixed` layer at `z-index: 2147483647`.
  - The layer is a sibling of the story container, so it no longer inherits a theme signal scoped below `<body>` (`withThemeByClassName({ parentSelector: '#storybook-root' })`). The stylesheet matches such a signal anywhere in the document, so dark mode keeps working, but the tokens are set on the layer rather than inherited.

## 0.1.0

### Minor Changes

- cf9dec8: 🚀
