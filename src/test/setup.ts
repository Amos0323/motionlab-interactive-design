import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
let reduced = false
const listeners = new Set<() => void>()
export function setReducedMotion(value: boolean) {
  reduced = value
  listeners.forEach((listener) => listener())
}
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    get matches() {
      return query.includes('prefers-reduced-motion') && reduced
    },
    media: query,
    onchange: null,
    addListener: (listener: () => void) => listeners.add(listener),
    removeListener: (listener: () => void) => listeners.delete(listener),
    addEventListener: (_event: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) =>
      listeners.delete(listener),
    dispatchEvent: () => true,
  }),
})
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
beforeEach(() => {
  reduced = false
})
afterEach(() => {
  cleanup()
  listeners.clear()
})
