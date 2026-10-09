import { useState, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { useReducedMotionPreference } from './useReducedMotionPreference'
import { MotionContext } from './context'
export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotionPreference()
  const enabled = !paused && !reduced
  return (
    <MotionContext.Provider
      value={{
        paused,
        reduced,
        enabled,
        toggle: () => setPaused((value) => !value),
      }}
    >
      <MotionConfig reducedMotion={enabled ? 'user' : 'always'}>
        <div data-motion={enabled ? 'on' : 'off'}>{children}</div>
      </MotionConfig>
    </MotionContext.Provider>
  )
}
