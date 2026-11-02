import { useEffect, useMemo, useRef } from 'react'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { BoxGeometry, EdgesGeometry, Plane, Vector3 } from 'three'
import { CATALOG, clampMargin, footprint } from '../model/catalog'
import { angleOf, clampToRoom, snapToWall } from '../model/geometry'
import { useStore } from '../model/store'
import type { Item } from '../model/types'
import { FURNITURE } from './furniture'
import { useWallVisible } from './Room'

interface DragState {
  pointerId: number
  offsetX: number
  offsetZ: number
  plane: Plane
  controls: { enabled: boolean } | undefined
  controlsEnabled: boolean
  started: boolean
}

export function ItemNode({ item }: { item: Item }) {
  const selected = useStore((state) => state.selectedId === item.id)
  const select = useStore((state) => state.select)
  const beginGesture = useStore((state) => state.beginGesture)
  const setItemTransient = useStore((state) => state.setItemTransient)
  const controls = useThree((state) => state.controls) as unknown as { enabled: boolean } | undefined
  const wallMounted = CATALOG[item.kind].mount === 'wall'
  const wallRef = useWallVisible(angleOf(item.x, item.z))
  const drag = useRef<DragState | null>(null)
  const hit = useMemo(() => new Vector3(), [])
  const dims = footprint(item)
  const edges = useMemo(() => {
    const box = new BoxGeometry(dims.w + 0.06, dims.h + 0.06, dims.d + 0.06)
    const geometry = new EdgesGeometry(box)
    box.dispose()
    return geometry
  }, [dims.w, dims.h, dims.d])
  useEffect(() => () => edges.dispose(), [edges])
  useEffect(() => () => {
    if (drag.current?.controls) drag.current.controls.enabled = drag.current.controlsEnabled
  }, [])

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return
    event.stopPropagation()
    if (drag.current.controls) drag.current.controls.enabled = drag.current.controlsEnabled
    drag.current = null
    ;(event.target as Element).releasePointerCapture(event.pointerId)
  }

  const Component = FURNITURE[item.kind]
  return (
    <group ref={wallMounted ? wallRef : undefined} position={[item.x, item.y ?? 0, item.z]} rotation-y={item.rotY}
      onPointerDown={(event) => {
        event.stopPropagation()
        select(item.id)
        const plane = new Plane(new Vector3(0, 1, 0), -(wallMounted ? (item.y ?? 0) : 0))
        if (!event.ray.intersectPlane(plane, hit)) return
        drag.current = {
          pointerId: event.pointerId,
          offsetX: item.x - hit.x,
          offsetZ: item.z - hit.z,
          plane,
          controls,
          started: false,
          controlsEnabled: controls?.enabled ?? true,
        }
        ;(event.target as Element).setPointerCapture(event.pointerId)
        if (controls) controls.enabled = false
      }}
      onPointerMove={(event) => {
        const current = drag.current
        if (!current || current.pointerId !== event.pointerId) return
        event.stopPropagation()
        if (!event.ray.intersectPlane(current.plane, hit)) return
        const x = hit.x + current.offsetX
        const z = hit.z + current.offsetZ
        const position = wallMounted
          ? snapToWall(x, z, dims.d)
          : clampToRoom(x, z, clampMargin(item))
        if (!current.started) {
          if (Math.hypot(x - item.x, z - item.z) < 0.01) return
          if (Math.hypot(position.x - item.x, position.z - item.z) < 0.001) return
          beginGesture()
          current.started = true
        }
        setItemTransient(item.id, position)
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Component item={item} dims={dims} />
      {selected && <lineSegments geometry={edges} position-y={wallMounted ? 0 : dims.h / 2} raycast={() => null}>
        <lineBasicMaterial color="#3FA9F5" depthTest={false} />
      </lineSegments>}
    </group>
  )
}
