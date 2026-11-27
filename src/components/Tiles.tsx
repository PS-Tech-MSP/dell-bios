import { useState } from 'react'
import { useStore, type Bios } from '../state/store'
import { PasswordDialog } from './PasswordDialog'
import { Switch } from './Switch'
import styles from './Tiles.module.css'

function Tile({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className={styles.tile}>
      <span className={styles.label}>{label}</span>
      {children}
    </div>
  )
}

function AdminTile({ bios }: { bios: Bios }) {
  const setPassword = useStore((s) => s.setPassword)
  const setAdminUnlocked = useStore((s) => s.setAdminUnlocked)
  const [dialog, setDialog] = useState<null | 'set' | 'enter'>(null)
  const current = bios.profile.passwords.admin
  const g = bios.get
  const unlocked = !!current && !bios.locked

  const onClick = () => {
    if (!current) setDialog('set')
    else if (bios.locked) setDialog('enter')
  }

  return (
    <>
      <button type="button" className={`${styles.tile} ${styles.tileBtn}`} onClick={onClick} disabled={unlocked}>
        <span className={styles.label}>Admin Password</span>
        {unlocked && <span className={styles.sub}>Unlocked</span>}
      </button>
      {dialog === 'set' && (
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
          onCancel={() => setDialog(null)}
          onSubmit={(p) => {
            setPassword('admin', p)
            setAdminUnlocked(true)
            setDialog(null)
          }}
        />
      )}
      {dialog === 'enter' && (
        <PasswordDialog
          mode="enter"
          title="Enter Admin Password"
          current={current}
          onCancel={() => setDialog(null)}
          onSubmit={() => {
            setAdminUnlocked(true)
            setDialog(null)
          }}
        />
      )}
    </>
  )
}

export function Tiles({ bios }: { bios: Bios }) {
  const advanced = useStore((s) => s.advanced)
  const setAdvanced = useStore((s) => s.setAdvanced)
  const helpText = useStore((s) => s.helpText)
  const setHelpText = useStore((s) => s.setHelpText)
  return (
    <div className={styles.tiles}>
      <Tile label="Advanced Setup">
        <Switch checked={advanced} onChange={setAdvanced} label="Advanced Setup" />
      </Tile>
      <Tile label="Help Text">
        <Switch checked={helpText} onChange={setHelpText} label="Help Text" />
      </Tile>
      <AdminTile bios={bios} />
    </div>
  )
}
