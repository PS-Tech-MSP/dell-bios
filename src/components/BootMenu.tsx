import { useEffect, useMemo, useRef, useState } from 'react'
import { getModel } from '../data/models'
import { useStore } from '../state/store'
import { ConfirmDialog } from './ConfirmDialog'
import { Logo } from './Logo'
import ui from './ui.module.css'
import styles from './BootMenu.module.css'

const TASKS = [
  { id: 'setup', title: 'BIOS SETUP', text: 'Configure BIOS options and control how your system functions.' },
  { id: 'diag', title: 'DIAGNOSTICS', text: 'Run system tests to identify any issues.' },
  { id: 'update', title: 'BIOS UPDATE', text: 'Search for and install the latest BIOS updates from various services.' },
  { id: 'recovery', title: 'SupportAssist OS Recovery', text: 'Analyze, repair and restore your system.' },
  { id: 'flash', title: 'BIOS Flash Update - Remote', text: 'BIOS and Firmware Update Over-the-Air' },
  { id: 'device', title: 'Device Configuration', text: 'Configure device settings' },
] as const

const HTTPS = 'UEFI HTTPs Boot'

const DriveIcon = () => (
  <svg className={styles.icon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="3" y="7" width="18" height="10" />
    <path d="M6 14h6" />
    <circle cx="17" cy="12" r="1" />
  </svg>
)
const NetworkIcon = () => (
  <svg className={styles.icon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="9" y="3" width="6" height="5" />
    <rect x="3" y="16" width="6" height="5" />
    <rect x="15" y="16" width="6" height="5" />
    <path d="M12 8v4M6 16v-4h12v4" />
  </svg>
)

export function BootMenu() {
  const modelId = useStore((s) => s.modelId)
  const profile = useStore((s) => (s.modelId ? s.profiles[s.modelId] : null))
  const setScreen = useStore((s) => s.setScreen)
  const setAdminUnlocked = useStore((s) => s.setAdminUnlocked)
  const model = getModel(modelId)
  const [message, setMessage] = useState<string | null>(null)
  const [task, setTask] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)

  const devices = useMemo(() => {
    if (!model) return []
    const applied = profile?.applied ?? {}
    const order = (applied['boot.order'] as string[] | undefined) ?? ['Windows Boot Manager']
    const nvme = `UEFI RST ${model.info.storage[0]?.value.replace(' (synthetic)', '') ?? 'NVMe'} ${model.info.serviceTag}${model.id.length}0042`
    // Network entries are represented by the single HTTPs row below.
    const list = order.filter((d) => !d.startsWith('Onboard NIC'))
    if (!list.some((d) => d.startsWith('UEFI RST'))) {
      const i = list.indexOf('Windows Boot Manager')
      list.splice(i + 1, 0, nvme)
    }
    const netStack = applied['connection.uefi-net']
    if (applied['connection.http'] !== false && netStack !== 'Disabled') list.push(HTTPS)
    return list
  }, [model, profile])

  const exit = () => setScreen('splash')
  const startTask = (id: string) => {
    if (id === 'setup') {
      setAdminUnlocked(false)
      setScreen('biosSetup')
    } else setTask(id)
  }
  const boot = (name: string) => setMessage(`Booting from ${name}... (simulated). Returning to the power-on screen.`)

  // Arrow-key focus movement across device rows, tiles and EXIT.
  useEffect(() => {
    if (message) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (task) setTask(null)
        else exit()
        return
      }
      if (task || !e.key.startsWith('Arrow')) return
      const el = root.current
      if (!el) return
      const rows = Array.from(el.querySelectorAll<HTMLElement>('[data-kind="row"]'))
      const tiles = Array.from(el.querySelectorAll<HTMLElement>('[data-kind="tile"]'))
      const exitBtn = el.querySelector<HTMLElement>('[data-kind="exit"]')!
      const cur = document.activeElement as HTMLElement
      e.preventDefault()
      const kind = cur?.dataset?.kind
      let next: HTMLElement | undefined
      if (kind === 'row') {
        const i = rows.indexOf(cur)
        if (e.key === 'ArrowDown') next = rows[i + 1]
        else if (e.key === 'ArrowUp') next = rows[i - 1]
        else if (e.key === 'ArrowRight') next = tiles[0]
      } else if (kind === 'tile') {
        const i = tiles.indexOf(cur)
        if (e.key === 'ArrowRight') next = tiles[i + 1]
        else if (e.key === 'ArrowLeft') next = i % 3 === 0 ? rows[0] : tiles[i - 1]
        else if (e.key === 'ArrowDown') next = tiles[i + 3] ?? exitBtn
        else if (e.key === 'ArrowUp') next = tiles[i - 3]
      } else if (kind === 'exit') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tiles[tiles.length - 1]
      } else next = rows[0] ?? tiles[0]
      next?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, task])

  if (!model) return null
  const header = (
    <header className={styles.header}>
      <Logo height={40} />
      <h1 className={styles.model}>{model.name}</h1>
      <dl className={styles.ids}>
        <div>
          <dt>Service Tag</dt>
          <dd>{model.info.serviceTag}</dd>
        </div>
        <div>
          <dt>BIOS Revision</dt>
          <dd>{model.info.biosVersion}</dd>
        </div>
      </dl>
    </header>
  )

  if (task) {
    const t = TASKS.find((x) => x.id === task)
    return (
      <div className={`${ui.screen} ${styles.wrap}`} ref={root}>
        {header}
        <div className={styles.placeholder}>
          <h2 className={styles.h2}>{t?.title}</h2>
          <p className={styles.text}>This task is not simulated in this training tool.</p>
          <button className={`${ui.btn} ${styles.back}`} autoFocus onClick={() => setTask(null)}>
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${ui.screen} ${styles.wrap}`} ref={root}>
      {header}
      <div className={styles.body}>
        <aside className={styles.left}>
          <h2 className={styles.h2}>One-Time Boot Settings</h2>
          <p className={styles.text}>Control the boot flow for the SupportAssist OS Recovery Tool.</p>
          <p className={styles.text}>
            <b className={styles.note}>NOTE:</b>
            <span className={styles.noteText}>Once a system and/or admin password is set, the system will always prompt for system and/or admin password during boot.</span>
          </p>
          <h3 className={styles.h3}>UEFI Boot Devices</h3>
          <div className={styles.devices}>
            {devices.map((d) => (
              <button key={d} data-kind="row" className={styles.device} onClick={() => boot(d)}>
                {d === HTTPS ? <NetworkIcon /> : <DriveIcon />}
                <span>{d}</span>
              </button>
            ))}
          </div>
        </aside>
        <section className={styles.right}>
          <h2 className={styles.h2}>Pre-Boot Tasks</h2>
          <p className={styles.text}>Change important BIOS settings on your system, configure how your device works and troubleshoot issues using this interface.</p>
          <div className={styles.tiles}>
            {TASKS.map((t) => (
              <button key={t.id} data-kind="tile" className={styles.tile} onClick={() => startTask(t.id)}>
                <strong>{t.title}</strong>
                <span>{t.text}</span>
              </button>
            ))}
          </div>
          <div className={styles.exitRow}>
            <button data-kind="exit" className={`${ui.btn} ${styles.exit}`} onClick={exit}>
              Exit
            </button>
          </div>
        </section>
      </div>
      {message && (
        <ConfirmDialog title="One-Time Boot Menu" onCancel={exit} actions={[{ label: 'OK', kind: 'primary', onClick: exit }]}>
          <p className={styles.msg}>{message}</p>
        </ConfirmDialog>
      )}
    </div>
  )
}
