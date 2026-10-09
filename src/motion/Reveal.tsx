import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useMotionPreferences } from './context'
import { motionTokens } from './tokens'
interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  disabled?: boolean
}
export function Reveal({
  children,
  className,
  delay = 0,
  disabled = false,
}: RevealProps) {
  const { enabled: globalEnabled } = useMotionPreferences()
  const enabled = globalEnabled && !disabled
  return (
    <motion.div
      className={className}
      initial={enabled ? { y: motionTokens.distance } : false}
      whileInView={{ y: 0 }}
      animate={enabled ? undefined : { y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: enabled ? motionTokens.duration.enter : 0,
        delay: enabled ? delay : 0,
        ease: motionTokens.ease,
      }}
    >
      {children}
    </motion.div>
  )
}
