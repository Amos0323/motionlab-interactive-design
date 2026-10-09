import { createContext, useContext } from 'react'
export interface MotionPreferences {
  paused: boolean
  reduced: boolean
  enabled: boolean
  toggle: () => void
}
export const MotionContext = createContext<MotionPreferences | null>(null)
export function useMotionPreferences() {
  const value = useContext(MotionContext)
  if (!value) throw new Error('Motion primitives must be inside MotionProvider')
  return value
}
