import { useSyncExternalStore } from 'react'
const query = '(prefers-reduced-motion: reduce)'
function subscribe(onChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}
// Subscribe directly so a live OS preference change also updates our controls.
export function useReducedMotionPreference() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  )
}
