import { describe, expect, it } from 'vitest';
import { designFromEra, ERA_BY_ID } from '../data/eras';
import { CATALOG } from './catalog';
import { decodeShareHash, encodeShareHash, parseDesign } from './codec';

describe('design codec', () => {
  const nixon = () => designFromEra(ERA_BY_ID['nixon-1969']);

  it('round trips an era through a share hash', () => {
    const design = nixon();
    expect(decodeShareHash(encodeShareHash(design))?.design).toEqual(design);
  });

  it('rejects a garbage hash', () => {
    expect(decodeShareHash('d=@@@')).toBeNull();
  });

  it('drops unknown item kinds', () => {
    const design = nixon();
    const raw = { ...design, items: [...design.items, { ...design.items[0], kind: 'unknown' }] };
    expect(parseDesign(raw)).toEqual(design);
  });

  it('rejects invalid finish colors', () => {
    const design = nixon();
    expect(parseDesign({ ...design, finishes: { ...design.finishes, wallColor: 'red' } })).toBeNull();
  });

  it('defaults missing upgrade fields in legacy designs', () => {
    for (const id of ['taft-1909', 'nixon-1969']) {
      const design = designFromEra(ERA_BY_ID[id]);
      const { ceiling, chandelier, mantelDecor, rug, ...oldFinishes } = design.finishes;
      const { borderStyle, text, ...oldRug } = rug;
      expect(parseDesign({ ...design, finishes: { ...oldFinishes, rug: oldRug } })?.finishes)
        .toEqual({ ...design.finishes, ceiling, chandelier, mantelDecor, rug: { ...rug, borderStyle, text } });
    }
  });

  it('rejects invalid new values and truncates rug text', () => {
    const design = nixon();
    for (const patch of [{ ceiling: 'bad' }, { mantelDecor: 'bad' }, { chandelier: 'yes' }]) {
      expect(parseDesign({ ...design, finishes: { ...design.finishes, ...patch } })).toBeNull();
    }
    for (const patch of [{ borderStyle: 'bad' }, { text: 42 }]) {
      expect(parseDesign({ ...design, finishes: { ...design.finishes, rug: { ...design.finishes.rug, ...patch } } })).toBeNull();
    }
    const parsed = parseDesign({ ...design, finishes: { ...design.finishes, rug: { ...design.finishes.rug, text: 'x'.repeat(201) } } });
    expect(parsed?.finishes.rug.text).toBe('x'.repeat(200));
  });

  it('falls back to the first variant for an unknown variant', () => {
    const design = nixon();
    const first = design.items[0];
    const parsed = parseDesign({ ...design, items: [{ ...first, variant: 'unknown' }] });
    expect(parsed?.items[0].variant).toBe(CATALOG[first.kind].variants[0].id);
  });
});
