import type { Colourway } from './settings'
export function ProductFallback({
  colour,
  exploded,
}: {
  colour: Colourway
  exploded: boolean
}) {
  const offset = exploded ? 35 : 0
  return (
    <svg
      className="product-fallback"
      viewBox="0 0 600 480"
      role="img"
      aria-label={`AURA headphones in ${colour.name}, ${exploded ? 'exploded' : 'assembled'} static illustration`}
    >
      <ellipse cx="300" cy="425" rx="155" ry="16" fill="#07070b" />
      <path
        d="M174 245V190a126 126 0 0 1 252 0v55"
        fill="none"
        stroke={colour.metal}
        strokeWidth="23"
      />
      <path
        d="M174 183a126 126 0 0 1 252 0"
        fill="none"
        stroke={colour.shell}
        strokeWidth="34"
        strokeLinecap="round"
      />
      {[-1, 1].map((side) => (
        <g
          key={side}
          transform={`translate(${300 + side * (126 + offset)} 295)`}
        >
          <rect
            x="-12"
            y="-88"
            width="24"
            height="60"
            rx="9"
            fill={colour.metal}
          />
          <rect
            x="-42"
            y="-52"
            width="84"
            height="148"
            rx="39"
            fill={colour.shell}
            stroke={colour.metal}
            strokeWidth="3"
          />
          <rect
            x={side === -1 ? 27 + offset : -48 - offset}
            y="-43"
            width="21"
            height="130"
            rx="10"
            fill={colour.cushion}
          />
          <path
            d="M-13 10h26M-13 18h26M-13 26h26"
            stroke={colour.metal}
            strokeWidth="2"
          />
        </g>
      ))}
    </svg>
  )
}
