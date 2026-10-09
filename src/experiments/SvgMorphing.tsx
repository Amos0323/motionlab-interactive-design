import { useState } from 'react'
import { motion, useTransform } from 'motion/react'
import { ExperimentLayout } from '../components/ExperimentLayout'
import { PlaybackControls } from '../components/PlaybackControls'
import { usePlayback } from '../motion/usePlayback'
import { shapes } from '../utils/svgShapes'
const initial = shapes[0]!
export default function SvgMorphing() {
  const [target, setTarget] = useState(initial)
  const [from, setFrom] = useState({ path: initial.path, color: initial.color })
  const [duration, setDuration] = useState(1.6)
  const playback = usePlayback(duration)
  const d = useTransform(playback.progress, [0, 1], [from.path, target.path])
  const color = useTransform(
    playback.progress,
    [0, 1],
    [from.color, target.color],
  )
  function choose(shape: typeof initial) {
    setFrom({ path: d.get(), color: color.get() })
    setTarget(shape)
    playback.replay()
  }
  return (
    <ExperimentLayout
      number="02"
      title="SVG morphing studio"
      introduction="One path. Many possibilities. Explore the space between simple silhouettes and expressive forms."
      explanation="Every original shape has the same eight cubic Bézier segments. Motion interpolates matching numeric coordinates and color channels, so a second morphing library is unnecessary. Changing shape mid-transition starts from the current visible path."
      technology="SVG paths · Cubic Bézier geometry · Motion value interpolation"
      accessibility="Shape names and selection states are native buttons. Reduced motion renders the selected silhouette immediately, while all selection and reset controls remain available."
    >
      <div className="studio-workbench">
        <section
          className="demo-canvas morph-canvas"
          aria-label="Vector preview"
        >
          <span className="canvas-label">VECTOR / BETWEEN FORMS</span>
          <svg
            className="morph-svg"
            viewBox="0 0 400 400"
            role="img"
            aria-label={target.name + ' silhouette'}
          >
            <defs>
              <pattern
                id="dots"
                width="25"
                height="25"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="1" fill="var(--color-line)" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#dots)" />
            {playback.reduced ? (
              <path d={target.path} fill={target.color} />
            ) : (
              <motion.path d={d} fill={color} />
            )}
          </svg>
          <span className="canvas-caption">
            {target.name} / Eight continuous curves
          </span>
        </section>
        <section className="control-panel" aria-labelledby="morph-controls">
          <h2 id="morph-controls">Find your form</h2>
          <fieldset>
            <legend>Choose a shape</legend>
            <div className="choice-grid">
              {shapes.map((shape) => (
                <button
                  className="choice"
                  key={shape.name}
                  aria-pressed={target.name === shape.name}
                  onClick={() => choose(shape)}
                >
                  {shape.name}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="morph-duration">
            Duration{' '}
            <span className="field-hint">{duration.toFixed(1)} seconds</span>
          </label>
          <input
            id="morph-duration"
            type="range"
            min=".4"
            max="4"
            step=".2"
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
          <PlaybackControls playback={playback} />
          <button
            className="studio-button secondary"
            onClick={() => {
              setDuration(1.6)
              choose(initial)
            }}
          >
            Reset shape
          </button>
          <p className="control-note">
            Choose two different shapes, then replay the transition. Pause to
            inspect the in-between geometry.
          </p>
        </section>
      </div>
    </ExperimentLayout>
  )
}
