import { useMotionPreferences } from '../motion/context'
export function MotionToggle() {
  const { paused, reduced, toggle } = useMotionPreferences()
  return (
    <button
      className="motion-toggle"
      type="button"
      onClick={toggle}
      disabled={reduced}
      aria-label={reduced ? 'Reduced motion enabled by your device' : undefined}
    >
      <span aria-hidden="true">{paused || reduced ? '▷' : 'Ⅱ'}</span>
      <span>
        {reduced ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion'}
      </span>
    </button>
  )
}
