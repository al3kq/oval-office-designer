import { ERA_BY_ID } from '../data/eras';
import { ERA_EVIDENCE } from '../data/accuracy';
import { useStore } from '../model/store';
import type { Finishes } from '../model/types';

// Field-wise so designs restored from autosave or share links (different key order) still match.
function sameFinishes(a: Finishes, b: Finishes): boolean {
  const keys = Object.keys(b) as (keyof Finishes)[];
  const rugKeys = Object.keys(b.rug) as (keyof Finishes['rug'])[];
  return keys.every((key) => key === 'rug' || a[key] === b[key])
    && rugKeys.every((key) => a.rug[key] === b.rug[key]);
}

export default function EraInfo() {
  const design = useStore((state) => state.design);
  const era = design.eraId ? ERA_BY_ID[design.eraId] : undefined;
  if (!era) return null;
  const modified = design.name !== `${era.president} (${era.years})`
    || !sameFinishes(design.finishes, era.finishes)
    || design.items.length !== era.items.length
    || design.items.some((item, index) => {
      const expected = era.items[index];
      return item.kind !== expected.kind || item.variant !== expected.variant
        || item.x !== expected.x || item.z !== expected.z || item.y !== expected.y
        || item.rotY !== expected.rotY || item.color !== expected.color
        || item.accent !== expected.accent || item.pattern !== expected.pattern;
    });

  return (
    <details className="era-info" aria-label="Era information">
      <summary className="era-info-heading">
        <span>{era.president} · {era.years}{modified && ' (modified)'}</span>
        <span className="era-info-toggle" aria-hidden="true" />
      </summary>
      <p>{era.blurb}</p>
      {ERA_EVIDENCE[era.id] && <p>{ERA_EVIDENCE[era.id].note}</p>}
      <p>Approximate reconstruction — colors and positions are estimated.</p>
      <div className="era-info-sources">
        Sources:{' '}
        {era.sources.map((source, index) => (
          <span key={source}>
            {index > 0 && ' · '}
            <a href={source} target="_blank" rel="noreferrer">{new URL(source).hostname.replace(/^www\./, '')}</a>
          </span>
        ))}
      </div>
    </details>
  );
}
