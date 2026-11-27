import { infoValue } from '../data/settings'
import type { Bios } from '../state/store'
import { BatteryIcon } from './Icons'
import { Logo } from './Logo'
import styles from './TopBar.module.css'

export function TopBar({ bios }: { bios: Bios }) {
  const laptop = bios.model.formFactor === 'laptop'
  return (
    <header className={styles.bar}>
      <Logo height={30} />
      <span className={styles.title}>BIOS Setup</span>
      {laptop && (
        <span className={styles.battery} title="Battery level (synthetic)">
          <BatteryIcon width={22} height={22} />
          {infoValue(bios.model, 'battery.level', '')}
        </span>
      )}
    </header>
  )
}
