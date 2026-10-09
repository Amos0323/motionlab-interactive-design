import { useEffect, useState } from 'react'
import { animate, useMotionValue } from 'motion/react'
import { useMotionPreferences } from './context'

/** A finite, resumable timeline. Frame updates stay outside React state. */
export function usePlayback(duration: number) {
  const { enabled, reduced, paused: globalPaused } = useMotionPreferences()
  const progress = useMotionValue(1)
  const [playing, setPlaying] = useState(false)
  const [completed, setCompleted] = useState(true)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (reduced) {
      progress.set(1)
      return
    }
    if (!playing || !enabled) return
    const animation = animate(progress, 1, {
      duration: Math.max(0, duration * (1 - progress.get())),
      ease: 'linear',
      onComplete: () => {
        setPlaying(false)
        setCompleted(true)
      },
    })
    return () => animation.stop()
  }, [playing, enabled, reduced, duration, revision, progress])
  function replay() {
    progress.stop()
    progress.set(reduced ? 1 : 0)
    setCompleted(reduced)
    setPlaying(!reduced)
    setRevision((value) => value + 1)
  }
  function toggle() {
    if (completed) replay()
    else setPlaying((value) => !value)
  }
  return {
    progress,
    playing,
    completed,
    replay,
    toggle,
    reduced,
    globalPaused,
    status: reduced
      ? 'Static preview · reduced motion'
      : globalPaused
        ? 'Paused by global control'
        : completed
          ? 'Complete'
          : playing
            ? 'Playing'
            : 'Paused',
  }
}
