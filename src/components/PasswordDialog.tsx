import { useEffect, useRef, useState } from 'react'
import ui from './ui.module.css'
import styles from './Dialog.module.css'

export interface PasswordRules {
  minLen: number
  upper: boolean
  lower: boolean
  digit: boolean
  special: boolean
}

export type PasswordMode = 'enter' | 'set' | 'change' | 'delete'

interface Props {
  mode: PasswordMode
  title: string
  /** Current password (for enter/change/delete verification). */
  current?: string | null
  rules?: PasswordRules
  onSubmit: (newPassword: string | null) => void
  onCancel: () => void
}

function checkRules(pw: string, r: PasswordRules): string | null {
  if (pw.length < r.minLen) return `Password must be at least ${r.minLen} characters.`
  if (pw.length > 32) return 'Password must be 32 characters or fewer.'
  if (r.upper && !/[A-Z]/.test(pw)) return 'Password must contain an uppercase letter.'
  if (r.lower && !/[a-z]/.test(pw)) return 'Password must contain a lowercase letter.'
  if (r.digit && !/[0-9]/.test(pw)) return 'Password must contain a digit.'
  if (r.special && !/[^A-Za-z0-9]/.test(pw)) return 'Password must contain a special character.'
  return null
}

export function PasswordDialog({ mode, title, current, rules, onSubmit, onCancel }: Props) {
  const [old, setOld] = useState('')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const first = useRef<HTMLInputElement>(null)
  useEffect(() => first.current?.focus(), [])

  const needsOld = mode !== 'set'
  const needsNew = mode === 'set' || mode === 'change'

  const submit = () => {
    if (needsOld && old !== (current ?? '')) {
      setError('The password you entered is incorrect.')
      return
    }
    if (needsNew) {
      const rule = rules ? checkRules(pw, rules) : null
      if (rule) return setError(rule)
      if (pw !== confirm) return setError('Passwords do not match.')
      return onSubmit(pw)
    }
    onSubmit(null)
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <form
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            onCancel()
          }
        }}
      >
        <h2>{title}</h2>
        <div className={styles.body}>
        {needsOld && (
          <label>
            {mode === 'enter' ? 'Enter password' : 'Old password'}
            <input ref={first} type="password" autoComplete="off" value={old} onChange={(e) => setOld(e.target.value)} />
          </label>
        )}
        {needsNew && (
          <>
            <label>
              New password
              <input
                ref={needsOld ? undefined : first}
                type="password"
                autoComplete="off"
                maxLength={32}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </label>
            <label>
              Confirm new password
              <input type="password" autoComplete="off" maxLength={32} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            {rules && (
              <p className={styles.hint}>
                Minimum {rules.minLen} characters, maximum 32
                {[rules.upper && 'an uppercase letter', rules.lower && 'a lowercase letter', rules.digit && 'a digit', rules.special && 'a special character']
                  .filter(Boolean)
                  .map((t, i, a) => (i === 0 ? ' · must include ' : '') + t + (i < a.length - 1 ? ', ' : ''))
                  .join('')}
                .
              </p>
            )}
          </>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.actions}>
          <button type="button" className={`${ui.btn}`} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={`${ui.btn} ${ui.primary}`}>
            {mode === 'delete' ? 'Delete' : 'OK'}
          </button>
        </div>
        </div>
      </form>
    </div>
  )
}
