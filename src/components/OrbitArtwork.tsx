import { useId } from 'react'
interface OrbitArtworkProps {
  compact?: boolean
}
export function OrbitArtwork({ compact = false }: OrbitArtworkProps) {
  const gradient = useId()
  return (
    <svg
      className={compact ? 'orbit orbit--compact' : 'orbit'}
      viewBox={compact ? '20 135 600 350' : '0 0 640 620'}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={gradient}
          x1="40"
          y1="60"
          x2="600"
          y2="520"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-violet)" />
          <stop offset="1" stopColor="var(--color-blue)" />
        </linearGradient>
      </defs>
      <g
        className="orbit-spin"
        stroke={'url(#' + gradient + ')'}
        strokeWidth="1.2"
      >
        {Array.from({ length: compact ? 10 : 19 }, (_, i) => (
          <ellipse
            key={i}
            cx="320"
            cy="310"
            rx={compact ? 260 - i * 13 : 260}
            ry={compact ? 98 - i * 5 : 95 + i * 5}
            transform={'rotate(' + (compact ? -18 : -58 + i * 8) + ' 320 310)'}
          />
        ))}
      </g>
      {!compact && (
        <g className="orbit-dot">
          <circle cx="320" cy="62" r="5" fill="var(--color-text)" />
          <circle
            cx="320"
            cy="62"
            r="12"
            stroke="var(--color-violet)"
            opacity=".45"
          />
        </g>
      )}
    </svg>
  )
}
