import { createContext, useContext } from 'react'
import type { Design } from '../model/types'

export interface SceneDesign {
  design: Design
  interactive: boolean
}

export const DesignContext = createContext<SceneDesign | null>(null)

/** Per-canvas wall-segment visibility (1 = shown). Lives here so Room.tsx hot reloads keep the same context. */
export const CutawayContext = createContext<Uint8Array | null>(null)

export function useSceneDesign(): SceneDesign {
  const value = useContext(DesignContext)
  if (!value) throw new Error('useSceneDesign must be used inside a DesignContext provider')
  return value
}
