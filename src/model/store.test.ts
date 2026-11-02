import { describe, expect, it } from 'vitest';
import { footprint } from './catalog';
import { angleOf, wall } from './geometry';
import { useStore } from './store';

describe('furniture duplication', () => {
  it('places a duplicate painting along the wall, facing the room', () => {
    const store = useStore.getState();
    store.addItem('painting');
    const original = useStore.getState().design.items.at(-1)!;
    useStore.getState().duplicateItem(original.id);
    const copy = useStore.getState().design.items.at(-1)!;
    const expected = wall(angleOf(copy.x, copy.z), footprint(copy).d / 2 + 0.01);
    expect(copy.id).not.toBe(original.id);
    expect(copy.y).toBe(original.y);
    expect(Math.hypot(copy.x - original.x, copy.z - original.z)).toBeGreaterThan(0.3);
    // Insetting from the ellipse shifts its angle slightly; allow millimetres.
    expect(Math.hypot(copy.x - expected.x, copy.z - expected.z)).toBeLessThan(0.003);
    expect(Math.abs(copy.rotY - expected.rotY)).toBeLessThan(0.002);
  });
});
