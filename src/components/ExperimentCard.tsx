import type { Experiment } from '../data/experiments'
import { OrbitArtwork } from './OrbitArtwork'
import { Reveal } from '../motion/Reveal'
function StudyArtwork({ kind }: { kind: Experiment['artwork'] }) {
  if (kind === 'orbit') return <OrbitArtwork compact />
  if (kind === 'type')
    return (
      <div className="type-art" aria-hidden="true">
        Aa<span>FORM FOLLOWS FEELING</span>
      </div>
    )
  if (kind === 'story')
    return (
      <svg
        viewBox="0 0 600 300"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <g stroke="currentColor">
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx={105 + i * 130} cy={150} r={12 + i * 14} />
              {i < 3 && <path d={'M' + (130 + i * 130) + ' 150h60'} />}
            </g>
          ))}
        </g>
      </svg>
    )
  if (kind === 'cube')
    return (
      <svg
        viewBox="0 0 600 300"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="cube-art"
      >
        <g stroke="currentColor" strokeWidth="1.2">
          <path d="M190 94 280 40 420 62 330 118Z M190 94v150l140 22V118 M330 266l90-56V62" />
          <path d="M190 244l90-56V40M280 188l140 22" strokeDasharray="4 5" />
        </g>
      </svg>
    )
  return (
    <svg
      className="fluid-art"
      viewBox="0 0 600 300"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1.2">
        {Array.from({ length: 4 }, (_, group) => (
          <g
            className="fluid-group"
            key={group}
            style={{ animationDelay: group * -1.7 + 's' }}
          >
            {Array.from({ length: 7 }, (_, i) => (
              <circle
                key={i}
                cx={95 + group * 137 + i * 3}
                cy={150 + Math.sin(group * 2) * 28}
                r={60 - i * 5}
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  return (
    <Reveal>
      <article
        className={
          experiment.route ? 'experiment' : 'experiment experiment--future'
        }
        aria-labelledby={experiment.id}
      >
        <div className={'experiment-art experiment-art--' + experiment.artwork}>
          <StudyArtwork kind={experiment.artwork} />
        </div>
        <div className="experiment-meta">
          <span>{experiment.number}</span>
          <span>{experiment.medium}</span>
        </div>
        <h3 id={experiment.id}>{experiment.title}</h3>
        <p className="experiment-status">{experiment.status}</p>
        {experiment.route && (
          <a className="open-studio" href={'/?experiment=' + experiment.route}>
            Open studio <span aria-hidden="true">↗</span>
            <span className="sr-only">: {experiment.title}</span>
          </a>
        )}
        <details>
          <summary>
            Read the brief{' '}
            <span aria-hidden="true" className="plus">
              +
            </span>
            <span className="sr-only"> for {experiment.title}</span>
          </summary>
          <p>{experiment.brief}</p>
        </details>
      </article>
    </Reveal>
  )
}
