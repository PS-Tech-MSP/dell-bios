import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = (p: P): P => ({
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...p,
})

export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)
export const ChevronUp = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 15 6-6 6 6" />
  </svg>
)
export const ChevronDown = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)
export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </svg>
)
export const LockIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)
export const InfoIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)
export const PlusIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const LaptopIcon = (p: P) => (
  <svg {...base({ width: 40, height: 40, strokeWidth: 1.5, ...p })}>
    <rect x="4" y="5" width="16" height="11" rx="1.5" />
    <path d="M2 19h20" />
  </svg>
)
export const DesktopIcon = (p: P) => (
  <svg {...base({ width: 40, height: 40, strokeWidth: 1.5, ...p })}>
    <rect x="6" y="3" width="12" height="18" rx="1.5" />
    <path d="M9 7h6M12 18h.01" />
  </svg>
)
export const MicroIcon = (p: P) => (
  <svg {...base({ width: 40, height: 40, strokeWidth: 1.5, ...p })}>
    <rect x="4" y="10" width="16" height="8" rx="1.5" />
    <path d="M7 14h4M17 14h.01" />
  </svg>
)

export const ViewAllIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)
export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const KeyIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 9-9M16 7l3 3" />
  </svg>
)

const s = (d: React.ReactNode) => (p: P) => (
  <svg {...base({ width: 20, height: 20, strokeWidth: 1.6, ...p })}>{d}</svg>
)

/** Simple line icons for the 17 BIOS sections (original artwork). */
export const SECTION_ICONS: Record<string, (p: P) => React.JSX.Element> = {
  overview: s(<><rect x="3" y="4" width="18" height="13" rx="1.5" /><path d="M8 21h8M12 17v4" /></>),
  boot: s(<><path d="M12 3v9" /><path d="M6.5 6.5a8 8 0 1 0 11 0" /></>),
  integrated: s(<><rect x="6" y="6" width="12" height="12" rx="1.5" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>),
  storage: s(<><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M7 12h.01M11 12h6" /></>),
  display: s(<><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></>),
  connection: s(<><path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0" /><path d="M12 19h.01" /></>),
  power: s(<><path d="M12 3v8" /><path d="M7 6.5a7.5 7.5 0 1 0 10 0" /></>),
  security: s(<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />),
  passwords: s(<><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l3 3" /></>),
  update: s(<><path d="M4 12a8 8 0 0 1 14-5.3L20 9" /><path d="M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15" /><path d="M4 20v-5h5" /></>),
  sysmgmt: s(<><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>),
  keyboard: s(<><rect x="2.5" y="6" width="19" height="12" rx="1.5" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></>),
  preboot: s(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  virtualization: s(<><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" /></>),
  performance: s(<><path d="M4 18a8 8 0 1 1 16 0" /><path d="m12 18 4-6" /></>),
  logs: s(<><path d="M6 3h9l3 3v15H6V3Z" /><path d="M9 11h6M9 15h6" /></>),
  about: s(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
}
