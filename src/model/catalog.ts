import type { Hex, Item, ItemKind } from './types'

export interface VariantDef { id: string; label: string; note?: string; story?: string; w: number; d: number; h: number }
export interface KindDef {
  label: string
  story?: string
  category: 'Desks' | 'Seating' | 'Tables' | 'Decor' | 'Flags' | 'Wall art'
  mount: 'floor' | 'wall'
  variants: VariantDef[]
  defaultColor: Hex
  defaultAccent: Hex
}

export const CATALOG: Record<ItemKind, KindDef> = {
  desk: { label: 'Desk', category: 'Desks', mount: 'floor', defaultColor: '#5A3220', defaultAccent: '#C9A43A', variants: [
    { id: 'resolute', label: 'Resolute', note: 'HMS Resolute timbers, 1880', story: 'Made from timbers of HMS Resolute, the desk was a gift from Queen Victoria in 1880.', w: 1.83, d: 1.22, h: 0.80 },
    { id: 'wilson', label: 'Wilson', story: 'Richard Nixon used the Wilson desk in the Oval Office.', w: 1.75, d: 1.0, h: 0.78 },
    { id: 'johnson', label: 'Johnson', w: 1.7, d: 0.95, h: 0.78 },
    { id: 'c-and-o', label: 'C&O', story: 'Named for the Chesapeake and Ohio Railway, this desk was used by George H. W. Bush in the Oval Office.', w: 1.6, d: 0.9, h: 0.78 },
    { id: 'roosevelt', label: 'Roosevelt', note: 'Theodore Roosevelt desk', story: 'Theodore Roosevelt used this desk; it later served other presidents including Truman.', w: 1.6, d: 0.95, h: 0.78 },
    { id: 'taft', label: 'Taft', w: 1.5, d: 0.9, h: 0.78 },
    { id: 'hoover', label: 'Hoover', w: 1.6, d: 0.9, h: 0.78 },
  ] },
  'desk-chair': { label: 'Desk chair', category: 'Seating', mount: 'floor', defaultColor: '#3A2418', defaultAccent: '#3A2418', variants: [
    { id: 'leather', label: 'Leather', w: 0.7, d: 0.7, h: 1.25 },
  ] },
  sofa: { label: 'Sofa', category: 'Seating', mount: 'floor', defaultColor: '#EDE8DC', defaultAccent: '#A8262E', variants: [
    { id: 'camelback', label: 'Camelback', w: 2.1, d: 0.9, h: 0.95 },
    { id: 'modern', label: 'Modern', w: 2.1, d: 0.9, h: 0.8 },
    { id: 'chesterfield', label: 'Chesterfield', w: 2.0, d: 0.95, h: 0.8 },
  ] },
  armchair: { label: 'Armchair', category: 'Seating', mount: 'floor', defaultColor: '#E0B13A', defaultAccent: '#6B4A2E', variants: [
    { id: 'wingback', label: 'Wingback', w: 0.85, d: 0.85, h: 1.15 },
    { id: 'club', label: 'Club', w: 0.85, d: 0.85, h: 0.8 },
    { id: 'bergere', label: 'Bergère', w: 0.75, d: 0.75, h: 0.95 },
  ] },
  'side-chair': { label: 'Side chair', category: 'Seating', mount: 'floor', defaultColor: '#5A3220', defaultAccent: '#2E3B6B', variants: [
    { id: 'wood', label: 'Wood', w: 0.5, d: 0.5, h: 0.95 },
  ] },
  'rocking-chair': { label: 'Rocking chair', category: 'Seating', mount: 'floor', defaultColor: '#C9A878', defaultAccent: '#EDE8DC', variants: [
    { id: 'kennedy', label: 'Kennedy', note: "JFK's rocker", story: 'John F. Kennedy used a rocking chair to help ease his chronic back pain.', w: 0.65, d: 0.9, h: 1.05 },
  ] },
  'coffee-table': { label: 'Coffee table', category: 'Tables', mount: 'floor', defaultColor: '#5A3220', defaultAccent: '#5A3220', variants: [
    { id: 'rect', label: 'Rectangular', w: 1.2, d: 0.6, h: 0.45 },
    { id: 'oval', label: 'Oval', w: 1.2, d: 0.65, h: 0.45 },
    { id: 'round', label: 'Round', w: 0.8, d: 0.8, h: 0.45 },
  ] },
  'side-table': { label: 'Side table', category: 'Tables', mount: 'floor', defaultColor: '#5A3220', defaultAccent: '#5A3220', variants: [
    { id: 'round', label: 'Round', w: 0.55, d: 0.55, h: 0.65 },
    { id: 'square', label: 'Square', w: 0.55, d: 0.55, h: 0.65 },
  ] },
  'table-lamp': { label: 'Table lamp', category: 'Decor', mount: 'floor', defaultColor: '#C9A43A', defaultAccent: '#F4EFE2', variants: [
    { id: 'urn', label: 'Urn', w: 0.4, d: 0.4, h: 0.6 },
  ] },
  credenza: { label: 'Credenza', category: 'Tables', mount: 'floor', defaultColor: '#5A3220', defaultAccent: '#C9A43A', variants: [
    { id: 'wood', label: 'Wood', w: 1.4, d: 0.5, h: 0.8 },
  ] },
  'tall-clock': { label: 'Tall clock', category: 'Decor', mount: 'floor', defaultColor: '#5A3220', defaultAccent: '#F4EFE2', variants: [
    { id: 'seymour', label: 'Seymour', note: 'Seymour tall case clock (Ford)', story: 'Gerald Ford added the Seymour tall-case clock to the Oval Office.', w: 0.5, d: 0.3, h: 2.3 },
  ] },
  flag: { label: 'Flag', story: 'The United States and presidential flags are displayed in the Oval Office; presidents have also displayed military service flags.', category: 'Flags', mount: 'floor', defaultColor: '#1B2A5A', defaultAccent: '#E2B33C', variants: [
    { id: 'us', label: 'United States', w: 0.3, d: 0.3, h: 2.6 },
    { id: 'presidential', label: 'Presidential', w: 0.3, d: 0.3, h: 2.6 },
    { id: 'army', label: 'Army', w: 0.3, d: 0.3, h: 2.6 },
    { id: 'navy', label: 'Navy', w: 0.3, d: 0.3, h: 2.6 },
    { id: 'air-force', label: 'Air Force', w: 0.3, d: 0.3, h: 2.6 },
    { id: 'marines', label: 'Marines', w: 0.3, d: 0.3, h: 2.6 },
    { id: 'coast-guard', label: 'Coast Guard', w: 0.3, d: 0.3, h: 2.6 },
    { id: 'space-force', label: 'Space Force', w: 0.3, d: 0.3, h: 2.6 },
  ] },
  plant: { label: 'Plant', category: 'Decor', mount: 'floor', defaultColor: '#3F6B35', defaultAccent: '#C9A43A', variants: [
    { id: 'ficus', label: 'Ficus', w: 0.7, d: 0.7, h: 1.9 },
  ] },
  sculpture: { label: 'Sculpture', category: 'Decor', mount: 'floor', defaultColor: '#6B4A2E', defaultAccent: '#F4F1E8', variants: [
    { id: 'bust-bronze', label: 'Bronze bust', w: 0.45, d: 0.45, h: 1.6 },
    { id: 'bust-marble', label: 'Marble bust', w: 0.45, d: 0.45, h: 1.6 },
    { id: 'bronco', label: 'Bronco Buster', note: 'Remington Bronco Buster', story: 'Frederic Remington’s bronze depicts a cowboy breaking a rearing horse.', w: 0.45, d: 0.45, h: 1.6 },
    { id: 'american-patriot', label: 'Spread-wing eagle', note: 'Stylized interpretation, not an exact likeness', story: 'A gold eagle sculpture was displayed in the Oval Office during Donald Trump’s second term. Source: https://apnews.com/article/trump-peoples-house-gold-oval-office-replica-f20fbcd0c51483a6d12ce361b690ea80', w: 1.0, d: 0.45, h: 1.6 },
    { id: 'churchill', label: 'Winston Churchill bust', story: 'Jacob Epstein sculpted this bust of British prime minister Winston Churchill.', w: 0.45, d: 0.45, h: 1.6 },
    { id: 'mlk', label: 'Martin Luther King Jr. bust', story: 'The civil rights leader Martin Luther King Jr. has been honored with a bust in the Oval Office.', w: 0.45, d: 0.45, h: 1.6 },
    { id: 'lincoln', label: 'Abraham Lincoln bust', story: 'Abraham Lincoln led the United States through the Civil War and issued the Emancipation Proclamation.', w: 0.45, d: 0.45, h: 1.6 },
    { id: 'rosa-parks', label: 'Rosa Parks bust', story: 'Rosa Parks became a civil rights icon after refusing to give up her seat on a segregated Montgomery bus.', w: 0.45, d: 0.45, h: 1.6 },
    { id: 'cesar-chavez', label: 'Cesar Chavez bust', story: 'Cesar Chavez co-founded the United Farm Workers and organized for farmworkers’ rights.', w: 0.45, d: 0.45, h: 1.6 },
  ] },
  globe: { label: 'Globe', category: 'Decor', mount: 'floor', defaultColor: '#2E5E8C', defaultAccent: '#5A3220', variants: [
    { id: 'fdr', label: 'FDR globe', note: "FDR's WWII globe", story: 'Franklin D. Roosevelt received a 50-inch globe during World War II.', w: 1.27, d: 1.27, h: 1.7 },
  ] },
  'tv-console': { label: 'TV console', category: 'Decor', mount: 'floor', defaultColor: '#F4F1E8', defaultAccent: '#202020', variants: [
    { id: 'lbj', label: 'LBJ three-TV console', note: "LBJ's three-TV console", story: 'Lyndon B. Johnson used three televisions to follow news broadcasts at once.', w: 1.6, d: 0.5, h: 1.1 },
  ] },
  painting: { label: 'Painting', category: 'Wall art', mount: 'wall', defaultColor: '#C9A43A', defaultAccent: '#3A3A3A', variants: [
    { id: 'portrait', label: 'Portrait', w: 0.8, d: 0.06, h: 1.0 },
    { id: 'landscape', label: 'Landscape', w: 1.2, d: 0.06, h: 0.8 },
    { id: 'seascape', label: 'Seascape', w: 1.2, d: 0.06, h: 0.8 },
    { id: 'washington-peale', label: 'Washington by Rembrandt Peale', story: 'Rembrandt Peale painted George Washington within a trompe-l’œil stone porthole.', w: 0.9, d: 0.06, h: 1.1 },
    { id: 'washington-charles-peale', label: 'Washington, military portrait', story: 'A military portrait of Washington by Charles Willson Peale hung above the Oval Office fireplace under Nixon and was reported there again in March 2025.', w: 0.9, d: 0.06, h: 1.1 },
    { id: 'fdr-portrait', label: 'Franklin D. Roosevelt portrait', story: 'Franklin D. Roosevelt moved the Oval Office to its present location in 1934.', w: 0.8, d: 0.06, h: 1.0 },
    { id: 'emancipation', label: 'Emancipation Proclamation', story: 'Abraham Lincoln issued the Emancipation Proclamation during the Civil War.', w: 0.7, d: 0.06, h: 0.9 },
    { id: 'hassam-flags', label: 'The Avenue in the Rain', story: 'Childe Hassam painted The Avenue in the Rain, a view of flag-lined Fifth Avenue.', w: 0.9, d: 0.06, h: 1.2 },
  ] },
}

export function getVariant(kind: ItemKind, variant: string): VariantDef {
  const variants = CATALOG[kind].variants
  return variants.find((candidate) => candidate.id === variant) ?? variants[0]
}

export function footprint(item: Pick<Item, 'kind' | 'variant'>): { w: number; d: number; h: number } {
  const { w, d, h } = getVariant(item.kind, item.variant)
  return { w, d, h }
}

export function clampMargin(item: Pick<Item, 'kind' | 'variant'>): number {
  const { w, d } = footprint(item)
  return 0.5 * Math.min(w, d) + 0.05
}
