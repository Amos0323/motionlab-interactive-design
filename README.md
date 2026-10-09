# MOTIONLAB

**Ideas in motion.** A creative-development portfolio demonstrating accessible interaction design, React animation engineering and procedural 3D product presentation.

Five working studios turn visual ideas into inspectable code: editable typography, SVG geometry, interface feedback, scroll storytelling and AURA headphones. Each pairs a live experiment with controls and an explanation of its design and engineering. Everything is local: no accounts, backend, API keys, paid assets or remote model downloads.

**Source:** [MOTIONLAB on GitHub](https://github.com/Amos0323/motionlab-interactive-design). No Vercel deployment has been performed. See [local QA evidence and remaining acceptance work](docs/QA_REPORT.md) and [hosted CI runs](https://github.com/Amos0323/motionlab-interactive-design/actions). Automated checks are evidence, not WCAG certification, designer sign-off or physical-device verification.

**Latest local results:** 39 unit tests and 33 Chromium browser tests pass. Firefox/WebKit install successfully but this host blocks their launch (`spawn EPERM`); both remain enabled in CI. See the QA report for exact commands and limitations.

## Explore

| Studio                     | Route                             | What to try                                                                                                                   |
| -------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Kinetic Typography         | `/?experiment=kinetic-type`       | Edit text; compare staggered characters, words, split entrances and emphasis; change speed; pause and replay                  |
| SVG Morphing               | `/?experiment=svg-morphing`       | Interpolate four original compatible silhouettes; change duration; pause, replay and reset                                    |
| UI Micro-interactions      | `/?experiment=micro-interactions` | Select a direction, toggle a preference, confirm in a modal, and explore simulated success/error feedback                     |
| Scroll Storytelling        | `/?experiment=scroll-story`       | Follow four chapters with native scrolling, restrained layered movement and a reading-progress indicator                      |
| AURA 3D Product Experience | `/?experiment=third-dimension`    | Orbit procedural headphones; change four colourways, finish and lighting; separate the construction; use a static alternative |

The landing page preserves the same near-black, violet and electric-blue visual language. Illustrations are editable SVG/CSS or real WebGL geometry; no screenshot or video substitutes for a working interaction.

## Run locally

Use **Node.js 24** and npm. The lockfile records exact dependencies; no `.env` file is needed.

```sh
npm ci
npm run dev -- --port 5190 --strictPort
```

Open [MOTIONLAB locally](http://127.0.0.1:5190/), or [the AURA studio](http://127.0.0.1:5190/?experiment=third-dimension).

```sh
npm run build
npm run preview -- --port 5191 --strictPort
```

The production preview is at [localhost:5191](http://127.0.0.1:5191/).

## Stack and commands

React 19, strict TypeScript 6, Vite 8, Motion for React 14, CSS and SVG. AURA adds Three.js 0.186, React Three Fiber 9 and Drei 10. Vitest, React Testing Library, Playwright and axe-core test the implementation; ESLint and Prettier enforce source quality. Exact versions live in `package-lock.json`.

| Command                | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Local Vite server                                      |
| `npm run build`        | TypeScript validation and production output in `dist/` |
| `npm run preview`      | Serve a production build                               |
| `npm run lint`         | ESLint, zero warnings allowed                          |
| `npm run typecheck`    | App, test and tooling type checks                      |
| `npm test`             | Component, interaction and utility tests               |
| `npm run test:watch`   | Interactive Vitest mode                                |
| `npm run test:browser` | All Chromium, Firefox and WebKit projects              |
| `npm run format`       | Write formatted source                                 |
| `npm run format:check` | Read-only formatting validation                        |

Install browser engines once:

```sh
npx playwright install chromium firefox webkit
npm run test:browser
```

Linux CI uses `npx playwright install --with-deps chromium firefox webkit`. To select one engine, run `npm run test:browser -- --project=firefox` (or `chromium` / `webkit`). The suite normally starts/reuses the development server on port 5190. To test production on port 5192 in PowerShell:

```powershell
npm run build
$env:PLAYWRIGHT_TEST_BUILD = '1'
npm run test:browser
```

CI selects production automatically and never reuses another server. An optional `PLAYWRIGHT_CHANNEL=msedge` override applies only to the Chromium project. Browser emulation is not a substitute for physical iOS/Android testing.

## Architecture

```text
src/
  App.tsx                  Landing page and query-route selection
  components/              Shared studio layout, motion toggle, modal and controls
  data/experiments.ts       Typed gallery metadata
  experiments/             Five lazy studio pages and interaction tests
  motion/                  Shared preferences, finite playback and reveal primitives
  three/                   Procedural model, renderer, fallback, settings and lifecycle
  styles/                  Visual tokens, landing, studio and product CSS
  utils/svgShapes.ts       Compatible original Bézier path generation
  test/                    DOM fixtures and browser API adapters

e2e/                       Browser behavior, axe, responsiveness and WebGL checks
.github/workflows/ci.yml    Node 24 production-build quality gate
docs/                      Engineering case study and QA evidence
```

Native query links provide direct routes and browser history without a router dependency or special server rewrites. Navigation creates a new page; demo state and manual pause reset. Device reduced-motion preferences remain authoritative. Unknown routes offer an accessible return to the gallery.

## Animation and interaction engineering

Typography and SVG morphing use a normalized Motion value, with derived transforms rather than React state updates every frame. Pause stops the active animation at its current value; resume uses the remaining duration. SVG silhouettes share winding, commands and 50 numeric coordinates, allowing interpolation without an additional morphing library.

The micro-interaction studio is an explicit `idle → loading → success/error` flow. Its short task is simulated and in memory: no information is saved externally and no email is sent. Errors preserve the visitor's choices. Native `dialog` supplies modal semantics and inert background behavior, supplemented by keyboard boundaries and focus restoration.

Scroll storytelling keeps native wheel/touch navigation. Motion is restrained, reading order remains semantic, and progress only updates React when its rounded value changes. Content is readable with motion disabled.

## AURA: original procedural 3D

AURA is a visual headphone concept, not a manufactured product or claim about audio performance. Partial toruses form the headband and inner padding; elliptical cylinders form the shells; toroidal pads, inner discs, arms and metallic details complete the model. Seven independent groups form the exploded assembly. Everything is authored in React/Three.js code, without Blender, Cinema 4D, downloaded models or HDR assets.

`ProductStudio` owns accessible HTML settings. A separate lazy `ProductScene` contains R3F Canvas, lights, Drei OrbitControls, camera behavior and renderer lifecycle. `Headphones` separates editable model geometry from UI concerns. Four colourways update the material surfaces immediately; roughness changes the shell finish independently of soft cushions and metallic accents. Hemisphere fill, directional key and violet rim lighting provide shape and depth. One 1024px shadow map grounds the product.

Assembly and camera transitions update Three.js objects directly with delta-time exponential interpolation, then snap to exact destinations. Automatic rotation is opt-in. Keyboard camera controls provide bounded zoom and a reset alternative to dragging. Wheel zoom is intentionally disabled; vertical swipes and the mouse wheel scroll the page while horizontal touch drags orbit.

## Accessibility decisions

- Semantic landmarks, one H1 per page, skip links, native controls, explicit labels, selected states and visible focus.
- An unsplit text alternative preserves the reading order of animated typography.
- Live device reduced-motion support and a global pause; local playback controls where appropriate.
- Modal Tab/Shift+Tab containment, Escape/Cancel restoration, and focus transfer to loading/results after confirmation.
- Semantic progress indicators and restrained status announcements; scrolling does not produce a noisy live region.
- Product details remain understandable without manipulating the canvas. An editable SVG alternative supports unsupported WebGL, context loss or a visitor-selected static view.
- Reduced motion removes continuous rotation and makes 3D transitions immediate without removing product settings.

Automated axe and keyboard checks do not establish screen-reader acceptance or WCAG certification. The QA report records the outstanding manual work.

## Performance decisions

The landing page does not download the 3D renderer. Both the studio and scene are lazy-loaded; the latter retains Vite's chunk-size advisory rather than hiding it. Pixel ratio is capped at 1.5, segment counts are bounded, and there are no post-processing passes or external texture downloads.

Demand rendering stops when idle, with explicit invalidation for target changes. Intersection and document visibility pause rendering offscreen and in background tabs. Shadows update when assembly geometry moves, rather than recomputing during camera-only rotation. R3F disposes declarative geometry/materials, Drei cleans up controls, and the feature probe releases its temporary WebGL context.

Measured workload, resource counters, cleanup checks and bundle sizes are recorded in [QA_REPORT.md](docs/QA_REPORT.md). No target frame rate, total memory usage or physical-device performance is claimed.

## Testing and CI

Vitest covers meaningful UI behavior and utility/lifecycle boundaries; it mocks the renderer where a DOM test cannot exercise GPU functionality. Playwright tests actual WebGL changes, exact assembly/reset return, camera input, pause behavior, fallback and resource cleanup, alongside all four 2D studios. Responsive checks span 320–1440px and axe runs on normal, reduced-motion and relevant fallback/modal states.

The [CI workflow](.github/workflows/ci.yml) runs on pushes and pull requests to `main`, uses Node 24 with npm caching, and has read-only repository permission. Official actions are pinned to verified commit SHAs. It installs dependencies, lints, typechecks, tests, builds, verifies formatting, runs the requested formatter and rejects resulting diffs, tests the production build in separate Chromium, Firefox and WebKit jobs. Each browser job installs its Linux dependencies and runs with an Xvfb virtual display and Mesa software graphics; Firefox explicitly enables software WebGL for this CI environment. Failure evidence is retained for seven days. Workflow syntax is locally validated; the [Actions page](https://github.com/Amos0323/motionlab-interactive-design/actions) records hosted results for each published commit.

## Publication and limitations

For Vercel, use the **Vite** preset, project root `.`, Node **24.x**, install command `npm ci`, build command `npm run build`, and output `dist`. No API keys, backend or environment variables are required. Query-based routes need no SPA rewrite. No deployment has been performed.

The save flow is simulated; SVG morphing supports supplied compatible paths, not uploaded arbitrary geometry; text input is bounded; JavaScript is required; state resets between pages. AURA is a modelling study, not a manufacturing mesh. Context loss retains the static alternative until reload. Device/GPU differences may affect shadows and antialiasing. See the QA report for exact tested coverage and remaining acceptance items.

Generated builds, dependencies, test evidence, local deployment state, environment files and credential extensions are ignored. No third-party media is used. Dependency licenses remain applicable; this project does not grant a new license to upstream packages. Choose an explicit license for original project code before encouraging reuse.

## Engineering case study

Read [the design problem, implementation decisions, defects discovered and lessons learned](docs/CASE_STUDY.md). This is intended to support an interview discussion about tradeoffs and verified behavior, rather than only visual output.

AI assisted implementation and verification. Architecture, code review, manual accessibility acceptance and release approval remain developer responsibilities.
