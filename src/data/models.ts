import type { LogEntry, Model, Platform, SystemInfo } from './types'

/** Small deterministic PRNG so synthetic data is stable per model between reloads. */
function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TAG_CHARS = 'BCDFGHJKLMNPQRSTVWXYZ0123456789'
const pick = (r: () => number, s: string) => s[Math.floor(r() * s.length)]
const hex = (r: () => number, n: number) =>
  Array.from({ length: n }, () => pick(r, '0123456789ABCDEF')).join('')
const mac = (r: () => number) =>
  // 02: locally administered prefix => clearly not a real vendor MAC
  `02:${hex(r, 2)}:${hex(r, 2)}:${hex(r, 2)}:${hex(r, 2)}:${hex(r, 2)}`

function logs(r: () => number, laptop: boolean): SystemInfo['logs'] {
  const d = (n: number) => `2026-0${1 + Math.floor(n / 9) % 9}-${String(1 + (n % 27)).padStart(2, '0')}`
  const t = () =>
    `${String(Math.floor(r() * 24)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}`
  const mk = (n: number, desc: string): LogEntry => ({ date: d(n), time: t(), description: desc })
  return {
    bios: [
      mk(3, 'Updated BIOS to the latest version (synthetic)'),
      mk(7, 'System BIOS settings changed'),
      mk(12, 'Secure Boot variables loaded'),
      mk(19, 'POST completed normally'),
      mk(24, 'Admin Password not set'),
    ],
    thermal: [
      mk(5, 'CPU temperature returned to normal'),
      mk(5, 'CPU temperature exceeded warning threshold'),
      mk(16, 'Fan 1 speed returned to normal'),
    ],
    power: laptop
      ? [
          mk(2, 'AC adapter connected: 65W'),
          mk(8, 'Battery charge started'),
          mk(14, 'Battery charge complete'),
          mk(21, 'AC adapter removed'),
        ]
      : [
          mk(2, 'AC power restored'),
          mk(11, 'AC power loss detected'),
          mk(11, 'System resumed after AC power loss'),
        ],
  }
}

interface Spec {
  id: string
  family: Model['family']
  platform: Platform
  name: string
  blurb: string
  cpu: string
  cpuCores: string
  cpuClock: string
  cpuCache: string
  ram: string
  ramSpeed: string
  ramTech: string
  slots: number
  video: string
  panel?: string
  res?: string
  wifi: string
  bios: string
  biosDate: string
  ec?: string
  storage: { label: string; value: string }[]
  battery?: SystemInfo['battery']
}

function build(s: Spec): Model {
  const r = rng(s.id)
  const laptop = s.platform === 'latitude' || s.platform === 'precision-mobile'
  const tag = Array.from({ length: 7 }, () => pick(r, TAG_CHARS)).join('')
  const sticks = s.slots
  const total = parseInt(s.ram, 10)
  const per = total / sticks
  const dimmSlots = Array.from({ length: Math.max(s.slots, 2) }, (_, i) =>
    i < sticks ? `DIMM ${i + 1}: ${per} GB` : `DIMM ${i + 1}: Not Installed`,
  )
  const info: SystemInfo = {
    biosVersion: s.bios,
    biosDate: s.biosDate,
    serviceTag: tag,
    assetTag: '',
    manufactureDate: '2025-0' + (1 + Math.floor(r() * 9)) + '-' + String(1 + Math.floor(r() * 27)).padStart(2, '0'),
    ownershipDate: '2025-0' + (1 + Math.floor(r() * 9)) + '-' + String(1 + Math.floor(r() * 27)).padStart(2, '0'),
    expressServiceCode: String(Math.floor(1e10 + r() * 9e10)),
    ecVersion: s.ec ?? '',
    meVersion: '19.0.0.' + (1000 + Math.floor(r() * 900)),
    cpu: s.cpu,
    cpuId: '0xB06A' + Math.floor(r() * 9),
    cpuCache: s.cpuCache,
    cpuCores: s.cpuCores,
    cpuClock: s.cpuClock,
    memoryInstalled: `${total} GB`,
    memoryAvailable: `${total - 0.5} GB`,
    memorySpeed: s.ramSpeed,
    memoryChannel: sticks > 1 ? 'Dual Channel' : 'Single Channel',
    memoryTech: s.ramTech,
    dimmSlots,
    video: s.video,
    panel: s.panel ?? 'Not applicable',
    nativeRes: s.res ?? 'Not applicable',
    wifi: s.wifi,
    audio: 'Realtek ALC3254 (synthetic)',
    bluetooth: laptop ? 'Intel Bluetooth 5.4' : 'Not installed',
    lomMac: mac(r),
    passThroughMac: 'Not applicable',
    storage: s.storage,
    battery: s.battery,
    logs: logs(r, laptop),
  }
  if (laptop) info.passThroughMac = mac(r)
  return {
    id: s.id,
    family: s.family,
    platform: s.platform,
    name: s.name,
    formFactor: laptop ? 'laptop' : 'desktop',
    blurb: s.blurb,
    info,
  }
}

export const MODELS: Model[] = [
  build({
    id: 'latitude-5450',
    family: 'Latitude',
    platform: 'latitude',
    name: 'Latitude 5450',
    blurb: '14" business laptop',
    cpu: 'Intel Core Ultra 5 135U (synthetic)',
    cpuCores: '12',
    cpuClock: '1.60 GHz',
    cpuCache: '12 MB',
    ram: '16 GB',
    ramSpeed: '5600 MT/s',
    ramTech: 'DDR5 SODIMM',
    slots: 2,
    video: 'Intel Graphics',
    panel: 'BOE 14" FHD (synthetic)',
    res: '1920 x 1080',
    wifi: 'Intel Wi-Fi 6E AX211',
    bios: '1.11.1',
    biosDate: '2026-02-13',
    ec: '1.8.0',
    storage: [{ label: 'M.2 PCIe SSD-0', value: 'SYNTH NVMe 512GB (synthetic)' }],
    battery: { primary: 'Primary Battery', health: 'Excellent', state: 'Charging' },
  }),
  build({
    id: 'latitude-7450',
    family: 'Latitude',
    platform: 'latitude',
    name: 'Latitude 7450',
    blurb: '14" premium business laptop',
    cpu: 'Intel Core Ultra 7 165U (synthetic)',
    cpuCores: '12',
    cpuClock: '1.70 GHz',
    cpuCache: '12 MB',
    ram: '32 GB',
    ramSpeed: '6400 MT/s',
    ramTech: 'LPDDR5x',
    slots: 2,
    video: 'Intel Graphics',
    panel: 'AUO 14" QHD+ (synthetic)',
    res: '2560 x 1600',
    wifi: 'Intel Wi-Fi 7 BE200',
    bios: '1.12.0',
    biosDate: '2026-03-05',
    ec: '1.9.0',
    storage: [{ label: 'M.2 PCIe SSD-0', value: 'SYNTH NVMe 1TB (synthetic)' }],
    battery: { primary: 'Primary Battery', health: 'Excellent', state: 'Charging' },
  }),
  build({
    id: 'optiplex-7020-micro',
    family: 'OptiPlex',
    platform: 'optiplex-micro',
    name: 'OptiPlex 7020 Micro',
    blurb: 'Micro form factor desktop',
    cpu: 'Intel Core i5-14500T (synthetic)',
    cpuCores: '14',
    cpuClock: '1.70 GHz',
    cpuCache: '24 MB',
    ram: '16 GB',
    ramSpeed: '4800 MT/s',
    ramTech: 'DDR5 SODIMM',
    slots: 2,
    video: 'Intel UHD Graphics 770',
    wifi: 'Intel Wi-Fi 6E AX211',
    bios: '1.9.0',
    biosDate: '2026-01-22',
    storage: [{ label: 'M.2 PCIe SSD-0', value: 'SYNTH NVMe 256GB (synthetic)' }],
  }),
  build({
    id: 'optiplex-7020-tower',
    family: 'OptiPlex',
    platform: 'optiplex-tower',
    name: 'OptiPlex 7020 Tower',
    blurb: 'Tower desktop',
    cpu: 'Intel Core i7-14700 (synthetic)',
    cpuCores: '20',
    cpuClock: '2.10 GHz',
    cpuCache: '33 MB',
    ram: '32 GB',
    ramSpeed: '4800 MT/s',
    ramTech: 'DDR5 UDIMM',
    slots: 2,
    video: 'Intel UHD Graphics 770',
    wifi: 'Intel Wi-Fi 6E AX211',
    bios: '1.9.0',
    biosDate: '2026-01-22',
    storage: [
      { label: 'M.2 PCIe SSD-0', value: 'SYNTH NVMe 512GB (synthetic)' },
      { label: 'SATA-0', value: 'SYNTH SATA HDD 1TB (synthetic)' },
    ],
  }),
  build({
    id: 'precision-3590',
    family: 'Precision',
    platform: 'precision-mobile',
    name: 'Precision 3590',
    blurb: '16" mobile workstation',
    cpu: 'Intel Core Ultra 7 155H (synthetic)',
    cpuCores: '16',
    cpuClock: '1.40 GHz',
    cpuCache: '24 MB',
    ram: '32 GB',
    ramSpeed: '5600 MT/s',
    ramTech: 'DDR5 SODIMM',
    slots: 2,
    video: 'NVIDIA RTX 2000 Ada (synthetic)',
    panel: 'LGD 16" FHD+ (synthetic)',
    res: '1920 x 1200',
    wifi: 'Intel Wi-Fi 6E AX211',
    bios: '1.10.0',
    biosDate: '2026-02-27',
    ec: '1.5.0',
    storage: [{ label: 'M.2 PCIe SSD-0', value: 'SYNTH NVMe 512GB (synthetic)' }],
    battery: { primary: 'Primary Battery', health: 'Excellent', state: 'Charging' },
  }),
  build({
    id: 'precision-3680',
    family: 'Precision',
    platform: 'precision-tower',
    name: 'Precision 3680 Tower',
    blurb: 'Tower workstation',
    cpu: 'Intel Core i9-14900K (synthetic)',
    cpuCores: '24',
    cpuClock: '3.20 GHz',
    cpuCache: '36 MB',
    ram: '64 GB',
    ramSpeed: '5600 MT/s',
    ramTech: 'DDR5 UDIMM',
    slots: 4,
    video: 'NVIDIA RTX A2000 (synthetic)',
    wifi: 'Intel Wi-Fi 6E AX210',
    bios: '1.8.0',
    biosDate: '2026-01-08',
    storage: [
      { label: 'M.2 PCIe SSD-0', value: 'SYNTH NVMe 1TB (synthetic)' },
      { label: 'SATA-0', value: 'SYNTH SATA SSD 2TB (synthetic)' },
    ],
  }),
]

export const getModel = (id: string | null): Model | undefined => MODELS.find((m) => m.id === id)
