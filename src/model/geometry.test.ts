import { describe, expect, it } from 'vitest'
import { RX, RZ, angleOf, clampToRoom, faceCenter, snapToWall, wall, wallNormal, wallPoint } from './geometry'

describe('room geometry', () => {
  it('clamps an exterior point to the inset ellipse', () => {
    const result = clampToRoom(10, 0, 0.5)
    expect(result.x).toBeCloseTo(RX - 0.5)
    expect(result.z).toBe(0)
  })

  it('leaves an interior point unchanged', () => {
    expect(clampToRoom(1, -2, 0.5)).toEqual({ x: 1, z: -2 })
  })

  it.each([0, 90, 180, 270, 333])('recovers wall angle %i°', (degrees) => {
    const { x, z } = wallPoint(degrees)
    expect(angleOf(x, z)).toBeCloseTo(degrees)
  })

  it('uses outward unit normals and positions objects facing inward', () => {
    const normal = wallNormal(90)
    const position = wall(90, 0.5)
    expect(normal.x).toBeCloseTo(1)
    expect(normal.z).toBeCloseTo(0)
    expect(position.x).toBeCloseTo(RX - 0.5)
    expect(Math.sin(position.rotY)).toBeCloseTo(-1)
    expect(faceCenter(0, RZ)).toBeCloseTo(-Math.PI)
  })

  it('snaps to the wall with half the depth and a clearance', () => {
    const position = snapToWall(0, 2, 0.06)
    expect(position.z).toBeCloseTo(RZ - 0.04)
    expect(Math.cos(position.rotY)).toBeCloseTo(-1)
  })
})
