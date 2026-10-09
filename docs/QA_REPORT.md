# MOTIONLAB — publication QA report

This report records Phase 4 local, pre-publication evidence. Statements about publication or hosted CI below describe that historical checkpoint. Subsequent [GitHub Actions runs](https://github.com/Amos0323/motionlab-interactive-design/actions) provide hosted results for published commits. No Vercel deployment is part of this publication task.

## Scope

All five studios remain: Kinetic Typography, SVG Morphing, UI Micro-interactions, Scroll Storytelling and AURA. The original 26 unit / 22 browser cases from the 2D phases and the Phase 3 cases remain. The only earlier gallery assertion change was the intended transition from a future 3D placeholder to a live studio.

Phase 4 changes are limited to publication documentation, CI/browser configuration, ignore/line-ending rules, a targeted rendering optimization and additional regression assertions. The visual identity and interaction set are preserved.

## Browser availability and coverage

| Engine                | Installation and execution                                       | Coverage                                                                     |
| --------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Chromium 156.0.8078.4 | Installed and launched with Playwright                           | Full production-build suite; real WebGL, keyboard, axe and responsive checks |
| Firefox 157.0         | Downloaded successfully; executable launch returns `spawn EPERM` | No application coverage claimed                                              |
| WebKit 27.2           | Downloaded successfully; executable launch returns `spawn EPERM` | No application coverage claimed                                              |

The initial three-engine run completed all 32 then-existing Chromium tests. Firefox failed before opening a page; direct Firefox and WebKit launch checks both confirmed the host startup restriction. The blocked run was stopped rather than repeatedly executing tests that could not launch. Neither engine is silently skipped in configuration: all three remain enabled for Linux CI. Their application behavior and Linux WebGL availability must be verified by the first hosted run.

Viewport checks cover 320, 390, 768, 1024 and 1440px on the landing page; all 2D studios at 390/1440 and a 320px overflow sweep; AURA at 320/390/768/1440. These are desktop automation/emulation results, not physical-device GPU verification or Safari acceptance.

## Accessibility review

Automated checks cover semantic landmarks, accessible names, skip links, native disclosures, selected states, modal accessibility, keyboard focus boundaries/restoration and real reduced-motion changes. Axe checks run on the landing page in both motion modes, the four 2D studios, AURA at four widths, the open modal, and unsupported-WebGL fallback.

The additional Phase 4 browser case switches reduced motion while the micro-interaction modal is open, verifies Cancel restores focus, and confirms task feedback still receives focus and completes. Existing cases cover live reduction in typography, SVG morphing, scroll storytelling and AURA.

Manual acceptance remains: NVDA with Firefox/Chromium, VoiceOver with Safari/iOS, actual announcement cadence and reading order, touch exploration, forced-colors and magnification review. Automated axe and keyboard results do not constitute WCAG certification or designer sign-off.

## Performance measurements and changes

Measurements used the desktop Edge/Chromium renderer at 1440 × 1100, the default assembled Amethyst configuration and automatic rotation after initial settling. Values are sampled Three.js counters, not a frame-rate benchmark.

| Renderer counter                              | Before | After |
| --------------------------------------------- | -----: | ----: |
| Draw calls in a sampled camera-rotation frame |     31 |    21 |
| Rendered triangles including shadow work      | 16,074 | 8,242 |
| Resident geometries                           |     21 |    21 |
| Resident textures                             |      3 |     3 |
| Shader programs                               |      4 |     4 |

The directional shadow map previously rebuilt during camera-only rotation. It now caches its result and updates when assembly geometry changes. This preserves lighting, materials and exploded-view behavior while removing approximately 32% of sampled draw calls and 49% of sampled triangle work. A browser assertion verifies that offscreen-target draws stop increasing during camera-only rotation while normal scene draws continue. Existing exact-reassembly and GPU cleanup assertions remain.

After three static-view/unmount/remount cycles, the active root count returned to one and the resource counters remained 21 geometries, 3 textures and 4 programs. Browser checks also observe buffer deletion on unmount. This is bounded lifecycle evidence, not proof against every memory leak and not a measurement of GPU bytes or the full JavaScript heap.

Drei OrbitControls now uses its direct module entry rather than the package barrel. Vite transformed 752 modules versus 1,005 previously; the production renderer size did not materially shrink. The lazy scene remains 931.39 kB minified / 247.27 kB gzip. The main entry is 347.75 kB / 110.51 kB gzip. Vite's default 500 kB chunk advisory is retained. The initial landing route does not request the 3D scene.

Existing controls remain: pixel ratio cap 1.5, one 1024px shadow map, demand rendering, offscreen/background pause, bounded geometry, no animation-frame React state updates, disposal by R3F/Drei, and a released temporary feature-probe context. No functionality was removed to reduce bundle size. No specific frame rate is claimed.

## CI configuration and validation

`.github/workflows/ci.yml` runs on pushes and pull requests to `main`. It uses Node 24, npm caching keyed by the lockfile, read-only `contents` permission, disabled persisted checkout credentials, cancellation of superseded runs and a 20-minute timeout. Official actions are pinned to release commit SHAs.

Commands: `npm ci`, lint, typecheck, unit tests, build, read-only formatting validation, the requested `npm run format`, a clean-diff assertion, Playwright installation with Linux dependencies, and production-build browser tests in all three engines. Failure traces/reports are retained for seven days. No deployment or secret is configured.

The YAML was checked with official actionlint 1.7.12, downloaded to a temporary directory and verified against the release SHA-256 checksum. It passes local workflow validation. Hosted execution remains unverified; local syntax validation is not a passing GitHub Actions run.

References: [Playwright CI setup](https://playwright.dev/docs/ci), [Node setup action](https://github.com/actions/setup-node), [actionlint](https://github.com/rhysd/actionlint).

## Publication security review

The source/documentation/configuration file set was inspected with dependencies, builds and generated test output excluded. Checks found no private-key/token patterns, machine-specific home paths or employer references; no binary or oversized source files; and only `registry.npmjs.org` download hosts in the lockfile. These are pattern and inventory checks, not a guarantee that every possible secret format can be detected.

No paid or third-party media is present. The favicon and experiment art are editable original SVG/CSS/procedural geometry. Direct 3D dependencies declare MIT licenses. Dependency licenses remain applicable; choose an explicit license for original project code before encouraging reuse.

`.gitignore` excludes dependencies, builds, coverage, test reports/traces, environment files, local Vercel state, temporary directories, logs and common private-key/certificate extensions. `.gitattributes` enforces LF source normalization for consistent Windows/Linux formatting. No Git history was created or published by this work.

## Publication decision and remaining gates

The repository can be prepared for public source publication with these limitations disclosed. Full cross-browser release acceptance remains conditional on Firefox/WebKit execution in an unrestricted environment and the first hosted CI run. Physical-device GPU behavior and manual assistive-technology acceptance remain open.

For a future authorized Vercel deployment: Vite preset; Node 24.x; install `npm ci`; build `npm run build`; output `dist`; root `.`. No environment variables or special query-route rewrites are needed. Verify every studio URL, fallback and asset loading on a preview deployment before promoting it.

Do not label Firefox/WebKit, physical-device performance, WCAG compliance or hosted CI as passing until their corresponding checks actually run.

## Final validation results — 2026-10-08

| Check                                                                | Actual result                                                                                                                                |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                                             | Passed after stopping the two project Vite servers that held a Windows file lock; 0 reported vulnerabilities                                 |
| `npm run lint`                                                       | Passed, zero warnings                                                                                                                        |
| `npm run typecheck`                                                  | Passed                                                                                                                                       |
| `npm test`                                                           | 39 passed across 3 files                                                                                                                     |
| `npm run build`                                                      | Passed; 752 modules; lazy renderer chunk advisory retained                                                                                   |
| `npm run format` / `npm run format:check`                            | Passed                                                                                                                                       |
| `actionlint -shellcheck= .github/workflows/ci.yml`                   | Passed; workflow syntax/expressions checked, external ShellCheck not installed                                                               |
| `PLAYWRIGHT_TEST_BUILD=1 npm run test:browser -- --project=chromium` | 33 passed against the production build in 1.6 minutes                                                                                        |
| Full three-engine suite                                              | Not fully validated: Firefox and WebKit startup blocked by host `spawn EPERM`; 99 cases are configured (33 per engine), not 99 passing cases |
| Axe checks                                                           | No violations in the tested Chromium routes/states                                                                                           |
| Production visual/smoke review                                       | Desktop, exploded view and mobile reviewed; no page/console errors; landing did not fetch ProductScene                                       |
| npm dependency audit                                                 | 0 known vulnerabilities reported at check time                                                                                               |

The runner's `NO_COLOR` / `FORCE_COLOR` notice is an environment-level warning. The unresolved application build advisory is the lazy 3D chunk size. No tests were removed, skipped or weakened to produce these results.

### Files substantially changed in Phase 4

Created: `.github/workflows/ci.yml`, `.gitattributes`, `docs/CASE_STUDY.md`, `docs/QA_REPORT.md`.

Updated: `README.md`, `.gitignore`, `playwright.config.ts`, `src/three/ProductScene.tsx`, `src/three/Headphones.tsx`, `e2e/product.spec.ts`, `e2e/studios.spec.ts`.

No other project was edited. The project remains unpublished, with its local development preview restored at port 5190.

## Publication validation follow-up

The final pre-push Chromium run exposed an intermittent autorotation stall: the viewer could be visible with autorotation enabled but have no queued demand frames. Small damped control updates did not always emit a change event. The scene now explicitly requests frames while autorotation is enabled and requests a wake-up frame when returning from `never` to `demand`. Offscreen/global/reduced-motion pauses remain authoritative. The lifecycle regression also verifies rendering resumes after returning onscreen; no previous assertion was removed.
