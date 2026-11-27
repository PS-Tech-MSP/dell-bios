import styles from './Switch.module.css'

interface Props {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  id?: string
  disabled?: boolean
  nav?: boolean
}

/** Dell-style flat toggle switch. State is exposed to assistive tech via role=switch. */
export function Switch({ checked, onChange, label, id, disabled, nav }: Props) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-nav={nav ? '' : undefined}
      className={`${styles.switch} ${checked ? styles.on : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.knob} />
    </button>
  )
}
