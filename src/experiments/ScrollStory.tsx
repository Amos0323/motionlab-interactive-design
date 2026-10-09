import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'motion/react'
import { ExperimentLayout } from '../components/ExperimentLayout'
import { Reveal } from '../motion/Reveal'
import { useMotionPreferences } from '../motion/context'
const chapters = [
  {
    title: 'Start with a point.',
    text: 'Every visual system begins with a single decision. A point anchors attention and gives the eye somewhere to land.',
    id: 'point',
  },
  {
    title: 'Create a connection.',
    text: 'A line introduces a relationship. Direction and distance begin to turn individual elements into a shared language.',
    id: 'connection',
  },
  {
    title: 'Find the rhythm.',
    text: 'Repetition creates a pattern. Small variations in scale and spacing make a system feel alive without losing its structure.',
    id: 'rhythm',
  },
  {
    title: 'Leave room to breathe.',
    text: 'Restraint gives the important things space. The best motion guides attention, then steps aside so the message can stay.',
    id: 'space',
  },
] as const
function StoryArtwork({
  index,
  progress,
  movement,
}: {
  index: number
  progress: MotionValue<number>
  movement: boolean
}) {
  const y = useTransform(progress, [0, 1], [16, -16])
  const rotate = useTransform(progress, [0, 1], [-8, 8])
  const layerX = useTransform(progress, [0, 1], [-10, 10])
  return (
    <div className="story-art" aria-hidden="true">
      <motion.svg
        viewBox="0 0 400 320"
        style={{ y: movement ? y : 0, rotate: movement ? rotate : 0 }}
        fill="none"
      >
        <motion.circle
          cx="200"
          cy="160"
          r="126"
          stroke="var(--color-line)"
          strokeDasharray="2 9"
          style={{ x: movement ? layerX : 0 }}
        />
        <circle
          cx="200"
          cy="160"
          r={index === 0 ? 12 : 7}
          fill="var(--color-violet)"
        />
        {index > 0 && (
          <path d="M70 160H330" stroke="var(--color-blue)" strokeWidth="2" />
        )}
        {index > 1 &&
          Array.from({ length: index === 3 ? 4 : 8 }, (_, i) => (
            <ellipse
              key={i}
              cx="200"
              cy="160"
              rx={55 + i * 14}
              ry={45 + i * 8}
              transform={'rotate(' + i * 15 + ' 200 160)'}
              stroke={i % 2 ? 'var(--color-blue)' : 'var(--color-violet)'}
              strokeWidth="1.2"
            />
          ))}
      </motion.svg>
      <span className="story-art-coordinate">FIG. 0{index + 1}</span>
    </div>
  )
}
export default function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const [percent, setPercent] = useState(0)
  const [localPaused, setLocalPaused] = useState(false)
  const { enabled, reduced } = useMotionPreferences()
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.round(value * 100)
    setPercent((previous) => (previous === next ? previous : next))
  })
  const movement = enabled && !localPaused
  return (
    <ExperimentLayout
      number="04"
      title="Scroll storytelling"
      introduction="From a point to a visual language. A short story about making more from less, told at your own pace."
      explanation="Native scrolling drives a Motion value rather than replacing browser scrolling. Illustrations move through a restrained 32px range. The reading indicator tracks actual progress even when decorative movement is disabled."
      technology="Motion useScroll · Derived transforms · Intersection reveals · Native anchors"
      accessibility="All chapters remain in document order and readable without animation. Jump links support keyboard navigation; touch and mouse use normal scrolling. The progress indicator is labelled without announcing every scroll update."
    >
      <div className="story-toolbar">
        <nav aria-label="Story chapters">
          {chapters.map((chapter, index) => (
            <a href={'#' + chapter.id} key={chapter.id}>
              {String(index + 1).padStart(2, '0')} <span>{chapter.id}</span>
            </a>
          ))}
        </nav>
        <button
          className="studio-button secondary"
          disabled={!enabled}
          onClick={() => setLocalPaused((value) => !value)}
        >
          {reduced
            ? 'Static story'
            : localPaused
              ? 'Resume story motion'
              : 'Pause story motion'}
        </button>
      </div>
      <div className="reading-progress">
        <label htmlFor="story-progress">
          Reading progress <span>{percent}%</span>
        </label>
        <progress id="story-progress" value={percent} max="100" />
      </div>
      <div
        className="story-chapters"
        ref={ref}
        data-story-motion={movement ? 'on' : 'off'}
      >
        {chapters.map((chapter, index) => (
          <section
            className="story-chapter"
            id={chapter.id}
            key={chapter.id}
            aria-labelledby={chapter.id + '-title'}
          >
            <div className="story-copy">
              <span className="studio-index">Chapter 0{index + 1}</span>
              <Reveal disabled={!movement}>
                <h2 id={chapter.id + '-title'}>{chapter.title}</h2>
                <p>{chapter.text}</p>
              </Reveal>
            </div>
            <StoryArtwork
              index={index}
              progress={scrollYProgress}
              movement={movement}
            />
          </section>
        ))}
      </div>
      <a className="text-link" href="#point">
        Read it again ↑
      </a>
    </ExperimentLayout>
  )
}
