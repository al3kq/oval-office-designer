import { ERAS } from '../data/eras';
import { useStore } from '../model/store';

export default function EraTimeline() {
  const eraId = useStore((state) => state.design.eraId);
  const loadEra = useStore((state) => state.loadEra);

  return (
    <div className="era-timeline" aria-label="Presidential eras">
      {ERAS.map((era) => (
        <button
          key={era.id}
          type="button"
          className={`era-button${eraId === era.id ? ' era-button--active' : ''}`}
          aria-pressed={eraId === era.id}
          onClick={() => loadEra(era.id)}
        >
          <span>{era.president}</span>
          <span>{era.years}</span>
        </button>
      ))}
    </div>
  );
}
