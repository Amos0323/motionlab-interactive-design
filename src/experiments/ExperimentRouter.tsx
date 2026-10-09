import { lazy, Suspense, type ComponentType } from 'react'
const ProductStudio = lazy(() => import('./ProductStudio'))
const KineticTypography = lazy(() => import('./KineticTypography'))
const SvgMorphing = lazy(() => import('./SvgMorphing'))
const MicroInteractions = lazy(() => import('./MicroInteractions'))
const ScrollStory = lazy(() => import('./ScrollStory'))
export function ExperimentRouter({ id }: { id: string }) {
  const pages: Record<string, ComponentType> = {
    'third-dimension': ProductStudio,
    'kinetic-type': KineticTypography,
    'svg-morphing': SvgMorphing,
    'micro-interactions': MicroInteractions,
    'scroll-story': ScrollStory,
  }
  const Page = Object.hasOwn(pages, id) ? pages[id] : undefined
  return (
    <Suspense
      fallback={
        <main className="shell route-loading">
          <p role="status">Opening the studio…</p>
        </main>
      }
    >
      {Page ? (
        <Page />
      ) : (
        <main className="shell route-loading">
          <h1>Study not found.</h1>
          <p>This experiment does not exist.</p>
          <a className="primary-link" href="/#experiments">
            Return to gallery
          </a>
        </main>
      )}
    </Suspense>
  )
}
