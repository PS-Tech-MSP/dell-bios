import { useState } from 'react'
import { infoValue } from '../data/settings'
import type { Setting, Value } from '../data/types'
import { useStore, type Bios, type PasswordKind } from '../state/store'
import { ConfirmDialog } from './ConfirmDialog'
import { Switch } from './Switch'
import { PasswordDialog, type PasswordMode, type PasswordRules } from './PasswordDialog'
import ui from './ui.module.css'
import styles from './SettingControl.module.css'

interface Props {
  setting: Setting
  bios: Bios
  disabled: boolean
}

const ACTION_TEXT: Record<string, string> = {
  'clear-secure-boot-keys': 'Simulated: all keys in the selected Secure Boot database would be deleted. Nothing was changed in this simulator.',
  'restore-secure-boot-keys': 'Simulated: the factory Secure Boot keys would be restored. Nothing was changed in this simulator.',
}

export function SettingControl({ setting: s, bios, disabled }: Props) {
  const setPending = useStore((st) => st.setPending)
  const setPassword = useStore((st) => st.setPassword)
  const [notice, setNotice] = useState<string | null>(null)
  const [pwMode, setPwMode] = useState<PasswordMode | null>(null)
  const value = bios.get(s.id)
  const id = `ctl-${s.id}`
  const set = (v: Value) => setPending(s.id, v)

  switch (s.control) {
    case 'toggle': {
      const on = value === true
      return <Switch id={id} checked={on} label={s.label} disabled={disabled} nav onChange={(v) => set(v)} />
    }
    case 'radio':
      return (
        <div role="radiogroup" aria-label={s.label} className={styles.radios}>
          {s.options?.map((o) => (
            <label key={o.value} className={styles.radio}>
              <input
                type="radio"
                name={id}
                disabled={disabled}
                checked={value === o.value}
                onChange={() => set(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      )
    case 'dropdown':
      return (
        <select id={id} aria-label={s.label} disabled={disabled} className={styles.select} value={String(value ?? '')} onChange={(e) => set(e.target.value)}>
          {s.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
    case 'text':
      return (
        <input
          id={id}
          aria-label={s.label}
          type="text"
          className={styles.text}
          disabled={disabled}
          maxLength={s.maxLength}
          value={String(value ?? '')}
          onChange={(e) => set(e.target.value)}
        />
      )
    case 'slider': {
      const n = Number(value ?? s.min ?? 0)
      return (
        <div className={styles.slider}>
          <input
            id={id}
            aria-label={s.label}
            type="range"
            disabled={disabled}
            min={s.min}
            max={s.max}
            step={s.step}
            value={n}
            onChange={(e) => set(e.target.value)}
          />
          <span>
            {n}
            {s.unit}
          </span>
        </div>
      )
    }
    case 'readonly': {
      const asset = String(bios.get('sysmgmt.asset') ?? '')
      return <span className={styles.readonly}>{s.infoKey ? infoValue(bios.model, s.infoKey, asset) : String(s.default)}</span>
    }
    case 'button':
      return (
        <>
          <button type="button" id={id} data-nav disabled={disabled} className={ui.btn} onClick={() => setNotice(ACTION_TEXT[s.action ?? ''] ?? 'Simulated action.')}>
            {s.buttonLabel ?? 'Run'}
          </button>
          {notice && (
            <ConfirmDialog title={s.label} onCancel={() => setNotice(null)} actions={[{ label: 'OK', kind: 'primary', onClick: () => setNotice(null) }]}>
              <p className={styles.note}>{notice}</p>
            </ConfirmDialog>
          )}
        </>
      )
    case 'bootorder':
      return <BootOrder id={id} value={Array.isArray(value) ? value : []} disabled={disabled} onChange={set} />
    case 'password': {
      const kind = s.passwordKind as PasswordKind
      const current = bios.profile.passwords[kind]
      const rules: PasswordRules = {
        minLen: Number(bios.get('passwords.min') ?? 4),
        upper: bios.get('passwords.upper') === true,
        lower: bios.get('passwords.lower') === true,
        digit: bios.get('passwords.digit') === true,
        special: bios.get('passwords.special') === true,
      }
      return (
        <div className={styles.pw}>
          <span className={current ? styles.pwSet : styles.readonly}>{current ? 'Set' : 'Not Set'}</span>
          {current ? (
            <>
              <button type="button" data-nav disabled={disabled} className={ui.btn} onClick={() => setPwMode('change')}>
                Change
              </button>
              <button type="button" data-nav disabled={disabled} className={ui.btn} onClick={() => setPwMode('delete')}>
                Delete
              </button>
            </>
          ) : (
            <button type="button" id={id} data-nav disabled={disabled} className={ui.btn} onClick={() => setPwMode('set')}>
              Set
            </button>
          )}
          {pwMode && (
            <PasswordDialog
              mode={pwMode}
              title={`${pwMode === 'set' ? 'Set' : pwMode === 'change' ? 'Change' : 'Delete'} ${s.label}`}
              current={current}
              rules={rules}
              onCancel={() => setPwMode(null)}
              onSubmit={(pw) => {
                setPassword(kind, pw)
                setPwMode(null)
                setNotice(pwMode === 'delete' ? `${s.label} deleted.` : `${s.label} saved.`)
              }}
            />
          )}
          {notice && (
            <ConfirmDialog title={s.label} onCancel={() => setNotice(null)} actions={[{ label: 'OK', kind: 'primary', onClick: () => setNotice(null) }]}>
              <p className={styles.note}>{notice}</p>
            </ConfirmDialog>
          )}
        </div>
      )
    }
    case 'table': {
      const key = s.infoKey as 'bios' | 'thermal' | 'power'
      const cleared = bios.profile.clearedLogs[key]
      const rows = cleared ? [] : bios.model.info.logs[key]
      return (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className={styles.empty}>
                  {cleared ? 'Log cleared. No entries.' : 'No entries.'}
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.time}</td>
                <td>{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
  }
}

function BootOrder({ id, value, disabled, onChange }: { id: string; value: string[]; disabled: boolean; onChange: (v: string[]) => void }) {
  const [sel, setSel] = useState(0)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const move = (d: number) => {
    const j = sel + d
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[sel], next[j]] = [next[j], next[sel]]
    onChange(next)
    setSel(j)
  }
  return (
    <div className={styles.boot} id={id}>
      <ol role="listbox" aria-label="Boot sequence">
        {value.map((v, i) => (
          <li
            key={v}
            role="option"
            aria-selected={i === sel}
            tabIndex={i === sel ? 0 : -1}
            className={i === sel ? styles.bootSel : ''}
            onClick={() => setSel(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                e.stopPropagation()
                setSel(Math.min(value.length - 1, i + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                e.stopPropagation()
                setSel(Math.max(0, i - 1))
              }
            }}
          >
            <span>{i + 1}.</span> {v}
          </li>
        ))}
        {value.length === 0 && <li className={styles.empty}>No boot options. Use Add Boot Option.</li>}
      </ol>
      <div className={styles.bootBtns}>
        <button type="button" data-nav className={ui.btn} disabled={disabled || sel === 0 || !value.length} onClick={() => move(-1)}>
          Move Up
        </button>
        <button type="button" data-nav className={ui.btn} disabled={disabled || sel >= value.length - 1} onClick={() => move(1)}>
          Move Down
        </button>
        <button
          type="button"
          data-nav
          className={ui.btn}
          disabled={disabled || !value.length}
          onClick={() => {
            onChange(value.filter((_, i) => i !== sel))
            setSel(Math.max(0, sel - 1))
          }}
          aria-label="Delete boot option"
        >
          Delete
        </button>
        <button type="button" data-nav className={ui.btn} disabled={disabled} onClick={() => setAdding(true)}>
          Add Boot Option
        </button>
      </div>
      {adding && (
        <ConfirmDialog
          title="Add Boot Option"
          onCancel={() => setAdding(false)}
          actions={[
            { label: 'Cancel', onClick: () => setAdding(false) },
            {
              label: 'OK',
              kind: 'primary',
              disabled: !name.trim() || value.includes(name.trim()),
              onClick: () => {
                onChange([...value, name.trim()])
                setSel(value.length)
                setName('')
                setAdding(false)
              },
            },
          ]}
        >
          <label className={styles.addLabel}>
            Boot option name
            <input
              type="text"
              autoFocus
              maxLength={40}
              className={styles.text}
              value={name}
              placeholder="e.g. USB Storage Device"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {value.includes(name.trim()) && <p className={styles.noteErr}>That boot option already exists.</p>}
        </ConfirmDialog>
      )}
    </div>
  )
}
