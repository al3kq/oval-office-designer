export type Hex = string
export type ItemKind = 'desk' | 'desk-chair' | 'sofa' | 'armchair' | 'side-chair' | 'rocking-chair' | 'coffee-table' | 'side-table' | 'table-lamp' | 'credenza' | 'tall-clock' | 'flag' | 'plant' | 'sculpture' | 'globe' | 'tv-console' | 'painting'
export type FabricPattern = 'solid' | 'stripe' | 'floral'

export interface Item {
  id: string
  kind: ItemKind
  variant: string
  x: number
  z: number
  /** Center height, used for wall-mounted items. */
  y?: number
  /** Radians; local front is +Z. */
  rotY: number
  color: Hex
  accent: Hex
  pattern: FabricPattern
}

export type RugPattern = 'plain' | 'lattice' | 'stars' | 'star-ring' | 'sunburst' | 'sunburst-laurel' | 'laurel' | 'laurel-stars' | 'quotes'
export type SealStyle = 'none' | 'tone' | 'color' | 'gold'
export type RugBorderStyle = 'band' | 'double' | 'greek-key' | 'scallop'
export interface RugSpec {
  base: Hex
  border: Hex
  accent: Hex
  pattern: RugPattern
  seal: SealStyle
  borderStyle: RugBorderStyle
  /** Custom ring text; replaces the Obama quotations when pattern is 'quotes'. '' = default quotes. Max 200 chars. */
  text: string
}
export type WallPattern = 'plain' | 'stripe' | 'damask' | 'panel' | 'fleur' | 'trellis' | 'grasscloth'
export type CeilingStyle = 'plain' | 'seal' | 'gold-seal'
export type MantelDecor = 'none' | 'classic' | 'gold'
export interface Finishes {
  room: '1909' | '1934'
  wallColor: Hex
  wallAccent: Hex
  wallPattern: WallPattern
  trimColor: Hex
  floorColor: Hex
  drapeColor: Hex
  drapeAccent: Hex
  drapeStyle: 'panel' | 'swag'
  ceiling: CeilingStyle
  chandelier: boolean
  mantelDecor: MantelDecor
  rug: RugSpec
}
export interface Design { v: 1; name: string; eraId: string | null; finishes: Finishes; items: Item[] }
export type ItemSpec = Omit<Item, 'id'>
export interface EraPreset { id: string; president: string; years: string; blurb: string; sources: string[]; finishes: Finishes; items: ItemSpec[] }
