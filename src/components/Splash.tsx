import { useEffect } from 'react'
import { getModel } from '../data/models'
import { useStore } from '../state/store'
import { Logo } from './Logo'
import ui from './ui.module.css'
import styles from './Splash.module.css'

export function Splash() {
  const modelId = useStore((s) => s.modelId)
  const setScreen = useStore((s) => s.setScreen)
  const setAdminUnlocked = useStore((s) => s.setAdminUnlocked)
  const resetSimulator = useStore((s) => s.resetSimulator)
  const model = getModel(modelId)
  // With an Admin Password set, Setup opens locked; it is unlocked inside Setup (top-left tile).
  const enterSetup = () => {
    setAdminUnlocked(false)
    setScreen('biosSetup')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        enterSetup()
      } else if (e.key === 'F12') {
        e.preventDefault()
        setScreen('bootMenu')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!model) return null
  return (
    <div className={`${ui.screen} ${styles.wrap}`}>
      <div className={styles.center}>
        <Logo height={96} badge />
        <div className={styles.model}>{model.name}</div>
        <div className={styles.bar} aria-hidden="true">
          <span />
        </div>
      </div>
      <div className={styles.prompts}>
        <button className={styles.key} onClick={enterSetup}>
          <kbd>F2</kbd> = BIOS Setup
        </button>
        <span className={styles.sep}>,</span>
        <button className={styles.key} onClick={() => setScreen('bootMenu')}>
          <kbd>F12</kbd> = One-Time Boot Menu
        </button>
      </div>
      <div className={styles.corner}>
        <button className={ui.btn} onClick={() => setScreen('modelSelect')}>
          Change model
        </button>
        <button className={`${ui.btn} ${ui.danger}`} onClick={resetSimulator}>
          Reset simulator
        </button>
      </div>
    </div>
  )
}
