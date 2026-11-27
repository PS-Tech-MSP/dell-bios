import { BiosShell } from './components/BiosShell'
import { BootMenu } from './components/BootMenu'
import { ModelSelect } from './components/ModelSelect'
import { Splash } from './components/Splash'
import { useStore } from './state/store'
import { getModel } from './data/models'
import ui from './components/ui.module.css'

export default function App() {
  const screen = useStore((s) => s.screen)
  const modelId = useStore((s) => s.modelId)
  // Guard: a persisted model id that no longer exists falls back to the selector.
  const effective = screen !== 'modelSelect' && !getModel(modelId) ? 'modelSelect' : screen
  return (
    <>
      {effective === 'modelSelect' && <ModelSelect />}
      {effective === 'splash' && <Splash />}
      {effective === 'bootMenu' && <BootMenu />}
      {effective === 'biosSetup' && <BiosShell />}
      <div className={`${ui.footer} ${effective === 'splash' ? ui.footerPost : ''}`} role="contentinfo">
        PS Tech training simulator. Not affiliated with Dell. All system data is synthetic.
      </div>
    </>
  )
}
