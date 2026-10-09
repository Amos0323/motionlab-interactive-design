import { useEffect, useRef, useState } from 'react'
export function useViewerVisibility() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [foreground, setForeground] = useState(!document.hidden)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { threshold: 0.05 },
    )
    if (ref.current) observer.observe(ref.current)
    const update = () => setForeground(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  return { ref, active: visible && foreground }
}
