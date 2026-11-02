import * as LZString from 'lz-string';
import { CATALOG } from './catalog';
import type { Design, Finishes, Item, ItemKind } from './types';
import { ERA_BY_ID } from '../data/eras';

export const AUTOSAVE_KEY = 'oval-designer:v1:autosave';

const isHex = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
const isOneOf = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === 'string' && options.includes(value as T);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function parseFinishes(rawValue: unknown): Finishes | null {
  if (typeof rawValue !== 'object' || rawValue === null || Array.isArray(rawValue)) return null;
  const value = rawValue as Record<string, unknown>;
  if (typeof value.rug !== 'object' || value.rug === null || Array.isArray(value.rug)) return null;
  const rug = value.rug as Record<string, unknown>;
  const ceiling = 'ceiling' in value ? value.ceiling : value.room === '1934' ? 'seal' : 'plain';
  const chandelier = 'chandelier' in value ? value.chandelier : false;
  const mantelDecor = 'mantelDecor' in value ? value.mantelDecor : 'classic';
  const borderStyle = 'borderStyle' in rug ? rug.borderStyle : 'band';
  const text = 'text' in rug ? rug.text : '';
  if (!isOneOf(value.room, ['1909', '1934'] as const) ||
      !isHex(value.wallColor) || !isHex(value.wallAccent) ||
      !isOneOf(value.wallPattern, ['plain', 'stripe', 'damask', 'panel', 'fleur', 'trellis', 'grasscloth'] as const) ||
      !isHex(value.trimColor) || !isHex(value.floorColor) ||
      !isHex(value.drapeColor) || !isHex(value.drapeAccent) ||
      !isOneOf(value.drapeStyle, ['panel', 'swag'] as const) ||
      !isHex(rug.base) || !isHex(rug.border) || !isHex(rug.accent) ||
      !isOneOf(rug.pattern, ['plain', 'lattice', 'stars', 'star-ring', 'sunburst', 'laurel', 'laurel-stars', 'quotes'] as const) ||
      !isOneOf(rug.seal, ['none', 'tone', 'color', 'gold'] as const) ||
      !isOneOf(ceiling, ['plain', 'seal'] as const) || typeof chandelier !== 'boolean' ||
      !isOneOf(mantelDecor, ['none', 'classic', 'gold'] as const) ||
      !isOneOf(borderStyle, ['band', 'double', 'greek-key', 'scallop'] as const) ||
      typeof text !== 'string') return null;
  return {
    room: value.room, wallColor: value.wallColor, wallAccent: value.wallAccent,
    wallPattern: value.wallPattern, trimColor: value.trimColor, floorColor: value.floorColor,
    drapeColor: value.drapeColor, drapeAccent: value.drapeAccent, drapeStyle: value.drapeStyle,
    ceiling, chandelier, mantelDecor,
    rug: { base: rug.base, border: rug.border, accent: rug.accent, pattern: rug.pattern, seal: rug.seal, borderStyle, text: text.slice(0, 200) },
  };
}

export function parseDesign(input: unknown): Design | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null;
  const raw = input as Record<string, unknown>;
  if (raw.v !== 1 || !Array.isArray(raw.items)) return null;
  const finishes = parseFinishes(raw.finishes);
  if (!finishes) return null;
  const items: Item[] = [];
  for (const entry of raw.items) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) continue;
    const value = entry as Record<string, unknown>;
    if (typeof value.kind !== 'string' ||
        !Object.hasOwn(CATALOG, value.kind) || !finite(value.x) || !finite(value.z) || !finite(value.rotY)) continue;
    const kind = value.kind as ItemKind;
    const definition = CATALOG[kind];
    const variant = definition.variants.find((entry) => entry.id === value.variant)?.id ?? definition.variants[0].id;
    const item: Item = {
      id: typeof value.id === 'string' ? value.id : crypto.randomUUID(),
      kind, variant, x: value.x, z: value.z, rotY: value.rotY,
      color: isHex(value.color) ? value.color : definition.defaultColor,
      accent: isHex(value.accent) ? value.accent : definition.defaultAccent,
      pattern: isOneOf(value.pattern, ['solid', 'stripe', 'floral'] as const) ? value.pattern : 'solid',
    };
    if (finite(value.y)) item.y = value.y;
    items.push(item);
  }
  return { v: 1, name: typeof raw.name === 'string' ? raw.name : 'Untitled Oval Office',
    eraId: typeof raw.eraId === 'string' ? raw.eraId : null, finishes, items };
}

export function encodeShareHash(design: Design): string {
  return `d=${LZString.compressToEncodedURIComponent(JSON.stringify(design))}`;
}

export function decodeShareHash(hash: string): { design?: Design; eraId?: string } | null {
  try {
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const encoded = params.get('d');
    if (encoded !== null) {
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (json) {
        const design = parseDesign(JSON.parse(json));
        if (design) return { design };
      }
    }
    const eraId = params.get('era');
    if (eraId && Object.hasOwn(ERA_BY_ID, eraId)) return { eraId };
  } catch {
    return null;
  }
  return null;
}

export function loadAutosave(): Design | null {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    return saved ? parseDesign(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
}

export function saveAutosave(design: Design): void {
  try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(design)); } catch { /* Storage may be unavailable or full. */ }
}

export function exportDesign(design: Design): void {
  const slug = design.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'oval-office';
  const url = URL.createObjectURL(new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug}.oval.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importDesignFile(file: File): Promise<Design | null> {
  try { return parseDesign(JSON.parse(await file.text())); } catch { return null; }
}
