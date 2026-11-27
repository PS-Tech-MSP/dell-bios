/** Hardware platform; settings use this in `appliesTo`. */
export type Platform =
  | 'latitude'
  | 'precision-mobile'
  | 'optiplex-micro'
  | 'optiplex-tower'
  | 'precision-tower'

export type Family = 'Latitude' | 'OptiPlex' | 'Precision'

export type ControlType =
  | 'toggle' // ON / OFF (boolean)
  | 'radio' // radio group (string)
  | 'dropdown' // select (string)
  | 'text' // editable text (string)
  | 'readonly' // read-only value (string)
  | 'button' // action button (opens a dialog / runs an action)
  | 'bootorder' // reorderable boot list (string[])
  | 'password' // password status + Set/Change/Delete buttons
  | 'slider' // numeric slider (min/max/step)
  | 'table' // read-only table (event logs), data comes from model info

export type Value = string | boolean | string[]

export interface Option {
  value: string
  label: string
  /** Optional extra help shown when this option is selected. */
  hint?: string
}

/** Setting is only editable when the referenced setting currently has one of `value`. */
export interface Dependency {
  id: string
  value: Value | Value[]
  /** Shown in the help panel when the setting is greyed out. */
  reason: string
}

export type ButtonAction =
  | 'clear-tpm'
  | 'clear-secure-boot-keys'
  | 'restore-secure-boot-keys'
  | 'add-boot-option'
  | 'clear-bios-log'
  | 'clear-thermal-log'
  | 'clear-power-log'
  | 'run-diagnostics'
  | 'noop'

export interface Setting {
  id: string
  sectionId: string
  /** Heading the setting is grouped under inside the section. */
  group: string
  label: string
  control: ControlType
  help: string
  options?: Option[]
  /** Default value for BIOS Defaults. For `readonly`, the displayed text. */
  default: Value
  appliesTo: Platform[]
  /** Hidden when "Advanced Setup" is OFF. */
  advanced?: boolean
  /** false = could not be confirmed in a Dell manual; see README. */
  verified: boolean
  dependsOn?: Dependency[]
  action?: ButtonAction
  buttonLabel?: string
  /** Text field constraints. */
  maxLength?: number
  /** Which stored password this `password` control manages. */
  passwordKind?: 'admin' | 'system' | 'nvme'
  /** If set on a readonly, the value comes from model system info (key). */
  infoKey?: string
  min?: number
  max?: number
  step?: number
  unit?: string
}

export interface Section {
  id: string
  label: string
  /** Optional restriction, otherwise shown on every platform. */
  appliesTo?: Platform[]
}

export interface LogEntry {
  date: string
  time: string
  description: string
}

export interface SystemInfo {
  biosVersion: string
  biosDate: string
  serviceTag: string
  assetTag: string
  manufactureDate: string
  ownershipDate: string
  expressServiceCode: string
  ecVersion: string
  meVersion: string
  cpu: string
  cpuId: string
  cpuCache: string
  cpuCores: string
  cpuClock: string
  memoryInstalled: string
  memoryAvailable: string
  memorySpeed: string
  memoryChannel: string
  memoryTech: string
  dimmSlots: string[]
  video: string
  panel: string
  nativeRes: string
  wifi: string
  audio: string
  bluetooth: string
  lomMac: string
  passThroughMac: string
  storage: { label: string; value: string }[]
  battery?: { primary: string; health: string; state: string }
  logs: {
    bios: LogEntry[]
    thermal: LogEntry[]
    power: LogEntry[]
  }
}

export interface Model {
  id: string
  family: Family
  platform: Platform
  name: string
  /** laptop shows battery/lid/etc. */
  formFactor: 'laptop' | 'desktop'
  blurb: string
  info: SystemInfo
}
