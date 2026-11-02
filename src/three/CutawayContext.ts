import { createContext } from 'react'

/** Wall-segment visibility shared by the room and its wall-mounted items. */
export const CutawayContext = createContext<Uint8Array | null>(null)
