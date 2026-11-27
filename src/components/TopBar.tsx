import { useEffect, useMemo, useRef, useState } from 'react'
import { SECTIONS, SETTINGS } from '../data/settings'
import { useStore, type Bios } from '../state/store'
import { KeyIcon, LockIcon, SearchIcon, ViewAllIcon } from './Icons'
import { Logo } from './Logo'
import { PasswordDialog } from './PasswordDialog'
import { Switch } from './Switch'
import styles from './TopBar.module.css'

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileLabel}>{label}</span>
      {children}
    </div>
  )
}

function AdminTile({ bios }: { bios: Bios }) {
  const setPassword = useStore((s) => s.setPassword)
  const setAdminUnlocked = useStore((s) => s.setAdminUnlocked)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const [setting, setSetting] = useState(false)
  const current = bios.profile.passwords.admin
  const g = bios.get

  const unlock = () => {
    if (pw === current) {
      setAdminUnlocked(true)
      setPw('')
      setErr(false)
    } else setErr(true)
  }

  if (!current) {
    return (
      <>
        <Tile label="Admin Password">
          <button type="button" className={styles.tileBtn} onClick={() => setSetting(true)}>
            <KeyIcon /> Not set. Set
          </button>
        </Tile>
        {setting && (
          <PasswordDialog
            mode="set"
            title="Set Admin Password"
            rules={{
              minLen: Number(g('passwords.min') ?? 4),
              upper: g('passwords.upper') === true,
              lower: g('passwords.lower') === true,
              digit: g('passwords.digit') === true,
              special: g('passwords.special') === true,
            }}
            onCancel={() => setSetting(false)}
            onSubmit={(p) => {
              setPassword('admin', p)
              setAdminUnlocked(true)
              setSetting(false)
            }}
          />
        )}
      </>
    )
  }
  if (bios.locked) {
    return (
      <Tile label="Admin Password">
        <form
          className={styles.unlock}
          onSubmit={(e) => {
            e.preventDefault()
            unlock()
          }}
        >
          <LockIcon />
          <input
            type="password"
            autoComplete="off"
            placeholder="Enter password to unlock"
            aria-label="Admin Password"
            aria-invalid={err}
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              setErr(false)
            }}
          />
          <button type="submit" className={styles.tileBtn}>
            Unlock
          </button>
        </form>
        {err && (
          <span className={styles.err} role="alert">
            Incorrect password
          </span>
        )}
      </Tile>
    )
  }
  return (
    <Tile label="Admin Password">
      <span className={styles.unlocked}>
        <KeyIcon /> Unlocked
      </span>
    </Tile>
  )
}

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
        <SearchIcon />
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

export function TopBar({ bios }: { bios: Bios }) {
  const advanced = useStore((s) => s.advanced)
  const setAdvanced = useStore((s) => s.setAdvanced)
  const helpText = useStore((s) => s.helpText)
  const setHelpText = useStore((s) => s.setHelpText)
  const searchOpen = useStore((s) => s.searchOpen)
  const setSearchOpen = useStore((s) => s.setSearchOpen)
  const setViewAllOpen = useStore((s) => s.setViewAllOpen)
  const hasQuery = useStore((s) => s.searchQuery.trim().length >= 2)

  return (
    <header className={styles.bar}>
      <div className={styles.logo}>
        <Logo height={30} />
      </div>
      <div className={styles.controls}>
        <Tile label="Advanced Setup">
          <Switch checked={advanced} onChange={setAdvanced} label="Advanced Setup" />
        </Tile>
        <Tile label="Help Text">
          <Switch checked={helpText} onChange={setHelpText} label="Help Text" />
        </Tile>
        <AdminTile bios={bios} />
      </div>
      <div className={styles.id}>
        <span>{bios.model.name}</span>
        <span>Service Tag: {bios.model.info.serviceTag} (synthetic)</span>
      </div>
      <div className={styles.icons}>
        <button
          type="button"
          data-search-toggle
          className={`${styles.iconBtn} ${searchOpen ? styles.iconOn : ''}`}
          aria-label="Search"
          aria-expanded={searchOpen}
          title="Search"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <SearchIcon width={20} height={20} />
          {hasQuery && !searchOpen && <span className={styles.badge} />}
        </button>
        <button type="button" className={styles.iconBtn} aria-label="View All" title="View All" onClick={() => setViewAllOpen(true)}>
          <ViewAllIcon width={20} height={20} />
        </button>
        {searchOpen && <SearchPanel bios={bios} />}
      </div>
    </header>
  )
}
