import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ExperimentLayout } from '../components/ExperimentLayout'
import { ReviewDialog } from '../components/ReviewDialog'
import { useMotionPreferences } from '../motion/context'
type JobStatus = 'idle' | 'loading' | 'success' | 'error'
export default function MicroInteractions() {
  const feedbackRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState('Pulse')
  const [email, setEmail] = useState(false)
  const [outcome, setOutcome] = useState<'success' | 'error'>('success')
  const [status, setStatus] = useState<JobStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const { enabled } = useMotionPreferences()
  useEffect(() => {
    if (status !== 'loading') return
    feedbackRef.current?.focus({ preventScroll: true })
    let value = 0
    const timer = window.setInterval(() => {
      value += 20
      setProgress(value)
      if (value >= 100) {
        window.clearInterval(timer)
        setStatus(outcome)
      }
    }, 300)
    return () => window.clearInterval(timer)
  }, [status, outcome])
  const busy = status === 'loading'
  function startSave() {
    setOpen(false)
    setProgress(0)
    setStatus('loading')
  }
  return (
    <ExperimentLayout
      number="03"
      title="Micro-interactions lab"
      introduction="Good interfaces answer back. Select a direction, adjust your preferences, and put the feedback loop to work."
      explanation="A small local save flow makes motion serve a real state change: selection, confirmation, progress, and a clear outcome. Loading is a deterministic simulation, not a network request. Task progress continues when decorative motion is paused."
      technology="React state machine · Motion gestures · Native dialog · Semantic progress"
      accessibility="Buttons, switch, and progress expose their state. The native modal traps focus, closes with Escape, and returns focus to its trigger. Reduced motion removes transitions without hiding loading, success, or error feedback."
    >
      <div className="studio-workbench micro-workbench">
        <section
          className="demo-canvas micro-canvas"
          aria-labelledby="direction-title"
        >
          <span className="canvas-label">INTERFACE / ACTION & RESPONSE</span>
          <h2 id="direction-title">Choose a direction.</h2>
          <p className="canvas-description">
            A small decision. A clear response.
          </p>
          <div className="direction-grid">
            {['Pulse', 'Flow'].map((name, index) => (
              <motion.button
                key={name}
                type="button"
                className="direction-card"
                aria-pressed={selection === name}
                disabled={busy}
                onClick={() => setSelection(name)}
                whileHover={enabled ? { y: -5 } : undefined}
                whileTap={enabled ? { scale: 0.98 } : undefined}
              >
                <span
                  className={'direction-art ' + (index ? 'flow' : 'pulse')}
                  aria-hidden="true"
                >
                  <i />
                  <i />
                  <i />
                </span>
                <span>{name}</span>
                <span className="selection-label">
                  {selection === name ? 'Selected ✓' : 'Select direction'}
                </span>
              </motion.button>
            ))}
          </div>
          <label className="switch-row">
            <span>
              <strong>Email confirmation</strong>
              <small>Demo preference only; no email is sent.</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={email}
              disabled={busy}
              onChange={(event) => setEmail(event.target.checked)}
            />
            <span className="switch-track" aria-hidden="true" />
          </label>
          <motion.button
            className="studio-button save-button"
            disabled={busy}
            onClick={() => setOpen(true)}
            whileTap={enabled ? { scale: 0.97 } : undefined}
          >
            {busy ? (
              <>
                <span className="loading-spinner" aria-hidden="true" />
                Saving direction…
              </>
            ) : (
              'Review and save'
            )}
          </motion.button>
          <div className="save-progress">
            <label htmlFor="save-progress">
              Save progress <span>{progress}%</span>
            </label>
            <progress id="save-progress" max="100" value={progress} />
          </div>
          <div
            ref={feedbackRef}
            tabIndex={-1}
            className={'feedback feedback--' + status}
            role={status === 'error' ? 'alert' : 'status'}
          >
            {status === 'idle'
              ? 'Your direction is ready to review.'
              : busy
                ? 'Saving locally. Please wait.'
                : status === 'success'
                  ? selection + ' saved. Your demo preference is confirmed.'
                  : 'Demo save failed. Your selection is preserved. Try again with a success outcome.'}
          </div>
        </section>
        <section className="control-panel" aria-labelledby="feedback-controls">
          <h2 id="feedback-controls">Test the feedback</h2>
          <label htmlFor="save-outcome">Simulated outcome</label>
          <select
            id="save-outcome"
            value={outcome}
            disabled={busy}
            onChange={(event) =>
              setOutcome(event.target.value === 'error' ? 'error' : 'success')
            }
          >
            <option value="success">Successful save</option>
            <option value="error">Recoverable error</option>
          </select>
          <p className="control-note">
            Choose a card, toggle the preference, then review and confirm. The
            loading state lasts 1.5 seconds.
          </p>
          <div className="interaction-key">
            <span>01 / Select</span>
            <span>02 / Confirm</span>
            <span>03 / Receive feedback</span>
          </div>
          <button
            className="studio-button secondary"
            disabled={busy}
            onClick={() => {
              setSelection('Pulse')
              setEmail(false)
              setStatus('idle')
              setProgress(0)
              setOutcome('success')
            }}
          >
            Reset demo
          </button>
        </section>
      </div>
      <ReviewDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={startSave}
        selection={selection}
      />
    </ExperimentLayout>
  )
}
