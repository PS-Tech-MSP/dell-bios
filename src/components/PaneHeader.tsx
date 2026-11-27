import { useEffect, useMemo, useRef } from 'react'
import { SECTIONS, SETTINGS } from '../data/settings'
import { useStore, type Bios } from '../state/store'
import { SearchIcon, ViewAllIcon } from './Icons'
import styles from './PaneHeader.module.css'

function SearchPanel({ bios }: { bios: Bios }) {
  const q = useStore((s) => s.searchQuery)
  const setQ = useStore((s) => s.setSearchQuery)
  const setOpen = useStore((s) => s.setSearchOpen)
  const jumpTo = useStore((s) => s.jumpTo)
  const box = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (t.length < 2) return []
    return SETTINGS.filter((s) => bios.visible(s) && s.control !== 'table')
      .filter((s) => `${s.label} ${s.group} ${s.help}`.toLowerCase().includes(t))
      .slice(0, 30)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, bios.model, bios.advanced])

  // Click away closes the panel but keeps the query and results for the session.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!box.current?.contains(t) && !t.closest('[data-search-toggle]')) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [setOpen])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const items = Array.from(box.current?.querySelectorAll<HTMLElement>('[data-result]') ?? [])
    if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const i = items.indexOf(e.target as HTMLElement)
      if (items.length) {
        e.preventDefault()
        const n = e.key === 'ArrowDown' ? i + 1 : i - 1
        if (n < 0) box.current?.querySelector<HTMLInputElement>('input')?.focus()
        else items[Math.min(items.length - 1, n)]?.focus()
      }
    }
  }

  return (
    <div className={styles.search} ref={box} onKeyDown={onKeyDown} role="search">
      <div className={styles.searchField}>
        <input
          type="search"
          autoFocus
          placeholder="Search settings"
          aria-label="Search settings"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) jumpTo(results[0].sectionId, results[0].id)
          }}
        />
      </div>
      {q.trim().length >= 2 && (
        <div className={styles.results} role="listbox" aria-label="Search results">
          {results.length === 0 && <div className={styles.none}>No matching settings</div>}
          {results.map((s) => (
            <button key={s.id} data-result role="option" aria-selected="false" onClick={() => jumpTo(s.sectionId, s.id)}>
              <span>{s.label}</span>
              <small>
                {SECTIONS.find((x) => x.id === s.sectionId)?.label} › {s.group}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function PaneHeader({ title, bios }: { title: string; bios: Bios }) {
  const searchOpen = useStore((s) => s.searchOpen)
  const setSearchOpen = useStore((s) => s.setSearchOpen)
  const setViewAllOpen = useStore((s) => s.setViewAllOpen)
  const hasQuery = useStore((s) => s.searchQuery.trim().length >= 2)

  return (
    <header className={styles.band}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.buttons}>
        <button
          type="button"
          data-search-toggle
          className={`${styles.btn} ${searchOpen ? styles.on : ''}`}
          aria-label="Search"
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <SearchIcon width={20} height={20} />
          <span>Search</span>
          {hasQuery && !searchOpen && <i className={styles.badge} />}
        </button>
        <button type="button" className={styles.btn} aria-label="View All" onClick={() => setViewAllOpen(true)}>
          <ViewAllIcon width={20} height={20} />
          <span>View All</span>
        </button>
      </div>
      {searchOpen && <SearchPanel bios={bios} />}
    </header>
  )
}
