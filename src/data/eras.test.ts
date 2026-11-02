import { describe, expect, it } from 'vitest';
import { CATALOG } from '../model/catalog';
import { parseDesign } from '../model/codec';
import { RX, RZ } from '../model/geometry';
import { designFromEra, ERAS } from './eras';

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
