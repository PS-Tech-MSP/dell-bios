import { MODELS } from '../data/models'
import type { Family } from '../data/types'
import { useStore } from '../state/store'
import { Logo } from './Logo'
import ui from './ui.module.css'
import styles from './ModelSelect.module.css'

const FAMILIES: { family: Family; kind: string }[] = [
  { family: 'Latitude', kind: 'Laptop' },
  { family: 'OptiPlex', kind: 'Desktop' },
  { family: 'Precision', kind: 'Mobile and tower workstations' },
]

export function ModelSelect() {
  const selectModel = useStore((s) => s.selectModel)
  const resetSimulator = useStore((s) => s.resetSimulator)
  return (
    <div className={`${ui.screen} ${styles.wrap}`}>
      <div className={styles.logo}>
        <Logo height={30} />
      </div>
      <header className={styles.band}>
        <h1>BIOS Setup Training Simulator</h1>
      </header>
      <div className={styles.content}>
        <p className={styles.lead}>Choose the device the end user is working on. All system data is synthetic.</p>
        <div className={styles.families}>
          {FAMILIES.map(({ family, kind }) => (
            <section key={family} className={styles.family} aria-labelledby={`f-${family}`}>
              <h2 id={`f-${family}`}>
                {family} <span>{kind}</span>
              </h2>
              <div className={styles.models}>
                {MODELS.filter((m) => m.family === family).map((m) => (
                  <button key={m.id} className={styles.model} onClick={() => selectModel(m.id)}>
                    <strong>{m.name}</strong>
                    <small>{m.blurb}</small>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
        <button className={`${ui.btn} ${ui.danger} ${styles.reset}`} onClick={resetSimulator}>
          Reset simulator
        </button>
      </div>
    </div>
  )
}
