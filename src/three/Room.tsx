import { useContext, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CanvasTexture, CircleGeometry, Float32BufferAttribute, Group } from 'three'
import { ARCH_FEATURES, RX, RZ, WALL_H, WALL_T, wall, wallNormal, wallPoint } from '../model/geometry'
import type { ArchFeature } from '../model/geometry'
import type { Finishes } from '../model/types'
import { CutawayContext } from './CutawayContext'
import { useStore } from '../model/store'
import { marbleTexture, plankTexture, rugTexture, wallTexture } from './textures'

const SEGMENTS = 72
const indexFor = (deg: number) => Math.floor(((deg % 360 + 360) % 360) / 5)

export function CutawayProvider({ children }: { children: ReactNode }) {
  const visible = useMemo(() => new Uint8Array(SEGMENTS).fill(1), [])
  useFrame(({ camera }) => {
    const { x, z } = camera.position
    const outside = (x / RX) ** 2 + (z / RZ) ** 2 > 1
    for (let i = 0; i < SEGMENTS; i++) {
      const mid = wallPoint(i * 5 + 2.5), normal = wallNormal(i * 5 + 2.5)
      const dx = x - mid.x, dz = z - mid.z, distance = Math.hypot(dx, dz)
      visible[i] = outside && distance > 0 && (normal.x * dx + normal.z * dz) / distance > 0.2 ? 0 : 1
    }
  }, -1)
  return <CutawayContext.Provider value={visible}>{children}</CutawayContext.Provider>
}

/** Attach to any wall-mounted group to follow this canvas's cutaway. */
export function useWallVisible(deg: number) {
  const visible = useContext(CutawayContext)
  if (!visible) throw new Error('useWallVisible requires CutawayProvider')
  const ref = useRef<Group>(null)
  useFrame(() => { if (ref.current) ref.current.visible = Boolean(visible[indexFor(deg)]) })
  return ref
}

// The inner face has meter-based UVs; all other faces share the exterior material.
function makeWallSegment(index: number, startU: number) {
  const a = wallPoint(index * 5), b = wallPoint((index + 1) * 5)
  const na = wallNormal(index * 5), nb = wallNormal((index + 1) * 5)
  const ao = { x: a.x + na.x * WALL_T, z: a.z + na.z * WALL_T }
  const bo = { x: b.x + nb.x * WALL_T, z: b.z + nb.z * WALL_T }
  const length = Math.hypot(b.x - a.x, b.z - a.z)
  const positions: number[] = [], uvs: number[] = []
  const quad = (p: number[][], uv: number[][]) => {
    for (const i of [0, 1, 2, 0, 2, 3]) { positions.push(...p[i]); uvs.push(...uv[i]) }
  }
  const pt = (p: { x: number; z: number }, y: number) => [p.x, y, p.z]
  quad([pt(a, 0), pt(b, 0), pt(b, WALL_H), pt(a, WALL_H)], [[startU, 0], [startU + length, 0], [startU + length, WALL_H], [startU, WALL_H]])
  const uv = [[0, 0], [1, 0], [1, 1], [0, 1]]
  quad([pt(bo, 0), pt(ao, 0), pt(ao, WALL_H), pt(bo, WALL_H)], uv)
  quad([pt(a, WALL_H), pt(b, WALL_H), pt(bo, WALL_H), pt(ao, WALL_H)], uv)
  quad([pt(ao, 0), pt(a, 0), pt(a, WALL_H), pt(ao, WALL_H)], uv)
  quad([pt(b, 0), pt(bo, 0), pt(bo, WALL_H), pt(b, WALL_H)], uv)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.addGroup(0, 6, 0)
  geometry.addGroup(6, 24, 1)
  geometry.computeVertexNormals()
  return { geometry, length }
}
function WallSegment({ index, geometry, length, finishes, texture }: { index: number; geometry: BufferGeometry; length: number; finishes: Finishes; texture: CanvasTexture }) {
  const ref = useWallVisible(index * 5)
  const a = wallPoint(index * 5), b = wallPoint((index + 1) * 5)
  const normal = wallNormal(index * 5 + 2.5)
  const mid = { x: (a.x + b.x) / 2 - normal.x * 0.025, z: (a.z + b.z) / 2 - normal.z * 0.025 }
  const rotation = -Math.atan2(b.z - a.z, b.x - a.x)
  return <group ref={ref}>
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial attach="material-0" map={texture} roughness={0.88} side={2} />
      <meshStandardMaterial attach="material-1" color="#f4f4f2" side={2} />
    </mesh>
    {[0.1, WALL_H - 0.125].map((y, i) => <mesh key={y} position={[mid.x, y, mid.z]} rotation-y={rotation}>
      <boxGeometry args={[length + 0.01, i ? 0.25 : 0.2, 0.08]} /><meshStandardMaterial color={finishes.trimColor} roughness={0.3} />
    </mesh>)}
  </group>
}

function Box({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return <mesh position={position} receiveShadow castShadow><boxGeometry args={size} /><meshStandardMaterial color={color} /></mesh>
}

function WindowFeature({ feature, finishes }: { feature: ArchFeature; finishes: Finishes }) {
  const { w, h, sill = 0 } = feature
  const y = sill + h / 2
  return <>
    <Box position={[0, y, 0]} size={[w + 0.2, h + 0.2, 0.06]} color={finishes.trimColor} />
    <mesh position={[0, y, 0.04]}><planeGeometry args={[w, h]} /><meshPhysicalMaterial color="#dcebf7" emissive="#dcebf7" emissiveIntensity={0.5} transmission={0.12} roughness={0.12} /></mesh>
    {[-w / 2, 0, w / 2].map(x => <Box key={x} position={[x, y, 0.065]} size={[0.055, h, 0.05]} color={finishes.trimColor} />)}
    {Array.from({ length: 5 }, (_, i) => <Box key={i} position={[0, sill + i * h / 4, 0.065]} size={[w, 0.055, 0.05]} color={finishes.trimColor} />)}
    {[-1, 1].map(side => <Box key={side} position={[side * (w / 2 + 0.19), y + 0.15, 0.16]} size={[0.35, h + 0.6, 0.22]} color={finishes.drapeColor} />)}
    {finishes.drapeStyle === 'swag' && <>
      <Box position={[0, sill + h + 0.27, 0.19]} size={[w + 0.7, 0.5, 0.24]} color={finishes.drapeColor} />
      {[-1, 0, 1].map(i => <mesh key={i} position={[i * (w + 0.5) / 3, sill + h + 0.02, 0.32]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.2, 0.2, (w + 0.5) / 3, 20, 1, false, 0, Math.PI]} /><meshStandardMaterial color={finishes.drapeAccent} side={2} />
      </mesh>)}
    </>}
  </>
}

function DoorFeature({ feature, finishes }: { feature: ArchFeature; finishes: Finishes }) {
  const { w, h } = feature
  return <>
    <Box position={[0, h / 2, 0]} size={[w + 0.2, h + 0.12, 0.08]} color={finishes.trimColor} />
    <Box position={[0, h + 0.18, 0.02]} size={[w + 0.4, 0.25, 0.14]} color={finishes.trimColor} />
    {finishes.ceiling === 'gold-seal' && <DoorGilt width={w} height={h} />}
    {[-1, 1].map(side => <group key={side}>
      <Box position={[side * w / 4, h / 2, 0.06]} size={[w / 2 - 0.04, h - 0.08, 0.06]} color="#f7f5ef" />
      {feature.deg === 100 && <mesh position={[side * w / 4, h * 0.62, 0.1]}><planeGeometry args={[w / 2 - 0.16, h * 0.65]} /><meshPhysicalMaterial color="#dcebf7" emissive="#dcebf7" emissiveIntensity={0.5} transmission={0.12} roughness={0.12} /></mesh>}
    </group>)}
  </>
}

// Shallow relief stays close to the door and shares its cutaway visibility.
function DoorGilt({ width, height }: { width: number; height: number }) {
  const gold = '#c9a43a'
  return <group position={[0, height + 0.34, 0.1]}>
    <mesh position={[0, 0.02, 0]}><boxGeometry args={[width + 0.3, 0.045, 0.035]} /><meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} /></mesh>
    <mesh position={[0, 0.22, 0]} scale={[0.14, 0.19, 0.035]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} /></mesh>
    {[-1, 1].map(side => <group key={side} position={[side * 0.42, 0.17, 0]}>
      {/* Mirrored heads, reclining bodies and raised wings suggest cherub reliefs. */}
      <mesh position={[-side * 0.14, 0.13, 0]} scale={[0.075, 0.075, 0.035]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} /></mesh>
      <mesh rotation-z={side * 0.2} scale={[0.19, 0.075, 0.035]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[side * 0.08, 0.13, -0.005]} rotation-z={-side * 0.6} scale={[0.08, 0.18, 0.025]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[side * 0.24, -0.03, 0]} rotation-z={side * 0.3} scale={[0.13, 0.035, 0.025]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} /></mesh>
    </group>)}
  </group>
}

function Fireplace({ finishes }: { finishes: Finishes }) {
  const marble = useMemo(() => marbleTexture(), [])
  return <>
    <mesh position={[0, 0.56, 0.02]} castShadow receiveShadow><boxGeometry args={[1.9, 1.12, 0.25]} /><meshStandardMaterial map={marble} roughness={0.3} /></mesh>
    <Box position={[0, 0.47, 0.17]} size={[1.22, 0.88, 0.08]} color="#2a2522" />
    <mesh position={[0, 1.23, 0.1]} castShadow receiveShadow><boxGeometry args={[2.05, 0.16, 0.42]} /><meshStandardMaterial map={marble} roughness={0.25} /></mesh>
    <Box position={[0, 0.05, 0.24]} size={[2, 0.1, 0.48]} color={finishes.trimColor} />
    {finishes.mantelDecor !== 'none' && <MantelDecor gold={finishes.mantelDecor === 'gold'} />}
  </>
}

function MantelDecor({ gold }: { gold: boolean }) {
  const metal = gold ? '#c9a43a' : '#897961'
  return <group>
    {[-0.73, 0.73].map(x => <group key={x} position={[x, 1.31, 0.12]}>
      <mesh position-y={0.03}><cylinderGeometry args={[0.1, 0.12, 0.06, 16]} /><meshStandardMaterial color={metal} metalness={0.65} roughness={0.25} /></mesh>
      <mesh position-y={0.19}><cylinderGeometry args={[0.035, 0.055, 0.28, 12]} /><meshStandardMaterial color={metal} metalness={0.65} roughness={0.25} /></mesh>
      <mesh position-y={0.4}><cylinderGeometry args={[0.035, 0.035, 0.16, 12]} /><meshStandardMaterial color="#fff5db" emissive="#ffdf9a" emissiveIntensity={0.15} /></mesh>
    </group>)}
    <mesh position={[0, 1.48, 0.12]}><cylinderGeometry args={[0.17, 0.17, 0.1, 32]} /><meshStandardMaterial color={metal} metalness={0.6} roughness={0.3} /></mesh>
    <mesh position={[0, 1.48, 0.18]}><circleGeometry args={[0.125, 32]} /><meshStandardMaterial color={gold ? '#e9cc78' : '#f4ead5'} /></mesh>
    {gold && [-0.4, 0.4].map(x => <group key={x} position={[x, 1.31, 0.12]}>
      <mesh position-y={0.11}><sphereGeometry args={[0.11, 16, 12]} /><meshStandardMaterial color={metal} metalness={0.75} roughness={0.2} /></mesh>
      <mesh position-y={0.22}><cylinderGeometry args={[0.08, 0.04, 0.08, 16]} /><meshStandardMaterial color={metal} metalness={0.75} roughness={0.2} /></mesh>
    </group>)}
    {gold && <group position={[0, 1.76, 0.12]}>
      <mesh scale={[0.09, 0.13, 0.04]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={metal} metalness={0.75} roughness={0.2} /></mesh>
      {[-1, 1].map(side => <mesh key={side} position={[side * 0.13, 0.03, 0]} rotation-z={side * 0.35} scale={[0.15, 0.045, 0.035]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={metal} metalness={0.75} roughness={0.2} /></mesh>)}
    </group>}
  </group>
}

function Ceiling({ finishes }: { finishes: Finishes }) {
  const ref = useRef<Group>(null)
  useFrame(({ camera }) => { if (ref.current) ref.current.visible = camera.position.y < WALL_H })
  return <>
    <group ref={ref}>
      <mesh position-y={WALL_H} rotation-x={Math.PI / 2} scale={[RX, RZ, 1]}><circleGeometry args={[1, 128]} /><meshStandardMaterial color="#f3f0e7" roughness={0.9} /></mesh>
      {finishes.ceiling !== 'plain' && <group position={[0, WALL_H - 0.025, 0]}>
        <mesh><cylinderGeometry args={[0.95, 0.95, 0.05, 48]} /><meshStandardMaterial color="#e5e0d4" roughness={0.8} /></mesh>
        <mesh position-y={-0.04}><cylinderGeometry args={[0.77, 0.77, 0.04, 48]} /><meshStandardMaterial color="#f6f2e9" roughness={0.8} /></mesh>
        {finishes.ceiling === 'gold-seal' && <mesh position-y={-0.065} rotation-x={Math.PI / 2}><torusGeometry args={[0.83, 0.025, 12, 64]} /><meshStandardMaterial color="#c9a43a" metalness={0.7} roughness={0.3} /></mesh>}
        <mesh position={[0, -0.08, 0]} scale={[0.17, 0.04, 0.3]}><sphereGeometry args={[1, 20, 12]} /><meshStandardMaterial color={finishes.ceiling === 'gold-seal' ? '#c9a43a' : '#ded8ca'} /></mesh>
        {[-1, 1].map(side => <mesh key={side} position={[side * 0.3, -0.08, -0.03]} rotation-y={side * 0.25} scale={[0.38, 0.04, 0.13]}><sphereGeometry args={[1, 20, 12]} /><meshStandardMaterial color={finishes.ceiling === 'gold-seal' ? '#c9a43a' : '#ded8ca'} /></mesh>)}
        <mesh position={[0, -0.08, -0.32]} scale={[0.09, 0.04, 0.09]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={finishes.ceiling === 'gold-seal' ? '#c9a43a' : '#ded8ca'} /></mesh>
      </group>}
    </group>
    {finishes.chandelier && <group position={[0, WALL_H - 0.55, 0]}>
      <mesh position-y={0.3}><cylinderGeometry args={[0.025, 0.025, 0.6, 12]} /><meshStandardMaterial color="#c9a43a" metalness={0.75} roughness={0.25} /></mesh>
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.48, 0.035, 12, 48]} /><meshStandardMaterial color="#c9a43a" metalness={0.75} roughness={0.25} /></mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = i * Math.PI / 4
        return <mesh key={i} position={[Math.cos(a) * 0.48, 0.12, Math.sin(a) * 0.48]}><sphereGeometry args={[0.075, 12, 8]} /><meshStandardMaterial color="#fff5d9" emissive="#ffe4ae" emissiveIntensity={0.8} /></mesh>
      })}
    </group>}
  </>
}

const bookColors = ['#683b30', '#3d5547', '#393f5c', '#a88149', '#6f5542', '#8c5745']
function Niche({ feature, finishes }: { feature: ArchFeature; finishes: Finishes }) {
  const { w, h, sill = 0 } = feature
  return <>
    <Box position={[0, sill + h / 2, 0]} size={[w + 0.16, h + 0.12, 0.08]} color={finishes.trimColor} />
    <Box position={[0, sill + h / 2, 0.055]} size={[w, h, 0.06]} color="#756954" />
    <mesh position={[0, sill + h, 0.03]} rotation-x={Math.PI / 2}><cylinderGeometry args={[w / 2 + 0.08, w / 2 + 0.08, 0.08, 24, 1, false, 0, Math.PI]} /><meshStandardMaterial color={finishes.trimColor} side={2} /></mesh>
    {Array.from({ length: 4 }, (_, shelf) => <group key={shelf}>
      <Box position={[0, sill + shelf * 0.59, 0.13]} size={[w, 0.055, 0.22]} color={finishes.trimColor} />
      {Array.from({ length: 9 }, (_, book) => {
        const seed = (shelf * 29 + book * 17 + feature.deg) % 19
        const height = 0.27 + (seed % 5) * 0.035
        return <Box key={book} position={[-w / 2 + 0.07 + book * 0.125, sill + shelf * 0.59 + 0.03 + height / 2, 0.14]} size={[0.095, height, 0.12]} color={bookColors[seed % bookColors.length]} />
      })}
    </group>)}
  </>
}

function Feature({ feature, finishes }: { feature: ArchFeature; finishes: Finishes }) {
  const ref = useWallVisible(feature.deg)
  const p = wall(feature.deg, 0.02)
  return <group ref={ref} position={[p.x, 0, p.z]} rotation-y={p.rotY}>
    {feature.kind === 'window' && <WindowFeature feature={feature} finishes={finishes} />}
    {feature.kind === 'door' && <DoorFeature feature={feature} finishes={finishes} />}
    {feature.kind === 'fireplace' && <Fireplace finishes={finishes} />}
    {feature.kind === 'niche' && <Niche feature={feature} finishes={finishes} />}
  </group>
}

export default function Room() {
  const finishes = useStore((state) => state.design.finishes)
  const wallMap = useMemo(() => wallTexture(finishes.wallPattern, finishes.wallColor, finishes.wallAccent), [finishes.wallPattern, finishes.wallColor, finishes.wallAccent])
  const floorMap = useMemo(() => plankTexture(finishes.floorColor), [finishes.floorColor])
  const rugMap = useMemo(() => rugTexture(finishes.rug), [finishes.rug])
  const floorGeometry = useMemo(() => {
    const geometry = new CircleGeometry(1, 128)
    const uv = geometry.getAttribute('uv')
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2 * RX, uv.getY(i) * 2 * RZ)
    return geometry
  }, [])
  useEffect(() => () => floorGeometry.dispose(), [floorGeometry])
  const segments = useMemo(() => {
    let u = 0
    return Array.from({ length: SEGMENTS }, (_, index) => {
      const segment = makeWallSegment(index, u)
      u += segment.length
      return segment
    })
  }, [])
  useEffect(() => () => { segments.forEach(segment => segment.geometry.dispose()) }, [segments])
  return <group>
    <mesh geometry={floorGeometry} rotation-x={-Math.PI / 2} scale={[RX, RZ, 1]} receiveShadow><meshStandardMaterial map={floorMap} roughness={0.4} metalness={0.04} /></mesh>
    <mesh position-y={0.01} rotation-x={-Math.PI / 2} scale={[RX - 0.45, RZ - 0.45, 1]} receiveShadow><circleGeometry args={[1, 128]} /><meshStandardMaterial map={rugMap} roughness={1} /></mesh>
    <Ceiling finishes={finishes} />
    {segments.map((segment, index) => <WallSegment key={index} index={index} {...segment} finishes={finishes} texture={wallMap} />)}
    {ARCH_FEATURES.filter(feature => !feature.room || feature.room === finishes.room).map(feature => <Feature key={`${feature.kind}-${feature.deg}`} feature={feature} finishes={finishes} />)}
  </group>
}
