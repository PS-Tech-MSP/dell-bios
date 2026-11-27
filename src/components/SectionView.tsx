import { useEffect, useMemo, useRef } from 'react'
import { SECTIONS, SETTINGS } from '../data/settings'
import { useStore, type Bios } from '../state/store'
import { SettingControl } from './SettingControl'
import styles from './SectionView.module.css'

interface Props {
  sectionId: string
  bios: Bios
}

export function SectionView({ sectionId, bios }: Props) {
  const focusId = useStore((s) => s.focusSettingId)
  const clearFocus = useStore((s) => s.clearFocus)
  const helpText = useStore((s) => s.helpText)
  const focusGroup = useStore((s) => s.focusGroup)
  const clearFocusGroup = useStore((s) => s.clearFocusGroup)
  const ref = useRef<HTMLDivElement>(null)
  const section = SECTIONS.find((s) => s.id === sectionId)

  const groups = useMemo(() => {
    const out: { name: string; items: typeof SETTINGS }[] = []
    for (const s of SETTINGS) {
      if (s.sectionId !== sectionId || !bios.visible(s)) continue
      let g = out.find((x) => x.name === s.group)
      if (!g) out.push((g = { name: s.group, items: [] }))
      g.items.push(s)
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, bios.model, bios.advanced])

  // Scroll to a setting after a search jump, and briefly highlight it.
  useEffect(() => {
    if (!focusId) return
    const row = ref.current?.querySelector<HTMLElement>(`[data-setting="${focusId}"]`)
    if (row) {
      row.scrollIntoView({ block: 'center' })
      row.classList.add(styles.flash)
      row.querySelector<HTMLElement>('input,select,button')?.focus({ preventScroll: true })
      const t = setTimeout(() => row.classList.remove(styles.flash), 1800)
      clearFocus()
      return () => clearTimeout(t)
    }
    clearFocus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, sectionId])

  useEffect(() => {
    if (focusGroup) return
    ref.current?.scrollTo({ top: 0 })
  }, [sectionId, focusGroup])

  // Scroll to a sub-section heading after a View All jump.
  useEffect(() => {
    if (!focusGroup) return
    const el = Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-group]') ?? []).find((e) => e.dataset.group === focusGroup)
    el?.scrollIntoView({ block: 'start' })
    clearFocusGroup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusGroup, sectionId])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const t = e.target as HTMLElement
    // let native controls keep their own arrow behaviour
    if (t.matches('select,input[type=radio],input[type=range],input[type=text],[role=option]')) return
    const els = Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-nav]:not(:disabled), select:not(:disabled), input:not(:disabled)') ?? [])
    const i = els.indexOf(t)
    if (i < 0) return
    e.preventDefault()
    els[Math.max(0, Math.min(els.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))]?.focus()
  }

  return (
    <div className={styles.main} ref={ref} onKeyDown={onKeyDown}>
      <h1 className={styles.title}>
        {section?.label}
        {(sectionId === 'overview' || sectionId === 'about') && <span className={styles.synth}>(synthetic)</span>}
      </h1>
      {bios.locked && (
        <p className={styles.locked} role="status">
          Settings are locked. Enter the Admin Password in the tile at the top left to make changes.
        </p>
      )}
      {groups.length === 0 && <p className={styles.none}>No settings in this section for {bios.model.name}.</p>}
      {groups.map((g) => (
        <section key={g.name} className={styles.group} aria-label={g.name} data-group={g.name}>
          <h2>{g.name}</h2>
          {g.items.map((s) => {
            const reason = bios.disabledReason(s)
            const changed = s.id in bios.pending
            const wide = s.control === 'table' || s.control === 'bootorder'
            const inline = s.control === 'toggle' || s.control === 'readonly' || s.control === 'button' || s.control === 'password'
            const showHelp = helpText || !!reason
            return (
              <div
                key={s.id}
                data-setting={s.id}
                className={`${styles.row} ${inline ? styles.inline : ''} ${changed ? styles.changed : ''} ${reason || bios.locked ? styles.off : ''}`}
              >
                <div className={styles.text}>
                  <label className={styles.label} htmlFor={`ctl-${s.id}`}>
                    {s.label}
                  </label>
                  {helpText && <p className={styles.help}>{s.help}</p>}
                  {reason && <p className={styles.reason}>Unavailable: {reason}</p>}
                  {helpText && !s.verified && <p className={styles.trainer}>Trainer note: name, options or default not confirmed in a Dell manual.</p>}
                </div>
                <div className={`${styles.ctl} ${wide ? styles.wideCtl : ''}`} data-has-help={showHelp}>
                  <SettingControl setting={s} bios={bios} disabled={!!reason || bios.locked} />
                </div>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
