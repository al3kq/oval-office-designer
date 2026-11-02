import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
import { ACESFilmicToneMapping, SRGBColorSpace, VSMShadowMap, type Vector3 } from 'three'
import { useStore } from '../model/store'
import { ItemNode } from './ItemNode'
import Room, { CutawayProvider } from './Room'

const CAMERA_VIEWS = {
  overview: { position: [7, 9, 9], target: [0, 0, 0] },
  top: { position: [0, 16, 0.01], target: [0, 0, 0] },
  desk: { position: [0, 1.6, 4.6], target: [0, 1.2, -5] },
} as const

let screenshotCanvas: HTMLCanvasElement | null = null

export function captureScreenshot(): string | null {
  const canvas = screenshotCanvas
  if (!canvas) return null
  try {
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

function ScreenshotCanvas() {
  const canvas = useThree((state) => state.gl.domElement)
  useEffect(() => {
    screenshotCanvas = canvas
    return () => { if (screenshotCanvas === canvas) screenshotCanvas = null }
  }, [canvas])
  return null
}

function CameraView() {
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as unknown as { target: Vector3; update: () => void } | null
  const preset = useStore((state) => state.cameraPreset)
  const nonce = useStore((state) => state.cameraNonce)

  useEffect(() => {
    if (!controls) return
    const view = CAMERA_VIEWS[preset]
    camera.position.set(view.position[0], view.position[1], view.position[2])
    controls.target.set(view.target[0], view.target[1], view.target[2])
    controls.update()
  }, [camera, controls, preset, nonce])
  return null
}

function Contents({ quality }: { quality: 'high' | 'low' }) {
  const items = useStore((state) => state.design.items)
  const shadowSize = quality === 'high' ? 2048 : 1024
  return <>
    <color attach="background" args={['#e9e8e3']} />
    <hemisphereLight args={['#fff8eb', '#a9967d', 0.8]} />
    <directionalLight key={quality} position={[2, 9, 10]} color="#fff0d7" intensity={2} castShadow
      shadow-mapSize-width={shadowSize} shadow-mapSize-height={shadowSize}
      shadow-radius={3} shadow-bias={-0.0002}
      shadow-camera-left={-7} shadow-camera-right={7}
      shadow-camera-top={7} shadow-camera-bottom={-7} />
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={3} color="#fff3df" position={[0, 5, 8]} scale={[8, 5, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[-6, 5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[6, 4, 1]} />
      <Lightformer form="rect" intensity={1} color="#fff8ea" position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 8, 1]} />
    </Environment>
    <OrbitControls makeDefault enableDamping maxPolarAngle={Math.PI / 2.05}
      minDistance={2} maxDistance={25} />
    <CameraView /><ScreenshotCanvas />
    <CutawayProvider>
      <Room />
      {items.map((item) => <ItemNode key={item.id} item={item} />)}
    </CutawayProvider>
    {quality === 'high' && <EffectComposer><N8AO aoRadius={0.5} distanceFalloff={1} intensity={1} /></EffectComposer>}
  </>
}

export function Scene() {
  const quality = useStore((state) => state.quality)
  const select = useStore((state) => state.select)
  return <Canvas shadows={{ type: VSMShadowMap }} dpr={quality === 'high' ? [1, 2] : 1}
    camera={{ position: [7, 9, 9], fov: 45 }}
    gl={{ preserveDrawingBuffer: true, toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }}
    onPointerMissed={() => select(null)}>
    <Contents quality={quality} />
  </Canvas>
}

export default Scene
