import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { defaultsFor } from '../data/settings'
import { getModel } from '../data/models'
import type { Value } from '../data/types'

export type Screen = 'modelSelect' | 'splash' | 'bootMenu' | 'biosSetup'
export type PasswordKind = 'admin' | 'system' | 'nvme'
export type LogKey = 'bios' | 'thermal' | 'power'

export const STORAGE_KEY = 'pst-bios-sim'

/** localStorage wrapper that never throws (private mode, blocked storage, quota). */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      /* fail silently */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* fail silently */
    }
  },
}

export type Values = Record<string, Value>

/** Per-model persisted BIOS state, so each model remembers its own settings. */
export interface Profile {
  applied: Values
  customUser: Values | null
  passwords: Record<PasswordKind, string | null>
  clearedLogs: Record<LogKey, boolean>
}

const freshProfile = (modelId: string): Profile => {
  const model = getModel(modelId)
  return {
    applied: model ? defaultsFor(model) : {},
    customUser: null,
    passwords: { admin: null, system: null, nvme: null },
    clearedLogs: { bios: false, thermal: false, power: false },
  }
}

export interface Change {
  id: string
  label: string
  from: Value
  to: Value
}

interface State {
  screen: Screen
  modelId: string | null
  profiles: Record<string, Profile>
  pending: Values
  advanced: boolean
  activeSection: string
  /** Setting to scroll to/flash after a search jump. */
  focusSettingId: string | null
  /** Admin password already entered this power cycle. */
  adminUnlocked: boolean
  /** Show inline help text under each setting. */
  helpText: boolean
  /** Search popover state; kept for the session so results survive clicking away. */
  searchOpen: boolean
  searchQuery: string
  viewAllOpen: boolean
  /** Group heading to scroll to after a View All jump. */
  focusGroup: string | null

  setHelpText: (v: boolean) => void
  setSearchOpen: (v: boolean) => void
  setSearchQuery: (v: string) => void
  setViewAllOpen: (v: boolean) => void
  jumpToGroup: (sectionId: string, group: string) => void
  clearFocusGroup: () => void
  setScreen: (s: Screen) => void
  selectModel: (id: string) => void
  setPending: (id: string, value: Value) => void
  applyChanges: () => void
  discardChanges: () => void
  restoreDefaults: () => void
  restoreCustom: () => boolean
  saveCustom: () => void
  setAdvanced: (v: boolean) => void
  setActiveSection: (id: string) => void
  jumpTo: (sectionId: string, settingId: string) => void
  clearFocus: () => void
  setPassword: (kind: PasswordKind, pw: string | null) => void
  setAdminUnlocked: (v: boolean) => void
  clearLog: (k: LogKey) => void
  resetSimulator: () => void
}

const sameValue = (a: Value | undefined, b: Value | undefined) =>
  JSON.stringify(a) === JSON.stringify(b)

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      screen: 'modelSelect',
      modelId: null,
      profiles: {},
      pending: {},
      advanced: false,
      activeSection: 'overview',
      focusSettingId: null,
      adminUnlocked: false,
      helpText: true,
      searchOpen: false,
      searchQuery: '',
      viewAllOpen: false,
      focusGroup: null,

      setHelpText: (helpText) => set({ helpText }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setViewAllOpen: (viewAllOpen) => set({ viewAllOpen }),
      jumpToGroup: (activeSection, focusGroup) => set({ activeSection, focusGroup, viewAllOpen: false }),
      clearFocusGroup: () => set({ focusGroup: null }),

      setScreen: (screen) => set({ screen }),

      selectModel: (id) =>
        set((s) => ({
          modelId: id,
          profiles: s.profiles[id] ? s.profiles : { ...s.profiles, [id]: freshProfile(id) },
          pending: {},
          activeSection: 'overview',
          adminUnlocked: false,
          screen: 'splash',
        })),

      setPending: (id, value) =>
        set((s) => {
          const applied = s.modelId ? s.profiles[s.modelId]?.applied[id] : undefined
          const pending = { ...s.pending }
          if (sameValue(applied, value)) delete pending[id]
          else pending[id] = value
          return { pending }
        }),

      applyChanges: () =>
        set((s) => {
          if (!s.modelId) return {}
          const p = s.profiles[s.modelId]
          const applied = { ...p.applied, ...s.pending }
          const clearedLogs = { ...p.clearedLogs }
          for (const k of ['bios', 'thermal', 'power'] as LogKey[]) {
            if (applied[`logs.${k}-clear`] === 'Clear Log') {
              clearedLogs[k] = true
              applied[`logs.${k}-clear`] = 'Keep Log'
            }
          }
          const profile: Profile = { ...p, applied, clearedLogs }
          return { profiles: { ...s.profiles, [s.modelId]: profile }, pending: {} }
        }),

      discardChanges: () => set({ pending: {} }),

      restoreDefaults: () =>
        set((s) => {
          const model = getModel(s.modelId)
          if (!model || !s.modelId) return {}
          const defs = defaultsFor(model)
          const applied = s.profiles[s.modelId].applied
          const pending: Values = {}
          for (const k of Object.keys(defs)) if (!sameValue(defs[k], applied[k])) pending[k] = defs[k]
          return { pending }
        }),

      restoreCustom: () => {
        const s = get()
        if (!s.modelId) return false
        const p = s.profiles[s.modelId]
        if (!p.customUser) return false
        const pending: Values = {}
        for (const k of Object.keys(p.customUser))
          if (!sameValue(p.customUser[k], p.applied[k])) pending[k] = p.customUser[k]
        set({ pending })
        return true
      },

      saveCustom: () =>
        set((s) => {
          if (!s.modelId) return {}
          const p = s.profiles[s.modelId]
          return {
            profiles: { ...s.profiles, [s.modelId]: { ...p, customUser: { ...p.applied, ...s.pending } } },
          }
        }),

      setAdvanced: (advanced) => set({ advanced }),
      setActiveSection: (activeSection) => set({ activeSection }),
      jumpTo: (activeSection, focusSettingId) => set({ activeSection, focusSettingId, searchOpen: false, viewAllOpen: false }),
      clearFocus: () => set({ focusSettingId: null }),

      setPassword: (kind, pw) =>
        set((s) => {
          if (!s.modelId) return {}
          const p = s.profiles[s.modelId]
          return {
            profiles: {
              ...s.profiles,
              [s.modelId]: { ...p, passwords: { ...p.passwords, [kind]: pw } },
            },
          }
        }),

      setAdminUnlocked: (adminUnlocked) => set({ adminUnlocked }),

      clearLog: (k) =>
        set((s) => {
          if (!s.modelId) return {}
          const p = s.profiles[s.modelId]
          return {
            profiles: {
              ...s.profiles,
              [s.modelId]: { ...p, clearedLogs: { ...p.clearedLogs, [k]: true } },
            },
          }
        }),

      resetSimulator: () => {
        safeStorage.removeItem(STORAGE_KEY)
        set({
          screen: 'modelSelect',
          modelId: null,
          profiles: {},
          pending: {},
          advanced: false,
          activeSection: 'overview',
          focusSettingId: null,
          adminUnlocked: false,
          helpText: true,
          searchOpen: false,
          searchQuery: '',
          viewAllOpen: false,
          focusGroup: null,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      partialize: (s) => ({ modelId: s.modelId, profiles: s.profiles, advanced: s.advanced, helpText: s.helpText }),
    },
  ),
)

/** Convenience selectors */
export const useProfile = (): Profile | null =>
  useStore((s) => (s.modelId ? (s.profiles[s.modelId] ?? null) : null))

/* ------------------------------------------------------------------ */
/* Effective values, dependency checks and visibility                  */
/* ------------------------------------------------------------------ */
import { appliesTo, settingById, SETTINGS } from '../data/settings'
import type { Model, Setting } from '../data/types'

export interface Bios {
  model: Model
  profile: Profile
  pending: Values
  advanced: boolean
  get: (id: string) => Value | undefined
  /** null when enabled, otherwise the reason it is greyed out. */
  disabledReason: (s: Setting) => string | null
  visible: (s: Setting) => boolean
  /** An Admin Password is set and has not been entered this session: every control is locked. */
  locked: boolean
  changes: Change[]
}

const matches = (v: Value | undefined, want: Value | Value[]) => {
  const wants = Array.isArray(want) && typeof want[0] !== 'undefined' && !Array.isArray(want[0]) ? (want as Value[]) : [want as Value]
  return wants.some((w) => JSON.stringify(w) === JSON.stringify(v))
}

export function useBios(): Bios | null {
  const modelId = useStore((s) => s.modelId)
  const profiles = useStore((s) => s.profiles)
  const pending = useStore((s) => s.pending)
  const advanced = useStore((s) => s.advanced)
  const adminUnlocked = useStore((s) => s.adminUnlocked)
  const model = getModel(modelId)
  const profile = modelId ? profiles[modelId] : undefined
  if (!model || !profile) return null

  const get = (id: string): Value | undefined => {
    if (id.startsWith('pw:')) return !!profile.passwords[id.slice(3) as PasswordKind]
    if (id in pending) return pending[id]
    if (id in profile.applied) return profile.applied[id]
    return settingById(id)?.default
  }

  const disabledReason = (s: Setting): string | null => {
    for (const d of s.dependsOn ?? []) {
      if (!d.id.startsWith('pw:')) {
        const ref = settingById(d.id)
        if (!ref || !appliesTo(ref, model.platform)) continue
      }
      if (!matches(get(d.id), d.value)) return d.reason
    }
    return null
  }

  const visible = (s: Setting) => appliesTo(s, model.platform) && (advanced || !s.advanced)

  const changes: Change[] = Object.keys(pending).map((id) => ({
    id,
    label: SETTINGS.find((x) => x.id === id)?.label ?? id,
    from: profile.applied[id] ?? settingById(id)?.default ?? '',
    to: pending[id],
  }))

  const locked = !!profile.passwords.admin && !adminUnlocked

  return { model, profile, pending, advanced, get, disabledReason, visible, locked, changes }
}

export function formatValue(v: Value | undefined): string {
  if (typeof v === 'boolean') return v ? 'ON' : 'OFF'
  if (Array.isArray(v)) return v.join(' › ')
  return v === '' || v === undefined ? '(blank)' : String(v)
}
