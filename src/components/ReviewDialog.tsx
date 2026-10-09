import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useMotionPreferences } from '../motion/context'
import { motionTokens } from '../motion/tokens'
export function ReviewDialog({
  open,
  onClose,
  onConfirm,
  selection,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  selection: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const { enabled } = useMotionPreferences()
  useEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      opener?.focus({ preventScroll: true })
    }
  }, [open])
  return (
    <dialog
      ref={ref}
      className="review-dialog"
      aria-labelledby="review-title"
      aria-describedby="review-description"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>(
          'button:not([disabled])',
        )
        const first = buttons[0],
          last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {open && (
        <motion.div
          initial={enabled ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: enabled ? motionTokens.duration.interaction : 0,
          }}
        >
          <span className="studio-index">A moment to confirm</span>
          <h2 id="review-title">Ready to save?</h2>
          <p id="review-description">
            Save the {selection} direction in this local demo. No information
            leaves your browser.
          </p>
          <div className="dialog-actions">
            <button className="studio-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="studio-button" onClick={onConfirm}>
              Confirm save
            </button>
          </div>
        </motion.div>
      )}
    </dialog>
  )
}
