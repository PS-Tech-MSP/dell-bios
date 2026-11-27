import { useEffect, useMemo, useRef } from 'react'
import { SECTIONS, SETTINGS } from '../data/settings'
import { useStore, type Bios } from '../state/store'
import { CloseIcon } from './Icons'
import styles from './ViewAll.module.css'

/** Single index of every section and sub-section; each entry jumps straight to it. */
export function ViewAll({ bios }: { bios: Bios }) {
  const setOpen = useStore((s) => s.setViewAllOpen)
  const setActive = useStore((s) => s.setActiveSection)
  const jumpToGroup = useStore((s) => s.jumpToGroup)
  const ref = useRef<HTMLDivElement>(null)

  const index = useMemo(
    () =>
      SECTIONS.map((sec) => {
        const groups: string[] = []
        for (const s of SETTINGS) if (s.sectionId === sec.id && bios.visible(s) && !groups.includes(s.group)) groups.push(s.group)
        return { sec, groups }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bios.model, bios.advanced],
  )

  useEffect(() => ref.current?.querySelector<HTMLElement>('a,button')?.focus(), [])

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div
        ref={ref}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="View All"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            setOpen(false)
          }
        }}
      >
        <header>
          <h2>View All</h2>
          <button type="button" aria-label="Close" className={styles.close} onClick={() => setOpen(false)}>
            <CloseIcon width={18} height={18} />
          </button>
        </header>
        <div className={styles.grid}>
          {index.map(({ sec, groups }) => (
            <section key={sec.id}>
              <h3>
                <a
                  href={`#${sec.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setActive(sec.id)
                    setOpen(false)
                  }}
                >
                  {sec.label}
                </a>
              </h3>
              <ul>
                {groups.map((g) => (
                  <li key={g}>
                    <a
                      href={`#${sec.id}-${g}`}
                      onClick={(e) => {
                        e.preventDefault()
                        jumpToGroup(sec.id, g)
                      }}
                    >
                      {g}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
