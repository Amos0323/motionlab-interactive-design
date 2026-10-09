import { useState } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { ExperimentLayout } from '../components/ExperimentLayout'
import { PlaybackControls } from '../components/PlaybackControls'
import { usePlayback } from '../motion/usePlayback'
import { useMotionPreferences } from '../motion/context'
const styles = ['Characters', 'Words', 'Split', 'Emphasis'] as const
type TextStyle = (typeof styles)[number]
function Segment({
  text,
  index,
  count,
  progress,
  style,
}: {
  text: string
  index: number
  count: number
  progress: MotionValue<number>
  style: TextStyle
}) {
  const { reduced } = useMotionPreferences()
  const local = useTransform(progress, (value) =>
    Math.min(
      1,
      Math.max(0, (value - (index / Math.max(1, count)) * 0.55) / 0.45),
    ),
  )
  const y = useTransform(local, (value) =>
    style === 'Split'
      ? (1 - value) * (index % 2 ? -55 : 55)
      : style === 'Emphasis'
        ? 0
        : (1 - value) * 45,
  )
  const opacity = useTransform(local, (value) =>
    style === 'Emphasis' ? 1 : 0.25 + value * 0.75,
  )
  const scale = useTransform(local, (value) =>
    style === 'Emphasis' ? 1 + Math.sin(value * Math.PI) * 0.18 : 1,
  )
  return (
    <motion.span
      className="type-segment"
      style={{
        y: reduced ? 0 : y,
        opacity: reduced ? 1 : opacity,
        scale: reduced ? 1 : scale,
      }}
    >
      {text === ' ' ? '\u00a0' : text}
    </motion.span>
  )
}
export default function KineticTypography() {
  const [text, setText] = useState('Make it move.')
  const [style, setStyle] = useState<TextStyle>('Characters')
  const [speed, setSpeed] = useState(1)
  const playback = usePlayback(3 / speed)
  const segments = style === 'Words' ? text.split(/(\s+)/) : Array.from(text)
  return (
    <ExperimentLayout
      number="01"
      title="Kinetic typography"
      introduction="Give words a rhythm. Shape the entrance, change the tempo, and find the moment it feels right."
      explanation="A single finite timeline drives each segment with a staggered offset. Pause keeps the current position; resume continues for the remaining duration. Emphasis uses one gentle scale pulse, without flashing."
      technology="React · TypeScript · Motion values · Transform interpolation"
      accessibility="One unsplit text alternative preserves reading order. Device reduced motion shows the complete text immediately. Playback and style controls work with keyboard and touch."
    >
      <div className="studio-workbench">
        <section
          className="demo-canvas type-canvas"
          aria-label="Typography preview"
        >
          <span className="canvas-label">TYPE / IN TIME</span>
          <p className="sr-only">{text || 'Enter your own text to preview'}</p>
          <div className="kinetic-text" aria-hidden="true">
            {segments.map((segment, index) => (
              <Segment
                key={index}
                text={segment}
                index={index}
                count={segments.length}
                progress={playback.progress}
                style={style}
              />
            ))}
          </div>
          <span className="canvas-caption">
            {style} / {speed}×
          </span>
        </section>
        <section className="control-panel" aria-labelledby="type-controls">
          <h2 id="type-controls">Set the direction</h2>
          <label htmlFor="type-text">
            Your words <span className="field-hint">40 characters max</span>
          </label>
          <input
            id="type-text"
            value={text}
            maxLength={40}
            onChange={(event) => {
              setText(event.target.value)
              playback.replay()
            }}
          />
          <fieldset>
            <legend>Animation style</legend>
            <div className="choice-grid">
              {styles.map((option) => (
                <button
                  key={option}
                  className="choice"
                  aria-pressed={style === option}
                  onClick={() => {
                    setStyle(option)
                    playback.replay()
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="type-speed">Animation speed</label>
          <select
            id="type-speed"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          >
            <option value={0.5}>0.5× · Slow</option>
            <option value={1}>1× · Natural</option>
            <option value={2}>2× · Fast</option>
          </select>
          <PlaybackControls playback={playback} />
          <p className="control-note">
            Select a style or press Play to begin. Every entrance finishes on a
            readable frame.
          </p>
        </section>
      </div>
    </ExperimentLayout>
  )
}
