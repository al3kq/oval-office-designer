# Oval Office Designer

A static 3D editor for approximate Oval Office reconstructions across 22 eras, from Taft's 1909 office through the 2025 office (including Obama's 2009–2010 use of the Bush décor). Historical colors, architectural positions, and furnishings are estimates; each era links to its sources. Furniture and textures are procedural, not historical photographs.

## Run

Use a supported Node.js release (Node 24 is recommended), then:

```sh
npm install
npm run dev
```

`npm test` runs the model tests; `npm run build` creates the static site in `dist/`; `npm run preview` serves the build. The build uses relative asset paths for static hosting. Before publishing, replace the relative `og:image` and `twitter:image` values in `index.html` with the final absolute HTTPS URL of `social-preview.png`: social crawlers may not resolve relative image URLs.

## Design

Select an era or add furniture from the left panel. Drag objects to move them, select an object to read its story and change its variant and appearance, or edit the room finishes (walls, trim, floor, drapes, ceiling, chandelier, mantel decor, rug pattern, border, seal and custom ring text) when nothing is selected. Orbit by dragging empty space; use the camera buttons for preset views. "Compare with" shows any era side by side with your design. Screenshot downloads a PNG; Quality switches between ambient-occlusion rendering and a faster low setting for weaker devices. Delete/Backspace removes a selection, Q/E rotates it, Escape deselects, Ctrl/⌘+Z undoes, Ctrl/⌘+Shift+Z or Ctrl+Y redoes, and Ctrl/⌘+D duplicates.

Designs autosave locally in the browser. Share creates a URL containing the design; JSON export/import provides a portable file. No backend is used. Sharing a URL discloses the design to anyone who receives it.

## Current state

Initial implementation on `master`; not deployed or released. The model suite passes (20 tests) and the production build succeeds. Browser checks exercised all 22 era controls and 50 furniture variants (not each visually inspected); import/export, invalid imports, autosave, sharing, history, reset, and wall-art duplication; plus the production site in Chromium and WebKit. The 390px layout, emulated touch drag and orbit, and low/high graphics modes were checked; real mobile devices and Firefox remain untested. On this machine, concurrent headless Chromium measurements were approximately 21 FPS for one high-quality scene and 16 FPS in comparison mode; the measurements are environment-dependent, and mobile performance remains unknown. An extended automated edit sequence timed out, though the page stayed responsive afterward. Historical placements are approximate, not independently reviewed. Next: configure the absolute social-preview URL once the host is known, then test on a real phone before deploying.
