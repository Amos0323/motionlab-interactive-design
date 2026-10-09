export interface Experiment {
  id: string
  number: string
  title: string
  medium: string
  status: string
  brief: string
  artwork: 'type' | 'orbit' | 'fluid' | 'cube' | 'story'
  route?: string
}
export const experiments: readonly Experiment[] = [
  {
    id: 'kinetic-type',
    number: '01',
    title: 'Kinetic type',
    medium: 'Typography / Timing',
    status: 'Live experiment',
    artwork: 'type',
    route: 'kinetic-type',
    brief:
      'A study in rhythm, weight, and typographic expression. Try four animation styles, adjust the timing, and pause or replay the entrance. A complete static version respects reduced motion.',
  },
  {
    id: 'svg-morphing',
    number: '02',
    title: 'SVG morphing studio',
    medium: 'Geometry / SVG',
    status: 'Live experiment',
    artwork: 'orbit',
    route: 'svg-morphing',
    brief:
      'Transform original vector silhouettes through matching Bézier curves. Choose a shape, tune the duration, and explore the geometry between forms.',
  },
  {
    id: 'micro-interactions',
    number: '03',
    title: 'Micro-interactions lab',
    medium: 'Interaction / Feedback',
    status: 'Live experiment',
    artwork: 'fluid',
    route: 'micro-interactions',
    brief:
      'A working local interface with selectable cards, a preference switch, confirmation modal, loading progress, and clear success or recoverable error feedback.',
  },
  {
    id: 'scroll-story',
    number: '04',
    title: 'Scroll storytelling',
    medium: 'Narrative / Movement',
    status: 'Live experiment',
    artwork: 'story',
    route: 'scroll-story',
    brief:
      'Four chapters turn a point into a visual system. Native scrolling controls gentle layered illustrations and a reading indicator; every chapter works without motion.',
  },
  {
    id: 'third-dimension',
    number: '05',
    title: 'Into the third dimension',
    medium: 'Product / Interactive 3D',
    status: 'Live experiment',
    route: 'third-dimension',
    artwork: 'cube',
    brief:
      'An original procedural headphone concept. Explore four colourways, studio lighting, material finishes, camera controls and an animated exploded construction.',
  },
]
