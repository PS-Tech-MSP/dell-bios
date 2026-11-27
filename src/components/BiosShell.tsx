import { useEffect, useState } from 'react'
import { formatValue, useBios, useStore } from '../state/store'
import { ConfirmDialog } from './ConfirmDialog'
import { Sidebar } from './Sidebar'
import { SectionView } from './SectionView'
import { TopBar } from './TopBar'
import { ViewAll } from './ViewAll'
import ui from './ui.module.css'
import dlg from './Dialog.module.css'
import styles from './BiosShell.module.css'

type Dlg = null | 'apply' | 'exit' | 'restore' | 'applied'

export function BiosShell() {
  const bios = useBios()
  const activeSection = useStore((s) => s.activeSection)
  const applyChanges = useStore((s) => s.applyChanges)
  const discardChanges = useStore((s) => s.discardChanges)
  const restoreDefaults = useStore((s) => s.restoreDefaults)
  const restoreCustom = useStore((s) => s.restoreCustom)
  const saveCustom = useStore((s) => s.saveCustom)
  const setScreen = useStore((s) => s.setScreen)
  const [dialog, setDialog] = useState<Dlg>(null)
  const viewAll = useStore((s) => s.viewAllOpen)
  const setAdminUnlocked = useStore((s) => s.setAdminUnlocked)
  const [restoreMsg, setRestoreMsg] = useState('')

  const count = bios ? bios.changes.length : 0

  const exit = () => {
    discardChanges()
    setAdminUnlocked(false)
    setDialog(null)
    setScreen('splash')
  }
  const requestExit = () => (count > 0 ? setDialog('exit') : exit())

  // Esc anywhere (when no dialog is open) behaves like the Exit button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !dialog && !document.querySelector('[role="dialog"]')) {
        const active = document.activeElement as HTMLElement | null
        if (active?.matches('input[type=search]') && (active as HTMLInputElement).value) return
        requestExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog, count])

  if (!bios) return null

  return (
    <div className={styles.shell}>
      <TopBar bios={bios} />
      <div className={styles.body}>
        <Sidebar bios={bios} />
        <div className={styles.right}>
          <SectionView sectionId={activeSection} bios={bios} />
          <footer className={styles.bottom}>
            <button className={`${ui.btn} ${styles.wide}`} disabled={bios.locked} onClick={() => setDialog('restore')}>
              Load Defaults
            </button>
            <button className={`${ui.btn} ${styles.wide}`} disabled={count === 0} onClick={() => setDialog('apply')}>
              Apply Changes
            </button>
            <span className={styles.counter} aria-live="polite">
              {count}
            </span>
            <span className={styles.note}>changes were made</span>
            <button className={`${ui.btn} ${styles.wide} ${styles.exit}`} onClick={requestExit}>
              Exit
            </button>
          </footer>
        </div>
      </div>
      {viewAll && <ViewAll bios={bios} />}

      {dialog === 'apply' && (
        <ConfirmDialog
          title="Apply Changes"
          onCancel={() => setDialog(null)}
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: 'Apply Changes',
              kind: 'primary',
              onClick: () => {
                applyChanges()
                setDialog('applied')
              },
            },
          ]}
        >
          <p className={dlg.msg}>The following settings will be changed:</p>
          <ul className={dlg.changes}>
            {bios.changes.map((c) => (
              <li key={c.id}>
                <b>{c.label}</b>
                <span className={dlg.old}>{formatValue(c.from)}</span>
                <span className={dlg.arrow}>→</span>
                <span className={dlg.new}>{formatValue(c.to)}</span>
              </li>
            ))}
          </ul>
        </ConfirmDialog>
      )}

      {dialog === 'applied' && (
        <ConfirmDialog title="Changes applied" onCancel={() => setDialog(null)} actions={[{ label: 'OK', kind: 'primary', onClick: () => setDialog(null) }]}>
          <p className={dlg.msg}>Your changes were saved. On a real system most take effect at the next restart.</p>
        </ConfirmDialog>
      )}

      {dialog === 'exit' && (
        <ConfirmDialog
          title="Exit BIOS Setup"
          onCancel={() => setDialog(null)}
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            { label: 'Discard Changes and Exit', kind: 'danger', onClick: exit },
            {
              label: 'Apply Changes and Exit',
              kind: 'primary',
              onClick: () => {
                applyChanges()
                setAdminUnlocked(false)
                setDialog(null)
                setScreen('splash')
              },
            },
          ]}
        >
          <p className={dlg.msg}>
            You have {count} unsaved change{count === 1 ? '' : 's'}. Apply them before exiting?
          </p>
        </ConfirmDialog>
      )}

      {dialog === 'restore' && (
        <ConfirmDialog
          title="Load Defaults"
          onCancel={() => setDialog(null)}
          actions={[
            { label: 'Cancel', onClick: () => setDialog(null) },
            {
              label: 'BIOS Defaults',
              onClick: () => {
                restoreDefaults()
                setRestoreMsg('')
                setDialog(null)
              },
            },
            {
              label: 'Custom User Settings',
              disabled: !bios.profile.customUser,
              onClick: () => {
                if (restoreCustom()) setDialog(null)
                else setRestoreMsg('No Custom User Settings have been saved yet.')
              },
            },
          ]}
        >
          <p className={dlg.msg}>
            Load the factory BIOS Defaults, or your Custom User Settings. Loaded values appear as pending changes; use Apply Changes to keep them.
          </p>
          <p className={dlg.msg}>
            {bios.profile.customUser ? 'Custom User Settings are saved.' : 'No Custom User Settings saved yet.'}
          </p>
          <button
            className={`${ui.btn}`}
            onClick={() => {
              saveCustom()
              setRestoreMsg('Current settings (including pending changes) saved as Custom User Settings.')
            }}
          >
            Save current settings as Custom User Settings
          </button>
          {restoreMsg && <p className={dlg.msg}>{restoreMsg}</p>}
        </ConfirmDialog>
      )}
    </div>
  )
}
