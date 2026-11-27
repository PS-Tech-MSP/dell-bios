import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = (p: P): P => ({
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  'aria-hidden': true,
  ...p,
})

/* Only icons that appear in the Dell UI: header buttons, close, battery. */
export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10" cy="10" r="6.5" />
    <path d="m15 15 6 6" />
  </svg>
)
export const ViewAllIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 5 14 14M19 5 5 19" />
  </svg>
)
export const BatteryIcon = (p: P) => (
  <svg {...base({ viewBox: '0 0 24 24', strokeWidth: 0, fill: 'currentColor', ...p })}>
    <path d="M3 7h16v10H3z" fillOpacity=".25" />
    <path d="M3 7h13v10H3z" />
    <path d="M20 10h2v4h-2z" />
  </svg>
)
