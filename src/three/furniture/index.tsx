import type { ComponentType } from 'react'
import { RoundedBox } from '@react-three/drei'
import type { Texture } from 'three'
import type { Item, ItemKind } from '../../model/types'
import { fabricTexture, flagTexture, paintingTexture } from '../textures'
import { historicalPaintingTexture } from './paintings'

type Dimensions = { w: number; d: number; h: number }
type Props = { item: Item; dims: Dimensions }
type Vec = [number, number, number]

function Box({ size, at, color, map, metal = false }: { size: Vec; at: Vec; color: string; map?: Texture; metal?: boolean }) {
  return <RoundedBox args={size} radius={Math.min(0.035, ...size.map(n => n * 0.22))} smoothness={2} position={at} castShadow receiveShadow><meshPhysicalMaterial color={color} map={map} roughness={map ? 0.8 : 0.48} metalness={metal ? 0.75 : 0} clearcoat={map ? 0 : 0.2} /></RoundedBox>
}
function Cylinder({ radius, height, at, color, rotation, topRadius }: { radius: number; height: number; at: Vec; color: string; rotation?: Vec; topRadius?: number }) {
  return <mesh position={at} rotation={rotation} castShadow receiveShadow><cylinderGeometry args={[topRadius ?? radius, radius, height, 16]} /><meshPhysicalMaterial color={color} roughness={0.45} clearcoat={0.2} /></mesh>
}
function Ball({ radius, at, color, scale, metal = false }: { radius: number; at: Vec; color: string; scale?: Vec; metal?: boolean }) {
  return <mesh position={at} scale={scale} castShadow receiveShadow><sphereGeometry args={[radius, 16, 12]} /><meshPhysicalMaterial color={color} roughness={metal ? 0.38 : 0.65} metalness={metal ? 0.65 : 0} /></mesh>
}
function Legs({ w, d, height, color }: { w: number; d: number; height: number; color: string }) {
  return <>{[-1, 1].flatMap(x => [-1, 1].map(z => <Cylinder key={`${x},${z}`} radius={0.025} topRadius={0.042} height={height} at={[x * (w / 2 - 0.08), height / 2, z * (d / 2 - 0.08)]} color={color} />))}</>
}

function Desk({ item, dims: { w, d, h } }: Props) {
  return <><Box size={[w, 0.05, d]} at={[0, h - 0.025, 0]} color={item.color} />
    {[-1, 1].map(x => <Box key={x} size={[w * 0.3, h - 0.05, d * 0.9]} at={[x * w * 0.35, (h - 0.05) / 2, 0]} color={item.color} />)}
    <Box size={[w * 0.96, h * 0.65, 0.05]} at={[0, h * 0.38, d / 2 - 0.025]} color={item.color} />
    {[-1, 1].flatMap(x => [0.25, 0.48, 0.68].map(y => <group key={`${x}-${y}`}><Box size={[w * 0.23, h * 0.15, 0.012]} at={[x * w * 0.35, h * y, d / 2 - 0.01]} color={item.color} /><Box size={[0.055, 0.012, 0.012]} at={[x * w * 0.35, h * y, d / 2]} color="#C9A43A" metal /></group>))}
    {item.variant === 'resolute' && <><Box size={[w * 0.38, h * 0.43, 0.025]} at={[0, h * 0.38, d / 2 + 0.01]} color={item.accent} /><Box size={[w * 0.33, h * 0.36, 0.03]} at={[0, h * 0.38, d / 2 + 0.025]} color={item.color} /><Box size={[w * 0.63, 0.006, d * 0.68]} at={[0, h + 0.003, 0]} color="#2F4A2E" /></>}
  </>
}
function DeskChair({ item, dims: { w, d, h } }: Props) {
  return <><Cylinder radius={0.06} height={0.42} at={[0, 0.23, 0]} color={item.accent} /><Cylinder radius={w * 0.43} height={0.05} at={[0, 0.04, 0]} color={item.accent} />
    <Box size={[w, 0.15, d * 0.85]} at={[0, 0.51, 0]} color={item.color} /><Box size={[w * 0.9, h - 0.52, 0.15]} at={[0, (h + 0.52) / 2, -d * 0.36]} color={item.color} /></>
}
function Sofa({ item, dims: { w, d, h } }: Props) {
  const map = fabricTexture(item.pattern, item.color, item.accent)
  return <><Legs w={w} d={d} height={0.14} color="#533926" /><Box size={[w, 0.34, d]} at={[0, 0.31, 0]} color="#ffffff" map={map} />
    {[-1, 1].map(x => <Box key={`seat${x}`} size={[w * 0.36, 0.09, d * 0.64]} at={[x * w * 0.2, 0.52, d * 0.06]} color="#ffffff" map={map} />)}
    <Box size={[w * 0.88, h - 0.35, 0.22]} at={[0, (h + 0.35) / 2, -d / 2 + 0.11]} color="#ffffff" map={map} />
    {[-1, 1].map(x => item.variant === 'chesterfield' ? <Cylinder key={x} radius={0.14} height={d * 0.9} at={[x * (w / 2 - 0.14), 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} color={item.color} /> : <Box key={x} size={[0.18, 0.38, d]} at={[x * (w / 2 - 0.09), 0.38, 0]} color="#ffffff" map={map} />)}
    {item.variant === 'chesterfield' && [-2, -1, 0, 1, 2].map(x => <Ball key={x} radius={0.018} at={[x * w * 0.15, h * 0.72, -d / 2 + 0.225]} color={item.accent} />)}
    {item.variant === 'camelback' && <Box size={[w * 0.48, 0.12, 0.22]} at={[0, h - 0.02, -d / 2 + 0.11]} color="#ffffff" map={map} />}
    {[-1, 1].map(x => <Box key={x} size={[0.3, 0.3, 0.12]} at={[x * w * 0.29, 0.58, -d * 0.22]} color={item.accent} />)}</>
}
function Armchair({ item, dims: { w, d, h } }: Props) {
  const map = fabricTexture(item.pattern, item.color, item.accent)
  const frame = item.variant === 'bergere' ? item.accent : '#533926'
  return <><Legs w={w} d={d} height={0.16} color={frame} />
    <Box size={[w * 0.94, 0.3, d * 0.92]} at={[0, 0.31, 0]} color="#ffffff" map={map} />
    <Box size={[w * 0.64, 0.09, d * 0.65]} at={[0, 0.51, d * 0.04]} color="#ffffff" map={map} />
    <Box size={[w * 0.9, h - 0.35, 0.16]} at={[0, (h + 0.35) / 2, -d / 2 + 0.1]} color="#ffffff" map={map} />
    {[-1, 1].map(x => <group key={x}><Box size={[0.14, 0.32, d * 0.9]} at={[x * (w / 2 - 0.07), 0.4, 0]} color={item.variant === 'bergere' ? frame : '#ffffff'} map={item.variant === 'bergere' ? undefined : map} />{item.variant === 'wingback' && <Box size={[0.14, 0.4, 0.28]} at={[x * (w / 2 - 0.07), h - 0.2, -d / 2 + 0.15]} color="#ffffff" map={map} />}</group>)}
  </>
}
function SideChair({ item, dims: { w, d, h } }: Props) {
  return <><Legs w={w} d={d} height={0.45} color={item.color} /><Box size={[w, 0.1, d]} at={[0, 0.45, 0]} color={item.accent} />
    {[-1, 1].map(x => <Box key={x} size={[0.06, h - 0.48, 0.06]} at={[x * (w / 2 - 0.03), (h + 0.48) / 2, -d / 2 + 0.03]} color={item.color} />)}
    <Box size={[w, 0.08, 0.06]} at={[0, h - 0.04, -d / 2 + 0.03]} color={item.color} /><Box size={[w * 0.7, 0.1, 0.06]} at={[0, h * 0.74, -d / 2 + 0.03]} color={item.color} /></>
}
function RockingChair({ item, dims }: Props) {
  return <><SideChair item={item} dims={dims} />{[-1, 1].map(x => <group key={x} position={[x * dims.w * 0.36, dims.d * 0.52 + 0.025, 0]} rotation={[0, Math.PI / 2, 0]}><mesh rotation={[0, 0, Math.PI * 1.15]} castShadow receiveShadow><torusGeometry args={[dims.d * 0.52, 0.025, 8, 32, Math.PI * 0.7]} /><meshStandardMaterial color={item.color} /></mesh></group>)}</>
}
function CoffeeTable({ item, dims: { w, d, h } }: Props) {
  return <><Legs w={w} d={d} height={h - 0.05} color={item.color} />{item.variant === 'rect' ? <Box size={[w, 0.05, d]} at={[0, h - 0.025, 0]} color={item.color} /> : <mesh position={[0, h - 0.025, 0]} scale={[w / 2, 1, d / 2]} castShadow receiveShadow><cylinderGeometry args={[1, 1, 0.05, 48]} /><meshStandardMaterial color={item.color} /></mesh>}</>
}
function SideTable({ item, dims: { w, d, h } }: Props) {
  return <><Cylinder radius={w * 0.3} height={0.05} at={[0, 0.025, 0]} color={item.color} /><Cylinder radius={0.045} height={h - 0.1} at={[0, h / 2, 0]} color={item.color} />{item.variant === 'square' ? <Box size={[w, 0.05, d]} at={[0, h - 0.025, 0]} color={item.color} /> : <Cylinder radius={w / 2} height={0.05} at={[0, h - 0.025, 0]} color={item.color} />}</>
}
function Lamp({ item, dims: { h } }: Props) {
  return <group position={[0, 0.66, 0]}><Cylinder radius={0.12} height={0.04} at={[0, 0.02, 0]} color={item.color} /><Ball radius={0.11} at={[0, 0.18, 0]} color={item.color} scale={[0.8, 1.3, 0.8]} /><Cylinder radius={0.045} height={0.19} at={[0, 0.31, 0]} color={item.color} /><Cylinder radius={0.2} topRadius={0.09} height={0.23} at={[0, h - 0.115, 0]} color={item.accent} /></group>
}
function Credenza({ item, dims: { w, d, h } }: Props) {
  return <><Box size={[w, h, d]} at={[0, h / 2, 0]} color={item.color} />{[-1, 1].map(x => <Ball key={x} radius={0.025} at={[x * w * 0.17, h * 0.55, d / 2 + 0.02]} color={item.accent} />)}</>
}
function Clock({ item, dims: { w, d, h } }: Props) {
  return <><Box size={[w * 0.8, h * 0.76, d * 0.8]} at={[0, h * 0.38, 0]} color={item.color} /><Box size={[w, h * 0.22, d]} at={[0, h * 0.89, 0]} color={item.color} /><Cylinder radius={w * 0.31} height={0.02} at={[0, h * 0.88, d / 2 + 0.01]} rotation={[Math.PI / 2, 0, 0]} color={item.accent} /><Box size={[0.015, w * 0.2, 0.015]} at={[0, h * 0.9, d / 2 + 0.025]} color={item.color} /></>
}
function Flag({ item, dims: { h } }: Props) {
  return <><Cylinder radius={0.15} height={0.04} at={[0, 0.02, 0]} color={item.accent} /><Cylinder radius={0.018} height={h - 0.08} at={[0, (h - 0.08) / 2, 0]} color={item.color} /><Ball radius={0.05} at={[0, h - 0.04, 0]} color={item.accent} /><Box size={[0.9, 1.4, 0.025]} at={[0.45, h - 0.8, 0]} color="#ffffff" map={flagTexture(item.variant)} /></>
}
function Plant({ item, dims: { h } }: Props) {
  return <><Cylinder radius={0.22} topRadius={0.28} height={0.4} at={[0, 0.2, 0]} color={item.accent} /><Cylinder radius={0.035} height={h * 0.65} at={[0, h * 0.43, 0]} color="#5A3220" /><Ball radius={0.34} at={[0, h - 0.34, 0]} color={item.color} /><Ball radius={0.27} at={[-0.23, h - 0.62, 0]} color={item.color} /><Ball radius={0.27} at={[0.23, h - 0.68, 0]} color={item.color} /></>
}
function Sculpture({ item }: Props) {
  if (item.variant === 'american-patriot') return <>
    <Box size={[0.4, 0.07, 0.4]} at={[0, 0.035, 0]} color={item.accent} />
    <Box size={[0.32, 1.02, 0.32]} at={[0, 0.57, 0]} color={item.accent} />
    <Box size={[0.4, 0.06, 0.4]} at={[0, 1.11, 0]} color={item.accent} />
    <Ball radius={0.13} scale={[0.8, 1.2, 0.7]} at={[0, 1.32, 0]} color={item.color} metal />
    <Ball radius={0.065} at={[0, 1.5, 0.02]} color={item.color} metal />
    <Ball radius={0.035} scale={[0.7, 0.65, 1.3]} at={[0, 1.48, 0.09]} color={item.color} metal />
    {[-1, 1].map(side => <group key={side} position={[side * 0.11, 1.39, 0]} rotation={[0, 0, -side * 0.28]}>
      <Ball radius={0.15} scale={[1.5, 0.4, 0.35]} at={[side * 0.14, 0, 0]} color={item.color} metal />
      {[0, 1, 2].map(i => <Ball key={i} radius={0.09} scale={[1.25, 0.25, 0.35]} at={[side * (0.12 + i * 0.055), -0.045 - i * 0.025, 0.015]} color={item.color} metal />)}
    </group>)}
  </>
  const bronze = ['churchill', 'mlk', 'cesar-chavez', 'rosa-parks', 'bust-bronze', 'bronco'].includes(item.variant)
  const color = item.variant === 'bust-marble' || item.variant === 'lincoln' ? '#e7e3da' : bronze ? '#765b42' : item.color
  const isLincoln = item.variant === 'lincoln'
  const hair = ['lincoln', 'mlk', 'rosa-parks', 'cesar-chavez'].includes(item.variant)
  return <><Box size={[0.4, 0.07, 0.4]} at={[0, 0.035, 0]} color="#dfdcd3" /><Box size={[0.32, 1.02, 0.32]} at={[0, 0.57, 0]} color="#eeeae1" /><Box size={[0.4, 0.06, 0.4]} at={[0, 1.11, 0]} color="#dfdcd3" />
    {item.variant === 'bronco' ? <><Ball radius={0.13} scale={[1.25, 0.8, 0.65]} at={[0, 1.34, 0]} color={color} />{[-1, 1].flatMap(x => [-1, 1].map(z => <Cylinder key={`${x},${z}`} radius={0.018} height={0.19} at={[x * 0.1, 1.23, z * 0.06]} color={color} />))}<Ball radius={0.075} at={[0.15, 1.46, 0]} color={color} /><Ball radius={0.07} at={[0.02, 1.52, 0]} color={color} /></> : <>
      <Ball radius={0.16} scale={[item.variant === 'churchill' ? 1.22 : 1.1, 0.65, 0.6]} at={[0, 1.25, 0]} color={color} metal={bronze} />
      <Cylinder radius={0.055} height={0.11} at={[0, 1.36, 0]} color={color} />
      <Ball radius={0.105} scale={[item.variant === 'churchill' ? 0.95 : 0.8, isLincoln ? 1.35 : 1.15, 0.85]} at={[0, 1.47, 0]} color={color} metal={bronze} />
      <Ball radius={0.025} scale={[0.65, 1, 1]} at={[0, 1.46, 0.09]} color={color} metal={bronze} />
      {hair && <Ball radius={0.09} scale={[0.95, item.variant === 'rosa-parks' ? 0.7 : 0.45, 0.95]} at={[0, 1.55, -0.01]} color={color} metal={bronze} />}
      {isLincoln && <Ball radius={0.065} scale={[1, 0.55, 0.7]} at={[0, 1.4, 0.05]} color={color} />}
    </>}
  </>
}
function Globe({ item, dims: { w, h } }: Props) {
  const r = w / 2
  return <><Cylinder radius={w * 0.3} height={0.06} at={[0, 0.03, 0]} color={item.accent} /><Cylinder radius={0.045} height={h - 2 * r} at={[0, (h - 2 * r) / 2, 0]} color={item.accent} /><Ball radius={r} at={[0, h - r, 0]} color={item.color} /></>
}
function Television({ item, dims: { w, d, h } }: Props) {
  return <><Box size={[w, h, d]} at={[0, h / 2, 0]} color={item.color} />{[-1, 0, 1].map(x => <Box key={x} size={[w * 0.27, h * 0.36, 0.02]} at={[x * w * 0.31, h * 0.66, d / 2 + 0.01]} color={item.accent} />)}</>
}
function Painting({ item, dims: { w, d, h } }: Props) {
  const historical = historicalPaintingTexture(item.variant)
  return <><Box size={[w, h, d]} at={[0, 0, 0]} color={item.variant === 'washington-peale' ? '#b8aea0' : item.color} /><mesh position={[0, 0, d / 2 + 0.001]} castShadow receiveShadow><planeGeometry args={[w - 0.1, h - 0.1]} /><meshStandardMaterial map={historical ?? paintingTexture(item.variant)} roughness={0.85} /></mesh></>
}

export const FURNITURE: Record<ItemKind, ComponentType<Props>> = {
  desk: Desk, 'desk-chair': DeskChair, sofa: Sofa, armchair: Armchair,
  'side-chair': SideChair, 'rocking-chair': RockingChair, 'coffee-table': CoffeeTable,
  'side-table': SideTable, 'table-lamp': Lamp, credenza: Credenza, 'tall-clock': Clock,
  flag: Flag, plant: Plant, sculpture: Sculpture, globe: Globe, 'tv-console': Television,
  painting: Painting,
}
