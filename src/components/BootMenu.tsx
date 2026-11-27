import { useEffect, useRef, useState } from 'react'
import { getModel } from '../data/models'
import { useStore } from '../state/store'
import { Logo } from './Logo'
import { ConfirmDialog } from './ConfirmDialog'
import ui from './ui.module.css'
import styles from './BootMenu.module.css'

const OTHER = ['BIOS Setup', 'BIOS Flash Update', 'Diagnostics', 'SupportAssist OS Recovery', 'Exit'] as const

export function BootMenu() {
  const modelId = useStore((s) => s.modelId)
  const profile = useStore((s) => (s.modelId ? s.profiles[s.modelId] : null))
  const setScreen = useStore((s) => s.setScreen)
  const setAdminUnlocked = useStore((s) => s.setAdminUnlocked)
  const model = getModel(modelId)
  const [usb, setUsb] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const order = (profile?.applied['boot.order'] as string[] | undefined) ?? [
    'Windows Boot Manager',
    'Onboard NIC (IPv4)',
    'Onboard NIC (IPv6)',
  ]
  const uefi = usb ? [...order, 'USB Storage Device (synthetic)'] : order
  const items = [...uefi, ...OTHER]

  const choose = (name: string) => {
    if (name === 'Exit') return setScreen('splash')
    if (name === 'BIOS Setup') {
      setAdminUnlocked(false)
      return setScreen('biosSetup')
    }
    if (uefi.includes(name)) {
      setMessage(`Simulated: the system would now boot from "${name}". Returning to the power-on screen.`)
    } else {
      setMessage(`Simulated: "${name}" is not available in this training simulator.`)
    }
  }

  useEffect(() => {
    if (message) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIndex((i) => Math.min(items.length - 1, i + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIndex((i) => Math.max(0, i - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        choose(items[index])
      } else if (e.key === 'Escape') {
        setScreen('splash')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, index, items.length, usb])

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [index])

  if (!model) return null
  const row = (name: string, i: number) => (
    <div
      key={name}
      role="option"
      aria-selected={i === index}
      className={`${styles.row} ${i === index ? styles.sel : ''}`}
      onClick={() => setIndex(i)}
      onDoubleClick={() => choose(name)}
    >
      {name}
    </div>
  )

  return (
    <div className={`${ui.screen} ${styles.wrap}`}>
      <div className={styles.logo}>
        <Logo height={30} />
      </div>
      <header className={styles.band}>
        <h1>
          {model.name} <span>One-Time Boot Menu</span>
        </h1>
      </header>
      <div className={styles.panel}>
        <div ref={listRef} role="listbox" aria-label="Boot options" className={styles.list}>
          <h2>UEFI Boot Devices</h2>
          {uefi.map((n, i) => row(n, i))}
          <h2>Other Options</h2>
          {OTHER.map((n, i) => row(n, uefi.length + i))}
        </div>
        <div className={styles.foot}>
          <label className={styles.usb}>
            <input type="checkbox" checked={usb} onChange={(e) => setUsb(e.target.checked)} /> Simulate a USB device attached
          </label>
          <span className={styles.keys}>↑ ↓ select · Enter = go · Esc = back</span>
          <button className={`${ui.btn} ${ui.primary}`} onClick={() => choose(items[index])}>
            Select
          </button>
        </div>
      </div>
      {message && (
        <ConfirmDialog
          title="One-Time Boot Menu"
          onCancel={() => setScreen('splash')}
          actions={[{ label: 'OK', kind: 'primary', onClick: () => setScreen('splash') }]}
        >
          <p className={styles.msg}>{message}</p>
        </ConfirmDialog>
      )}
    </div>
  )
}
