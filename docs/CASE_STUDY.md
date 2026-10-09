# Engineering case study — MOTIONLAB

## The design problem

A creative-development portfolio should demonstrate that motion is engineered interaction, not just decoration. The challenge was to make five visually coherent experiments that remain understandable with a keyboard, without animation, on narrow screens and when the GPU is unavailable.

The implementation extends one visual language and shared accessibility architecture. It deliberately avoids a backend, downloaded product model, animation video or framework replacement: the behaviors and geometry can be inspected directly in source.

## The implementation

**Make controls explain the work.** Each studio exposes the variables behind the result: timing, shape, feedback state, reading progress or material/light configuration. Labels, descriptions and state feedback serve both visitors and reviewers.

**Separate state from frames.** React owns control state and semantic UI. Motion values or Three.js object references own frame-by-frame updates. This avoids rerendering a component tree for every frame while keeping the controls straightforward to test.

**Model a bounded problem.** Four compatible SVG paths need no general-purpose morphing library. Procedural headphones need arcs, elliptical shells, pads, arms and accents, not an external asset pipeline. Each implementation demonstrates its actual scope without implying arbitrary SVG support or professional CAD output.

**Treat movement as optional.** Device preferences, global pause and local controls stop decorative motion. The product retains real 3D inspection with immediate state changes under reduced motion, plus an explicitly selectable static illustration. Native scrolling and modal semantics are preserved.

**Pay for complexity only when needed.** The 3D renderer is lazy-loaded. Demand rendering and visibility boundaries avoid unnecessary drawing. Cached shadows avoid repeated work when only the camera moves. This preserves functionality rather than removing it to chase a smaller number.

## Defects discovered through verification

Earlier browser checks found that a Motion-bound SVG path could retain stale geometry when switched to a plain string under reduced motion; separate static and animated branches fixed it. Modal checks exposed reverse-Tab escaping into browser chrome, leading to explicit first/last-button boundaries and confirmation-result focus handling.

AURA initially failed an exact reassembly screenshot test with reduced motion. The target coordinates changed, but no continuous loop was requesting a new frame. Explicit target invalidation fixed the renderer rather than loosening the assertion. This illustrates why a DOM control test cannot prove a GPU scene changed.

The final QA pass also measured avoidable shadow work during camera rotation. The light and model did not move, so rebuilding their shadow map was unnecessary. The map now updates when assembly parts change; exact-return and lifecycle browser checks guard against stale results. Measured before/after counters and any cross-browser findings are recorded in [the QA report](QA_REPORT.md).

## Testing strategy and interpretation

Unit tests cover user-facing state, keyboard actions and meaningful failure boundaries. Browser tests exercise real navigation, reduced-motion changes, focus restoration, pixel changes, WebGL failure, offscreen pause and disposal. Axe adds automated accessibility checks. Production-build testing catches integration differences hidden by the development server.

A passing test is evidence for its tested conditions. It does not prove every GPU, screen reader or device works, establish WCAG certification, or establish a target frame rate. Memory counters describe renderer resources, not a complete process heap analysis. Publication decisions should preserve these distinctions.

## Decisions to discuss in an interview

- Why stateful UI and animation frames have different owners.
- How matching SVG topology avoids unnecessary dependencies.
- Why demand rendering needs explicit invalidation when no continuous animation is running.
- How native semantics and targeted focus handling work together.
- Why the wheel scrolls the page and zoom remains available through controls.
- How lazy loading, visibility and cached shadows reduce different kinds of cost.
- Why automated accessibility and desktop browser emulation still leave manual acceptance work.
- How tests exposed actual rendering/lifecycle defects and how the fixes preserved assertions.
