import { useEffect, useRef, type ReactNode } from 'react'
import ui from './ui.module.css'
import styles from './Dialog.module.css'

export interface DialogAction {
  label: string
  onClick: () => void
  kind?: 'primary' | 'danger' | 'default'
  disabled?: boolean
}

interface Props {
  title: string
  children?: ReactNode
  actions: DialogAction[]
  /** Called on Esc. */
  onCancel: () => void
}

export function ConfirmDialog({ title, children, actions, onCancel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const primary = ref.current?.querySelector<HTMLButtonElement>('button[data-primary="true"]')
    ;(primary ?? ref.current?.querySelector<HTMLButtonElement>('button'))?.focus()
  }, [])

  return (
    <div className={styles.backdrop} role="presentation">
      <div
        ref={ref}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            onCancel()
          }
          // keep Tab focus inside the dialog
          if (e.key === 'Tab') {
            const els = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,select') ?? [])
            if (!els.length) return
            const first = els[0]
            const last = els[els.length - 1]
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault()
              last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault()
              first.focus()
            }
          }
        }}
      >
        <h2>{title}</h2>
        <div className={styles.body}>
        {children}
        <div className={styles.actions}>
          {actions.map((a) => (
            <button
              key={a.label}
              data-primary={a.kind === 'primary'}
              disabled={a.disabled}
              className={`${ui.btn} ${a.kind === 'primary' ? ui.primary : ''} ${a.kind === 'danger' ? ui.danger : ''}`}
              onClick={a.onClick}
            >
              {a.label}
            </button>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}
