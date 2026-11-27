import { useRef } from 'react'
import { SECTIONS } from '../data/settings'
import { useStore, type Bios } from '../state/store'
import { Tiles } from './Tiles'
import styles from './Sidebar.module.css'

export function Sidebar({ bios }: { bios: Bios }) {
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

  const item = (s: (typeof SECTIONS)[number]) => {
    const count = Object.keys(pending).filter((k) => k.startsWith(s.id + '.')).length
    return (
      <button
        key={s.id}
        data-sec={s.id}
        tabIndex={s.id === active ? 0 : -1}
        aria-current={s.id === active ? 'page' : undefined}
        className={`${styles.item} ${s.id === active ? styles.active : ''}`}
        onClick={() => setActive(s.id)}
      >
        {s.label}
        {count > 0 && <span className={styles.dot} title={`${count} pending change(s)`} />}
      </button>
    )
  }

  return (
    <aside className={styles.left}>
      <div className={styles.model}>{bios.model.name}</div>
      <Tiles bios={bios} />
      <nav className={styles.nav} aria-label="BIOS sections" ref={ref} onKeyDown={onKeyDown}>
        <div className={styles.list}>{SECTIONS.filter((s) => s.id !== 'about').map(item)}</div>
        <div className={styles.about}>{SECTIONS.filter((s) => s.id === 'about').map(item)}</div>
      </nav>
    </aside>
  )
}
