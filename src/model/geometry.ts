export const RX = 4.42
export const RZ = 5.46
export const WALL_H = 5.64
export const WALL_T = 0.3

/** Wall angles are measured clockwise from south (+Z), in degrees. */
export function wallPoint(deg: number): { x: number; z: number } {
  const theta = deg * Math.PI / 180
  return { x: RX * Math.sin(theta), z: RZ * Math.cos(theta) }
}

export function wallNormal(deg: number): { x: number; z: number } {
  const theta = deg * Math.PI / 180
  const x = Math.sin(theta) / RX
  const z = Math.cos(theta) / RZ
  const length = Math.hypot(x, z)
  return { x: x / length, z: z / length }
}

export function angleOf(x: number, z: number): number {
  return (Math.atan2(x / RX, z / RZ) * 180 / Math.PI + 360) % 360
}

export function faceCenter(x: number, z: number): number {
  return Math.atan2(-x, -z)
}

export function wall(deg: number, inset: number): { x: number; z: number; rotY: number } {
  const point = wallPoint(deg)
  const normal = wallNormal(deg)
  return { x: point.x - inset * normal.x, z: point.z - inset * normal.z, rotY: Math.atan2(-normal.x, -normal.z) }
}

export function clampToRoom(x: number, z: number, margin: number): { x: number; z: number } {
  const k = (x / (RX - margin)) ** 2 + (z / (RZ - margin)) ** 2
  if (k <= 1) return { x, z }
  const scale = 1 / Math.sqrt(k)
  return { x: x * scale, z: z * scale }
}

export function snapToWall(x: number, z: number, depth: number): { x: number; z: number; rotY: number } {
  return wall(angleOf(x, z), depth / 2 + 0.01)
}

export interface ArchFeature {
  kind: 'window' | 'door' | 'fireplace' | 'niche'
  deg: number
  w: number
  h: number
  sill?: number
  room?: '1909' | '1934'
}

export const ARCH_FEATURES: ArchFeature[] = [
  { kind: 'window', deg: -28, w: 1.3, h: 3.4, sill: 0.6 },
  { kind: 'window', deg: 0, w: 1.3, h: 3.4, sill: 0.6 },
  { kind: 'window', deg: 28, w: 1.3, h: 3.4, sill: 0.6 },
  { kind: 'window', deg: 70, w: 1.3, h: 3.4, sill: 0.6, room: '1934' },
  { kind: 'door', deg: 100, w: 1.6, h: 3.0 },
  { kind: 'door', deg: 145, w: 1.6, h: 3.0 },
  { kind: 'door', deg: 215, w: 1.6, h: 3.0 },
  { kind: 'door', deg: 270, w: 1.6, h: 3.0 },
  { kind: 'fireplace', deg: 180, w: 1.9, h: 1.3 },
  { kind: 'niche', deg: 245, w: 1.2, h: 2.6, sill: 0.9, room: '1934' },
  { kind: 'niche', deg: 295, w: 1.2, h: 2.6, sill: 0.9, room: '1934' },
]
