# Oval Office Designer

A static 3D editor for approximate Oval Office reconstructions across 22 eras, from Taft's 1909 office through a later-2026 Trump configuration. Each era includes a sourced note describing its approximate time frame and key uncertainties. Colors, architectural positions, and furnishings are estimates; procedural objects are not exact reproductions.

## Run

Use a supported Node.js release (Node 24 is recommended), then:

```sh
npm install
npm run dev
```

`npm test` runs the model tests; `npm run build` creates the static site in `dist/`; `npm run preview` serves the build. Pushes to `master` run tests and deploy `dist/` to GitHub Pages. The build uses relative asset paths; social preview URLs in `index.html` are configured for `https://al3kq.github.io/oval-office-designer/`.

## Design

Select an era or add furniture from the left panel. Select the era title over the scene to expand or collapse its history and sources. Drag objects to move them, select an object to read its story and change its variant and appearance, or edit the room finishes when nothing is selected. Orbit by dragging empty space; use the camera buttons for preset views. Screenshot downloads a PNG; Quality switches between ambient-occlusion rendering and a faster low setting for weaker devices. Delete/Backspace removes a selection, Q/E rotates it, Escape deselects, Ctrl/⌘+Z undoes, Ctrl/⌘+Shift+Z or Ctrl+Y redoes, and Ctrl/⌘+D duplicates.

Designs autosave locally in the browser. Share creates a URL containing the design; JSON export/import provides a portable file. No backend is used. Sharing a URL discloses the design to anyone who receives it.

## Current state

GitHub Pages deployment is configured for `https://al3kq.github.io/oval-office-designer/`; publication is not yet verified. The model suite passes (22 tests) and the production build succeeds; desktop and mobile viewport smoke checks covered the editing interface. All 22 eras have sourced notes, but colors, placements and the later-2026 reconstruction remain approximate. Real mobile devices and Firefox remain untested; previous high-quality performance measurements were limited and device-dependent. Next: verify the deployed site and test on a real phone.
