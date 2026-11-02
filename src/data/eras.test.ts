import { describe, expect, it } from 'vitest';
import { CATALOG } from '../model/catalog';
import { parseDesign } from '../model/codec';
import { RX, RZ } from '../model/geometry';
import { designFromEra, ERA_BY_ID, ERAS } from './eras';

describe('historical eras', () => {
  it('contains 22 unique eras in chronological order', () => {
    expect(ERAS).toHaveLength(22);
    expect(new Set(ERAS.map(era => era.id)).size).toBe(22);
    const starts = ERAS.map(era => Number(era.years.slice(0, 4)));
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });

  it('uses known furniture variants and places floor items inside the room', () => {
    for (const era of ERAS) {
      for (const item of era.items) {
        const kind = CATALOG[item.kind];
        expect(kind, `${era.id}: ${item.kind}`).toBeDefined();
        expect(kind.variants.some(variant => variant.id === item.variant), `${era.id}: ${item.kind}/${item.variant}`).toBe(true);
        if (kind.mount === 'floor') {
          expect((item.x / RX) ** 2 + (item.z / RZ) ** 2, `${era.id}: ${item.kind}`).toBeLessThan(1);
        }
      }
    }
  });

  it('keeps preset flag stands and fabric separate and inside the wall', () => {
    for (const era of ERAS) {
      const flags = era.items.filter(item => item.kind === 'flag');
      for (const [index, flag] of flags.entries()) {
        // All preset flags face north: their 0.9 m fabric extends toward -X.
        expect(Math.cos(flag.rotY)).toBeCloseTo(-1);
        for (const x of [flag.x, flag.x - 0.9]) {
          for (const z of [flag.z - 0.0125, flag.z + 0.0125]) {
            expect((x / RX) ** 2 + (z / RZ) ** 2, `${era.id}: flag fabric crosses wall`).toBeLessThan(1);
          }
        }
        for (const other of flags.slice(index + 1)) {
          expect(Math.hypot(flag.x - other.x, flag.z - other.z), `${era.id}: flag bases overlap`).toBeGreaterThanOrEqual(0.3);
          const fabricOverlaps = flag.x - 0.9 < other.x && other.x - 0.9 < flag.x;
          if (fabricOverlaps) expect(Math.abs(flag.z - other.z), `${era.id}: flag fabrics overlap`).toBeGreaterThan(0.031);
        }
      }
    }
  });
  it('distinguishes the later 2026 room and the Kennedy-era rug', () => {
    const current = ERA_BY_ID['trump-2025'];
    expect(current.finishes.ceiling).toBe('gold-seal');
    expect(current.finishes.rug.pattern).toBe('sunburst-laurel');
    expect(current.items.some(item => item.kind === 'desk' && item.variant === 'resolute')).toBe(true);
    expect(current.items.some(item => item.kind === 'sculpture' && item.variant === 'american-patriot')).toBe(true);
    expect(ERA_BY_ID['kennedy-1961'].finishes.rug.base).toBe(ERA_BY_ID['truman-1945'].finishes.rug.base);
  });

  it('produces valid designs with independent finishes and item ids', () => {
    for (const era of ERAS) {
      const design = designFromEra(era);
      expect(parseDesign(design)).toEqual(design);
      expect(design.finishes).not.toBe(era.finishes);
      expect(design.finishes.rug).not.toBe(era.finishes.rug);
      expect(new Set(design.items.map(item => item.id)).size).toBe(design.items.length);
    }
  });
});
