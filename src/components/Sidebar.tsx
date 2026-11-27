import { useRef } from 'react'
import { SECTIONS } from '../data/settings'
import { useStore } from '../state/store'
import { SECTION_ICONS } from './Icons'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const active = useStore((s) => s.activeSection)
  const setActive = useStore((s) => s.setActiveSection)
  const pending = useStore((s) => s.pending)
  const ref = useRef<HTMLElement>(null)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const i = SECTIONS.findIndex((s) => s.id === active)
    const n = SECTIONS[Math.max(0, Math.min(SECTIONS.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))]
    setActive(n.id)
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>(`[data-sec="${n.id}"]`)?.focus())
  }

  return (
    <nav className={styles.nav} aria-label="BIOS sections" ref={ref} onKeyDown={onKeyDown}>
      {SECTIONS.map((s) => {
        const count = Object.keys(pending).filter((k) => k.startsWith(s.id + '.')).length
        const Icon = SECTION_ICONS[s.id]
        return (
          <button
            key={s.id}
            data-sec={s.id}
            tabIndex={s.id === active ? 0 : -1}
            aria-current={s.id === active ? 'page' : undefined}
            className={`${styles.item} ${s.id === active ? styles.active : ''}`}
            onClick={() => setActive(s.id)}
          >
            {Icon && <Icon />}
            <span className={styles.label}>{s.label}</span>
            {count > 0 && <span className={styles.dot} title={`${count} pending change(s)`} />}
          </button>
        )
      })}
    </nav>
  )
}
