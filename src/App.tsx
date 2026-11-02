import { lazy, Suspense, useEffect, useState } from 'react'
import { useStore } from './model/store'
import Toolbar from './ui/Toolbar'
import EraTimeline from './ui/EraTimeline'
import EraInfo from './ui/EraInfo'
import Catalog from './ui/Catalog'
import Inspector from './ui/Inspector'
import FinishesPanel from './ui/FinishesPanel'
import './App.css'

// The WebGL renderer is loaded separately from the editing interface.
const Scene = lazy(() => import('./three/Scene'))

function App() {
  const [tab, setTab] = useState<'eras' | 'catalog'>('eras')
  const selectedId = useStore((state) => state.selectedId)
  const cameraPreset = useStore((state) => state.cameraPreset)
  const setCamera = useStore((state) => state.setCamera)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName))) return
      const state = useStore.getState()
      const key = event.key.toLowerCase()
      const command = event.metaKey || event.ctrlKey
      if (command && key === 'z') {
        event.preventDefault()
        if (event.shiftKey) state.redo()
        else state.undo()
      } else if (command && key === 'y') {
        event.preventDefault()
        state.redo()
      } else if (command && key === 'd') {
        event.preventDefault()
        if (state.selectedId) state.duplicateItem(state.selectedId)
      } else if (!command && !event.altKey) {
        if (key === 'escape') state.select(null)
        else if ((key === 'delete' || key === 'backspace') && state.selectedId) {
          event.preventDefault()
          state.removeItem(state.selectedId)
        } else if ((key === 'q' || key === 'e') && state.selectedId) {
          const item = state.design.items.find((entry) => entry.id === state.selectedId)
          if (item) state.setItem(item.id, { rotY: item.rotY + (key === 'q' ? -1 : 1) * Math.PI / 12 })
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="app-shell">
      <Toolbar />
      <main className="workspace">
        <aside className="sidebar sidebar-left" aria-label="Design library">
          <div className="sidebar-tabs" role="tablist" aria-label="Design library">
            <button type="button" role="tab" aria-selected={tab === 'eras'} onClick={() => setTab('eras')}>Eras</button>
            <button type="button" role="tab" aria-selected={tab === 'catalog'} onClick={() => setTab('catalog')}>Add furniture</button>
          </div>
          <div className="sidebar-content" role="tabpanel">{tab === 'eras' ? <EraTimeline /> : <Catalog />}</div>
        </aside>
        <section className="scene-area" aria-label="3D Oval Office designer">
          <Suspense fallback={<div className="scene-loading" role="status">Loading 3D scene…</div>}><Scene /></Suspense>
          <div className="scene-info"><EraInfo /></div>
          <div className="scene-hint">Drag to orbit · Scroll to zoom · Select an object to edit</div>
          <div className="camera-controls" aria-label="Camera views">
            {([{ id: 'overview', label: 'Overview' }, { id: 'top', label: 'Top' }, { id: 'desk', label: 'Desk' }] as const).map((view) => (
              <button type="button" key={view.id} aria-pressed={cameraPreset === view.id} onClick={() => setCamera(view.id)}>{view.label}</button>
            ))}
          </div>
        </section>
        <aside className="sidebar sidebar-right" aria-label={selectedId ? 'Selected item' : 'Room finishes'}>
          <div className="sidebar-content">{selectedId ? <Inspector /> : <FinishesPanel />}</div>
        </aside>
      </main>
    </div>
  )
}

export default App
